import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_GENRES_LIST } from '../data/initialBooks';
import { Star, Heart, Mail, Bookmark } from 'lucide-react';
import { EmailFavoritesModal } from './EmailFavoritesModal';

export const Sidebar: React.FC = () => {
  const {
    selectedGenres,
    toggleGenreFilter,
    selectedRatings,
    toggleRatingFilter,
    selectedLanguage,
    setSelectedLanguage,
    isDarkMode,
    showFavoritesOnly,
    setShowFavoritesOnly,
    favoriteBookIds,
    showWishlistOnly,
    setShowWishlistOnly,
    wishlistBookIds,
  } = useApp();

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  return (
    <aside 
      id="library-sidebar-filters" 
      className={`w-full md:w-64 shrink-0 p-5 rounded-xl border transition-all duration-300 space-y-6 ${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700/80 text-slate-100 shadow-md' 
          : 'bg-white border-slate-200/60 shadow-xs'
      }`}
    >
      
      {/* FAVORITES & WISHLIST PREFERENCE SECTION */}
      <div className="space-y-3 font-sans">
        <h3 className={`text-xs font-black uppercase tracking-wider border-b pb-2 ${
          isDarkMode ? 'text-slate-100 border-slate-700/60' : 'text-slate-800 border-slate-100'
        }`}>
          MY BOOKSHELF
        </h3>
        <div className="space-y-2.5">
          <label 
            className={`flex items-center gap-2.5 cursor-pointer select-none group transition-colors ${
              isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-605 hover:text-slate-950'
            }`}
          >
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => {
                setShowFavoritesOnly(e.target.checked);
                if (e.target.checked) setShowWishlistOnly(false);
              }}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500/50 border-slate-300 transition-colors cursor-pointer"
            />
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500 animate-pulse' : 'text-slate-400'}`} />
              <span>Show Favorites ({favoriteBookIds.length})</span>
            </div>
          </label>

          <label 
            className={`flex items-center gap-2.5 cursor-pointer select-none group transition-colors ${
              isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-605 hover:text-slate-950'
            }`}
          >
            <input
              type="checkbox"
              checked={showWishlistOnly}
              onChange={(e) => {
                setShowWishlistOnly(e.target.checked);
                if (e.target.checked) setShowFavoritesOnly(false);
              }}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500/50 border-slate-300 transition-colors cursor-pointer"
            />
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Bookmark className={`w-3.5 h-3.5 ${showWishlistOnly ? 'fill-amber-500 text-amber-500 animate-pulse' : 'text-slate-400'}`} />
              <span>Show Wishlist ({wishlistBookIds.length})</span>
            </div>
          </label>
        </div>
      </div>

      {/* 1. RATINGS SECTION (Checkbox + Star design matching screenshot) */}
      <div className="space-y-3 font-sans">
        <h3 className={`text-xs font-black uppercase tracking-wider border-b pb-2 ${
          isDarkMode ? 'text-slate-100 border-slate-700/60' : 'text-slate-800 border-slate-100'
        }`}>
          RATINGS
        </h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const isChecked = selectedRatings.includes(rating);
            return (
              <label 
                key={rating}
                className={`flex items-center gap-2.5 cursor-pointer select-none group transition-colors ${
                  isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleRatingFilter(rating)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500/50 border-slate-300 transition-colors cursor-pointer"
                />
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating 
                          ? 'fill-teal-500 text-teal-500' // Matches teal rating stars in ManyBooks screenshots
                          : (isDarkMode ? 'fill-slate-700 text-slate-750' : 'fill-slate-100 text-slate-200')
                      }`}
                    />
                  ))}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. LANGUAGE SECTION (English default dropdown) */}
      <div className="space-y-3 font-sans">
        <h3 className={`text-xs font-black uppercase tracking-wider border-b pb-2 ${
          isDarkMode ? 'text-slate-100 border-slate-700/60' : 'text-slate-800 border-slate-100'
        }`}>
          Language
        </h3>
        <div className="relative">
          <select
            id="language-select-dropdown"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className={`w-full border py-2 px-3 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-700 text-slate-150' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="Any">- Any -</option>
            <option value="English">English</option>
          </select>
        </div>

        {/* Email Bookshelf Report Option placed directly below Language dropdown */}
        <button
          onClick={() => setIsEmailModalOpen(true)}
          className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-700/85 text-slate-250 hover:bg-slate-950 hover:text-white' 
              : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Email Bookshelf Report"
          id="email-bookshelf-sidebar-btn"
        >
          <Mail className="w-3.5 h-3.5 text-emerald-500" />
          <span>Email Bookshelf</span>
        </button>
      </div>

      {/* 3. GENRE LIST CHECKBOXES SECTION (Matches Genre.png mockup precisely) */}
      <div className="space-y-3 font-sans">
        <div className={`flex items-center justify-between border-b pb-2 ${
          isDarkMode ? 'border-slate-700/60' : 'border-slate-100'
        }`}>
          <h3 className={`text-xs font-black uppercase tracking-wider ${
            isDarkMode ? 'text-slate-100' : 'text-slate-800'
          }`}>
            Genre
          </h3>
          {selectedGenres.length > 0 && (
            <button
              onClick={() => {
                ALL_GENRES_LIST.forEach(g => {
                  if (selectedGenres.includes(g)) toggleGenreFilter(g);
                });
              }}
              className={`text-[10px] font-black hover:underline ${
                isDarkMode ? 'text-teal-400' : 'text-teal-600'
              }`}
            >
              Reset
            </button>
          )}
        </div>
        
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-slate-400/30">
          {ALL_GENRES_LIST.map((genre) => {
            const isChecked = selectedGenres.includes(genre);
            return (
              <label
                key={genre}
                className={`flex items-start gap-2.5 cursor-pointer group transition-colors ${
                  isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleGenreFilter(genre)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500/50 border-slate-300 mt-0.5"
                />
                <span className={`text-[13px] font-medium leading-tight transition-colors ${
                  isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-755 group-hover:text-slate-900'
                }`}>
                  {genre}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <EmailFavoritesModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
      />

    </aside>
  );
};
