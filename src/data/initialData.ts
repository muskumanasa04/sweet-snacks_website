import { Suite, Review, Booking, ContactSchedule, SystemNotification } from '../types';

export const INITIAL_SUITES: Suite[] = [
  {
    id: 'sweet-suite-1',
    title: 'The Royal Saffron Ghee Laddu',
    description: 'Bite into ancient family secrets. Prepared with cold-press grass-fed local ghee, handpicked saffron strands from Kashmir, and premium stone-ground chickpea flour with roasted cashews inside each melt-in-the-mouth sphere.',
    location: "Grandma's Kitchen, Carmel CA",
    pricePerNight: 24, // interpreted asPrice per item/pack
    unitWeight: "500g Festive Tin",
    rating: 4.9,
    capacity: 20, // Max quantity stock
    category: 'Traditional Sweets',
    amenities: ['100% Pure Ghee', 'No Added Preservatives', 'Kashmiri Saffron', 'Vacuum Packed', 'Family Recipe', 'Freshly Baked'],
    images: [
      'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=800'
    ],
    ownerEmail: 'sweet.owner@sweetstay.com',
    status: 'approved',
    reviewsCount: 3
  },
  {
    id: 'sweet-suite-2',
    title: 'Artisanal Pistachio Honey Baklava',
    description: 'Paper-thin flaky phyllo layers brushed generously with organic butter, filled with raw crushed Turkish pistachios, and baked to golden-brown crispiness before being drowned in an orange-blossom honey glaze.',
    location: 'Antalia Bakers, Savannah GA',
    pricePerNight: 38,
    unitWeight: "450g Assorted Box",
    rating: 4.8,
    capacity: 15,
    category: 'Traditional Sweets',
    amenities: ['Halal ingredients', 'Handcrafted', 'Orange Blossom Glaze', 'Premium Pistachio', 'Long Shelf Life', 'No Corn Syrup'],
    images: [
      'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1621569642780-4864752e847e?auto=format&fit=crop&q=80&w=800'
    ],
    ownerEmail: 'sugar.plum@sweetstay.com',
    status: 'approved',
    reviewsCount: 2
  },
  {
    id: 'sweet-suite-3',
    title: 'Crispy Handmade Paneer Samosa & Sev',
    description: 'The ultimate golden pastry triangles stuffed with hand-crumbled spiced paneer, sweet green peas, ginger, cumin, and fried to crunchy perfection. Paired with aromatic roasted sev for a traditional high-tea snack combo.',
    location: 'Kerala Crunch Co, New York NY',
    pricePerNight: 16,
    unitWeight: "400g Safepack Pouch",
    rating: 4.7,
    capacity: 35,
    category: 'Crunchy Snacks',
    amenities: ['Gluten-Free Flour Option', 'Roasted Cumin Seeds', 'Hand-pounded Spices', 'High Fiber', 'Airtight Sealed', 'Perfect with Tea'],
    images: [
      'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800'
    ],
    ownerEmail: 'metro.owner@sweetstay.com',
    status: 'approved',
    reviewsCount: 2
  },
  {
    id: 'sweet-suite-4',
    title: 'Organic Almond & Date Energy Rolls',
    description: 'Naturally sweetened luxury rolls prepared specifically for fitness aficionados. Combines thick pulpy Medjool dates, dry-roasted Californian almonds, protein-packed chia seeds, and a dusting of grated coconut.',
    location: 'Wellness Delights, Aspen CO',
    pricePerNight: 29,
    unitWeight: "500g Sugar-Free Pack",
    rating: 4.9,
    capacity: 25,
    category: 'Healthy & Sugar-Free',
    amenities: ['100% No Added Sugar', 'Vegan & Raw', 'Superfood Ingredients', 'High Energy Density', 'Eco Friendly Wrap', 'Dairy-Free'],
    images: [
      'https://images.unsplash.com/photo-1621569642780-4864752e847e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=800'
    ],
    ownerEmail: 'sweet.owner@sweetstay.com',
    status: 'approved',
    reviewsCount: 2
  },
  {
    id: 'sweet-suite-5',
    title: 'The Grand Festive Confection Hamper',
    description: 'The ultimate royal gift chest designed for premium gifting. Contains Saffron Ghee Laddus, Rose-infused Hand-crushed Almond Halwa, Roasted Cashews with pink Himalayan salt, and Spicy Crunchy Murukku.',
    location: 'Royal Confections, Paris FR',
    pricePerNight: 75,
    unitWeight: "1.2kg Hand-Carved Wooden Chest",
    rating: 5.0,
    capacity: 10,
    category: 'Festive Hampers',
    amenities: ['Premium Wooden Box', 'Silk Ribbon Finish', 'Greeting Card Included', 'Assorted Delicacies', 'Gourmet Selection', 'Express Shipping Mode'],
    images: [
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=800'
    ],
    ownerEmail: 'sweet.owner@sweetstay.com',
    status: 'approved',
    reviewsCount: 2
  },
  {
    id: 'sweet-suite-6',
    title: 'Guilt-Free Stevia Cashew Kaju Katli',
    description: 'An elegant Indian cashew fudge remade safely with natural calorie-free Stevia leaves. Soft, diamond-shaped bars featuring pure ground Goan cashews, hints of delicate cardamom, and organic silver leaf trim.',
    location: 'Sweet Artistry, Austin TX',
    pricePerNight: 32,
    unitWeight: "400g Diamond Box",
    rating: 4.6,
    capacity: 18,
    category: 'Healthy & Sugar-Free',
    amenities: ['Stevia Sweetened', 'Low Glycemic Index', 'Goan Cashews', 'Gluten Free Certified', 'Premium Grade Cardamom', 'Handmade Craft'],
    images: [
      'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=800'
    ],
    ownerEmail: 'sugar.plum@sweetstay.com',
    status: 'approved',
    reviewsCount: 1
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    suiteId: 'sweet-suite-1',
    sweetTitle: 'The Royal Saffron Ghee Laddu',
    userName: 'Amelia Rose',
    rating: 5,
    comment: 'Absolutely celestial! Reminds me exactly of the laddus my granny made. The pure saffron aroma is breathtaking when you pop open the golden tin. Best ghee laddus online!',
    date: '2026-05-15',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'rev-2',
    suiteId: 'sweet-suite-1',
    sweetTitle: 'The Royal Saffron Ghee Laddu',
    userName: 'Benjamin Carter',
    rating: 5,
    comment: 'The ghee is so fresh and delicious, not heavy at all. Perfect roasted crunch of the cashews. Cleanly packed and shipped super fast. A highly recommended brand.',
    date: '2026-05-20',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'rev-3',
    suiteId: 'sweet-suite-1',
    sweetTitle: 'The Royal Saffron Ghee Laddu',
    userName: 'Chantal Dubois',
    rating: 4.7,
    comment: 'Very tasty treats! Saffron flavor is prominent and texture is perfectly melt-in-the-mouth. Shipped with cold gel packs too.',
    date: '2026-05-24',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'rev-4',
    suiteId: 'sweet-suite-2',
    sweetTitle: 'Artisanal Pistachio Honey Baklava',
    userName: 'Eleanor Vance',
    rating: 5,
    comment: 'Extremely crispy and not overly sweet or sticky. The pistachio filling is packed right in! I enjoyed two boxes with Turkish coffee during my birthday event.',
    date: '2026-04-18',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-1',
    suiteId: 'sweet-suite-1',
    suiteTitle: 'The Royal Saffron Ghee Laddu',
    suiteImage: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=400',
    guestName: 'Amelia Rose',
    guestEmail: 'amelia.rose@gmail.com',
    checkIn: '2026-06-10', // interpreted as delivery date
    checkOut: 'Standard Home Delivery',
    totalAmount: 48,
    guestsCount: 2, // 2 boxes
    status: 'completed',
    paymentStatus: 'paid',
    createdAt: '2026-05-20T10:30:00Z',
    deliveryAddress: '312 Maple Ave, Carmel-by-the-Sea, California',
    deliveryPhone: '+1 (555) 234-9281'
  },
  {
    id: 'bk-2',
    suiteId: 'sweet-suite-3',
    suiteTitle: 'Spicy South-Indian Ribbon Murukku',
    suiteImage: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400',
    guestName: 'David Miller',
    guestEmail: 'david.miller@gmail.com',
    checkIn: '2026-07-02',
    checkOut: 'Express Air Cargo',
    totalAmount: 48,
    guestsCount: 3, // 3 boxes
    status: 'pending',
    paymentStatus: 'paid',
    createdAt: '2026-05-24T14:15:00Z',
    deliveryAddress: 'Soho Penthouse Level 4, New York, NY',
    deliveryPhone: '+1 (555) 872-1092'
  }
];

