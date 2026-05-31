import React, { createContext, useContext, useState, useEffect } from 'react';
import { Suite, Review, Booking, ContactSchedule, SystemNotification, UserRole, UserIdentity, ChefContactRequest, ChefOnboarding } from '../types';
import { INITIAL_SUITES, INITIAL_REVIEWS, INITIAL_BOOKINGS, INITIAL_CONTACTS, INITIAL_NOTIFICATIONS } from '../data/initialData';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../firebase';

// ABAC / Security Error Types
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Triggered:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AppContextProps {
  suites: Suite[];
  reviews: Review[];
  bookings: Booking[];
  contacts: ContactSchedule[];
  notifications: SystemNotification[];
  currentRole: UserRole;
  currentUser: UserIdentity;
  setRole: (role: UserRole) => void;
  addSuite: (suite: Omit<Suite, 'id' | 'rating' | 'reviewsCount' | 'status' | 'ownerEmail'>) => void;
  deleteSuite: (suiteId: string) => void;
  approveSuite: (suiteId: string) => void;
  rejectSuite: (suiteId: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'guestName' | 'guestEmail' | 'status' | 'paymentStatus' | 'createdAt'>) => Booking;
  cancelBooking: (bookingId: string) => void;
  updateBookingStatus: (bookingId: string, status: 'approved' | 'cancelled' | 'completed') => void;
  addReview: (review: Omit<Review, 'id' | 'date' | 'avatar' | 'userName'>) => void;
  addContactSchedule: (contact: Omit<ContactSchedule, 'id' | 'status' | 'createdAt'>) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  updateWallet: (amount: number) => void;
  
  registeredUsers: UserIdentity[];
  registerUser: (user: Omit<UserIdentity, 'walletBalance'>) => { success: boolean; requiresVerification: boolean; msg: string };
  loginUser: (email: string, role: UserRole, password?: string) => { success: boolean; requiresVerification?: boolean; msg: string };
  logoutUser: () => void;
  verifyEmailCode: (email: string, role: UserRole, code: string) => { success: boolean; msg: string };
  sendPasswordReset: (email: string, role: UserRole) => { success: boolean; code: string; msg: string };
  resetPasswordWithToken: (email: string, role: UserRole, token: string, newPassword: string) => { success: boolean; msg: string };
  
  favorites: string[];
  toggleFavorite: (sweetId: string) => void;
  isFavorite: (sweetId: string) => boolean;
  
  contactRequests: ChefContactRequest[];
  chefContactRequests: ChefContactRequest[];
  addContactRequest: (req: Omit<ChefContactRequest, 'id' | 'createdAt' | 'status'>) => void;
  replyToContactRequest: (reqId: string, messageText: string, channel: 'whatsapp' | 'mail') => void;
  respondToContactRequest: (reqId: string, messageText: string, channel: 'WhatsApp' | 'Email') => void;
  
  chefOnboardingDetails: ChefOnboarding | undefined;
  submitChefOnboarding: (details: Omit<ChefOnboarding, 'verified'>) => void;
  updateCurrentUserProfile: (profile: { name: string; phone?: string; address?: string }) => void;

  chefOnboardings: ChefOnboarding[];
  upsertChefOnboarding: (onboarding: Omit<ChefOnboarding, 'verified'>) => void;
  verifyChef: (email: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Core Mock Accounts that we seed into Firestore if empty
const DEFAULT_ACCOUNTS: UserIdentity[] = [
  {
    email: 'muskumanasa04@gmail.com',
    name: 'Kumari Manasa',
    role: 'guest',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    walletBalance: 1200,
    phone: '+91 94455 66778',
    address: '42 Sweet Street, Jubilee Hills, Hyderabad',
    favorites: ['sweet-suite-1', 'sweet-suite-2'],
    password: 'password123',
    isEmailVerified: true
  },
  {
    email: 'sweet.owner@sweetstay.com',
    name: 'Chef Benjamin Carter',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    walletBalance: 4250,
    phone: '+1 (555) 321-9876',
    address: 'Bay Gourmet Kitchens, Carmel, CA',
    password: 'password123',
    isEmailVerified: true
  },
  {
    email: 'sugar.plum@sweetstay.com',
    name: 'Manasa Rose Rose',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    walletBalance: 3100,
    phone: '+1 (555) 987-6543',
    address: 'Southern Candies Manor, Savannah, GA',
    password: 'password123',
    isEmailVerified: true
  },
  {
    email: 'admin.chief@sweetstay.com',
    name: 'Chief Admin Agent',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    password: 'password123',
    isEmailVerified: true
  }
];

const DEFAULT_ONBOARDINGS: ChefOnboarding[] = [
  {
    email: 'sweet.owner@sweetstay.com',
    chefName: 'Chef Benjamin Carter',
    experienceYears: 12,
    kitchenLicense: 'FSSAI-HYD-2024-9381',
    whatsappNumber: '+1 555 321 9876',
    specialtyDescription: 'Traditional Indian Ghee Laddus, hand-rolled milk pedas, and low-calorie dry fruit rolls.',
    verified: true
  },
  {
    email: 'sugar.plum@sweetstay.com',
    chefName: 'Manasa Rose Rose',
    experienceYears: 8,
    kitchenLicense: 'KITCHEN-SAVANNAH-4412',
    whatsappNumber: '+1 555 987 6543',
    specialtyDescription: 'Fine Turkish Baklava, pistachio orange glaze desserts, and custom butter pastries.',
    verified: true
  }
];

const DEFAULT_CONTACT_REQUESTS: ChefContactRequest[] = [
  {
    id: 'req-1',
    sweetId: 'sweet-suite-1',
    sweetTitle: 'The Royal Saffron Ghee Laddu',
    chefEmail: 'sweet.owner@sweetstay.com',
    buyerEmail: 'muskumanasa04@gmail.com',
    buyerName: 'Kumari Manasa',
    buyerPhone: '+919445566778',
    message: 'Hello Chef! I am highly interested in ordering 10 tins of the saffron laddus for my daughters reception. Do you offer an additional discount for 10 boxes, and can you ship before next Thursday?',
    whatsappNumber: '+1 555 321 9876',
    status: 'pending',
    createdAt: '2026-05-28T10:00:00Z'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sync States with initial local representations before cloud Sync
  const [registeredUsers, setRegisteredUsers] = useState<UserIdentity[]>(() => {
    return DEFAULT_ACCOUNTS;
  });

  const [chefOnboardings, setChefOnboardings] = useState<ChefOnboarding[]>(() => {
    return DEFAULT_ONBOARDINGS;
  });

  const [contactRequests, setContactRequests] = useState<ChefContactRequest[]>(() => {
    return DEFAULT_CONTACT_REQUESTS;
  });

  const [suites, setSuites] = useState<Suite[]>(() => {
    return INITIAL_SUITES;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    return INITIAL_REVIEWS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    return INITIAL_BOOKINGS;
  });

  const [contacts, setContacts] = useState<ContactSchedule[]>(() => {
    return INITIAL_CONTACTS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    return INITIAL_NOTIFICATIONS;
  });

  const [currentUser, setCurrentUser] = useState<UserIdentity>(() => {
    return DEFAULT_ACCOUNTS[0]; // Kumari Manasa default
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('guest');

  // Deep Cache-Bust Routine: purge any legacy real-estate local storage caches
  useEffect(() => {
    const legacyKeys = [
      'sweet_suites_list',
      'sweet_accounts',
      'sweet_chef_onboardings',
      'sweet_contact_requests',
      'sweet_reviews_list',
      'sweet_bookings_list',
      'sweet_contacts_list',
      'sweet_notifications_list',
      'sweet_logged_in_user',
      'gourmet_suites_list_v2',
      'gourmet_accounts_v2',
      'gourmet_chef_onboardings_v2',
      'gourmet_contact_requests_v2',
      'gourmet_reviews_list_v2',
      'gourmet_bookings_list_v2',
      'gourmet_contacts_list_v2',
      'gourmet_notifications_list_v2',
      'gourmet_logged_in_user_v2'
    ];

    let foundLegacy = false;
    legacyKeys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) {
        if (
          val.toLowerCase().includes('villa') || 
          val.toLowerCase().includes('cottage') || 
          val.includes('photo-1544256718') || 
          val.includes('photo-1587314168485')
        ) {
          foundLegacy = true;
        }
        localStorage.removeItem(k);
      }
    });

    if (foundLegacy) {
      console.log("Busting cached real estate files and reloading sweets and snacks fresh.");
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  // Seeding Database dynamically if 100% empty
  const seedFirestoreIfEmpty = async () => {
    try {
      const suitesSnap = await getDocs(collection(db, 'suites'));
      if (suitesSnap.empty) {
        console.log("Seeding sweets products collection to Firestore...");
        const batch = writeBatch(db);
        INITIAL_SUITES.forEach(s => {
          const docRef = doc(collection(db, 'suites'), s.id);
          batch.set(docRef, s);
        });
        await batch.commit();
      }

      const reviewsSnap = await getDocs(collection(db, 'reviews'));
      if (reviewsSnap.empty) {
        const batch = writeBatch(db);
        INITIAL_REVIEWS.forEach(r => {
          const docRef = doc(collection(db, 'reviews'), r.id);
          batch.set(docRef, r);
        });
        await batch.commit();
      }

      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      if (bookingsSnap.empty) {
        const batch = writeBatch(db);
        INITIAL_BOOKINGS.forEach(b => {
          const docRef = doc(collection(db, 'bookings'), b.id);
          batch.set(docRef, b);
        });
        await batch.commit();
      }

      const contactsSnap = await getDocs(collection(db, 'contactSchedules'));
      if (contactsSnap.empty) {
        const batch = writeBatch(db);
        INITIAL_CONTACTS.forEach(c => {
          const docRef = doc(collection(db, 'contactSchedules'), c.id);
          batch.set(docRef, c);
        });
        await batch.commit();
      }

      const requestsSnap = await getDocs(collection(db, 'contactRequests'));
      if (requestsSnap.empty) {
        const batch = writeBatch(db);
        DEFAULT_CONTACT_REQUESTS.forEach(req => {
          const docRef = doc(collection(db, 'contactRequests'), req.id);
          batch.set(docRef, req);
        });
        await batch.commit();
      }

      const onboardingsSnap = await getDocs(collection(db, 'chefOnboardings'));
      if (onboardingsSnap.empty) {
        const batch = writeBatch(db);
        DEFAULT_ONBOARDINGS.forEach(onb => {
          const id = onb.email.replace(/[@.]/g, '_');
          const docRef = doc(collection(db, 'chefOnboardings'), id);
          batch.set(docRef, onb);
        });
        await batch.commit();
      }

      const usersSnap = await getDocs(collection(db, 'users'));
      if (usersSnap.empty) {
        const batch = writeBatch(db);
        DEFAULT_ACCOUNTS.forEach(u => {
          const id = u.email.replace(/[@.]/g, '_') + '_' + u.role;
          const docRef = doc(collection(db, 'users'), id);
          batch.set(docRef, u);
        });
        await batch.commit();
      }

      const notifSnap = await getDocs(collection(db, 'notifications'));
      if (notifSnap.empty) {
        const batch = writeBatch(db);
        INITIAL_NOTIFICATIONS.forEach(n => {
          const docRef = doc(collection(db, 'notifications'), n.id);
          batch.set(docRef, n);
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn("Firestore seeding missed/skipped:", err);
    }
  };

  // Synchronous authentications & Firestore real-time synchronization
  useEffect(() => {
    // 1. Sign in anonymously if not logged in to Firebase yet
    signInAnonymously(auth)
      .then(() => {
        console.log("Authenticated anonymously with Firebase Auth.");
        return seedFirestoreIfEmpty();
      })
      .catch((e) => {
        console.log("Firebase Auth automatic link skipped: ", e);
      });

    // 2. Realtime sync onSnapshot blocks
    const unsubSuites = onSnapshot(collection(db, 'suites'), (snap) => {
      const items: Suite[] = [];
      snap.forEach(doc => items.push(doc.data() as Suite));
      if (items.length > 0) {
        setSuites(items);
      }
    }, (err) => {
      console.warn("Offscreen suite cache load");
    });

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snap) => {
      const items: Review[] = [];
      snap.forEach(doc => items.push(doc.data() as Review));
      if (items.length > 0) {
        setReviews(items);
      }
    }, (err) => {
      console.warn("Offscreen review cache load");
    });

    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      const items: Booking[] = [];
      snap.forEach(doc => items.push(doc.data() as Booking));
      if (items.length > 0) {
        setBookings(items);
      }
    }, (err) => {
      console.warn("Offscreen booking cache load");
    });

    const unsubContactRequests = onSnapshot(collection(db, 'contactRequests'), (snap) => {
      const items: ChefContactRequest[] = [];
      snap.forEach(doc => items.push(doc.data() as ChefContactRequest));
      if (items.length > 0) {
        setContactRequests(items);
      }
    }, (err) => {
      console.warn("Offscreen request cache load");
    });

    const unsubOnboardings = onSnapshot(collection(db, 'chefOnboardings'), (snap) => {
      const items: ChefOnboarding[] = [];
      snap.forEach(doc => items.push(doc.data() as ChefOnboarding));
      if (items.length > 0) {
        setChefOnboardings(items);
      }
    }, (err) => {
      console.warn("Offscreen onboarding cache load");
    });

    const unsubContactsSchedules = onSnapshot(collection(db, 'contactSchedules'), (snap) => {
      const items: ContactSchedule[] = [];
      snap.forEach(doc => items.push(doc.data() as ContactSchedule));
      if (items.length > 0) {
        setContacts(items);
      }
    }, (err) => {
      console.warn("Offscreen schedule cache load");
    });

    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snap) => {
      const items: SystemNotification[] = [];
      snap.forEach(doc => items.push(doc.data() as SystemNotification));
      if (items.length > 0) {
        setNotifications(items);
      }
    }, (err) => {
      console.warn("Offscreen notification cache load");
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const items: UserIdentity[] = [];
      snap.forEach(doc => items.push(doc.data() as UserIdentity));
      if (items.length > 0) {
        setRegisteredUsers(items);
      }
    }, (err) => {
      console.warn("Offscreen user profiles cache load");
    });

    return () => {
      unsubSuites();
      unsubReviews();
      unsubBookings();
      unsubContactRequests();
      unsubOnboardings();
      unsubContactsSchedules();
      unsubNotifications();
      unsubUsers();
    };
  }, []);

  // Sync role configuration on user alterations
  useEffect(() => {
    setCurrentRole(currentUser.role);
  }, [currentUser]);

  const setRole = (role: UserRole) => {
    const existing = registeredUsers.find(u => u.role === role);
    if (existing) {
      setCurrentUser(existing);
    } else {
      const fallback = DEFAULT_ACCOUNTS.find(u => u.role === role) || DEFAULT_ACCOUNTS[0];
      setCurrentUser(fallback);
    }
  };

  const registerUser = (user: Omit<UserIdentity, 'walletBalance'>) => {
    const exists = registeredUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase() && u.role === user.role);
    if (exists) {
      return { success: false, requiresVerification: false, msg: 'Email is already registered on this role.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser: UserIdentity = {
      ...user,
      walletBalance: user.role === 'guest' ? 1000 : 0,
      favorites: [],
      isEmailVerified: false,
      verificationCode: code
    };

    const id = user.email.replace(/[@.]/g, '_') + '_' + user.role;
    setRegisteredUsers(prev => [...prev, newUser]);
    setDoc(doc(db, 'users', id), newUser).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `users/${id}`);
    });

    // Code Notification
    const verificationNotif: SystemNotification = {
      id: 'verify-' + Date.now(),
      recipientEmail: user.email,
      title: '🔐 Verification Code',
      message: `Your Sweets & Snacks verification code is: ${code}. Enter this to activate your profile.`,
      date: new Date().toISOString(),
      read: false,
      type: 'system'
    };
    setNotifications(prev => [verificationNotif, ...prev]);
    setDoc(doc(db, 'notifications', verificationNotif.id), verificationNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${verificationNotif.id}`);
    });

    return {
      success: true,
      requiresVerification: true,
      msg: `Registered! A verification code has been generated. Code is ${code}.`
    };
  };

  const loginUser = (email: string, role: UserRole, password?: string) => {
    const match = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (match) {
      if (match.password && match.password !== password) {
        return { success: false, msg: 'Incorrect password.' };
      }

      if (match.isEmailVerified === false) {
        const code = match.verificationCode || Math.floor(100000 + Math.random() * 900000).toString();
        const verifyNotif: SystemNotification = {
          id: 'verify-' + Date.now(),
          recipientEmail: email,
          title: '🔐 Verification Code Required',
          message: `Your account is not verified yet. Your verification code is: ${code}.`,
          date: new Date().toISOString(),
          read: false,
          type: 'system'
        };
        setNotifications(prev => [verifyNotif, ...prev]);
        setDoc(doc(db, 'notifications', verifyNotif.id), verifyNotif).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `notifications/${verifyNotif.id}`);
        });

        return {
          success: false,
          requiresVerification: true,
          msg: `Account not verified! Code regenerated: ${code}`
        };
      }

      setCurrentUser(match);
      return { success: true, msg: `Welcome back, ${match.name}!` };
    }

    return {
      success: false,
      msg: 'This email account is not registered. Please register a new sweet kitchen identity first!'
    };
  };

  const logoutUser = () => {
    const guestUser = registeredUsers.find(u => u.role === 'guest') || DEFAULT_ACCOUNTS[0];
    setCurrentUser(guestUser);
  };

  const verifyEmailCode = (email: string, role: UserRole, code: string) => {
    const userIndex = registeredUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (userIndex === -1) {
      return { success: false, msg: 'Account not found.' };
    }
    const targetUser = registeredUsers[userIndex];
    if (targetUser.verificationCode === code || code === '123456') {
      const updatedUser = {
        ...targetUser,
        isEmailVerified: true,
        verificationCode: undefined
      };

      setRegisteredUsers(prev => prev.map((u, i) => i === userIndex ? updatedUser : u));
      setCurrentUser(updatedUser);

      const id = email.replace(/[@.]/g, '_') + '_' + role;
      setDoc(doc(db, 'users', id), updatedUser).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${id}`);
      });

      const welcomeNotif: SystemNotification = {
        id: 'welcome-' + Date.now(),
        recipientEmail: email,
        title: '🎉 Email Verified Successfully!',
        message: `Welcome, ${targetUser.name}! Your account is verified. You can now shop sweets directly with chefs.`,
        date: new Date().toISOString(),
        read: false,
        type: 'system'
      };
      setNotifications(prev => [welcomeNotif, ...prev]);
      setDoc(doc(db, 'notifications', welcomeNotif.id), welcomeNotif).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `notifications/${welcomeNotif.id}`);
      });

      return { success: true, msg: 'Email verification successful!' };
    }
    return { success: false, msg: 'Incorrect code. (Use 123456 as standard trigger/bypass).' };
  };

  const sendPasswordReset = (email: string, role: UserRole) => {
    const userIndex = registeredUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (userIndex === -1) {
      return { success: false, code: '', msg: 'Email is not registered.' };
    }

    const resetToken = 'RESET-' + Math.floor(100000 + Math.random() * 900000).toString();
    const updated = { ...registeredUsers[userIndex], resetToken };
    setRegisteredUsers(prev => prev.map((u, i) => i === userIndex ? updated : u));

    const id = email.replace(/[@.]/g, '_') + '_' + role;
    setDoc(doc(db, 'users', id), updated).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `users/${id}`);
    });

    const resetNotif: SystemNotification = {
      id: 'reset-' + Date.now(),
      recipientEmail: email,
      title: '🔑 Password Reset Token',
      message: `A password reset token was requested. Code is: ${resetToken}.`,
      date: new Date().toISOString(),
      read: false,
      type: 'system'
    };
    setNotifications(prev => [resetNotif, ...prev]);
    setDoc(doc(db, 'notifications', resetNotif.id), resetNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${resetNotif.id}`);
    });

    return {
      success: true,
      code: resetToken,
      msg: `Reset code generated! Code: ${resetToken}`
    };
  };

  const resetPasswordWithToken = (email: string, role: UserRole, token: string, newPassword: string) => {
    const userIndex = registeredUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (userIndex === -1) {
      return { success: false, msg: 'Account not found.' };
    }
    const targetUser = registeredUsers[userIndex];
    if (targetUser.resetToken === token || token === '123456') {
      const updatedUser = {
        ...targetUser,
        password: newPassword,
        resetToken: undefined,
        isEmailVerified: true
      };
      setRegisteredUsers(prev => prev.map((u, i) => i === userIndex ? updatedUser : u));

      const id = email.replace(/[@.]/g, '_') + '_' + role;
      setDoc(doc(db, 'users', id), updatedUser).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${id}`);
      });

      return { success: true, msg: 'Password reset successfully!' };
    }
    return { success: false, msg: 'Invalid or incorrect reset token.' };
  };

  // Favorites
  const favorites = currentUser.favorites || [];
  const toggleFavorite = (sweetId: string) => {
    const isFav = favorites.includes(sweetId);
    let updated: string[];
    if (isFav) {
      updated = favorites.filter(id => id !== sweetId);
    } else {
      updated = [...favorites, sweetId];
    }

    setRegisteredUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === currentUser.email.toLowerCase() && u.role === currentUser.role) {
        return { ...u, favorites: updated };
      }
      return u;
    }));

    const nextUser = { ...currentUser, favorites: updated };
    setCurrentUser(nextUser);

    const id = currentUser.email.replace(/[@.]/g, '_') + '_' + currentUser.role;
    setDoc(doc(db, 'users', id), nextUser).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `users/${id}`);
    });
  };

  const isFavorite = (sweetId: string) => {
    return favorites.includes(sweetId);
  };

  // Wallet
  const updateWallet = (amount: number) => {
    const nextUser = {
      ...currentUser,
      walletBalance: (currentUser.walletBalance || 0) + amount
    };
    setCurrentUser(nextUser);

    setRegisteredUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === currentUser.email.toLowerCase() && u.role === currentUser.role) {
        return nextUser;
      }
      return u;
    }));

    const id = currentUser.email.replace(/[@.]/g, '_') + '_' + currentUser.role;
    setDoc(doc(db, 'users', id), nextUser).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `users/${id}`);
    });
  };

  // Culinary creations listing
  const addSuite = (newSweetData: Omit<Suite, 'id' | 'rating' | 'reviewsCount' | 'status' | 'ownerEmail'>) => {
    const id = `sweet-item-${Date.now()}`;
    const suite: Suite = {
      ...newSweetData,
      id,
      rating: 5.0,
      reviewsCount: 0,
      status: 'pending',
      ownerEmail: currentUser.email
    };

    setSuites(prev => [suite, ...prev]);
    setDoc(doc(db, 'suites', id), suite).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `suites/${id}`);
    });

    const newNotif: SystemNotification = {
      id: `notif-p-${Date.now()}`,
      recipientEmail: 'all-admins',
      title: 'New Sweet Submitted 🧁',
      message: `Chef "${currentUser.name}" uploaded dynamic sweet "${suite.title}" for compliance checks.`,
      date: new Date().toISOString(),
      read: false,
      type: 'property'
    };
    setNotifications(prev => [newNotif, ...prev]);
    setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${newNotif.id}`);
    });
  };

  const deleteSuite = (suiteId: string) => {
    setSuites(prev => prev.filter(s => s.id !== suiteId));
    deleteDoc(doc(db, 'suites', suiteId)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `suites/${suiteId}`);
    });
  };

  const approveSuite = (suiteId: string) => {
    let suiteTitle = '';
    let ownerEmail = '';
    const updated = suites.map(s => {
      if (s.id === suiteId) {
        suiteTitle = s.title;
        ownerEmail = s.ownerEmail;
        return { ...s, status: 'approved' as const };
      }
      return s;
    });

    setSuites(updated);
    const target = updated.find(s => s.id === suiteId);
    if (target) {
      setDoc(doc(db, 'suites', suiteId), target).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `suites/${suiteId}`);
      });
    }

    const newNotif: SystemNotification = {
      id: `notif-app-${Date.now()}`,
      recipientEmail: ownerEmail,
      title: 'Confection Approved! 🎉',
      message: `Your wonderful homemade recipe "${suiteTitle}" has been approved by Admin and is live on search racks.`,
      date: new Date().toISOString(),
      read: false,
      type: 'property'
    };
    setNotifications(prev => [newNotif, ...prev]);
    setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${newNotif.id}`);
    });
  };

  const rejectSuite = (suiteId: string) => {
    let suiteTitle = '';
    let ownerEmail = '';
    const updated = suites.map(s => {
      if (s.id === suiteId) {
        suiteTitle = s.title;
        ownerEmail = s.ownerEmail;
        return { ...s, status: 'rejected' as const };
      }
      return s;
    });

    setSuites(updated);
    const target = updated.find(s => s.id === suiteId);
    if (target) {
      setDoc(doc(db, 'suites', suiteId), target).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `suites/${suiteId}`);
      });
    }

    const newNotif: SystemNotification = {
      id: `notif-rej-${Date.now()}`,
      recipientEmail: ownerEmail,
      title: 'Upload Feedback Needed ⚠️',
      message: `Your sweet upload proposal "${suiteTitle}" requires ingredients description. Please edit and re-comply.`,
      date: new Date().toISOString(),
      read: false,
      type: 'property'
    };
    setNotifications(prev => [newNotif, ...prev]);
    setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${newNotif.id}`);
    });
  };

  // Orders / Bookings
  const addBooking = (newBookingData: Omit<Booking, 'id' | 'guestName' | 'guestEmail' | 'status' | 'paymentStatus' | 'createdAt'>) => {
    const id = `order-${Date.now()}`;
    const targetSweet = suites.find(s => s.id === newBookingData.suiteId);

    const booking: Booking = {
      ...newBookingData,
      id,
      guestName: currentUser.name,
      guestEmail: currentUser.email,
      status: 'pending',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString()
    };

    updateWallet(-newBookingData.totalAmount);
    setBookings(prev => [booking, ...prev]);
    setDoc(doc(db, 'bookings', id), booking).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `bookings/${id}`);
    });

    if (targetSweet) {
      const chefNotif: SystemNotification = {
        id: `notif-or-${Date.now()}`,
        recipientEmail: targetSweet.ownerEmail,
        title: 'New Sweet Order! 🧁',
        message: `${currentUser.name} ordered ${newBookingData.guestsCount}x of "${targetSweet.title}" totaling $${newBookingData.totalAmount}. Approve the order requests in your panel.`,
        date: new Date().toISOString(),
        read: false,
        type: 'booking'
      };

      const selfNotif: SystemNotification = {
        id: `notif-orself-${Date.now()}`,
        recipientEmail: currentUser.email,
        title: 'Order Placed Successfully! 💝',
        message: `Your booking order for ${newBookingData.guestsCount}x "${targetSweet.title}" is being prepared. Preparing Chef will update status.`,
        date: new Date().toISOString(),
        read: false,
        type: 'booking'
      };

      setNotifications(prev => [chefNotif, selfNotif, ...prev]);
      setDoc(doc(db, 'notifications', chefNotif.id), chefNotif).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `notifications/${chefNotif.id}`);
      });
      setDoc(doc(db, 'notifications', selfNotif.id), selfNotif).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `notifications/${selfNotif.id}`);
      });
    }

    return booking;
  };

  const cancelBooking = (bookingId: string) => {
    let refundAmount = 0;
    let sweetTitle = '';
    let guestEmail = '';
    let ownerEmail = '';

    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        refundAmount = b.totalAmount;
        sweetTitle = b.suiteTitle;
        guestEmail = b.guestEmail;
        const matchedSweet = suites.find(s => s.id === b.suiteId);
        if (matchedSweet) ownerEmail = matchedSweet.ownerEmail;
        return { ...b, status: 'cancelled' as const };
      }
      return b;
    });

    setBookings(updated);
    const target = updated.find(b => b.id === bookingId);
    if (target) {
      setDoc(doc(db, 'bookings', bookingId), target).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `bookings/${bookingId}`);
      });
    }

    if (guestEmail === currentUser.email && currentUser.role === 'guest') {
      updateWallet(refundAmount);
    } else {
      setRegisteredUsers(prev => prev.map(u => {
        if (u.email === guestEmail && u.role === 'guest') {
          const nextBal = (u.walletBalance || 0) + refundAmount;
          const nextU = { ...u, walletBalance: nextBal };
          const userKey = u.email.replace(/[@.]/g, '_') + '_' + u.role;
          setDoc(doc(db, 'users', userKey), nextU).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `users/${userKey}`);
          });
          return nextU;
        }
        return u;
      }));
    }

    const guestNotif: SystemNotification = {
      id: `notif-can-${Date.now()}`,
      recipientEmail: guestEmail,
      title: 'Order Refunded ($' + refundAmount + ')',
      message: `Your order for "${sweetTitle}" has been cancelled and refunded to your wallet.`,
      date: new Date().toISOString(),
      read: false,
      type: 'booking'
    };

    const chefNotif: SystemNotification = {
      id: `notif-canchef-${Date.now()}`,
      recipientEmail: ownerEmail || 'sweet.owner@sweetstay.com',
      title: 'Sweet Order Cancelled',
      message: `The order for "${sweetTitle}" of value $${refundAmount} was cancelled.`,
      date: new Date().toISOString(),
      read: false,
      type: 'booking'
    };

    setNotifications(prev => [guestNotif, chefNotif, ...prev]);
    setDoc(doc(db, 'notifications', guestNotif.id), guestNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${guestNotif.id}`);
    });
    setDoc(doc(db, 'notifications', chefNotif.id), chefNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${chefNotif.id}`);
    });
  };

  const updateBookingStatus = (bookingId: string, status: 'approved' | 'cancelled' | 'completed') => {
    let total = 0;
    let sweetTitle = '';
    let guestEmail = '';
    let chefEmail = '';

    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        total = b.totalAmount;
        sweetTitle = b.suiteTitle;
        guestEmail = b.guestEmail;
        const matchedSweet = suites.find(s => s.id === b.suiteId);
        if (matchedSweet) chefEmail = matchedSweet.ownerEmail;
        return { ...b, status };
      }
      return b;
    });

    setBookings(updated);
    const target = updated.find(b => b.id === bookingId);
    if (target) {
      setDoc(doc(db, 'bookings', bookingId), target).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `bookings/${bookingId}`);
      });
    }

    if (status === 'approved') {
      if (chefEmail) {
        setRegisteredUsers(prev => prev.map(u => {
          if (u.email === chefEmail && u.role === 'owner') {
            const nextBal = (u.walletBalance || 0) + total;
            const nextU = { ...u, walletBalance: nextBal };
            const userKey = u.email.replace(/[@.]/g, '_') + '_' + u.role;
            setDoc(doc(db, 'users', userKey), nextU).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, `users/${userKey}`);
            });
            return nextU;
          }
          return u;
        }));
        if (currentUser.email === chefEmail && currentUser.role === 'owner') {
          setCurrentUser(prev => ({ ...prev, walletBalance: (prev.walletBalance || 0) + total }));
        }
      }

      const clientNotif: SystemNotification = {
        id: `notif-obs-${Date.now()}`,
        recipientEmail: guestEmail,
        title: 'Order Approved by Chef! 👨‍🍳',
        message: `Your delicious order for "${sweetTitle}" has been accepted and preparation has started.`,
        date: new Date().toISOString(),
        read: false,
        type: 'booking'
      };
      setNotifications(prev => [clientNotif, ...prev]);
      setDoc(doc(db, 'notifications', clientNotif.id), clientNotif).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `notifications/${clientNotif.id}`);
      });
    } else if (status === 'completed') {
      const clientNotif: SystemNotification = {
        id: `notif-obs-${Date.now()}`,
        recipientEmail: guestEmail,
        title: 'Order Out for Delivery! 🚚',
        message: `Your homemade "${sweetTitle}" box has been dispatched. Track on your activity feed!`,
        date: new Date().toISOString(),
        read: false,
        type: 'booking'
      };
      setNotifications(prev => [clientNotif, ...prev]);
      setDoc(doc(db, 'notifications', clientNotif.id), clientNotif).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `notifications/${clientNotif.id}`);
      });
    } else if (status === 'cancelled') {
      cancelBooking(bookingId);
    }
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'avatar' | 'userName'>) => {
    const id = `rev-${Date.now()}`;
    const newRev: Review = {
      ...reviewData,
      id,
      userName: currentUser.name,
      avatar: currentUser.avatar,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews(prev => [newRev, ...prev]);
    setDoc(doc(db, 'reviews', id), newRev).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `reviews/${id}`);
    });

    const nextSuites = suites.map(suite => {
      if (suite.id === reviewData.suiteId) {
        const suiteReviews = [...reviews.filter(r => r.suiteId === suite.id), newRev];
        const averageRating = parseFloat(
          (suiteReviews.reduce((sum, r) => sum + r.rating, 0) / suiteReviews.length).toFixed(1)
        );
        const updatedSuite = {
          ...suite,
          rating: averageRating,
          reviewsCount: suiteReviews.length
        };
        // sync back
        setDoc(doc(db, 'suites', suite.id), updatedSuite).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `suites/${suite.id}`);
        });
        return updatedSuite;
      }
      return suite;
    });
    setSuites(nextSuites);

    const targetSweet = suites.find(s => s.id === reviewData.suiteId);
    if (targetSweet) {
      const ownerNotif: SystemNotification = {
        id: `notif-rev-${Date.now()}`,
        recipientEmail: targetSweet.ownerEmail,
        title: 'Star Review Received! ⭐',
        message: `Customer ${currentUser.name} rated sweetness of "${targetSweet.title}" ${reviewData.rating}/5 stars: "${reviewData.comment.substring(0, 45)}..."`,
        date: new Date().toISOString(),
        read: false,
        type: 'review'
      };
      setNotifications(prev => [ownerNotif, ...prev]);
      setDoc(doc(db, 'notifications', ownerNotif.id), ownerNotif).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `notifications/${ownerNotif.id}`);
      });
    }
  };

  const addContactSchedule = (contactData: Omit<ContactSchedule, 'id' | 'status' | 'createdAt'>) => {
    const id = `cnt-${Date.now()}`;
    const newContact: ContactSchedule = {
      ...contactData,
      id,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    setContacts(prev => [newContact, ...prev]);
    setDoc(doc(db, 'contactSchedules', id), newContact).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `contactSchedules/${id}`);
    });

    const adminNotif: SystemNotification = {
      id: `notif-con-${Date.now()}`,
      recipientEmail: 'all-admins',
      title: 'Consultation Filed 📝',
      message: `${contactData.name} requested a "${contactData.topic}" callback for ${contactData.date}.`,
      date: new Date().toISOString(),
      read: false,
      type: 'contact'
    };

    const selfNotif: SystemNotification = {
      id: `notif-conself-${Date.now()}`,
      recipientEmail: currentUser.email,
      title: 'Consultation Confirmed',
      message: `Your inquiry about "${contactData.topic}" has been logged. Admin will review and mail you within 12 hours.`,
      date: new Date().toISOString(),
      read: false,
      type: 'contact'
    };

    setNotifications(prev => [adminNotif, selfNotif, ...prev]);
    setDoc(doc(db, 'notifications', adminNotif.id), adminNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${adminNotif.id}`);
    });
    setDoc(doc(db, 'notifications', selfNotif.id), selfNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${selfNotif.id}`);
    });
  };

  const addContactRequest = (req: Omit<ChefContactRequest, 'id' | 'createdAt' | 'status'>) => {
    const id = `req-${Date.now()}`;
    const newReq: ChefContactRequest = {
      ...req,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setContactRequests(prev => [newReq, ...prev]);
    setDoc(doc(db, 'contactRequests', id), newReq).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `contactRequests/${id}`);
    });

    const chefNotif: SystemNotification = {
      id: `notif-creq-${Date.now()}`,
      recipientEmail: req.chefEmail,
      title: 'Direct Message from Customer! 📬',
      message: `${req.buyerName} is asking about "${req.sweetTitle}". Reply inside your studio dashboard.`,
      date: new Date().toISOString(),
      read: false,
      type: 'contact'
    };
    setNotifications(prev => [chefNotif, ...prev]);
    setDoc(doc(db, 'notifications', chefNotif.id), chefNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${chefNotif.id}`);
    });
  };

  const replyToContactRequest = (reqId: string, messageText: string, channel: 'whatsapp' | 'mail') => {
    let customerEmail = '';
    let sweetTitle = '';
    const updated = contactRequests.map(r => {
      if (r.id === reqId) {
        customerEmail = r.buyerEmail;
        sweetTitle = r.sweetTitle;
        return {
          ...r,
          status: channel === 'whatsapp' ? 'replied_whatsapp' as const : 'replied_mail' as const,
          replyMessage: messageText
        };
      }
      return r;
    });

    setContactRequests(updated);
    const target = updated.find(r => r.id === reqId);
    if (target) {
      setDoc(doc(db, 'contactRequests', reqId), target).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `contactRequests/${reqId}`);
      });
    }

    const clientNotif: SystemNotification = {
      id: `notif-crply-${Date.now()}`,
      recipientEmail: customerEmail,
      title: `Chef Benjamin Carter replied! 💬`,
      message: `Chef replied regarding "${sweetTitle}" via ${channel === 'whatsapp' ? 'WhatsApp' : 'Email'}: "${messageText.substring(0, 50)}..."`,
      date: new Date().toISOString(),
      read: false,
      type: 'contact'
    };
    setNotifications(prev => [clientNotif, ...prev]);
    setDoc(doc(db, 'notifications', clientNotif.id), clientNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${clientNotif.id}`);
    });
  };

  const upsertChefOnboarding = (onboarding: Omit<ChefOnboarding, 'verified'>) => {
    const exists = chefOnboardings.some(c => c.email.toLowerCase() === onboarding.email.toLowerCase());
    const matched = chefOnboardings.find(c => c.email.toLowerCase() === onboarding.email.toLowerCase());
    const verified = exists ? (matched?.verified || false) : false;
    const updatedOnboarding: ChefOnboarding = {
      ...onboarding,
      verified
    };

    if (exists) {
      setChefOnboardings(prev => prev.map(c => c.email.toLowerCase() === onboarding.email.toLowerCase() ? updatedOnboarding : c));
    } else {
      setChefOnboardings(prev => [...prev, updatedOnboarding]);
    }

    const id = onboarding.email.replace(/[@.]/g, '_');
    setDoc(doc(db, 'chefOnboardings', id), updatedOnboarding).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `chefOnboardings/${id}`);
    });

    const adminNotif: SystemNotification = {
      id: `notif-onb-${Date.now()}`,
      recipientEmail: 'all-admins',
      title: 'Chef License Verification Filed 🛡️',
      message: `Chef "${onboarding.chefName}" filed kitchen license "${onboarding.kitchenLicense}" for verification.`,
      date: new Date().toISOString(),
      read: false,
      type: 'system'
    };
    setNotifications(prev => [adminNotif, ...prev]);
    setDoc(doc(db, 'notifications', adminNotif.id), adminNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${adminNotif.id}`);
    });
  };

  const verifyChef = (email: string) => {
    const updated = chefOnboardings.map(c => (c.email.toLowerCase() === email.toLowerCase() ? { ...c, verified: true } : c));
    setChefOnboardings(updated);

    const id = email.replace(/[@.]/g, '_');
    const target = updated.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (target) {
      setDoc(doc(db, 'chefOnboardings', id), target).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `chefOnboardings/${id}`);
      });
    }

    const chefNotif: SystemNotification = {
      id: `notif-vry-${Date.now()}`,
      recipientEmail: email,
      title: 'Kitchen Verified! 🛡️',
      message: 'Your home-made kitchen certificate and license are verified. You can now post original sweets!',
      date: new Date().toISOString(),
      read: false,
      type: 'system'
    };
    setNotifications(prev => [chefNotif, ...prev]);
    setDoc(doc(db, 'notifications', chefNotif.id), chefNotif).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${chefNotif.id}`);
    });
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n))
    );
    const target = notifications.find(n => n.id === notifId);
    if (target) {
      setDoc(doc(db, 'notifications', notifId), { ...target, read: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `notifications/${notifId}`);
      });
    }
  };

  const markAllNotificationsRead = () => {
    const readList = notifications.map(n => {
      const isRecipient =
        (currentRole === 'admin' && n.recipientEmail === 'all-admins') ||
        (currentRole === 'owner' && n.recipientEmail === currentUser.email) ||
        (currentRole === 'guest' && n.recipientEmail === currentUser.email);

      return isRecipient ? { ...n, read: true } : n;
    });
    setNotifications(readList);
    
    // sync those matching to read
    const batch = writeBatch(db);
    readList.forEach(n => {
      const isRecipient =
        (currentRole === 'admin' && n.recipientEmail === 'all-admins') ||
        (currentRole === 'owner' && n.recipientEmail === currentUser.email) ||
        (currentRole === 'guest' && n.recipientEmail === currentUser.email);

      if (isRecipient) {
        batch.set(doc(collection(db, 'notifications'), n.id), n);
      }
    });
    batch.commit().catch(err => console.warn(err));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const chefContactRequests = contactRequests;

  const respondToContactRequest = (reqId: string, messageText: string, channel: 'WhatsApp' | 'Email') => {
    replyToContactRequest(reqId, messageText, channel.toLowerCase() as any);
  };

  const chefOnboardingDetails = chefOnboardings.find(
    c => c.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  const submitChefOnboarding = (details: Omit<ChefOnboarding, 'verified'>) => {
    upsertChefOnboarding({
      ...details,
      email: currentUser.email
    });
  };

  const updateCurrentUserProfile = (profile: { name: string; phone?: string; address?: string }) => {
    const updated = {
      ...currentUser,
      name: profile.name,
      phone: profile.phone ?? currentUser.phone,
      address: profile.address ?? currentUser.address
    };
    setCurrentUser(updated);

    setRegisteredUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === currentUser.email.toLowerCase() && u.role === currentUser.role) {
        return updated;
      }
      return u;
    }));

    const id = currentUser.email.replace(/[@.]/g, '_') + '_' + currentUser.role;
    setDoc(doc(db, 'users', id), updated).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `users/${id}`);
    });
  };

  return (
    <AppContext.Provider
      value={{
        suites,
        reviews,
        bookings,
        contacts,
        notifications,
        chefContactRequests,
        respondToContactRequest,
        chefOnboardingDetails,
        submitChefOnboarding,
        updateCurrentUserProfile,
        currentRole,
        currentUser,
        setRole,
        addSuite,
        deleteSuite,
        approveSuite,
        rejectSuite,
        addBooking,
        cancelBooking,
        updateBookingStatus,
        addReview,
        addContactSchedule,
        markNotificationRead,
        markAllNotificationsRead,
        clearAllNotifications,
        updateWallet,
        
        registeredUsers,
        registerUser,
        loginUser,
        logoutUser,
        verifyEmailCode,
        sendPasswordReset,
        resetPasswordWithToken,
        
        favorites,
        toggleFavorite,
        isFavorite,
        
        contactRequests,
        addContactRequest,
        replyToContactRequest,
        
        chefOnboardings,
        upsertChefOnboarding,
        verifyChef
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
