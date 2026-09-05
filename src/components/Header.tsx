import React, { useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DISCOVER_GENRES, DISCOVER_RESOURCES } from '../data/initialBooks';
import { BookOpen, Search, User as UserIcon, BookOpenCheck, Settings, LogOut, Heart, Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    theme,
    currentUser,
    searchQuery,
    setSearchQuery,
    isDiscoverOpen,
    setIsDiscoverOpen,
    isProfileOpen,
    setIsProfileOpen,
    currentPage,
    setCurrentPage,
    toggleGenreFilter,
    setCurrentUser,
    isDarkMode,
    toggleDarkMode,
  } = useApp();

  const discoverRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (discoverRef.current && !discoverRef.current.contains(event.target as Node)) {
        setIsDiscoverOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [setIsDiscoverOpen, setIsProfileOpen]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const selectGenreFromMega = (genre: string) => {
    toggleGenreFilter(genre);
    setIsDiscoverOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    setIsProfileOpen(false);
  };

  return (
    <header 
      className={`${isDarkMode ? 'bg-slate-950 border-b border-slate-800 text-slate-100' : theme.headerBg} text-white shadow-md relative z-40 transition-all duration-300 border-t-4`}
      style={{ borderTopColor: isDarkMode ? '#1e293b' : theme.accentColor }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Brand Icon + Discovery button */}
        <div className="flex items-center justify-between md:justify-start gap-6">
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            {/* Books Library styled book logo */}
            <div 
              style={{ color: isDarkMode ? '#38bdf8' : theme.accentColor }} 
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-extrabold text-2xl shadow-md transform group-hover:scale-105 transition-all"
            >
              B
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-black text-2xl tracking-tighter leading-none">Books Library</span>
              <span className="text-[10px] tracking-widest text-white/70 uppercase font-mono">Custom Admin</span>
            </div>
          </div>

          {/* DISCOVER DROPDOWN TRIGGER */}
          <div className="relative" ref={discoverRef}>
            <button
              id="discover-dropdown-trigger"
              onClick={() => {
                setIsDiscoverOpen(!isDiscoverOpen);
                setIsProfileOpen(false);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-all font-sans font-bold uppercase tracking-wider text-xs border border-white/20"
            >
              Discover
              <span className={`transition-transform duration-200 text-[9px] ${isDiscoverOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {/* MEGA MENU DROPDOWN (Matches Discovery.png mockup) */}
            {isDiscoverOpen && (
              <div 
                id="discover-mega-menu"
                className="absolute left-0 mt-3 w-[290px] sm:w-[540px] bg-white rounded-xl shadow-2xl border border-slate-100 flex flex-col sm:flex-row overflow-hidden animate-fade-in text-slate-800 z-50"
              >
                {/* Genres Column */}
                <div className="p-5 flex-1 max-h-[380px] overflow-y-auto">
                  <h4 className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-3 pb-1.5 border-b border-slate-100">
                    Genres
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                    {DISCOVER_GENRES.map((gen) => (
                      <button
                        key={gen}
                        onClick={() => selectGenreFromMega(gen)}
                        className="text-left py-1 text-[13px] text-slate-600 hover:text-emerald-600 font-medium transition-colors"
                      >
                        {gen}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resources Column (Teal Background Tint) */}
                <div className="p-5 w-full sm:w-[210px] bg-emerald-50/70 border-t sm:border-t-0 sm:border-l border-emerald-100/40">
                  <h4 className="text-emerald-700/80 text-xs font-extrabold tracking-wider uppercase mb-3 pb-1.5 border-b border-emerald-100">
                    Resources
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {DISCOVER_RESOURCES.map((res) => (
                      <button
                        key={res}
                        onClick={() => {
                          alert(`Resource: "${res}". Filter books by selecting genres and author collections directly from our dynamic JSON library database!`);
                          setIsDiscoverOpen(false);
                        }}
                        className="text-left text-[13px] text-slate-700 hover:text-emerald-600 font-semibold transition-colors flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {res}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Field (ManyBooks Styled) */}
        <div className="flex-1 max-w-xl mx-auto md:mx-4 w-full">
          <div className="relative flex shadow-inner rounded-md overflow-hidden bg-white group border border-black/10">
            <span className="pl-3.5 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="header-search-input"
              type="text"
              value={searchQuery}
              onChange={handleQueryChange}
              placeholder="Search by title, author or keyword"
              className="w-full pl-2.5 pr-4 py-2.5 text-slate-800 text-sm focus:outline-none placeholder-slate-400"
            />
            
            {/* Search Teal Button */}
            <button
              id="search-confirm-btn"
              style={{ backgroundColor: theme.accentColor }}
              className="px-6 text-white hover:brightness-105 active:scale-95 transition-all flex items-center justify-center font-bold"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: User Profile dropdown */}
        <div className="flex items-center gap-3 justify-end relative" ref={profileRef}>
          {/* Theme switcher button */}
          <button
            onClick={() => toggleDarkMode()}
            className="p-2 rounded-full hover:bg-white/15 hover:scale-105 active:scale-95 text-white transition-all cursor-pointer relative flex items-center justify-center mr-1"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            id="theme-darklight-switcher-btn"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-300 fill-amber-300/40 stroke-[2] animate-bounce-subtle" />
            ) : (
              <Moon className="w-5 h-5 text-white stroke-[2]" />
            )}
          </button>

          {currentUser ? (
            <>
              {/* ADMIN ENTRY SHORTCUT - Restricted to adminuser only */}
              {currentUser.username.toLowerCase() === 'adminuser' && (
                <button
                  id="header-admin-nav-btn"
                  onClick={() => setCurrentPage(currentPage === 'admin' ? 'home' : 'admin')}
                  className={`py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all text-white/90 hover:text-white hover:bg-white/15 ${currentPage === 'admin' ? 'bg-white/20 ring-1 ring-white/30 text-white' : ''}`}
                  title="Open Customize Panel"
                >
                  <Settings className={`w-3.5 h-3.5 ${currentPage === 'admin' ? 'animate-spin-slow' : ''}`} />
                  <span className="hidden sm:inline">Theme Customizer</span>
                </button>
              )}

              <div className="relative">
                <button
                  id="profile-dropdown-trigger"
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsDiscoverOpen(false);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-md hover:bg-white/10 transition-all text-sm font-semibold border border-white/15 bg-white/5"
                >
                  <div className="w-6 h-6 rounded-full bg-white text-rose-500 font-extrabold text-[11px] flex items-center justify-center shadow-inner">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[80px] sm:max-w-none truncate text-white">{currentUser.username}</span>
                  <span className="text-[9px] text-white/70">▼</span>
                </button>

                {isProfileOpen && (
                  <div 
                    id="profile-info-mega"
                    className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 p-5 text-slate-800 animate-fade-in z-50"
                  >
                    <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-base flex items-center justify-center">
                        {currentUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-slate-800 truncate">{currentUser.username}</span>
                        <span className="text-xs text-rose-500 font-medium uppercase tracking-wide">Registered Member</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-sans">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Mobile No:</span>
                        <span className="font-mono font-semibold text-slate-700">{currentUser.mobileNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Language:</span>
                        <span className="font-medium text-slate-700">English (Global)</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-200/50 pt-2 mt-1">
                        <span className="text-slate-404">Wishlist:</span>
                        <span className="font-mono font-bold text-amber-600">{(currentUser.wishlist || []).length} books</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 flex flex-col gap-1">
                      {currentUser.username.toLowerCase() === 'adminuser' && (
                        <button
                          onClick={() => {
                            setCurrentPage('admin');
                            setIsProfileOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-400" />
                          Admin Dashboard
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-2 transition-colors mt-1 pt-2 border-t border-slate-100 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setCurrentPage('login')}
              className="py-2 px-5 bg-white text-rose-500 font-bold text-xs rounded-md shadow-md hover:brightness-105 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
