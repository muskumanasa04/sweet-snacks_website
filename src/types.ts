export interface Review {
  id: string;
  suiteId: string; // Refers to the sweet product ID
  sweetTitle: string; // Title of the sweet product
  userName: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

export interface Suite {
  id: string;
  title: string;
  description: string;
  location: string; // City or region, e.g., "Grandma's Kitchen, SOHO"
  pricePerNight: number; // Sweet price (renamed in layout as price per pack/box)
  unitWeight: string; // Weight of the pack, e.g. "500g" or "1kg box"
  rating: number;
  capacity: number; // Max quantity orderable at once or stock availability
  category: 'Traditional Sweets' | 'Crunchy Snacks' | 'Festive Hampers' | 'Healthy & Sugar-Free';
  amenities: string[]; // List of ingredients or key features (e.g., "100% Ghee", "No Added Preservatives", "Gluten-Free")
  images: string[];
  ownerEmail: string;
  status: 'approved' | 'pending' | 'rejected';
  reviewsCount: number;
}

export interface Booking {
  id: string;
  suiteId: string;
  suiteTitle: string;
  suiteImage: string;
  guestName: string;
  guestEmail: string;
  checkIn: string; // Used as Order delivery slot / pickup date
  checkOut: string; // Additional instruction or alternate date
  totalAmount: number;
  guestsCount: number; // Quantity of boxes ordered
  status: 'pending' | 'approved' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'unpaid';
  createdAt: string;
  deliveryAddress?: string;
  deliveryPhone?: string;
}

export interface ChefContactRequest {
  id: string;
  sweetId: string;
  sweetTitle: string;
  chefEmail: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  message: string;
  whatsappNumber: string;
  status: 'pending' | 'replied_whatsapp' | 'replied_mail';
  replyMessage?: string;
  createdAt: string;
}

export interface ChefOnboarding {
  email: string;
  chefName: string;
  experienceYears: number;
  kitchenLicense: string;
  whatsappNumber: string;
  specialtyDescription: string;
  verified: boolean;
}

export interface ContactSchedule {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  topic: string; // 'Consultation' | 'Bulk Order' | 'Event Catering' | 'Feedback'
  message: string;
  status: 'scheduled' | 'completed';
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  recipientEmail: string; // 'all-admins', 'all-owners', or specific guest/owner email
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'booking' | 'property' | 'review' | 'system' | 'contact';
}

export type UserRole = 'guest' | 'owner' | 'admin';

export interface UserIdentity {
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  walletBalance?: number;
  phone?: string;
  address?: string;
  favorites?: string[]; // Array of sweet/suite IDs
  password?: string;
  isEmailVerified?: boolean;
  verificationCode?: string;
  resetToken?: string;
}
