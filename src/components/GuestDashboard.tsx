import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Suite } from '../types';
import { Calendar, CreditCard, Heart, ShoppingBag, Send, Sparkles, Inbox, User, MapPin, Phone, MessageSquare, ArrowRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SuiteCard } from './SuiteCard';
import { SuiteDetailModal } from './SuiteDetailModal';

export const GuestDashboard: React.FC = () => {
  const { 
    bookings, 
    contacts, 
    currentUser, 
    cancelBooking, 
    updateWallet, 
    suites, 
    chefContactRequests, 
    updateCurrentUserProfile 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'favorites' | 'chef-chat' | 'profile' | 'events'>('orders');
  
  // Wallet Top-up
  const [topUpAmount, setTopUpAmount] = useState('100');
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Profile Edit
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profileAddress, setProfileAddress] = useState(currentUser.address || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Detail Modal target
  const [selectedSuite, setSelectedSuite] = useState<Suite | null>(null);

  // Filters matching active user email coordinates
  const myOrders = bookings.filter(b => b.guestEmail === currentUser.email);
  const myAppointmentEvents = contacts.filter(c => c.email === currentUser.email);
  
  // Get favorited suites
  const favoriteSuites = suites.filter(s => currentUser.favorites?.includes(s.id));
  
  // Direct inquiries sent to any kitchen owners
  const myInquiries = chefContactRequests.filter(req => req.buyerEmail === currentUser.email);

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(topUpAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    updateWallet(parsed);
    setTopUpSuccess(true);
    setTimeout(() => setTopUpSuccess(false), 2500);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name: profileName,
      phone: profilePhone,
      address: profileAddress
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
      
      {/* Dynamic Profile Cover Banner */}
      <div className="bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#FFF5F2] via-[#FFFBF9] to-white border border-[#FFEDE9] rounded-[36px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 text-left select-none relative overflow-hidden">
        
        {/* Abstract background circles */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-[#FF7A85]/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-1/4 h-32 w-32 bg-[#FF9B85]/5 rounded-full blur-xl" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-tr from-[#FF7A85] to-[#FF9B85] border-2 border-white flex items-center justify-center text-xs text-white">
              👑
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#FF7A85] bg-[#FFF2EE] px-2.5 py-0.5 rounded-full border border-[#FFF0EA]">
                Guest Hub Coordinator
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Level 1 Sweet Tooth
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#3A2218] mt-1.5">{currentUser.name}</h2>
            <p className="text-xs text-[#8A756D] mt-0.5 max-w-md">
              Your gourmet customer command center. Monitor pending confectionery orders, organize your bookmarks, or review home-made recipes safely.
            </p>
          </div>
        </div>

        {/* Dynamic Ghee topup visual container */}
        <form onSubmit={handleWalletSubmit} className="bg-white/90 backdrop-blur-xs border border-[#FAEDE4] p-5 rounded-2xl shadow-sm flex flex-col gap-2 w-full md:w-80 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#867168] font-bold uppercase tracking-wider">Ghee Wallet Reserve</span>
            <span className="font-mono text-xs font-black text-[#FF7A85]">${(currentUser.walletBalance ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-sans text-xs font-bold text-gray-400">$</span>
              <input
                type="number"
                value={topUpAmount}
                onChange={e => setTopUpAmount(e.target.value)}
                className="w-full bg-[#FFFDFC] pl-5 pr-2 py-2 text-xs font-black rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] text-[#331E14]"
                required
                min={1}
              />
            </div>
            <button
              type="submit"
              className="bg-[#3A2218] text-white hover:bg-black text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition duration-200 shadow-sm"
            >
              Add Ghee
            </button>
          </div>
          {topUpSuccess && (
            <p className="text-[9px] font-bold text-emerald-600 text-center">✓ Balance credited! Instant sandbox balance ready.</p>
          )}
        </form>
      </div>

      {/* Workspace subtab buttons layout */}
      <div className="flex bg-[#FDF8F5] p-1 rounded-2xl border border-[#FAEDE4] mb-8 overflow-x-auto gap-1 select-none">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeSubTab === 'orders'
              ? 'bg-[#3A2218] text-white shadow-xs'
              : 'text-[#8A756D] hover:bg-[#F2E6DF] hover:text-black'
          }`}
        >
          <ShoppingBag size={14} />
          <span>My Sweets Orders ({myOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('favorites')}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeSubTab === 'favorites'
              ? 'bg-[#FF7A85] text-white shadow-xs'
              : 'text-[#8A756D] hover:bg-[#FBECE6] hover:text-black'
          }`}
        >
          <Heart size={14} />
          <span>My Favorites Page ({favoriteSuites.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chef-chat')}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeSubTab === 'chef-chat'
              ? 'bg-[#FF9B85] text-white shadow-xs'
              : 'text-[#8A756D] hover:bg-[#FBECE6] hover:text-black'
          }`}
        >
          <MessageSquare size={14} />
          <span>Direct Chef Inquiries ({myInquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('events')}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeSubTab === 'events'
              ? 'bg-[#8FBC8F] text-white shadow-xs'
              : 'text-[#8A756D] hover:bg-[#EAF2EA] hover:text-black'
          }`}
        >
          <Calendar size={14} />
          <span>Appointments & Events ({myAppointmentEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeSubTab === 'profile'
              ? 'bg-[#A68F85] text-white shadow-xs'
              : 'text-[#8A756D] hover:bg-[#F5EDE8] hover:text-black'
          }`}
        >
          <User size={14} />
          <span>Coordinates / Profile</span>
        </button>
      </div>

      {/* Tab Panels Contents */}
      <AnimatePresence mode="wait">
        
        {/* subtab orders */}
        {activeSubTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-5 text-left"
          >
            <div className="flex justify-between items-baseline border-b border-[#F7EFE9] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#3A2218]">Active Order History</h3>
              <p className="text-xs text-[#A68F85] font-semibold">Track dispatch routes and preparation levels</p>
            </div>

            {myOrders.length === 0 ? (
              <div className="py-20 border border-dashed border-[#FAEDE4] rounded-[32px] text-center bg-white">
                <ShoppingBag size={48} className="mx-auto text-gray-300 stroke-1 mb-3 animate-bounce" />
                <h4 className="font-serif text-sm font-bold text-[#3A2218]">No homemade orders logged yet</h4>
                <p className="text-xs text-[#8A756D] mt-1 max-w-sm mx-auto leading-relaxed">
                  Head over to out sweet shop explore grid, click order checkout and pay directly via Ghee wallet or debit card details safely.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myOrders.map(b => (
                  <div
                    key={b.id}
                    className="bg-white border border-[#FAEDE4] rounded-3xl p-5 flex gap-4 items-start hover:shadow-md transition-all relative overflow-hidden"
                  >
                    <img src={b.suiteImage} alt={b.suiteTitle} className="h-20 w-20 rounded-2xl object-cover border border-[#FAEDE4] shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black uppercase text-[#FF7A85] bg-[#FFF2EE] px-2 py-0.5 rounded-md border border-[#FFF0EA]">
                          {b.status}
                        </span>
                        <span className="text-xs text-[#3A2218] font-black">${b.totalAmount}</span>
                      </div>
                      
                      <h4 className="text-sm font-bold text-[#3A2218] mt-1.5 truncate">{b.suiteTitle}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Quantity: {b.guestsCount}x packs • {b.checkOut}</p>

                      <div className="mt-3 pt-2.5 border-t border-[#F9F4F0] text-[11px] text-[#6E5950] flex flex-col gap-1">
                        <p className="flex items-center gap-1">
                          <Calendar size={11} className="text-[#FF9B85]" />
                          <span>Delivery Target: <strong>{b.checkIn}</strong></span>
                        </p>
                        <p className="truncate flex items-center gap-1">
                          <MapPin size={11} className="text-gray-400" />
                          <span>Address: {b.deliveryAddress || currentUser.address}</span>
                        </p>
                      </div>

                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => cancelBooking(b.id)}
                          className="mt-3 text-[10px] font-bold text-[#E36D5B] hover:underline"
                        >
                          Cancel Order & Full Ghee Refund
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* subtab favorites */}
        {activeSubTab === 'favorites' && (
          <motion.div
            key="favorites"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6 text-left"
          >
            <div className="border-b border-[#F7EFE9] pb-3 flex justify-between items-baseline">
              <h3 className="font-serif text-lg font-bold text-[#3A2218]">My Favorites Confectioneries</h3>
              <p className="text-xs text-[#A68F85] font-semibold">Quick-jump to your saved homemade selection</p>
            </div>

            {favoriteSuites.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-[#FAEDE4] rounded-2xl bg-white">
                <Heart size={44} className="mx-auto text-pink-200 stroke-1 mb-2" />
                <h4 className="text-xs font-bold text-[#3A2218]">No bookmarked recipes</h4>
                <p className="text-xs text-gray-400 mt-1">Browse sweets from the catalog and tap heart buttons!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteSuites.map(suite => (
                  <SuiteCard
                    key={suite.id}
                    suite={suite}
                    onClick={() => setSelectedSuite(suite)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* subtab chef chat inquiries */}
        {activeSubTab === 'chef-chat' && (
          <motion.div
            key="chef-chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4 text-left"
          >
            <div className="border-b border-[#F7EFE9] pb-3 flex justify-between items-baseline">
              <h3 className="font-serif text-lg font-bold text-[#3A2218]">Direct inquiries to Sweet Chefs</h3>
              <p className="text-xs text-[#A68F85]">Chef answers sync back here or to your mobile WhatsApp number</p>
            </div>

            {myInquiries.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-[#FAEDE4] rounded-2xl bg-white">
                <MessageSquare size={44} className="mx-auto text-gray-300 stroke-1 mb-2" />
                <h4 className="text-xs font-bold text-[#3A2218]">Your communication logs are empty</h4>
                <p className="text-xs text-gray-400 mt-1 text-center">Click custom sweet details, click 'Contact Chef' to trigger real-time chat requests.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {myInquiries.map(req => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-white border border-[#FAEDE4] text-left relative overflow-hidden flex flex-col gap-3"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-[#FF7A85] to-[#FF9B85]" />
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-[#FF7A85] bg-[#FFF2EE] px-2.5 py-0.5 rounded-md border border-[#FFF0EA]">
                          Sweet Recipe Query
                        </span>
                        <h4 className="font-serif text-sm font-bold text-[#3A2218] mt-1.5">{req.sweetTitle}</h4>
                      </div>
                      <span className="font-mono text-[9px] text-[#A68F85]">{req.id}</span>
                    </div>

                    <div className="bg-[#FFFDFC] border border-[#FAEDE4] p-3 rounded-lg flex flex-col gap-1 text-xs">
                      <p className="text-[#867168] font-bold">My Message:</p>
                      <p className="italic text-[#5C463C]">"{req.message}"</p>
                    </div>

                    {req.replyText ? (
                      <div className="bg-[#EAF2EA] border border-green-100 p-3 rounded-lg flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1 text-[#2A4D2A] font-bold">
                          <span>👩‍🍳 Chef Response:</span>
                          <span className="text-[10px] bg-green-150 border border-green-300 text-green-700 px-1.5 py-0.1 select-none rounded-md uppercase font-sans">
                            Dispatched via {req.replyChannel}
                          </span>
                        </div>
                        <p className="text-[#2B4B2B] leading-tight mt-0.5">{req.replyText}</p>
                      </div>
                    ) : (
                      <div className="text-[11px] font-bold text-[#A68F85] flex items-center justify-between mt-1 pl-1">
                        <span className="flex items-center gap-1 text-[#FF8E6E] animate-pulse">
                          ● Unreplied In Queue (Expected reply: &lt; 2 hours)
                        </span>
                        <span className="text-gray-400 font-normal">Registered under WhatsApp: {req.buyerPhone}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* subtab client appointments / events */}
        {activeSubTab === 'events' && (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4 text-left"
          >
            <div className="border-b border-[#F7EFE9] pb-3 flex justify-between items-baseline">
              <h3 className="font-serif text-lg font-bold text-[#3A2218]">Gourmet Kitchen Tastings</h3>
              <p className="text-xs text-[#A68F85]">Consultations and physical sampling events scheduled with our sweet curators</p>
            </div>

            {myAppointmentEvents.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-[#FAEDE4] rounded-2xl bg-white">
                <Calendar size={44} className="mx-auto text-emerald-100 stroke-1 mb-2" />
                <h4 className="text-xs font-bold text-[#8A756D]">No kitchen tasting consultations booked</h4>
                <p className="text-xs text-gray-400 mt-1">Use the primary 'Custom & Bulk Orders' tab to schedule a meeting.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myAppointmentEvents.map(appt => (
                  <div key={appt.id} className="bg-white border border-[#F5EDE8] rounded-2xl p-4 relative overflow-hidden text-left pl-6">
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#8FBC8F]" />
                    <div className="flex justify-between items-center text-[10px] font-mono select-none">
                      <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider">
                        Topic: {appt.topic}
                      </span>
                      <span className="text-gray-400">{appt.id}</span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <p className="text-sm font-black text-[#3A2218]">{appt.date}</p>
                      <p className="text-xs text-gray-500 font-mono">({appt.timeSlot})</p>
                    </div>

                    <p className="text-xs font-medium text-gray-600 bg-[#FFFDFC] p-2.5 border border-[#FAEDE4] rounded-xl mt-3 italic">
                      "{appt.message}"
                    </p>

                    <div className="mt-4 pt-2 border-t border-[#FDF8F5] flex items-center justify-between text-[11px] font-bold text-[#A68F85]">
                      <span>Coordination: Admin Officer</span>
                      <span className="text-[#8FBC8F]">● Booking Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* subtab profile coordinates */}
        {activeSubTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6 text-left max-w-xl"
          >
            <div className="border-b border-[#F7EFE9] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#3A2218]">Gourmet Profile Coordinates</h3>
              <p className="text-xs text-[#A68F85]">These details auto-fill in future checkout requests</p>
            </div>

            {profileSuccess && (
              <p className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl p-3 text-xs font-bold">
                ✓ Local context profile saved successfully! Real-time state updated.
              </p>
            )}

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Human / Buyer Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full bg-[#FFFDFC] text-xs font-bold text-[#3A2218] border border-[#FAEDE4] rounded-xl px-3 py-2 outline-none focus:border-[#FF7A85]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">WhatsApp Mobile Contacts</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  placeholder="e.g. +91 94455-66778"
                  className="w-full bg-[#FFFDFC] text-xs font-bold text-[#3A2218] border border-[#FAEDE4] rounded-xl px-3 py-2 outline-none focus:border-[#FF7A85]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Default Shipping Location</label>
                <textarea
                  value={profileAddress}
                  onChange={e => setProfileAddress(e.target.value)}
                  placeholder="Street and Room Number details"
                  className="w-full bg-[#FFFDFC] min-h-[80px] text-xs font-bold text-[#3A2218] border border-[#FAEDE4] rounded-xl p-3 outline-none focus:border-[#FF7A85]"
                />
              </div>

              <button
                type="submit"
                className="bg-[#3A2218] text-white py-2 px-5 rounded-xl text-xs font-black self-start hover:bg-black transition cursor-pointer"
              >
                Flush Details Into State
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded DetailModal Trigger overlay */}
      <AnimatePresence>
        {selectedSuite && (
          <SuiteDetailModal suite={selectedSuite} onClose={() => setSelectedSuite(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
