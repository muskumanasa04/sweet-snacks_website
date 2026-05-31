import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Wallet, ShieldAlert, KeyRound, User, Check, Trash2, Menu, X, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModal } from './AuthModal';

export const Header: React.FC = () => {
  const {
    currentRole,
    currentUser,
    setRole,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications based on role
  const userNotifs = notifications.filter(n => {
    if (currentRole === 'admin') return n.recipientEmail === 'all-admins';
    if (currentRole === 'owner') return n.recipientEmail === currentUser.email;
    return n.recipientEmail === currentUser.email;
  });

  const unreadCount = userNotifs.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDFB]/95 backdrop-blur-md border-b border-[#F7EFE9] px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo and App Title */}
        <div className="flex items-center gap-2 select-none">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#FF7A85] to-[#FF9B85] flex items-center justify-center text-white shadow-sm shadow-[#FF7A85]/20">
            <span className="font-serif text-[15px] font-bold">🍬🥨</span>
          </div>
          <div>
            <h1 className="font-serif text-base md:text-lg font-bold tracking-tight text-[#3A2218] leading-tight">
              Sweets & <span className="text-[#FF7A85]">Snacks</span>
            </h1>
            <p className="hidden xs:block font-sans text-[9px] tracking-wider uppercase text-[#BF9C8F] font-black">Homemade Bakers & Confections</p>
          </div>
        </div>

        {/* Roles Tab Panel (Main Switcher) */}
        <div className="hidden lg:flex items-center bg-[#FDF8F5] p-1.5 rounded-full border border-[#F5EDE8] gap-1">
          <button
            onClick={() => setRole('guest')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
              currentRole === 'guest'
                ? 'bg-[#FF7A85] text-white shadow-sm'
                : 'text-[#8A756D] hover:bg-[#FBECE6] hover:text-[#3A2218]'
            }`}
          >
            <User size={13} />
            Guest Hub
          </button>
          <button
            onClick={() => setRole('owner')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
              currentRole === 'owner'
                ? 'bg-[#FF9B85] text-white shadow-sm'
                : 'text-[#8A756D] hover:bg-[#FBECE6] hover:text-[#3A2218]'
            }`}
          >
            <KeyRound size={13} />
            Chef Owner Studio
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
              currentRole === 'admin'
                ? 'bg-[#8FBC8F] text-white shadow-sm'
                : 'text-[#8A756D] hover:bg-[#EAF2EA] hover:text-[#3A2218]'
            }`}
          >
            <ShieldAlert size={13} />
            Executive Admin
          </button>
        </div>

        {/* User Info, Notifications, Wallet Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Auth Switch Portal button */}
          <button
            onClick={() => setAuthOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#3A2218] hover:bg-black text-white text-[11px] font-bold cursor-pointer transition-all shadow-xs"
          >
            <LogIn size={12} className="text-[#FFD9CE]" />
            <span>Login/Register</span>
          </button>

          {/* Virtual Wallet */}
          {currentRole !== 'admin' && (
            <div className="flex items-center gap-1 bg-[#FFF2EE] px-2.5 py-1.5 rounded-full border border-[#FFE1D9] text-[#C45543] select-none">
              <Wallet size={12} />
              <span className="font-mono text-xs font-bold">
                ${(currentUser.walletBalance ?? 0).toFixed(2)}
              </span>
            </div>
          )}

          {/* User Profile info */}
          <div className="hidden sm:flex items-center gap-1.5 border-l border-gray-150 pl-2.5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full border border-[#FFD9CE] object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="text-left leading-none">
              <p className="text-xs font-black text-[#3A2218] truncate max-w-[90px]">{currentUser.name}</p>
              <p className="text-[9px] text-[#A68F85] mt-0.5 capitalize font-black text-[#FF7A85]">{currentUser.role}</p>
            </div>
          </div>

          {/* Notification Dropper */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-full border border-[#F5EDE8] bg-[#FDF8F5] text-[#331E14] hover:bg-[#F5EDE8] transition duration-200 cursor-pointer"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-[#FF7A85] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-white border border-[#F5EDE8] shadow-xl overflow-hidden shadow-[#3A2218]/5 z-50"
                >
                  <div className="p-3 border-b border-[#F7EFE9] bg-[#FFFDFC] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#3A2218]">Sweets Notices</h4>
                      <p className="text-[10px] text-[#A68F85]">You have {unreadCount} updates</p>
                    </div>
                    {userNotifs.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[10px] font-bold text-[#FF7A85] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Mark all read
                        </button>
                        <button
                          onClick={clearAllNotifications}
                          className="text-[10px] font-medium text-[#A68F85] hover:text-[#FF7A85] cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#F9F4F0]">
                    {userNotifs.length === 0 ? (
                      <div className="py-8 text-center text-[#A68F85] text-xs">
                        <Bell className="mx-auto mb-2 opacity-30 text-[#857168]" size={24} />
                        All quiet here. No new updates!
                      </div>
                    ) : (
                      userNotifs.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 text-left transition duration-200 hover:bg-[#FFFDFC] ${
                            !n.read ? 'bg-[#FCF5F1]' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-sans text-[10px] font-semibold text-[#FF7A85] flex items-center gap-1 uppercase tracking-wider">
                              {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A85]" />}
                              {n.type === 'booking' ? '📦 Order Request' : n.type === 'property' ? '🧁 Recipe' : n.type === 'review' ? '⭐ Star Review' : '📢 System'}
                            </span>
                            <span className="font-mono text-[9px] text-[#C0AAA0]">
                              {new Date(n.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-[#331E14] mt-1 pr-4">{n.title}</h5>
                          <p className="text-[11px] text-[#6E5950] mt-0.5 leading-relaxed pr-2">{n.message}</p>
                          {!n.read && (
                            <button
                              onClick={() => markNotificationRead(n.id)}
                              className="mt-1.5 text-[10px] text-[#FF9B85] hover:text-[#C45543] font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              <Check size={11} /> Mark as read
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Navigation Drawer Open */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 lg:hidden rounded-full border border-[#F5EDE8] text-[#331E14] hover:bg-[#FDF8F5] cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-3 border-t border-[#F5EDE8] pt-3 overflow-hidden"
          >
            <div className="flex flex-col gap-2 p-1 bg-[#FDF8F5] rounded-xl border border-[#F7EFE9]">
              <div className="p-2 border-b border-[#F5EDE8] flex items-center gap-2">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full border border-[#FFD9CE] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-xs font-bold text-[#3A2218]">{currentUser.name}</p>
                  <p className="text-[10px] text-[#A68F85]">{currentUser.email}</p>
                </div>
              </div>
              <p className="text-[9px] font-bold text-center tracking-wider text-[#BF9C8F] uppercase mt-1">Select Active Workspace</p>
              <button
                onClick={() => {
                  setRole('guest');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
                  currentRole === 'guest'
                    ? 'bg-[#FF7A85] text-white shadow-sm'
                    : 'text-[#8A756D] hover:bg-[#FBECE6]'
                }`}
              >
                <User size={14} /> Guest Hub - Buy Sweets
              </button>
              <button
                onClick={() => {
                  setRole('owner');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
                  currentRole === 'owner'
                    ? 'bg-[#FF9B85] text-white shadow-sm'
                    : 'text-[#8A756D] hover:bg-[#FBECE6]'
                }`}
              >
                <KeyRound size={14} /> Chef Owner Studio
              </button>
              <button
                onClick={() => {
                  setRole('admin');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-[#8FBC8F] text-white shadow-sm'
                    : 'text-[#8A756D] hover:bg-[#EAF2EA]'
                }`}
              >
                <ShieldAlert size={14} /> Executive Admin Board
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mounting Login Gateway Modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
};