export const INITIAL_CONTACTS: ContactSchedule[] = [
  {
    id: 'cnt-1',
    name: 'Oliver Thorne',
    email: 'oliver.t@luxuryventures.com',
    phone: '+1 (555) 345-9831',
    date: '2026-06-03',
    timeSlot: '10:00 AM - 11:00 AM',
    topic: 'Bulk Order',
    message: 'We are hosting a corporate luxury retreat next month and want to purchase 150 chests of the Grand Festive Confection Hamper. Can we schedule a zoom to discuss raw-branding the covers?',
    status: 'scheduled',
    createdAt: '2026-05-27T11:20:00Z'
  },
  {
    id: 'cnt-2',
    name: 'Madeline Stone',
    email: 'mstone@sweet-events.events',
    phone: '+1 (555) 872-4512',
    date: '2026-06-05',
    timeSlot: '02:00 PM - 03:00 PM',
    topic: 'Event Catering',
    message: 'Planning a sweet bar layout for a wedding reception in Southern Georgia. Looking to customize sugar-free options with stevia cashew designs for 200 guests.',
    status: 'scheduled',
    createdAt: '2026-05-28T08:45:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    recipientEmail: 'all-admins',
    title: 'New Sweet Proposal',
    message: 'Homemade Chef sweet.owner@sweetstay.com has submitted "Handcrafted Rose Coconut Fudge" for quality checks.',
    date: '2026-05-28T14:30:00Z',
    read: false,
    type: 'property'
  },
  {
    id: 'notif-2',
    recipientEmail: 'sweet.owner@sweetstay.com',
    title: 'Order Completed 🎉',
    message: 'Customer Amelia Rose completed payments of $48 for 2 boxes of Saffron Laddus.',
    date: '2026-05-20T10:31:00Z',
    read: false,
    type: 'booking'
  }
];
