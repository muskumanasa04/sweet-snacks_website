import React, { createContext, useContext, useState, useEffect } from 'react';
import { Suite, Review, Booking, ContactSchedule, SystemNotification, UserRole, UserIdentity, ChefContactRequest, ChefOnboarding } from '../types';
import { INITIAL_SUITES, INITIAL_REVIEWS, INITIAL_BOOKINGS, INITIAL_CONTACTS, INITIAL_NOTIFICATIONS } from '../data/initialData';

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
  
  // Auth and Profile System
  registeredUsers: UserIdentity[];
  registerUser: (user: Omit<UserIdentity, 'walletBalance'>) => { success: boolean; requiresVerification: boolean; msg: string };
  loginUser: (email: string, role: UserRole, password?: string) => { success: boolean; requiresVerification?: boolean; msg: string };
  logoutUser: () => void;
  verifyEmailCode: (email: string, role: UserRole, code: string) => { success: boolean; msg: string };
  sendPasswordReset: (email: string, role: UserRole) => { success: boolean; code: string; msg: string };
  resetPasswordWithToken: (email: string, role: UserRole, token: string, newPassword: string) => { success: boolean; msg: string };
  
  // Favorites system
  favorites: string[];
  toggleFavorite: (sweetId: string) => void;
  isFavorite: (sweetId: string) => boolean;
  
  // Chef direct contact requests ("Contact Owner")
  contactRequests: ChefContactRequest[];
  chefContactRequests: ChefContactRequest[];
  addContactRequest: (req: Omit<ChefContactRequest, 'id' | 'createdAt' | 'status'>) => void;
  replyToContactRequest: (reqId: string, messageText: string, channel: 'whatsapp' | 'mail') => void;
  respondToContactRequest: (reqId: string, messageText: string, channel: 'WhatsApp' | 'Email') => void;
  
  // Chef Onboarding and profile updates
  chefOnboardingDetails: ChefOnboarding | undefined;
  submitChefOnboarding: (details: Omit<ChefOnboarding, 'verified'>) => void;
  updateCurrentUserProfile: (profile: { name: string; phone?: string; address?: string }) => void;

  // Chef onboarding & KYC registration details before upload of sweets
  chefOnboardings: ChefOnboarding[];
  upsertChefOnboarding: (onboarding: Omit<ChefOnboarding, 'verified'>) => void;
  verifyChef: (email: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Initial list of registered accounts
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

// Initial Chef verification/onboardings
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

// Initial Chef contact messages
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
  // Config state
  const [registeredUsers, setRegisteredUsers] = useState<UserIdentity[]>(() => {
    const saved = localStorage.getItem('gourmet_accounts_v2');
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  const [chefOnboardings, setChefOnboardings] = useState<ChefOnboarding[]>(() => {
    const saved = localStorage.getItem('gourmet_chef_onboardings_v2');
    return saved ? JSON.parse(saved) : DEFAULT_ONBOARDINGS;
  });

  const [contactRequests, setContactRequests] = useState<ChefContactRequest[]>(() => {
    const saved = localStorage.getItem('gourmet_contact_requests_v2');
    return saved ? JSON.parse(saved) : DEFAULT_CONTACT_REQUESTS;
  });

  const [suites, setSuites] = useState<Suite[]>(() => {
    const saved = localStorage.getItem('gourmet_suites_list_v2');
    return saved ? JSON.parse(saved) : INITIAL_SUITES;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('gourmet_reviews_list_v2');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('gourmet_bookings_list_v2');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [contacts, setContacts] = useState<ContactSchedule[]>(() => {
    const saved = localStorage.getItem('gourmet_contacts_list_v2');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('gourmet_notifications_list_v2');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [currentUser, setCurrentUser] = useState<UserIdentity>(() => {
    const savedUser = localStorage.getItem('gourmet_logged_in_user_v2');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return DEFAULT_ACCOUNTS[0]; // Kumari Manasa Guest default
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedUser = localStorage.getItem('gourmet_logged_in_user_v2');
    if (savedUser) {
      return JSON.parse(savedUser).role;
    }
    return 'guest';
  });

  // Keep Local Storage synced
  useEffect(() => {
    localStorage.setItem('gourmet_accounts_v2', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('gourmet_chef_onboardings_v2', JSON.stringify(chefOnboardings));
  }, [chefOnboardings]);

  useEffect(() => {
    localStorage.setItem('gourmet_contact_requests_v2', JSON.stringify(contactRequests));
  }, [contactRequests]);

  useEffect(() => {
    localStorage.setItem('gourmet_suites_list_v2', JSON.stringify(suites));
  }, [suites]);

  useEffect(() => {
    localStorage.setItem('gourmet_reviews_list_v2', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('gourmet_bookings_list_v2', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('gourmet_contacts_list_v2', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('gourmet_notifications_list_v2', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('gourmet_logged_in_user_v2', JSON.stringify(currentUser));
    setCurrentRole(currentUser.role);
  }, [currentUser]);

  // Auth Functions
  const setRole = (role: UserRole) => {
    // Switch to first matching role account or a mock workspace profile
    const existing = registeredUsers.find(u => u.role === role);
    if (existing) {
      setCurrentUser(existing);
    } else {
      // Setup dynamic fallback profile
      const rawUser = registeredUsers.find(u => u.email === currentUser.email);
      if (rawUser && rawUser.role === role) {
        setCurrentUser(rawUser);
      } else {
        // Fallback placeholder
        setCurrentUser({
          email: role === 'admin' ? 'admin.chief@sweetstay.com' : role === 'owner' ? 'sweet.owner@sweetstay.com' : 'guest.tester@sweetstay.com',
          name: role === 'admin' ? 'Chief Admin Agent' : role === 'owner' ? 'Home Sweet Chef' : 'Guest Tester',
          role,
          avatar: role === 'owner' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120' : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
          walletBalance: 500
        });
      }
    }
  };

  const registerUser = (user: Omit<UserIdentity, 'walletBalance'>): { success: boolean; requiresVerification: boolean; msg: string } => {
    const exists = registeredUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase() && u.role === user.role);
    if (exists) {
      return { success: false, requiresVerification: false, msg: 'This email address is already registered on this specific workspace role.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser: UserIdentity = {
      ...user,
      walletBalance: user.role === 'guest' ? 1000 : 0,
      favorites: [],
      isEmailVerified: false,
      verificationCode: code
    };
    setRegisteredUsers(prev => [...prev, newUser]);

    // Dispatch system notification with code for sandbox visibility
    const newNotif: SystemNotification = {
      id: 'verify-' + Date.now(),
      recipientEmail: user.email,
      title: '🔐 Email Verification Code',
      message: `Your Sweets & Snacks email verification code is: ${code}. Enter this code to verify your profile.`,
      date: new Date().toISOString(),
      read: false,
      type: 'system'
    };
    setNotifications(prev => [newNotif, ...prev]);

    return {
      success: true,
      requiresVerification: true,
      msg: `Account registered successfully! A 6-digit verification code has been generated. Use code ${code} to verify.`
    };
  };

  const loginUser = (email: string, role: UserRole, password?: string): { success: boolean; requiresVerification?: boolean; msg: string } => {
    const match = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (match) {
      // Check password matching
      if (match.password && match.password !== password) {
        return { success: false, msg: 'Account credential mismatch. The password you entered is incorrect.' };
      }

      // Check email verification status
      if (match.isEmailVerified === false) {
        let code = match.verificationCode;
        if (!code) {
          code = Math.floor(100000 + Math.random() * 900000).toString();
          setRegisteredUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role ? { ...u, verificationCode: code } : u));
        }

        const verifyNotif: SystemNotification = {
          id: 'verify-' + Date.now(),
          recipientEmail: email,
          title: '🔐 Email Verification Code Required',
          message: `Your account is not verified yet. Your verification code is: ${code}.`,
          date: new Date().toISOString(),
          read: false,
          type: 'system'
        };
        setNotifications(prev => [verifyNotif, ...prev]);

        return {
          success: false,
          requiresVerification: true,
          msg: `Your email is not verified yet. Verification code regenerated! Use: ${code}`
        };
      }

      setCurrentUser(match);
      return { success: true, msg: `Welcome back, ${match.name}! Login successful.` };
    }

    // Default accounts don't exist under this email/role, so let's allow registration instead of auto provisioning to keep it realistic
    return {
      success: false,
      msg: 'This email account is not registered under this role. Please register a new sweet kitchen identity first!'
    };
  };

  const logoutUser = () => {
    const guestUser = registeredUsers.find(u => u.role === 'guest') || DEFAULT_ACCOUNTS[0];
    setCurrentUser(guestUser);
  };

  const verifyEmailCode = (email: string, role: UserRole, code: string): { success: boolean; msg: string } => {
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

      const welcomeNotif: SystemNotification = {
        id: 'welcome-' + Date.now(),
        recipientEmail: email,
        title: '🎉 Email Verified Successfully!',
        message: `Welcome, ${targetUser.name}! Your account is verified. You can now place orders or request catering, direct with chefs.`,
        date: new Date().toISOString(),
        read: false,
        type: 'system'
      };
      setNotifications(prev => [welcomeNotif, ...prev]);

      return { success: true, msg: 'Email verification successful! Welcome.' };
    }
    return { success: false, msg: 'Mismatch code. Use 123456 or look up the code in notifications drawer 🔔.' };
  };

  const sendPasswordReset = (email: string, role: UserRole): { success: boolean; code: string; msg: string } => {
    const userIndex = registeredUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (userIndex === -1) {
      return { success: false, code: '', msg: 'Email address not registered under this role.' };
    }

    const resetToken = 'RESET-' + Math.floor(100000 + Math.random() * 900000).toString();
    setRegisteredUsers(prev => prev.map((u, i) => i === userIndex ? { ...u, resetToken } : u));

    const resetNotif: SystemNotification = {
      id: 'reset-' + Date.now(),
      recipientEmail: email,
      title: '🔑 Password Reset Code Generated',
      message: `A password reset code has been requested. Code is: ${resetToken}. Enter this code in the reset container.`,
      date: new Date().toISOString(),
      read: false,
      type: 'system'
    };
    setNotifications(prev => [resetNotif, ...prev]);

    return {
      success: true,
      code: resetToken,
      msg: `A reset code has been generated. Use code ${resetToken} to reset your password.`
    };
  };

  const resetPasswordWithToken = (email: string, role: UserRole, token: string, newPassword: string): { success: boolean; msg: string } => {
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
      return { success: true, msg: 'Password reset successfully! You can now log in.' };
    }
    return { success: false, msg: 'Invalid or incorrect reset token. Check notification drawer 🔔.' };
  };

  // Favoriting
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
      if (u.email === currentUser.email && u.role === currentUser.role) {
        return { ...u, favorites: updated };
      }
      return u;
    }));

    setCurrentUser(prev => ({ ...prev, favorites: updated }));
  };

  const isFavorite = (sweetId: string) => {
    return favorites.includes(sweetId);
  };

  // Wallet updates
  const updateWallet = (amount: number) => {
    setRegisteredUsers(prev => prev.map(u => {
      if (u.email === currentUser.email && u.role === currentUser.role) {
        const balance = (u.walletBalance || 0) + amount;
        return { ...u, walletBalance: balance };
      }
      return u;
    }));
    setCurrentUser(prev => ({
      ...prev,
      walletBalance: (prev.walletBalance || 0) + amount
    }));
  };

  // Add Homemade Sweet (Owner Role)
  const addSuite = (newSweetData: Omit<Suite, 'id' | 'rating' | 'reviewsCount' | 'status' | 'ownerEmail'>) => {
    const id = `sweet-item-${Date.now()}`;
    const suite: Suite = {
      ...newSweetData,
      id,
      rating: 5.0,
      reviewsCount: 0,
      status: 'pending', // Pending state for Administrator approval
      ownerEmail: currentUser.email
    };

    setSuites(prev => [suite, ...prev]);

    // System Notification to Admins
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
  };

  const deleteSuite = (suiteId: string) => {
    setSuites(prev => prev.filter(s => s.id !== suiteId));
  };

  // Approve sweet (Admin Role)
  const approveSuite = (suiteId: string) => {
    let suiteTitle = '';
    let ownerEmail = '';
    setSuites(prev =>
      prev.map(s => {
        if (s.id === suiteId) {
          suiteTitle = s.title;
          ownerEmail = s.ownerEmail;
          return { ...s, status: 'approved' };
        }
        return s;
      })
    );

    // Notify Chef
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
  };

  // Reject sweet (Admin Role)
  const rejectSuite = (suiteId: string) => {
    let suiteTitle = '';
    let ownerEmail = '';
    setSuites(prev =>
      prev.map(s => {
        if (s.id === suiteId) {
          suiteTitle = s.title;
          ownerEmail = s.ownerEmail;
          return { ...s, status: 'rejected' };
        }
        return s;
      })
    );

    // Notify Chef
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
  };

  // Add Sweet purchase (Booking / Order)
  const addBooking = (newBookingData: Omit<Booking, 'id' | 'guestName' | 'guestEmail' | 'status' | 'paymentStatus' | 'createdAt'>) => {
    const id = `order-${Date.now()}`;
    const targetSweet = suites.find(s => s.id === newBookingData.suiteId);

    const booking: Booking = {
      ...newBookingData,
      id,
      guestName: currentUser.name,
      guestEmail: currentUser.email,
      status: 'pending', // Starts as pending for Chef approval
      paymentStatus: 'paid',
      createdAt: new Date().toISOString()
    };

    // Charge customer
    updateWallet(-newBookingData.totalAmount);

    setBookings(prev => [booking, ...prev]);

    // Send notifications to Chef
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
    }

    return booking;
  };

  const cancelBooking = (bookingId: string) => {
    let refundAmount = 0;
    let sweetTitle = '';
    let guestEmail = '';
    let ownerEmail = '';

    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          refundAmount = b.totalAmount;
          sweetTitle = b.suiteTitle;
          guestEmail = b.guestEmail;
          const matchedSweet = suites.find(s => s.id === b.suiteId);
          if (matchedSweet) ownerEmail = matchedSweet.ownerEmail;
          return { ...b, status: 'cancelled' as const };
        }
        return b;
      })
    );

    // Refund Wallet
    if (guestEmail === currentUser.email && currentUser.role === 'guest') {
      updateWallet(refundAmount);
    } else {
      // Refund to other guest account
      setRegisteredUsers(prev => prev.map(u => {
        if (u.email === guestEmail && u.role === 'guest') {
          return { ...u, walletBalance: (u.walletBalance || 0) + refundAmount };
        }
        return u;
      }));
    }

    // Notifications
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
  };

  // Change Order status (Chef Panel approved / completed)
  const updateBookingStatus = (bookingId: string, status: 'approved' | 'cancelled' | 'completed') => {
    let total = 0;
    let sweetTitle = '';
    let guestEmail = '';
    let chefEmail = '';

    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          total = b.totalAmount;
          sweetTitle = b.suiteTitle;
          guestEmail = b.guestEmail;
          const matchedSweet = suites.find(s => s.id === b.suiteId);
          if (matchedSweet) chefEmail = matchedSweet.ownerEmail;
          return { ...b, status };
        }
        return b;
      })
    );

    if (status === 'approved') {
      // Disburse earnings to chef
      if (chefEmail) {
        setRegisteredUsers(prev => prev.map(u => {
          if (u.email === chefEmail && u.role === 'owner') {
            return { ...u, walletBalance: (u.walletBalance || 0) + total };
          }
          return u;
        }));
        if (currentUser.email === chefEmail && currentUser.role === 'owner') {
          setCurrentUser(prev => ({ ...prev, walletBalance: (prev.walletBalance || 0) + total }));
        }
      }

      // Notify customer
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
    } else if (status === 'cancelled') {
      // cancel & refund
      cancelBooking(bookingId);
    }
  };

  // Add Review
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

    // Recalculate Rating
    setSuites(prev =>
      prev.map(suite => {
        if (suite.id === reviewData.suiteId) {
          const suiteReviews = [...reviews.filter(r => r.suiteId === suite.id), newRev];
          const averageRating = parseFloat(
            (suiteReviews.reduce((sum, r) => sum + r.rating, 0) / suiteReviews.length).toFixed(1)
          );
          return {
            ...suite,
            rating: averageRating,
            reviewsCount: suiteReviews.length
          };
        }
        return suite;
      })
    );

    // Notify Chef
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
    }
  };

  // Add Help Contact form schedule
  const addContactSchedule = (contactData: Omit<ContactSchedule, 'id' | 'status' | 'createdAt'>) => {
    const id = `cnt-${Date.now()}`;
    const newContact: ContactSchedule = {
      ...contactData,
      id,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    setContacts(prev => [newContact, ...prev]);

    // Send notifications to Admin and Self
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
  };

  // Contact requests directly to Chefs (e.g. "Contact Owner")
  const addContactRequest = (req: Omit<ChefContactRequest, 'id' | 'createdAt' | 'status'>) => {
    const id = `req-${Date.now()}`;
    const newReq: ChefContactRequest = {
      ...req,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setContactRequests(prev => [newReq, ...prev]);

    // Notify Chef
    const chefNotif: SystemNotification = {
      id: `notif-creq-${Date.now()}`,
      recipientEmail: req.chefEmail,
      title: 'Direct Message from Customer! 📬',
      message: `${req.buyerName} is asking about "${req.sweetTitle}". Reply to their WhatsApp/email inside your studio dashboard.`,
      date: new Date().toISOString(),
      read: false,
      type: 'contact'
    };
    setNotifications(prev => [chefNotif, ...prev]);
  };

  const replyToContactRequest = (reqId: string, messageText: string, channel: 'whatsapp' | 'mail') => {
    let customerEmail = '';
    let sweetTitle = '';
    setContactRequests(prev =>
      prev.map(r => {
        if (r.id === reqId) {
          customerEmail = r.buyerEmail;
          sweetTitle = r.sweetTitle;
          return {
            ...r,
            status: channel === 'whatsapp' ? 'replied_whatsapp' : 'replied_mail',
            replyMessage: messageText
          };
        }
        return r;
      })
    );

    // Notify Customer about reply
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
  };

  // Chef onboarding & compliance
  const upsertChefOnboarding = (onboarding: Omit<ChefOnboarding, 'verified'>) => {
    const exists = chefOnboardings.some(c => c.email.toLowerCase() === onboarding.email.toLowerCase());
    const updatedOnboarding: ChefOnboarding = {
      ...onboarding,
      verified: exists ? (chefOnboardings.find(c => c.email.toLowerCase() === onboarding.email.toLowerCase())?.verified || false) : false
    };

    if (exists) {
      setChefOnboardings(prev => prev.map(c => c.email.toLowerCase() === onboarding.email.toLowerCase() ? updatedOnboarding : c));
    } else {
      setChefOnboardings(prev => [...prev, updatedOnboarding]);
    }

    // Trigger Admin Notification for Verification checks
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
  };

  const verifyChef = (email: string) => {
    setChefOnboardings(prev =>
      prev.map(c => (c.email.toLowerCase() === email.toLowerCase() ? { ...c, verified: true } : c))
    );

    // Notify Chef
    const chefNotif: SystemNotification = {
      id: `notif-vry-${Date.now()}`,
      recipientEmail: email,
      title: 'Kitchen Verified! 🛡️',
      message: 'Your home-made kitchen certificate and license are verified. You can now post new cookie-cutter sweets!',
      date: new Date().toISOString(),
      read: false,
      type: 'system'
    };
    setNotifications(prev => [chefNotif, ...prev]);
  };

  // Notification actions
  const markNotificationRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev =>
      prev.map(n => {
        const isRecipient =
          (currentRole === 'admin' && n.recipientEmail === 'all-admins') ||
          (currentRole === 'owner' && n.recipientEmail === currentUser.email) ||
          (currentRole === 'guest' && n.recipientEmail === currentUser.email);

        return isRecipient ? { ...n, read: true } : n;
      })
    );
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
    setRegisteredUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === currentUser.email.toLowerCase() && u.role === currentUser.role) {
        return {
          ...u,
          name: profile.name,
          phone: profile.phone ?? u.phone,
          address: profile.address ?? u.address
        };
      }
      return u;
    }));
    setCurrentUser(prev => ({
      ...prev,
      name: profile.name,
      phone: profile.phone ?? prev.phone,
      address: profile.address ?? prev.address
    }));
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
        
        // Auth / account registry
        registeredUsers,
        registerUser,
        loginUser,
        logoutUser,
        verifyEmailCode,
        sendPasswordReset,
        resetPasswordWithToken,
        
        // Favorites
        favorites,
        toggleFavorite,
        isFavorite,
        
        // Chef Direct chat/contact requests
        contactRequests,
        addContactRequest,
        replyToContactRequest,
        
        // Onboardings
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
