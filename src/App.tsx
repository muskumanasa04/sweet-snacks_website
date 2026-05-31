import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { SuiteCard } from './components/SuiteCard';
import { SuiteDetailModal } from './components/SuiteDetailModal';
import { GuestDashboard } from './components/GuestDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ContactScheduleForm } from './components/ContactScheduleForm';
import { AboutSection } from './components/AboutSection';
import { Suite } from './types';
import { Search, Sparkles, MapPin, SlidersHorizontal, Users, Star, ArrowRight, HeartHandshake } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { suites, currentRole } = useApp();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'suites' | 'schedule' | 'about' | 'dashboard'>('suites');
  const [selectedSuite, setSelectedSuite] = useState<Suite | null>(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceTier, setPriceTier] = useState<string>('All');
  const [capacityFilter, setCapacityFilter] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter approved suites for Guest catalog
  const approvedSuites = suites.filter(s => s.status === 'approved');

  const filteredSuites = approvedSuites.filter(s => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    
    const matchesPrice =
      priceTier === 'All' ||
      (priceTier === 'budget' && s.pricePerNight < 30) ||
      (priceTier === 'luxe' && s.pricePerNight >= 30);

    const matchesCapacity = capacityFilter === 0 || s.capacity >= capacityFilter;

    return matchesSearch && matchesCategory && matchesPrice && matchesCapacity;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDFB]">
      {/* Dynamic Navigation Toolbar header */}
      <Header />

      {/* Primary tab workspace navigation */}
      <nav className="border-b border-[#F9F4F0] bg-white sticky top-[65px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-center gap-1.5 xs:gap-4 md:gap-8 overflow-x-auto py-3">
          <button
            onClick={() => setActiveTab('suites')}
            className={`flex items-center gap-1 py-1.5 px-3 text-xs md:text-sm font-serif font-bold rounded-full transition-all shrink-0 ${
              activeTab === 'suites'
                ? 'bg-[#FF7A85]/10 text-[#FF7A85]'
                : 'text-[#8A756D] hover:bg-[#FDF8F5] hover:text-[#3A2218]'
            }`}
          >
            🍭 Explore Sweets & Snacks
          </button>
          
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1 py-1.5 px-3 text-xs md:text-sm font-serif font-bold rounded-full transition-all shrink-0 ${
              activeTab === 'schedule'
                ? 'bg-[#FF9B85]/10 text-[#FF9B85]'
                : 'text-[#8A756D] hover:bg-[#FDF8F5] hover:text-[#3A2218]'
            }`}
          >
            📅 Custom & Bulk Orders
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-1 py-1.5 px-3 text-xs md:text-sm font-serif font-bold rounded-full transition-all shrink-0 ${
              activeTab === 'about'
                ? 'bg-[#8FBC8F]/10 text-[#8FBC8F]'
                : 'text-[#8A756D] hover:bg-[#FDF8F5] hover:text-[#3A2218]'
            }`}
          >
            📖 Our Bakery Legacy
          </button>

          <div className="h-4 w-px bg-gray-200 shrink-0" />

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 py-1.5 px-4 text-xs md:text-sm font-serif font-black rounded-full border transition-all shrink-0 ${
              activeTab === 'dashboard'
                ? currentRole === 'admin'
                  ? 'bg-gradient-to-r from-[#8FBC8F] to-[#7FA47F] text-white border-transparent shadow-sm'
                  : currentRole === 'owner'
                  ? 'bg-gradient-to-r from-[#FF9B85] to-[#EE8068] text-white border-transparent shadow-sm'
                  : 'bg-gradient-to-r from-[#FF7A85] to-[#EE606D] text-white border-transparent shadow-sm'
                : 'border-[#FAEDE4] text-[#8E756C] bg-[#FFF8F6] hover:bg-[#FDF1EE] hover:text-[#3A2218]'
            }`}
          >
            📋 {currentRole === 'admin' ? 'Admin Board' : currentRole === 'owner' ? 'Chef Studio' : 'My Orders & Cart'}
          </button>
        </div>
      </nav>

      {/* Main Container rendering active tab views */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'suites' && (
            <motion.div
              key="suites"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-4 py-8 md:px-8 flex flex-col gap-8 text-center"
            >
              {/* Grand Hero Section */}
              <div className="relative py-12 md:py-20 rounded-[36px] overflow-hidden bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#FFF0EA] via-[#FFF9F6] to-[#FFFDFB] border border-[#FAEDE4] flex flex-col items-center gap-4 select-none">
                {/* Floating soft decorations */}
                <div className="absolute top-10 left-10 text-3xl opacity-30 animate-bounce">🍬</div>
                <div className="absolute bottom-10 right-10 text-3xl opacity-30 animate-pulse">🧁</div>

                <div className="z-10 max-w-2xl px-6">
                  <span className="text-[10px] bg-[#FFF2EE] text-[#FF7A85] border border-[#FFD9CE] px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1 justify-center mx-auto w-fit">
                    <Sparkles size={11} /> 100% Certified Authentic Kitchens
                  </span>
                  
                  <h2 className="font-serif text-3xl sm:text-5xl font-black text-[#3A2218] tracking-tight mt-4 leading-tight">
                    Sweets & Snacks. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A85] to-[#FF9B85]">Feast Crunchy.</span>
                  </h2>
                  
                  <p className="text-xs sm:text-sm text-[#8A756D] font-medium leading-relaxed mt-4 max-w-lg mx-auto">
                    Welcome to the Sweets & Snacks pantry. Discover traditional pure-ghee laddus, crispy samosas, artisan baklavas, and guilt-free snacks hand-vetted, packed fresh, and delivered with love.
                  </p>
                </div>

                {/* Inline Quick Search & Filters drawer toggle */}
                <div className="w-full max-w-3xl px-4 mt-4 z-10">
                  <div className="bg-white rounded-2xl border border-[#FAEDE4] p-3 shadow-md shadow-[#3A2218]/4 flex flex-col sm:flex-row gap-2.5 items-stretch">
                    {/* Search Field */}
                    <div className="flex-grow relative flex items-center">
                      <Search size={16} className="absolute left-3 text-[#A68F85]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search delicious sweets, crunchy snacks or chef locations..."
                        className="w-full bg-[#FFFDFC] pl-10 pr-3 py-2 text-xs font-semibold rounded-xl border border-transparent outline-none focus:bg-[#FFFDFC] text-[#331E14]"
                      />
                    </div>

                    {/* Filter drawer toggle button */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        showFilters
                          ? 'bg-[#3A2218] text-white border-transparent'
                          : 'bg-[#FDF8F5] text-[#8A756D] border-[#FAEDE4] hover:bg-[#F7EFE9]'
                      }`}
                    >
                      <SlidersHorizontal size={13} />
                      Filters {showFilters ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {/* Responsive Filters Area */}
                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 bg-[#FFFDFC] border border-[#F5EDE8] rounded-2xl p-4 text-left grid grid-cols-1 sm:grid-cols-3 gap-4"
                      >
                        {/* Categories pills */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-2">Category</label>
                          <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="bg-white border border-gray-200 p-2 text-xs rounded-xl w-full outline-none focus:border-[#FF7A85]"
                          >
                            <option value="All">All Categories</option>
                            <option value="Traditional Sweets">Traditional Sweets</option>
                            <option value="Crunchy Snacks">Crunchy Snacks</option>
                            <option value="Healthy & Sugar-Free">Healthy & Sugar-Free</option>
                            <option value="Festive Hampers">Festive Hampers</option>
                          </select>
                        </div>

                        {/* Price tier selection */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-2">Budget Tier</label>
                          <select
                            value={priceTier}
                            onChange={e => setPriceTier(e.target.value)}
                            className="bg-white border border-gray-200 p-2 text-xs rounded-xl w-full outline-none focus:border-[#FF7A85]"
                          >
                            <option value="All">All Prices</option>
                            <option value="budget">Value Treats (&lt; $30)</option>
                            <option value="luxe">Luxury Premium Chests (&gt;= $30)</option>
                          </select>
                        </div>

                        {/* Capacity filtering */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-2">Minimum Stock</label>
                          <select
                            value={capacityFilter}
                            onChange={e => setCapacityFilter(parseInt(e.target.value) || 0)}
                            className="bg-white border border-gray-200 p-2 text-xs rounded-xl w-full outline-none focus:border-[#FF7A85]"
                          >
                            <option value={0}>Any availability status</option>
                            <option value={10}>10+ items left</option>
                            <option value={20}>20+ items left</option>
                            <option value={30}>30+ items left</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Grid List section */}
              <div className="flex flex-col gap-4 mt-4 text-left">
                <div className="flex justify-between items-baseline border-b border-[#F9F4F0] pb-2">
                  <h3 className="font-serif text-lg font-bold text-[#3A2218]">Featured Delicacies</h3>
                  <p className="text-xs text-[#A68F85] font-semibold">{filteredSuites.length} artisan sweets found</p>
                </div>

                {filteredSuites.length === 0 ? (
                  <div className="py-20 text-center rounded-3xl border border-dashed border-[#F0E6DE] bg-white text-gray-400">
                    <Search className="mx-auto mb-2 opacity-20 text-[#3A2218]" size={36} />
                    <p className="text-sm font-semibold text-[#8A756D]">No delicious items match your criteria.</p>
                    <p className="text-xs text-gray-400 mt-1">Try spelling/keyword expansions or resetting search inputs.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filteredSuites.map(suite => (
                      <SuiteCard key={suite.id} suite={suite} onClick={() => setSelectedSuite(suite)} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-4 py-8 md:px-8 text-center flex flex-col gap-4"
            >
              <div className="max-w-2xl text-center mx-auto mb-4 select-none">
                <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#3A2218] tracking-tight">Bulk Order & Catering Consultation Scheduler</h2>
                <p className="text-xs md:text-sm text-[#8A756D] leading-relaxed mt-2">
                  Reserve a personalized layout consult, speak with certified local home bakers directly, request sample taste boxes, or coordinate large-scale wedding and party packages.
                </p>
              </div>
              <ContactScheduleForm />
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-4 py-8 md:px-8 text-center"
            >
              <AboutSection />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {currentRole === 'admin' ? (
                <AdminDashboard />
              ) : currentRole === 'owner' ? (
                <OwnerDashboard />
              ) : (
                <GuestDashboard />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Dynamic Popups Detail Overlay */}
      <AnimatePresence>
        {selectedSuite && (
          <SuiteDetailModal suite={selectedSuite} onClose={() => setSelectedSuite(null)} />
        )}
      </AnimatePresence>

      {/* Simple Sweet Ticker Banner */}
      <div className="bg-[#FFF2EE] border-t border-b border-[#FFE1D9] py-2 px-4 text-center select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 overflow-x-auto text-[11px] font-bold text-[#E36D5B]">
          <span className="animate-pulse">🔔</span>
          <span className="truncate">Recent Sweet & Snack Hampers batch dispatched to California! Fresh and aromatic.</span>
          <ArrowRight size={12} />
        </div>
      </div>

      {/* Aesthetic human credits footer */}
      <footer className="bg-white border-t border-[#F5EDE8] py-8 text-center px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A68F85] font-semibold select-none">
          <div className="flex items-center gap-1.5 text-[#331E14]">
            <HeartHandshake size={14} className="text-[#FF7A85]" />
            <span>Sweets & Snacks Home Bakers Alliance. All rights reserved.</span>
          </div>
          <div>
            <p className="tracking-wider uppercase text-[10px] text-gray-400">Secure SSL sandbox billing network active</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
