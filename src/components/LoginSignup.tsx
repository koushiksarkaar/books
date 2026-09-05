import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Phone, User as UserIcon, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';

export const LoginSignup: React.FC = () => {
  const { registerUser, loginUser, currentPage, setCurrentPage } = useApp();

  // Screen state
  const isLoginPage = currentPage === 'login';

  // Input states
  const [mobileNumber, setMobileNumber] = useState('');
  const [username, setUsername] = useState('');
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');

    if (!mobileNumber.trim()) {
      setErrorText('Please enter your Mobile Number.');
      return;
    }

    // Regexp check: standard numeric validation
    const onlyNumbers = /^[0-9]+$/;
    if (!onlyNumbers.test(mobileNumber.trim())) {
      setErrorText('Mobile number must contain digits only.');
      return;
    }

    if (isLoginPage) {
      const success = await loginUser(mobileNumber.trim());
      if (success) {
        setSuccessText('Sign in successful! Entering dashboard...');
      } else {
        setErrorText('No user registered with this mobile number. Please click "Sign Up" above to register!');
      }
    } else {
      if (!username.trim()) {
        setErrorText('Please enter your full Username.');
        return;
      }
      const success = await registerUser(username.trim(), mobileNumber.trim());
      if (success) {
        setSuccessText('Registration successful! Setting up your library...');
      } else {
        setErrorText('This mobile number is already registered. Please sign in!');
      }
    }
  };

  const loadDemoUser = (num: string) => {
    setMobileNumber(num);
    setErrorText('');
  };

  return (
    <div 
      id="auth-fullscreen-container" 
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200/50 flex flex-col relative z-10">
        
        {/* Decorative Top header block with brand accent */}
        <div className="bg-[#1e9c45] p-8 text-white text-center relative overflow-hidden">
          {/* Subtle grid pattern or shapes in background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
          
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 bg-white rounded-xl mx-auto flex items-center justify-center text-[#1e9c45] font-black text-2xl shadow-md">
              B
            </div>
            <h2 className="text-2xl font-sans font-black tracking-tighter">Books Library</h2>
            <p className="text-white/80 text-xs font-medium max-w-xs mx-auto">
              Your customized modern portal to thousands of community eBooks & literature records
            </p>
          </div>
        </div>

        {/* Tab buttons to toggle Login / Signup */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => {
              setCurrentPage('login');
              setErrorText('');
              setSuccessText('');
            }}
            className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              isLoginPage 
                ? 'border-emerald-600 text-slate-800 bg-slate-50/50' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign In (Mobile No.)
          </button>
          
          <button
            onClick={() => {
              setCurrentPage('signup');
              setErrorText('');
              setSuccessText('');
            }}
            className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              !isLoginPage 
                ? 'border-emerald-600 text-slate-800 bg-slate-50/50' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {/* Status Dialog lines */}
          {errorText && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          {successText && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successText}</span>
            </div>
          )}

          {/* User Name input (Visible for Signup screen only) */}
          {!isLoginPage && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Username
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  id="auth-username-input"
                  type="text"
                  placeholder="Enter your beautiful name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm focus:outline-none transition-all placeholder-slate-400 font-medium"
                />
              </div>
            </div>
          )}

          {/* Mobile Number inputs (Visible for both Login and Signup screens) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                id="auth-phone-input"
                type="text"
                maxLength={15}
                placeholder="e.g. 1234567890, 9876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 text-sm focus:outline-none transition-all placeholder-slate-400 font-mono font-semibold"
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Users log in instantly by entering their micro-registered mobile numbers.
            </p>
          </div>

          {/* Core Submit Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{isLoginPage ? 'Access My Library' : 'Comply & Register'}</span>
            <BookOpen className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Practical Pre-registered test credentials (extremely helpful details) */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Registered Accounts (Immediate Access):</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => loadDemoUser('1234567890')}
                className="p-2 text-left bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 border border-slate-100 rounded-lg transition-all font-mono font-medium flex flex-col"
              >
                <span className="font-sans font-bold text-slate-700">John Doe</span>
                <span>Mobile: 1234567890</span>
              </button>

              <button
                type="button"
                onClick={() => loadDemoUser('9876543210')}
                className="p-2 text-left bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 border border-slate-100 rounded-lg transition-all font-mono font-medium flex flex-col"
              >
                <span className="font-sans font-bold text-slate-700">Jane Austen</span>
                <span>Mobile: 9876543210</span>
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 text-center leading-normal pt-1 bg-amber-50 rounded p-1.5 text-amber-800 border border-amber-100">
              💡 Register any new mobile number and username to instantly experience user specific profile updates on click of profile!
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};
