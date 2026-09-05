import React from 'react';
import { useApp } from '../context/AppContext';
import { POPULAR_GENRES } from '../data/initialBooks';

export const GenreBar: React.FC = () => {
  const { selectedGenres, toggleGenreFilter, isDarkMode } = useApp();

  return (
    <div 
      id="popular-genres-subbar" 
      className={`border-b py-3 transition-colors duration-300 sticky top-0 z-10 ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-200' 
          : 'bg-white border-slate-200/80 text-slate-700'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center gap-2 sm:gap-6 text-xs sm:text-sm font-sans font-semibold">
        
        {/* Popular Genres title with fire icon */}
        <div className={`flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[11px] sm:text-xs ${
          isDarkMode ? 'text-white' : 'text-slate-800'
        }`}>
          <span className="text-orange-500 text-sm sm:text-base animate-pulse">🔥</span>
          POPULAR GENRES
        </div>

        {/* Dynamic button list */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {POPULAR_GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => toggleGenreFilter(genre)}
                className={`py-1 px-3 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1e9c45] text-white font-bold shadow-xs scale-105'
                    : (isDarkMode 
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50')
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Filter reset indicator */}
        {selectedGenres.length > 0 && (
          <button
            onClick={() => {
              // Resetting popular genres only
              POPULAR_GENRES.forEach(g => {
                if (selectedGenres.includes(g)) toggleGenreFilter(g);
              });
            }}
            className="text-[11px] text-[#1e9c45] hover:underline font-bold ml-auto cursor-pointer"
          >
            Clear Selected
          </button>
        )}
      </div>
    </div>
  );
};
