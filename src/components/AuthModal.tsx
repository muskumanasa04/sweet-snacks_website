import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, User, ShieldAlert, KeyRound, Phone, MapPin, CheckCircle, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'register' | 'verify' | 'forgot' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    registeredUsers,
    registerUser,
    loginUser,
    verifyEmailCode,
    sendPasswordReset,
    resetPasswordWithToken
  } = useApp();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'guest' | 'owner' | 'admin'>('guest');

  // Verification state
  const [verificationCode, setVerificationCode] = useState('');

  // Password reset state
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email || !password) {
      setErrorMsg('Please fill in both email and password.');
      return;
    }

    const { success, requiresVerification, msg } = loginUser(email.trim(), role, password);
    if (success) {
      setSuccessMsg(msg);
      setTimeout(() => {
        onClose();
        resetMessages();
        setPassword('');
      }, 1500);
    } else if (requiresVerification) {
      setSuccessMsg(msg);
      setTimeout(() => {
        setMode('verify');
        resetMessages();
      }, 2000);
    } else {
      setErrorMsg(msg);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email || !name || !password || !phone) {
      setErrorMsg('Name, email, mobile phone number, and password are required fields.');
      return;
    }

    const randomAvatar = `https://images.unsplash.com/photo-${
      role === 'owner' 
        ? '1534528741775-53994a69daeb' 
        : '1544005313-94ddf0286df2'
    }?auto=format&fit=crop&q=80&w=150`;

    const { success, requiresVerification, msg } = registerUser({
      email: email.trim(),
      name: name.trim(),
      role,
      avatar: randomAvatar,
      phone: phone.trim(),
      address: address.trim() || 'No address provided',
      password: password
    });

    if (success) {
      setSuccessMsg(msg);
      if (requiresVerification) {
        setTimeout(() => {
          setMode('verify');
          resetMessages();
        }, 2500);
      } else {
        setTimeout(() => {
          setMode('login');
          resetMessages();
        }, 1500);
      }
    } else {
      setErrorMsg(msg);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!verificationCode) {
      setErrorMsg('Please enter a 6-digit confirmation code.');
      return;
    }

    const { success, msg } = verifyEmailCode(email.trim(), role, verificationCode.trim());
    if (success) {
      setSuccessMsg(msg);
      setTimeout(() => {
        onClose();
        resetMessages();
        setVerificationCode('');
      }, 1500);
    } else {
      setErrorMsg(msg);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email) {
      setErrorMsg('Please enter your email coordinates.');
      return;
    }

    const { success, msg } = sendPasswordReset(email.trim(), role);
    if (success) {
      setSuccessMsg(msg);
      setTimeout(() => {
        setMode('reset');
        resetMessages();
      }, 2000);
    } else {
      setErrorMsg(msg);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!resetToken || !newPassword) {
      setErrorMsg('Reset token code and new password are required.');
      return;
    }

    const { success, msg } = resetPasswordWithToken(email.trim(), role, resetToken.trim(), newPassword);
    if (success) {
      setSuccessMsg(msg);
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setNewPassword('');
        setResetToken('');
        resetMessages();
      }, 2000);
    } else {
      setErrorMsg(msg);
    }
  };

  // Helper title & descriptions based on active mode
  const getHeaderDetails = () => {
    switch (mode) {
      case 'register':
        return {
          tag: 'Chef & Buyer Hub',
          title: 'Register Your Account',
          desc: 'Create an account specifying your name, email, mobile number, and password to start matching with domestic kitchens.'
        };
      case 'verify':
        return {
          tag: 'Email Verification',
          title: 'Enter Verification Code',
          desc: `Check your sweets notification bell 🔔 or dashboard system to retrieve your email verification code for ${email || 'your account'}.`
        };
      case 'forgot':
        return {
          tag: 'Credential Recovery',
          title: 'Forgot Password',
          desc: 'Request a secure password reset token code dispatched directly into your notifications feed.'
        };
      case 'reset':
        return {
          tag: 'Set New Password',
          title: 'Reset Password',
          desc: 'Supply the reset code code along with your desired brand-new credential pass phrase.'
        };
      case 'login':
      default:
        return {
          tag: 'Sweets & Snacks Gateway',
          title: 'Access Your Gourmet Hub',
          desc: 'Sign in utilizing your email and password credentials to order homemade sweets, snacks, and message elite local chefs.'
        };
    }
  };

  const headerDetails = getHeaderDetails();

  return (
    <div className="fixed inset-0 bg-[#3A2218]/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-[32px] overflow-hidden border border-[#FAEDE4] shadow-2xl shadow-[#3A2218]/15"
      >
        {/* Banner */}
        <div className="bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#FFF0EA] to-[#FFF9F6] border-b border-[#F7EFE9] p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white border border-[#FAEDE4] text-gray-500 hover:text-black hover:bg-gray-50 flex items-center justify-center cursor-pointer transition duration-150"
          >
            <X size={15} />
          </button>

          <span className="text-[9px] bg-[#FFF2EE] text-[#FF7A85] border border-[#FFD9CE] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1 w-fit">
            <Sparkles size={10} /> {headerDetails.tag}
          </span>

          <h3 className="font-serif text-xl font-bold text-[#3A2218] mt-3">
            {headerDetails.title}
          </h3>
          <p className="text-[11px] text-[#867168] mt-1 font-medium leading-relaxed">
            {headerDetails.desc}
          </p>
        </div>

        {/* Form Body Container */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 text-xs font-semibold bg-red-50 text-red-500 border border-red-100 p-3 rounded-xl">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 text-xs font-semibold bg-green-50 text-emerald-600 border border-emerald-100 p-3 rounded-xl flex items-center gap-1">
              <CheckCircle size={14} className="shrink-0" /> {successMsg}
            </div>
          )}

          {/* Mode switch logic */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {/* Role Select Pills */}
              <div>
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-2">My Current Workspace Role</label>
                <div className="grid grid-cols-3 gap-2 bg-[#FDF8F5] p-1 rounded-xl border border-[#FAEDE4]">
                  <button
                    type="button"
                    onClick={() => { setRole('guest'); resetMessages(); }}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                      role === 'guest'
                        ? 'bg-[#FF7A85] text-white shadow-sm'
                        : 'text-[#8A756D] hover:text-[#3A2218]'
                    }`}
                  >
                    Guest (User)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole('owner'); resetMessages(); }}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                      role === 'owner'
                        ? 'bg-[#FF9B85] text-white shadow-sm'
                        : 'text-[#8A756D] hover:text-[#3A2218]'
                    }`}
                  >
                    Chef (Owner)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole('admin'); resetMessages(); }}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                      role === 'admin'
                        ? 'bg-[#8FBC8F] text-white shadow-sm'
                        : 'text-[#8A756D] hover:text-[#3A2218]'
                    }`}
                  >
                    Admin Board
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-1">Email Coordinates</label>
                <div className="relative flex items-center">
                  <Mail size={14} className="absolute left-3 text-[#A68F85]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. muskumanasa04@gmail.com"
                    className="w-full bg-[#FFFDFC] pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] text-[#331E14]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider">Credential Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); resetMessages(); }}
                    className="text-[9px] font-black text-[#FF7A85] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock size={14} className="absolute left-3 text-[#A68F85]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full bg-[#FFFDFC] pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] text-[#331E14]"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="mt-2 w-full py-2.5 bg-[#3A2218] text-white hover:bg-black rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-sm shadow-[#3A2218]/10"
              >
                Log In & Access Sweets
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              {/* Role Select Pills */}
              <div>
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-2">Registering Workspace Role</label>
                <div className="grid grid-cols-2 gap-2 bg-[#FDF8F5] p-1 rounded-xl border border-[#FAEDE4]">
                  <button
                    type="button"
                    onClick={() => { setRole('guest'); resetMessages(); }}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                      role === 'guest'
                        ? 'bg-[#FF7A85] text-white shadow-sm'
                        : 'text-[#8A756D] hover:text-[#3A2218]'
                    }`}
                  >
                    Guest (Buyer)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole('owner'); resetMessages(); }}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                      role === 'owner'
                        ? 'bg-[#FF9B85] text-white shadow-sm'
                        : 'text-[#8A756D] hover:text-[#3A2218]'
                    }`}
                  >
                    Chef (Seller)
                  </button>
                </div>
              </div>

              {/* Name field */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-1">Full Identity Name</label>
                <div className="relative flex items-center">
                  <User size={14} className="absolute left-3 text-[#A68F85]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Kumari Manasa"
                    className="w-full bg-[#FFFDFC] pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] text-[#331E14]"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-1">Email Coordinates</label>
                <div className="relative flex items-center">
                  <Mail size={14} className="absolute left-3 text-[#A68F85]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="w-full bg-[#FFFDFC] pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] text-[#331E14]"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-1">Mobile Phone Number</label>
                <div className="relative flex items-center">
                  <Phone size={14} className="absolute left-3 text-[#A68F85]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +91 94455-66778"
                    className="w-full bg-[#FFFDFC] pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] text-[#331E14]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-1">Account Password</label>
                <div className="relative flex items-center">
                  <Lock size={14} className="absolute left-3 text-[#A68F85]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Define secure password"
                    className="w-full bg-[#FFFDFC] pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] text-[#331E14]"
                  />
                </div>
              </div>

              {/* Address field (Optional/Cozy) */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-1">Kitchen / Shipping Address</label>
                <div className="relative flex items-center">
                  <MapPin size={14} className="absolute left-3 text-[#A68F85]" />
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. Jubilee Hills, Hyderabad"
                    className="w-full bg-[#FFFDFC] pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] text-[#331E14]"
                  />
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="mt-2 w-full py-2.5 bg-[#3A2218] text-white hover:bg-black rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-sm shadow-[#3A2218]/10"
              >
                Register & Verify Email
              </button>
            </form>
          )}

          {mode === 'verify' && (
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <div className="bg-[#FFFDFC] border border-[#FAEDE4] p-3 rounded-2xl text-[11px] text-[#867168] select-none leading-relaxed">
                We generated a verification code for <strong className="text-black font-bold">{email || 'your account'}</strong>. Enter it below to authorize this email identity.
              </div>

              {/* Verification Code */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-1">6-Digit Verification Code</label>
                <div className="relative flex items-center">
                  <KeyRound size={14} className="absolute left-3 text-[#A68F85]" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    placeholder="Enter code (or use 123456)"
                    className="w-full bg-[#FFFDFC] pl-9 pr-3 py-2 text-xs font-bold font-mono rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] text-[#331E14]"
                  />
                </div>
              </div>

              {/* Submit verification button */}
              <button
                type="submit"
                className="mt-2 w-full py-2.5 bg-[#3A2218] text-white hover:bg-black rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-sm shadow-[#3A2218]/10"
              >
                Verify & Activate Account
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              {/* Role select */}
              <div>
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-2">My Account Role</label>
                <div className="grid grid-cols-2 gap-2 bg-[#FDF8F5] p-1 rounded-xl border border-[#FAEDE4]">
                  <button
                    type="button"
                    onClick={() => setRole('guest')}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                      role === 'guest'
                        ? 'bg-[#FF7A85] text-white shadow-sm'
                        : 'text-[#8A756D] hover:text-[#3A2218]'
                    }`}
                  >
                    Guest Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                      role === 'owner'
                        ? 'bg-[#FF9B85] text-white shadow-sm'
                        : 'text-[#8A756D] hover:text-[#3A2218]'
                    }`}
                  >
                    Chef Status
                  </button>
                </div>
              </div>

              {/* Email Address */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-1">Email Coordinates</label>
                <div className="relative flex items-center">
                  <Mail size={14} className="absolute left-3 text-[#A68F85]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. muskumanasa04@gmail.com"
                    className="w-full bg-[#FFFDFC] pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] text-[#331E14]"
                  />
                </div>
              </div>

              {/* Submit forgot pass */}
              <button
                type="submit"
                className="mt-2 w-full py-2.5 bg-[#4B2F22] text-white hover:bg-black rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-sm shadow-[#3A2218]/10"
              >
                Send Recovery Code
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="bg-[#FFFDFC] border border-[#FAEDE4] p-3 rounded-2xl text-[11px] text-[#A68F85] leading-relaxed select-none">
                A verification token code was generated. Input the code along with your desired brand-new password phrase.
              </div>

              {/* Token Input */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-1">Reset Token Code</label>
                <div className="relative flex items-center">
                  <KeyRound size={14} className="absolute left-3 text-[#A68F85]" />
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value)}
                    placeholder="Enter RESET-XXXXXX code (or use 123456)"
                    className="w-full bg-[#FFFDFC] pl-9 pr-3 py-2 text-xs font-bold font-mono rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] text-[#331E14]"
                  />
                </div>
              </div>

              {/* New Password Input */}
              <div className="relative">
                <label className="block text-[10px] font-bold text-[#8A756D] uppercase tracking-wider mb-1">New Credential Password</label>
                <div className="relative flex items-center">
                  <Lock size={14} className="absolute left-3 text-[#A68F85]" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Specify new secure password"
                    className="w-full bg-[#FFFDFC] pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#FAEDE4] outline-none focus:border-[#FF7A85] text-[#331E14]"
                  />
                </div>
              </div>

              {/* Submit pass resetting */}
              <button
                type="submit"
                className="mt-2 w-full py-2.5 bg-[#3A2218] text-white hover:bg-black rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-sm shadow-[#3A2218]/10"
              >
                Change Code & Save
              </button>
            </form>
          )}

          {/* Core Sandbox Accounts Segment for instant bypass/fills */}
          {mode === 'login' && (
            <div className="mt-5 border-t border-[#FAEDE4] pt-4 text-center">
              <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-2">⚡ Sandbox One-Click Fills</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {registeredUsers.map(acc => (
                  <button
                    key={`${acc.email}-${acc.role}`}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setRole(acc.role);
                      setPassword('password123');
                      resetMessages();
                    }}
                    className="px-2.5 py-1 bg-[#FDF8F5] border border-[#FAEDE4] text-[#867168] hover:bg-[#FCEFE9] hover:text-black rounded-full text-[9px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span className="text-[10px]">{acc.role === 'guest' ? '👤' : acc.role === 'owner' ? '👨‍🍳' : '🛡️'}</span>
                    {acc.name.split(' ')[0]} ({acc.role})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode Switching options */}
          <div className="mt-6 text-center border-t border-[#F9F3EE] pt-4">
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => { setMode('register'); resetMessages(); }}
                className="text-[11px] font-bold text-[#FF7A85] hover:underline"
              >
                Don't have an account? Enlist your household kitchen here
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setMode('login'); resetMessages(); }}
                className="text-[11px] font-bold text-[#FF7A85] hover:underline flex items-center gap-1.5 justify-center mx-auto"
              >
                <ArrowRight size={12} className="rotate-180" /> Return to workspace sign-in portal
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
