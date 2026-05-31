import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Suite, ChefContactRequest } from '../types';
import { PlusCircle, Landmark, Upload, BadgePercent, ShieldAlert, Sparkles, Sliders, MapPin, Eye, CheckCircle, Clock, ShoppingBag, Send, AlertTriangle, ShieldCheck, Check, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OwnerDashboard: React.FC = () => {
  const { 
    suites, 
    bookings, 
    currentUser, 
    addSuite, 
    chefContactRequests, 
    respondToContactRequest,
    chefOnboardingDetails,
    submitChefOnboarding
  } = useApp();

  const [activeTab, setActiveTab] = useState<'add-sweet' | 'orders' | 'inquiries' | 'earnings' | 'kyc'>('add-sweet');

  // Form State for creating a Sweet Recipe
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Jubilee Hills, Hyderabad');
  const [pricePerNight, setPricePerNight] = useState('12.50'); // Unit price
  const [unitWeight, setUnitWeight] = useState('500g Gift Box');
  const [capacity, setCapacity] = useState(25); // Stock limit
  const [category, setCategory] = useState<'Traditional Sweets' | 'Desi Ghee Pack' | 'Crispy Snacks' | 'Festive Hampers'>('Traditional Sweets');
  const [amenities, setAmenities] = useState<string[]>(['100% Organic Ghee', 'No Artificial Colorants', 'Stevia Sugar Substitute option']);
  const [selectedImgPreset, setSelectedImgPreset] = useState(0);
  const [formSuccess, setFormSuccess] = useState(false);
  const [customPresetOpen, setCustomPresetOpen] = useState(false);

  // Chef Onboarding (KYC details needed before uploading sweets)
  const [kycChefName, setKycChefName] = useState(chefOnboardingDetails?.chefName || currentUser.name);
  const [kycKitchenName, setKycKitchenName] = useState(chefOnboardingDetails?.kitchenName || 'Manasa Sweet Kitchens & Savouries');
  const [kycSanitationCode, setKycSanitationCode] = useState(chefOnboardingDetails?.sanitationFssaiCode || 'FSSAI-2449-0091-889');
  const [kycExperience, setKycExperience] = useState(chefOnboardingDetails?.experienceYears || 12);
  const [kycAddress, setKycAddress] = useState(chefOnboardingDetails?.kitchenAddress || currentUser.address || 'Jubilee Hills, Hyderabad');
  const [kycSuccess, setKycSuccess] = useState(false);

  // Chat message reply simulation
  const [replyText, setReplyText] = useState('');
  const [replyChannel, setReplyChannel] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  const [activeReplyInquiryId, setActiveReplyInquiryId] = useState<string | null>(null);

  // Filter owner sweets and pending/approved counters
  const ownerSuites = suites.filter(s => s.ownerEmail === currentUser.email);
  const ownerSuiteIds = ownerSuites.map(s => s.id);

  // Filter bookings (sweet orders) for owner recipes
  const ownerBookings = bookings.filter(b => ownerSuiteIds.includes(b.suiteId));

  const countPendingOrders = ownerBookings.filter(b => b.status === 'confirmed').length;
  const countApprovedOrders = ownerBookings.filter(b => b.status === 'completed').length;
  const countCancelledOrders = ownerBookings.filter(b => b.status === 'cancelled').length;

  // Filter incoming product inquiries for direct customer text forwarding
  const ownerInquiries = chefContactRequests.filter(req => req.chefEmail === currentUser.email);

  // Sweets image preset gallery options matching delicious themes
  const PRESET_SWEET_IMAGES = [
    [
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=800', // laddoos / dry fruits box
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600'
    ],
    [
      'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=800', // syrup Gulab Jamuns
      'https://images.unsplash.com/photo-1621569642780-4864752e847e?auto=format&fit=crop&q=80&w=600'
    ],
    [
      'https://images.unsplash.com/photo-1509622905150-fa66d3906e09?auto=format&fit=crop&q=80&w=800', // crispy chips/snacks
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=600'
    ],
    [
      'https://images.unsplash.com/photo-1621569642780-4864752e847e?auto=format&fit=crop&q=80&w=800', // chocolate sweets
      'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=600'
    ]
  ];

  // Financial calculations
  const totalEarnings = ownerBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingPayoutValue = ownerBookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const toggleAmenity = (name: string) => {
    setAmenities(prev =>
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitChefOnboarding({
      chefName: kycChefName,
      kitchenName: kycKitchenName,
      sanitationFssaiCode: kycSanitationCode,
      experienceYears: kycExperience,
      kitchenAddress: kycAddress,
      isVerified: true
    });
    setKycSuccess(true);
    setTimeout(() => {
      setKycSuccess(false);
      setActiveTab('add-sweet'); // send back to submit sweets upon KYC success
    }, 2000);
  };

  const handleSweetFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Check if chefOnboardingDetails is filled
    if (!chefOnboardingDetails?.isVerified) {
      alert('Please fill out and submit your Chef Details & Sanitation verification inside the "Chef Onboarding" subtab first.');
      setActiveTab('kyc');
      return;
    }

    addSuite({
      title,
      description,
      location,
      pricePerNight: parseFloat(pricePerNight) || 10,
      unitWeight,
      capacity, // stock limit
      category,
      amenities,
      images: PRESET_SWEET_IMAGES[selectedImgPreset]
    });

    setTitle('');
    setDescription('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReplyInquiryId || !replyText.trim()) return;

    respondToContactRequest(activeReplyInquiryId, replyText, replyChannel);
    setReplyText('');
    setActiveReplyInquiryId(null);
  };

  const SWEET_ATTRIBUTES_LIST = [
    '100% Organic Ghee',
    'No Artificial Colorants',
    'Pure Cashew Infusions',
    'Guilt-Free Palm Sugar',
    'Hand-pounded cardamoms',
    'Cruelty-Free Dairy sourcing',
    'Gluten-Free Flour Option',
    'Zero preservatives added',
    'Crispy Air-Fried Option',
    'Himalayan Pink Rock Salt'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 text-left select-none">
      
      {/* Cover Hub segment */}
      <div className="bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#FFF9F6] via-[#FFFDFB] to-white border border-[#FFEDE9] rounded-[36px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 select-none">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#FF7A85] to-[#FF9B85] text-white flex items-center justify-center font-bold text-xl shadow-md">
            🧑‍🍳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#FFF2EE] text-[#FF9B85] px-2.5 py-0.5 rounded-full border border-[#FFD9CE] font-extrabold uppercase tracking-widest">
                Owner Kitchen Studio Workspace
              </span>
              {chefOnboardingDetails?.isVerified ? (
                <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wide flex items-center gap-1">
                  <ShieldCheck size={11} /> Food Verified
                </span>
              ) : (
                <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wide flex items-center gap-1">
                  <AlertTriangle size={11} /> Onboarding Needed
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl font-black text-[#3A2218] mt-1.5">Chef {currentUser.name}'s Bakery Hub</h2>
            <p className="text-xs text-[#8A756D] mt-0.5 max-w-xl">
              Construct high-performance recipes, analyze dispatch earnings logs, verification status reports, and respond directly to user questions through email/WhatsApp portals.
            </p>
          </div>
        </div>

        {/* Quick Earnings Dashboard */}
        <div className="bg-white border border-[#FAEDE4] rounded-2xl p-4 w-full md:w-auto shadow-xs flex items-center gap-5 justify-between">
          <div>
            <p className="text-[10px] text-[#A68F85] uppercase font-bold tracking-wider">Confirmed Revenue</p>
            <h4 className="font-serif text-lg font-black text-emerald-600">${totalEarnings.toFixed(2)}</h4>
          </div>
          <div className="h-8 w-px bg-[#F7EFE9]" />
          <div>
            <p className="text-[10px] text-[#A68F85] uppercase font-bold tracking-wider">Pending Payouts</p>
            <h4 className="font-serif text-lg font-black text-amber-500">${pendingPayoutValue.toFixed(2)}</h4>
          </div>
          <div className="h-8 w-px bg-[#F7EFE9]" />
          <div>
            <p className="text-[10px] text-[#A68F85] uppercase font-bold tracking-wider">Recipes Count</p>
            <h4 className="font-serif text-lg font-black text-[#3A2218]">{ownerSuites.length} Active</h4>
          </div>
        </div>
      </div>

      {/* Verification & Onboarding Warning Block */}
      {!chefOnboardingDetails?.isVerified && (
        <div className="bg-[#FFF4F1] border border-[#FFE1D9] rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2.5 items-start">
            <AlertTriangle className="text-[#FF7A85] shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-xs font-black text-[#4B3023] uppercase">Identity & Sanitation Onboarding Outstanding</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                You must record your household details, kitchen verification code, and sanitation clearances inside the "Owner Details" tab before you are authorized to publish custom recipes.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('kyc')}
            className="bg-[#3A2218] hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Launch Onboarding Gateway
          </button>
        </div>
      )}

      {/* Tab Switcher Grid */}
      <div className="flex bg-[#FDF8F5] p-1 rounded-2xl border border-[#FAEDE4] mb-8 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('add-sweet')}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === 'add-sweet'
              ? 'bg-[#3A2218] text-white shadow-xs'
              : 'text-[#8A756D] hover:bg-[#FBECE6]'
          }`}
        >
          <PlusCircle size={14} />
          <span>Upload Sweet Recipe</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === 'orders'
              ? 'bg-[#FF7A85] text-white shadow-xs'
              : 'text-[#8A756D] hover:bg-[#FBECE6]'
          }`}
        >
          <ShoppingBag size={14} />
          <span>Order Dispatch Log ({ownerBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === 'inquiries'
              ? 'bg-[#FF9B85] text-white shadow-xs'
              : 'text-[#8A756D] hover:bg-[#FBECE6]'
          }`}
        >
          <MessageSquare size={14} />
          <span>Buyer Inquiries ({ownerInquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === 'earnings'
              ? 'bg-[#8FBC8F] text-white shadow-xs'
              : 'text-[#8A756D] hover:bg-[#EAF2EA]'
          }`}
        >
          <Sliders size={14} />
          <span>Portfolio Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeTab === 'kyc'
              ? 'bg-[#A68F85] text-white shadow-xs'
              : 'text-[#8A756D] hover:bg-[#F5EDE8]'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Owner Credentials / KYC</span>
        </button>
      </div>

      {/* Panels content */}
      <AnimatePresence mode="wait">
        
        {/* TAB add-sweet */}
        {activeTab === 'add-sweet' && (
          <motion.div
            key="add-sweet"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Form */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#FAEDE4] shadow-xs">
              <h3 className="font-serif text-base font-black text-[#3A2218] border-b border-[#F7EFE9] pb-3 mb-4">Post New Kitchen Batch</h3>

              <form onSubmit={handleSweetFormSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Sweet / Snack Name</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Dry Fruit Atta Laddu"
                      className="w-full bg-[#FFFDFC] border border-[#FAEDE4] px-3 py-2 text-xs font-semibold rounded-xl outline-none focus:border-[#FF7A85]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Pricing per Pack ($)</label>
                    <input
                      type="text"
                      value={pricePerNight}
                      onChange={e => setPricePerNight(e.target.value)}
                      placeholder="e.g. 15.50"
                      className="w-full bg-[#FFFDFC] border border-[#FAEDE4] px-3 py-2 text-xs font-bold font-mono rounded-xl outline-none focus:border-[#FF7A85]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Pack Weight / Unit</label>
                    <input
                      type="text"
                      value={unitWeight}
                      onChange={e => setUnitWeight(e.target.value)}
                      placeholder="e.g. 500g Tin Tray"
                      className="w-full bg-[#FFFDFC] border border-[#FAEDE4] px-3 py-2 text-xs font-semibold rounded-xl outline-none focus:border-[#FF7A85]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Max Stock Limit</label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={e => setCapacity(parseInt(e.target.value) || 10)}
                      className="w-full bg-[#FFFDFC] border border-[#FAEDE4] px-3 py-2 text-xs font-bold rounded-xl outline-none focus:border-[#FF7A85]"
                      required
                      min={1}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Product Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full bg-[#FFFDFC] border border-[#FAEDE4] px-3 py-2 text-xs font-semibold rounded-xl outline-none focus:border-[#FF7A85]"
                    >
                      <option value="Traditional Sweets">Traditional Sweets</option>
                      <option value="Desi Ghee Pack">Desi Ghee Pack</option>
                      <option value="Crispy Snacks">Crispy Snacks</option>
                      <option value="Festive Hampers">Festive Hampers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Photo Preset Theme</label>
                    <select
                      value={selectedImgPreset}
                      onChange={e => setSelectedImgPreset(parseInt(e.target.value))}
                      className="w-full bg-[#FFFDFC] border border-[#FAEDE4] px-3 py-2 text-xs font-semibold rounded-xl outline-none focus:border-[#FF7A85]"
                    >
                      <option value={0}>Dry Fruits Laddu Box Pack</option>
                      <option value={1}>Ghee Jamun Sweet Syrup</option>
                      <option value={2}>Crispy Desi Sev Snacks Selection</option>
                      <option value={3}>Aromatic Almonds Festive Box</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Packaging Highlights / Spicing</label>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {SWEET_ATTRIBUTES_LIST.map((am, idx) => (
                      <label key={idx} className="flex items-center gap-2 bg-[#FFFDFC] border border-[#FAEDE4] p-2 rounded-xl text-[11px] cursor-pointer hover:bg-[#FFF4F1] select-none">
                        <input
                          type="checkbox"
                          checked={amenities.includes(am)}
                          onChange={() => toggleAmenity(am)}
                          className="accent-[#FF7A85]"
                        />
                        <span className="truncate">{am}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Gourmet Description & Prep details</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide details about cashew proportions, sugar substitutes (e.g. Stevia), storage life, and organic clearances..."
                    className="w-full bg-[#FFFDFC] border border-[#FAEDE4] px-3 py-2.5 text-xs font-medium rounded-xl outline-none focus:border-[#FF7A85] h-20 resize-none whitespace-normal text-[#3A2218]"
                    required
                  />
                </div>

                {formSuccess && (
                  <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                    🎉 proposal batch uploaded! Sweets proposal cataloged in real-time. Sent to Admin Verification checks.
                  </p>
                )}

                <button
                  type="submit"
                  className="bg-[#3A2218] text-white py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black cursor-pointer shadow-xs transition"
                >
                  Publish New Recipe proposal
                </button>
              </form>
            </div>

            {/* Listed Sweets Vetted portfolio list */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <h3 className="font-serif text-base font-black text-[#3A2218] border-b border-[#F7EFE9] pb-3">Listed Sweet Portfolios</h3>
              
              {ownerSuites.length === 0 ? (
                <div className="py-12 border border-dashed border-[#F0E6DE] bg-white rounded-3xl text-center text-gray-400">
                  <Clock className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-bold text-[#8A756D]">No recipes posted yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                  {ownerSuites.map(s => (
                    <div key={s.id} className="bg-white border border-[#FAEDE4] p-4 rounded-2xl flex gap-3 text-left">
                      <img src={s.images[0]} alt={s.title} className="h-16 w-16 rounded-xl object-cover border border-[#FAEDE4] shrink-0" referrerPolicy="no-referrer" />
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] uppercase font-black text-[#FF7A85] bg-[#FFF2EE] px-2 py-0.5 rounded-md">
                            {s.category}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border uppercase tracking-wider ${
                            s.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-[#3A2218] mt-1 pr-4 truncate">{s.title}</h4>
                        <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold uppercase">
                          <span>${s.pricePerNight} / {s.unitWeight || 'box'}</span>
                          <span>Stock: {s.capacity} units</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB orders */}
        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center justify-between border-b border-[#F7EFE9] pb-3">
              <h3 className="font-serif text-base font-black text-[#3A2218]">Active Customer Confectionery Orders</h3>
              <div className="flex gap-2 text-[10px] font-black uppercase">
                <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-200">{countPendingOrders} Preparing</span>
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-200">{countApprovedOrders} Delivered</span>
              </div>
            </div>

            {ownerBookings.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-[#FAEDE4]">
                <ShoppingBag className="mx-auto text-gray-300 stroke-1 mb-2" size={40} />
                <p className="text-xs font-bold text-[#8A756D]">Your confectionery queue is vacant</p>
                <p className="text-[11px] text-gray-400 mt-1">Pending order arrivals will ring alerts live.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                {ownerBookings.map(b => (
                  <div key={b.id} className="bg-white border border-[#FAEDE4] rounded-2xl p-4 flex gap-4 items-start relative relative">
                    <img src={b.suiteImage} alt={b.suiteTitle} className="h-16 w-16 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-xs truncate max-w-[150px] text-[#3A2218]">{b.suiteTitle}</h4>
                        <span className="font-mono text-[9px] text-[#867168] bg-[#FDF8F5] px-2 py-0.5 rounded border border-[#FAEDE4]">ID: {b.id.substring(0,6)}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Buyer: {b.guestName} ({b.guestEmail})</p>
                      
                      <div className="mt-3 bg-[#FFFDFC] border border-[#F9F4F0] p-2.5 rounded-xl text-[11px] text-[#6E5950] flex flex-col gap-1">
                        <p>Quantity requested: <strong>{b.guestsCount}x boxes</strong></p>
                        <p>Delivery Target: <strong>{b.checkIn}</strong></p>
                        <p className="truncate">Destination: <strong>{b.deliveryAddress || 'Verified Home Town'}</strong></p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-[#F5EDE8] flex items-center justify-between text-[11px] font-bold">
                        <span>Paid: <strong className="text-emerald-600 font-mono">${b.totalAmount}</strong></span>
                        <div className="flex gap-2">
                          {b.status === 'confirmed' && (
                            <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 border border-amber-200 rounded-lg text-[9px] uppercase font-black tracking-wide">
                              Preparing Sweet Ghee
                            </span>
                          )}
                          {b.status === 'completed' && (
                            <span className="text-green-600 bg-green-50 px-2.5 py-0.5 border border-green-200 rounded-lg text-[9px] uppercase font-black tracking-wide">
                              Delivered successfully
                            </span>
                          )}
                          {b.status === 'cancelled' && (
                            <span className="text-red-500 bg-red-50 px-2.5 py-0.5 border border-red-100 rounded-lg text-[9px] uppercase font-black tracking-wide">
                              Refunded Cash
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB inquiries for direct contact owner */}
        {activeTab === 'inquiries' && (
          <motion.div
            key="inquiries"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-5 text-left"
          >
            <div className="border-b border-[#F7EFE9] pb-3">
              <h3 className="font-serif text-base font-black text-[#3A2218]">Direct buyer inquiry request inbox</h3>
              <p className="text-xs text-[#A68F85]">Click reply to dispatch responses directly back to customer panels or mobile WhatsApp registries</p>
            </div>

            {ownerInquiries.length === 0 ? (
              <div className="py-20 text-center bg-white border border-dashed border-[#FAEDE4] rounded-2xl">
                <MessageSquare className="mx-auto text-gray-300 stroke-1 mb-2" size={44} />
                <h4 className="text-xs font-bold text-[#8A756D]">Inbox is currently empty</h4>
                <p className="text-xs text-gray-400 mt-1">When buyers dispatch custom inquiries from details, they manifest here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {ownerInquiries.map(inq => (
                  <div key={inq.id} className="bg-white border border-[#FAEDE4] rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#FF7A85] to-[#FF9B85]" />

                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-[#FFF2EE] text-[#FF7A85] px-2.5 py-0.5 rounded-full border border-[#FFF0EA] font-extrabold uppercase tracking-wide">
                          Requested Sweet: {inq.sweetTitle}
                        </span>
                        <h4 className="text-xs font-bold text-[#3A2218] mt-2">Sender: {inq.buyerName} ({inq.buyerEmail})</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">Mobile registered: {inq.buyerPhone}</p>
                      </div>
                      <span className="font-mono text-[9px] text-[#A68F85]">{inq.id}</span>
                    </div>

                    <div className="bg-[#FFFDFC] border border-[#F9F4F0] p-3 text-xs rounded-xl italic text-gray-600">
                      "{inq.message}"
                    </div>

                    {inq.replyText ? (
                      <div className="bg-[#EAF2EA] border border-green-150 p-3 rounded-xl text-xs flex flex-col gap-1">
                        <p className="text-[#2A4D2A] font-bold">✓ Response sent via {inq.replyChannel}:</p>
                        <p className="text-[#2A4D2A] italic">"{inq.replyText}"</p>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-[#F9F4F0] flex flex-col gap-2">
                        {activeReplyInquiryId === inq.id ? (
                          <form onSubmit={handleReplySubmit} className="flex flex-col gap-2 bg-[#FFFDFC] p-3 rounded-xl border border-[#FAEDE4]">
                            <label className="text-[10px] uppercase font-bold text-[#8A756D]">Type reply message text:</label>
                            <textarea
                              required
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder={`e.g. Hi ${inq.buyerName.split(' ')[0]}! Yes, I can cook standard stevia sweetener and package it nicely. Dispatched via ${replyChannel}...`}
                              className="w-full bg-white text-xs text-[#3A2218] p-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#FF7A85]"
                            />
                            
                            <div className="flex justify-between items-center mt-1">
                              {/* Swapper channel channels */}
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-gray-400 font-semibold font-sans">Dispatch Route:</span>
                                <button
                                  type="button"
                                  onClick={() => setReplyChannel('WhatsApp')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                    replyChannel === 'WhatsApp' ? 'bg-[#FF7A85] text-white' : 'bg-gray-100 text-[#867168]'
                                  }`}
                                >
                                  WhatsApp SMS
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReplyChannel('Email')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                    replyChannel === 'Email' ? 'bg-[#FF7A85] text-white' : 'bg-gray-100 text-[#867168]'
                                  }`}
                                >
                                  Client Email
                                </button>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveReplyInquiryId(null);
                                    setReplyText('');
                                  }}
                                  className="px-2.5 py-1 text-gray-400 font-bold hover:text-black hover:underline text-[11px]"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="bg-[#3A2218] hover:bg-black text-white px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1"
                                >
                                  <Send size={10} />
                                  <span>Send reply</span>
                                </button>
                              </div>
                            </div>
                          </form>
                        ) : (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-[#FF8E6E] font-bold">● Awaiting reply coordinates</span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReplyInquiryId(inq.id);
                                setReplyChannel('WhatsApp');
                              }}
                              className="bg-[#FF7A85] hover:bg-[#C45543] text-white px-3 py-1 rounded-xl text-[10px] font-black cursor-pointer flex items-center gap-1"
                            >
                              Write Back Reply
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB earnings */}
        {activeTab === 'earnings' && (
          <motion.div
            key="earnings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
          >
            {/* Charts representation */}
            <div className="bg-white p-5 rounded-3xl border border-[#FAEDE4] flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-sm font-black text-[#3A2218]">Gourmet Dispatch Volume Performance</h4>
                <p className="text-[11px] text-gray-400 mt-1">Calculated monthly sweets progress trends</p>
              </div>

              <div className="h-44 flex items-end mt-4">
                <svg className="w-full h-full" viewBox="0 0 300 130">
                  <defs>
                    <linearGradient id="owner-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF7A85" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#FF7A85" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  <path d="M 10 115 L 70 85 L 140 90 L 210 40 L 280 15 L 280 120 L 10 120 Z" fill="url(#owner-grad)" />
                  <path d="M 10 115 Q 70 85 140 90 T 280 15" fill="none" stroke="#FF7A85" strokeWidth="3.5" strokeLinecap="round" />
                  
                  <circle cx="210" cy="40" r="4.5" fill="#3A2218" stroke="#FFE1D9" strokeWidth="2" />
                  <circle cx="280" cy="15" r="4.5" fill="#FF7A85" stroke="#FFF0EA" strokeWidth="2" />
                  
                  <text x="215" y="35" fontSize="9" fontWeight="bold" fill="#3A2218" fontFamily="sans-serif">$350.00</text>
                  <text x="145" y="125" fontSize="8" fill="#806C62" fontFamily="sans-serif">Weekly Organic Sweet dispatch curves</text>
                </svg>
              </div>
            </div>

            {/* Occupants ratio statistics */}
            <div className="bg-white p-5 rounded-3xl border border-[#FAEDE4] flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-sm font-black text-[#3A2218]">Product Order ratio distributions</h3>
                <p className="text-[11px] text-gray-400 mt-1">Ratios calculated after admin verification checking approvals</p>
              </div>

              <div className="flex items-center gap-6 mt-4">
                <div className="relative h-28 w-28 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="46" fill="transparent" stroke="#FFF0EA" strokeWidth="9" />
                    <circle
                      cx="56"
                      cy="56"
                      r="46"
                      fill="transparent"
                      stroke="#8FBC8F"
                      strokeWidth="9"
                      strokeDasharray="290"
                      strokeDashoffset={290 - 200 * (countApprovedOrders ? countApprovedOrders / ownerBookings.length : 1)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-serif text-base font-bold text-[#3A2218]">{ownerSuites.length} list</span>
                    <span className="text-[8px] uppercase font-bold text-gray-400">Recipes</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 text-xs text-[#5C463C]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Preparing / Pending: <strong>{countPendingOrders}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Delivered / Handed: <strong>{countApprovedOrders}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span>Cancelled Orders: <strong>{countCancelledOrders}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB kyc details profile */}
        {activeTab === 'kyc' && (
          <motion.div
            key="kyc"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6 text-left max-w-xl bg-white border border-[#FAEDE4] p-6 sm:p-8 rounded-[32px] shadow-xs"
          >
            <div>
              <h3 className="font-serif text-base font-black text-[#3A2218]">Chef Onboarding & Clearances (KYC)</h3>
              <p className="text-xs text-[#8A756D] mt-0.5">Admin checking rules expect verified certifications before enabling recipes uploads.</p>
            </div>

            {kycSuccess && (
              <p className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-xl text-xs font-bold font-sans">
                ✓ Clearance Certifications Filed! Sweet recipes upload authorization status matches [APPROVED]. Jumping back...
              </p>
            )}

            <form onSubmit={handleKycSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Chef Name / Identity</label>
                  <input
                    type="text"
                    required
                    value={kycChefName}
                    onChange={e => setKycChefName(e.target.value)}
                    className="w-full bg-[#FFFDFC] border border-[#FAEDE4] rounded-xl px-3 py-2 text-xs font-semibold text-[#3A2218] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Bakery Kitchen Title</label>
                  <input
                    type="text"
                    required
                    value={kycKitchenName}
                    onChange={e => setKycKitchenName(e.target.value)}
                    className="w-full bg-[#FFFDFC] border border-[#FAEDE4] rounded-xl px-3 py-2 text-xs font-semibold text-[#3A2218] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Local Sanitation FSSAI Code</label>
                  <input
                    type="text"
                    required
                    value={kycSanitationCode}
                    onChange={e => setKycSanitationCode(e.target.value)}
                    className="w-full bg-[#FFFDFC] border border-[#FAEDE4] rounded-xl px-3 py-2 text-xs font-mono font-black text-[#3A2218] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Baking Experience Years</label>
                  <input
                    type="number"
                    required
                    value={kycExperience}
                    onChange={e => setKycExperience(parseInt(e.target.value) || 3)}
                    className="w-full bg-[#FFFDFC] border border-[#FAEDE4] rounded-xl px-3 py-2 text-xs font-semibold text-[#3A2218] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Physical Kitchen Address coordinates</label>
                <textarea
                  required
                  value={kycAddress}
                  onChange={e => setKycAddress(e.target.value)}
                  placeholder="e.g. Plot No. 12, Jubilee Hills Road 4, Hyderabad, IN"
                  className="w-full bg-[#FFFDFC] border border-[#FAEDE4] rounded-xl p-3 text-xs font-semibold text-[#3A2218] min-h-[75px] outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-[#3A2218] text-white py-2.5 px-5 font-black text-xs rounded-xl hover:bg-black cursor-pointer transition flex items-center gap-1 self-start"
              >
                <Check size={14} />
                <span>Submit Sanitation Clearance</span>
              </button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
