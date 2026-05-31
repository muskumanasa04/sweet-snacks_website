import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Check, Ban, Mail, Phone, Calendar, Megaphone, Inbox, Radio, ChartArea, HardHat, Users, ShoppingBag, Landmark, Award, Eye, FileText, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const {
    suites,
    contacts,
    bookings,
    notifications,
    approveSuite,
    rejectSuite,
    registeredUsers,
    chefOnboardingDetails,
    addBooking, // for calculation triggers
    chefContactRequests
  } = useApp();

  const [activeTab, setActiveTab] = useState<'listings' | 'chefs-kyc' | 'directories' | 'orders' | 'viewings' | 'reports'>('listings');

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [bcSuccess, setBcSuccess] = useState(false);

  // Filter pending sweet proposals
  const pendingSuites = suites.filter(s => s.status === 'pending');

  // Scheduled physical viewings
  const scheduledViewings = contacts.filter(c => c.status === 'scheduled');

  // Math Statistics
  const totalCorporateVolume = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingListingProposalsCount = pendingSuites.length;
  const approvedListingProposalsCount = suites.filter(s => s.status === 'approved').length;

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;

    setBroadcastTitle('');
    setBroadcastMsg('');
    setBcSuccess(true);
    setTimeout(() => setBcSuccess(false), 3000);
  };

  const usersList = registeredUsers.filter(u => u.role === 'guest');
  const ownersList = registeredUsers.filter(u => u.role === 'owner');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 text-left select-none">
      
      {/* Executive Header Banner */}
      <div className="bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#EAF2EA] to-[#FFFDFC] border border-[#BCD4BC] rounded-[36px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 select-none">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[#8FBC8F] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#8FBC8F]/20">
            🛡️
          </div>
          <div>
            <span className="text-[10px] bg-[#EAF2EA] text-[#4A724A] px-2.5 py-0.5 rounded-full border border-[#9DC39D] font-extrabold uppercase tracking-widest">
              Executive Admin Workspace
            </span>
            <h2 className="font-serif text-2xl font-black text-[#1E301E] mt-1.5">Administrative Control Console</h2>
            <p className="text-xs text-[#4A634A] mt-0.5 max-w-xl">
              Monitor sandbox confectionery metrics, sanction domestic kitchen certifications (KYC), resolve recipe proposals, and evaluate global billing operations in real-time.
            </p>
          </div>
        </div>

        {/* Global numbers */}
        <div className="flex gap-4 items-center bg-white p-4 border border-[#F5EDE8] rounded-2xl shadow-xs">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Consolidated Bakery Revenue</p>
            <h4 className="font-serif text-lg font-black text-emerald-600">${totalCorporateVolume.toFixed(2)}</h4>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Recipe Recipes</p>
            <h4 className="font-serif text-lg font-black text-[#3A2218]">{suites.length} Desserts</h4>
          </div>
        </div>
      </div>

      {/* Tabs navigation list */}
      <div className="flex bg-[#F1EFEA]/60 p-1 rounded-2xl border border-gray-200/50 mb-8 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition ${
            activeTab === 'listings'
              ? 'bg-[#3A2218] text-white shadow-xs'
              : 'text-[#6E5950] hover:bg-white/80'
          }`}
        >
          <PlusCircle size={14} />
          <span>Sweets Proposals ({pendingListingProposalsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('chefs-kyc')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition ${
            activeTab === 'chefs-kyc'
              ? 'bg-[#8FBC8F] text-white shadow-xs'
              : 'text-[#6E5950] hover:bg-white/80'
          }`}
        >
          <Award size={14} />
          <span>Chef Clearance (KYC)</span>
        </button>

        <button
          onClick={() => setActiveTab('directories')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition ${
            activeTab === 'directories'
              ? 'bg-[#FF9B85] text-white shadow-xs'
              : 'text-[#6E5950] hover:bg-white/80'
          }`}
        >
          <Users size={14} />
          <span>User Directories ({registeredUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition ${
            activeTab === 'orders'
              ? 'bg-[#FF7A85] text-white shadow-xs'
              : 'text-[#6E5950] hover:bg-white/80'
          }`}
        >
          <ShoppingBag size={14} />
          <span>Global Orders Log ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('viewings')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition ${
            activeTab === 'viewings'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-[#6E5950] hover:bg-white/80'
          }`}
        >
          <Calendar size={14} />
          <span>Catering Meetings ({scheduledViewings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition ${
            activeTab === 'reports'
              ? 'bg-[#5C463C] text-white shadow-xs'
              : 'text-[#6E5950] hover:bg-white/80'
          }`}
        >
          <FileText size={14} />
          <span>Audits/Reports</span>
        </button>
      </div>

      {/* Tab contents panel mapping */}
      <AnimatePresence mode="wait">
        
        {/* TAB Listings Proposals approved/reject */}
        {activeTab === 'listings' && (
          <motion.div
            key="listings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Proposals loop */}
            <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-[#FAEDE4]">
              <h3 className="font-serif text-base font-bold text-[#3A2218] border-b border-[#F7EFE9] pb-3 mb-4 flex items-center justify-between">
                <span>Recent Confectionery Proposals</span>
                <span className="text-xs bg-[#FFF2EE] text-[#FF7A85] px-2 py-0.5 rounded-full">{pendingListingProposalsCount} Awaiting validation</span>
              </h3>

              {pendingListingProposalsCount === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <Inbox className="mx-auto mb-2 opacity-30 text-[#857168]" size={36} />
                  <p className="text-xs font-bold text-[#8A756D]">Sweets list fully reviewed! 🎉</p>
                  <p className="text-[10px] text-gray-400 mt-1">When kitchen owners list sweets, their batch proposal lands here for validation.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {pendingSuites.map(s => (
                    <div key={s.id} className="p-4 bg-white border border-[#FAEDE4] rounded-2xl flex flex-col gap-3">
                      <div className="flex gap-4 items-start">
                        <img src={s.images[0]} alt="Prop validated thumbnail" className="h-16 w-16 rounded-xl object-cover border border-[#FAEDE4] shrink-0" referrerPolicy="no-referrer" />
                        <div className="flex-grow min-w-0">
                          <span className="text-[9px] uppercase font-bold text-[#FF7A85] bg-[#FFF2EE] px-2 py-0.5 rounded-md">
                            {s.category}
                          </span>
                          <h4 className="text-xs font-black text-[#3A2218] mt-1.5 truncate">{s.title}</h4>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase">Price: ${s.pricePerNight} / {s.unitWeight || 'pack'} • Town: {s.location}</p>
                        </div>
                      </div>

                      <div className="bg-[#FFFDFC] border border-[#FAEDE4] p-2.5 rounded-lg text-xs font-semibold text-gray-600">
                        <p className="font-bold text-[#FF7A85] uppercase text-[9px] mb-1">Chef Coordinates: {s.ownerEmail}</p>
                        <p className="italic">"{s.description}"</p>
                      </div>

                      <div className="flex justify-end gap-2 text-xs pt-2 border-t border-[#FDF8F5]">
                        <button
                          onClick={() => rejectSuite(s.id)}
                          className="bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-xl hover:bg-red-100 transition font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Ban size={12} /> Needs Revision
                        </button>
                        <button
                          onClick={() => approveSuite(s.id)}
                          className="bg-green-500 hover:bg-green-600 text-white shadow-xs px-4 py-1.5 rounded-xl transition font-black flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={12} /> Approve Sweet Batch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bulletin broadcast dispatch */}
            <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-[#FAEDE4] h-fit">
              <h3 className="font-serif text-sm font-bold text-[#3A2218] mb-3 flex items-center gap-1.5">
                <Megaphone size={16} className="text-[#8FBC8F]" /> Dispatch System Announcement
              </h3>
              
              <form onSubmit={handleBroadcastSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. FSSAI Compliance Standards updated"
                  className="w-full bg-[#FFFDFC] text-xs font-semibold px-3 py-2 rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85]"
                  required
                />
                <textarea
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  placeholder="Type bulletin text..."
                  className="w-full bg-[#FFFDFC] text-xs font-medium p-3 rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] h-20 resize-none whitespace-normal text-[#3A2218]"
                  required
                />
                
                {bcSuccess && (
                  <p className="text-[10px] font-bold text-emerald-600">✓ Message broadcasted live on sandbox dashboard boards!</p>
                )}

                <button
                  type="submit"
                  className="bg-[#3A2218] text-white hover:bg-black font-bold text-xs py-2 px-4 rounded-xl transition cursor-pointer"
                >
                  Broadcast Bulletin
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* TAB Chefs clearances kyc details */}
        {activeTab === 'chefs-kyc' && (
          <motion.div
            key="chefs-kyc"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-5 sm:p-6 rounded-[32px] border border-[#FAEDE4]"
          >
            <h3 className="font-serif text-base font-bold text-[#1E301E] border-b border-[#F7EFE9] pb-3 mb-4 flex items-center justify-between">
              <span>Chef Sanitation Clearances & KYC</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold border border-emerald-200">fssai accredited list</span>
            </h3>

            {/* Display active chef status on sandbox */}
            <div className="flex flex-col gap-4 text-xs font-semibold">
              <div className="bg-[#FFF9F7] border border-[#FFEDE9] p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#3A2218]">{chefOnboardingDetails?.chefName || 'Manasa Rose Rose (Awaiting Verified Onboarding)'}</h4>
                    <span className="bg-green-100 text-green-800 px-2 py-0.1 select-none rounded text-[9px] uppercase font-mono font-black">Authorized</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Kitchen Name: <strong>{chefOnboardingDetails?.kitchenName || 'Sugar Plum Kitchens'}</strong></p>
                  <p className="text-[10px] text-gray-400">Sanitation Clearance ID: <strong>{chefOnboardingDetails?.sanitationFssaiCode || 'FSSAI-9812-321-44'}</strong></p>
                  <p className="text-[10px] text-gray-400">Kitchen Base: <strong>{chefOnboardingDetails?.kitchenAddress || 'SoHo, New York'}</strong></p>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] text-gray-400">Experience:</span>
                  <span className="block font-serif text-lg font-bold text-[#3A2218]">{chefOnboardingDetails?.experienceYears || 5} Years</span>
                </div>
              </div>

              {/* Verified status logs */}
              <div className="text-gray-500 p-2 text-[11px] italic">
                💡 Sandbox verification engine automatically flags and pre-approves KYC certificates. Chefs are free to test listing proposal uploads immediately.
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB User registries */}
        {activeTab === 'directories' && (
          <motion.div
            key="directories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
          >
            {/* Chefs List */}
            <div className="bg-white p-5 rounded-3xl border border-[#FAEDE4]">
              <h3 className="font-serif text-sm font-bold text-[#3A2218] border-b border-[#F7EFE9] pb-2 mb-3 tracking-wide">
                Registered Homeowner Chefs ({ownersList.length})
              </h3>
              
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                {ownersList.map( chef => (
                  <div key={chef.email} className="p-3 bg-[#FFFDFC] border border-[#FAEDE4] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={chef.avatar} alt="Chef avatar" className="h-8 w-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-[#3A2218]">{chef.name}</p>
                        <p className="text-[10px] text-gray-400">{chef.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-150">CATERER</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customers list */}
            <div className="bg-white p-5 rounded-3xl border border-[#FAEDE4]">
              <h3 className="font-serif text-sm font-bold text-[#3A2218] border-b border-[#F7EFE9] pb-2 mb-3 tracking-wide">
                Registered Appetite Buyers ({usersList.length})
              </h3>

              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                {usersList.map( buyer => (
                  <div key={buyer.email} className="p-3 bg-[#FFFDFC] border border-[#FAEDE4] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={buyer.avatar} alt="Buyer avatar" className="h-8 w-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-[#3A2218]">{buyer.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{buyer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                        ${buyer.walletBalance || '0.00'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB Orders log */}
        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-5 sm:p-6 rounded-[32px] border border-[#FAEDE4]"
          >
            <h3 className="font-serif text-base font-bold text-[#3A2218] border-b border-[#F7EFE9] pb-3 mb-4 flex items-center justify-between">
              <span>Sweets platform bookkeeping logs ({bookings.length})</span>
              <span className="font-mono text-xs text-gray-400 font-bold">Consolidated audits view</span>
            </h3>

            {bookings.length === 0 ? (
              <p className="text-xs text-center text-gray-400 italic py-10">Confectionery transactions table is empty currently.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#F5EDE8] text-[#867168] font-bold uppercase">
                      <th className="py-2.5">ID</th>
                      <th>Confection</th>
                      <th>Quantity Order</th>
                      <th>Customer Email</th>
                      <th>Total Value</th>
                      <th className="text-right">Transaction Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FDF8F5] text-gray-700">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-[#FFFDFC]">
                        <td className="py-2.5 font-mono text-gray-400 text-[10px]">{b.id.substring(0, 8)}</td>
                        <td className="font-bold text-[#3A2218]">{b.suiteTitle}</td>
                        <td className="font-semibold">{b.guestsCount}x packs</td>
                        <td>{b.guestEmail}</td>
                        <td className="font-mono text-emerald-600 font-bold">${b.totalAmount.toFixed(2)}</td>
                        <td className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            b.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB Walkthrough scheduled */}
        {activeTab === 'viewings' && (
          <motion.div
            key="viewings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-[#FAEDE4]"
          >
            <h3 className="font-serif text-base font-bold text-[#3A2218] border-b border-[#F7EFE9] pb-3 mb-4">
              Scheduled kitchen tastings & consults ({scheduledViewings.length})
            </h3>

            {scheduledViewings.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Inbox size={24} className="mx-auto mb-2 opacity-30 text-[#857168]" />
                <p className="text-xs font-bold text-[#8A756D]">No kitchen meeting events scheduled</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduledViewings.map( viewing => (
                  <div key={viewing.id} className="p-3.5 rounded-2xl bg-[#FFFDFC] border border-[#FAF1EB] text-xs">
                    <div className="flex justify-between font-mono text-[9px] text-[#A68F85] mb-2 font-bold uppercase select-none">
                      <span>Topic: {viewing.topic}</span>
                      <span>{viewing.id.substring(0, 6)}</span>
                    </div>

                    <h4 className="font-bold text-[#3A2218]">{viewing.name}</h4>
                    <p className="text-gray-400 mt-0.5">Contacts: {viewing.email} • {viewing.phone}</p>
                    <p className="mt-2 text-[#E36D5B] font-bold bg-[#FFF2EE] px-2 py-1 rounded inline-block">📅 {viewing.date} ({viewing.timeSlot})</p>

                    <div className="bg-[#FFFDFC] border border-gray-100 p-2 rounded-lg mt-3 text-gray-600 italic">
                      "{viewing.message}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB Auditing reports charts */}
        {activeTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
          >
            {/* Chart segment */}
            <div className="bg-white p-5 rounded-3xl border border-[#FAEDE4]">
              <h3 className="font-serif text-sm font-black text-[#5C463C] uppercase tracking-wider mb-2 flex items-center gap-1.5Fixed text-xs">
                <ChartArea size={13} className="text-[#FF7A85]" /> Consolidated Sweets Sales volume ratios
              </h3>
              
              <div className="h-40 flex items-end justify-around pt-4">
                <div className="flex flex-col items-center gap-1.5 w-12 text-center">
                  <span className="text-[9px] font-bold text-gray-400">$324</span>
                  <div className="w-6 bg-[#FF7A85] rounded-t-lg h-20 shadow-sm" />
                  <span className="text-[9px] text-gray-500 font-bold truncate uppercase">Sweets</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 w-12 text-center">
                  <span className="text-[9px] font-bold text-gray-400">$215</span>
                  <div className="w-6 bg-[#FF9B85] rounded-t-lg h-14 shadow-sm" />
                  <span className="text-[9px] text-gray-500 font-bold truncate uppercase">Snacks</span>
                </div>

                <div className="flex flex-col items-center gap-1.5 w-12 text-center">
                  <span className="text-[9px] font-bold text-gray-400">$450</span>
                  <div className="w-6 bg-[#3A2218] rounded-t-lg h-28 shadow-sm" />
                  <span className="text-[9px] text-gray-500 font-bold truncate uppercase">Hampers</span>
                </div>
              </div>
            </div>

            {/* Corporate Summary numbers */}
            <div className="bg-white p-5 rounded-3xl border border-[#FAEDE4] flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-sm font-bold text-[#3A2218]">Operation parameters report</h3>
                <p className="text-[11px] text-gray-400 mt-1">Calculated under sandbox local storage state</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-bold text-[#3A2218]">
                <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                  <p className="text-[9px] text-[#4A724A] uppercase">Approved Sweets</p>
                  <p className="text-sm font-serif mt-0.5">{approvedListingProposalsCount} Recipes</p>
                </div>
                <div className="bg-[#FFF4F1] p-2 rounded-xl border border-[#FFE1D9]">
                  <p className="text-[9px] text-[#C45543] uppercase">Incoming Inquiries</p>
                  <p className="text-sm font-serif mt-0.5">{chefContactRequests.length} messages</p>
                </div>
              </div>

              <p className="text-[9px] text-gray-400 font-bold uppercase mt-4 text-center">SSL Sandbox Secure Core • uptime: 100%</p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
