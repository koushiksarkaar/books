/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Banner } from './components/Banner';
import { Header } from './components/Header';
import { GenreBar } from './components/GenreBar';
import { Sidebar } from './components/Sidebar';
import { BookCard } from './components/BookCard';
import { LoginSignup } from './components/LoginSignup';
import { AdminDashboard } from './components/AdminDashboard';
import { Play, Pause, ChevronUp, Layers, HelpCircle, RefreshCw } from 'lucide-react';

function LibraryAppContent() {
  const {
    books,
    theme,
    currentPage,
    currentUser,
    searchQuery,
    selectedGenres,
    selectedRatings,
    selectedLanguage,
    sortBy,
    setSortBy,
    autoScrollSpeed,
    setAutoScrollSpeed,
    setCurrentPage,
    resetToDefaults,
    isDarkMode,
    favoriteBookIds,
    showFavoritesOnly,
    wishlistBookIds,
    showWishlistOnly,
  } = useApp();

  // Perform client-side search, filtering and sorting
  const filteredAndSortedBooks = books
    .filter((book) => {
      // 1. Search Query text constraint
      const lowerQuery = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !lowerQuery ||
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.genre.toLowerCase().includes(lowerQuery);

      // 2. Sidebar checkboxes genres constraints
      const matchesGenre =
        selectedGenres.length === 0 || selectedGenres.includes(book.genre);

      // 3. Sidebar checkboxes rating stars constraints
      const matchesRating =
        selectedRatings.length === 0 || selectedRatings.includes(book.rating);

      // 4. Sidebar Language dropdown constraint: English-only as per specs
      const matchesLanguage =
        selectedLanguage === 'Any' || book.language === selectedLanguage;

      // 5. Favorites Toggle constraint
      const matchesFavorites =
        !showFavoritesOnly || favoriteBookIds.includes(book.id);

      // 6. Wishlist Toggle constraint
      const matchesWishlist =
        !showWishlistOnly || wishlistBookIds.includes(book.id);

      return matchesSearch && matchesGenre && matchesRating && matchesLanguage && matchesFavorites && matchesWishlist;
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'author') {
        return a.author.localeCompare(b.author);
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating; // Descending
      }
      return b.popularity - a.popularity; // Popularity descending (Default ManyBooks style)
    });

  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredAndSortedBooks.length / itemsPerPage);

  // Books to show on current page
  const startIndex = (currentPageNum - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = filteredAndSortedBooks.slice(startIndex, endIndex);

  // Reference for scrolling viewport
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Apply custom typography fonts to root document
  useEffect(() => {
    const root = document.documentElement;
    if (theme.fontFamily === 'serif') {
      root.style.setProperty('--font-sans', 'Georgia, Cambria, "Times New Roman", Times, serif');
    } else if (theme.fontFamily === 'mono') {
      root.style.setProperty('--font-sans', 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace');
    } else {
      root.style.setProperty('--font-sans', '"Inter", ui-sans-serif, system-ui, sans-serif');
    }
  }, [theme.fontFamily]);

  // Admin routing shield: non-adminuser cannot access admin panel
  useEffect(() => {
    if (currentPage === 'admin' && (!currentUser || currentUser.username.toLowerCase() !== 'adminuser')) {
      setCurrentPage('home');
    }
  }, [currentPage, currentUser, setCurrentPage]);

  // Reset page number back to 1 when filters or query changes
  useEffect(() => {
    setCurrentPageNum(1);
  }, [searchQuery, selectedGenres, selectedRatings, selectedLanguage, sortBy, showFavoritesOnly, showWishlistOnly]);

  // Infinite/Auto Scroll Simulation Engine (Implements "auto scroll down pattern" smoothly)
  useEffect(() => {
    // Clear any existing active timer
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    if (autoScrollSpeed > 0 && currentPage === 'home') {
      const scrollStep = () => {
        // Scroll the entire page window down continuously and smoothly
        const speedMultiplier = autoScrollSpeed; // 1, 2, or 3
        window.scrollBy({
          top: speedMultiplier,
          behavior: 'smooth'
        });

        // Loop continuous scroll: If user reaches the absolute bottom, loop or pause
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 5) {
          // Pause or scroll back to top if desired. Let's scroll back to top to simulate infinite read!
          window.scrollTo({ top: 300, behavior: 'instant' });
        }
      };

      // Set smooth frame scroll
      scrollIntervalRef.current = setInterval(scrollStep, 45);
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [autoScrollSpeed, currentPage]);

  // Track and persist scroll position in local storage dynamically
  useEffect(() => {
    const handleScroll = () => {
      if (currentPage === 'home' || currentPage === 'admin') {
        localStorage.setItem(`bt_scroll_pos_${currentPage}`, window.scrollY.toString());
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPage]);

  // Restore scroll position upon page mount or view/navigation change
  useEffect(() => {
    const savedPos = localStorage.getItem(`bt_scroll_pos_${currentPage}`);
    if (savedPos) {
      const targetY = parseInt(savedPos, 10);
      if (!isNaN(targetY) && targetY > 0) {
        // Delay slightly to allow the DOM to render books and elements
        const timer = setTimeout(() => {
          window.scrollTo({ top: targetY, behavior: 'auto' });
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [currentPage, books, searchQuery, selectedGenres, selectedRatings, selectedLanguage, sortBy, showFavoritesOnly, showWishlistOnly]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is unauthenticated, require Logging screen
  if (!currentUser || currentPage === 'login' || currentPage === 'signup') {
    return <LoginSignup />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-mustard-100 text-slate-800'}`}>
      
      {/* 1. Global customizable banner */}
      <Banner />

      {/* 2. Top-bar Header containing logo, search field and profile metadata */}
      <Header />

      {/* 3. Render Dashboard View vs Home Catalog View */}
      {currentPage === 'admin' ? (
        <main className="flex-1">
          <AdminDashboard />
        </main>
      ) : (
        <>
          {/* Popular genres list with fire icon */}
          <GenreBar />

          {/* Main Container Core */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
            
            {/* Left Column Sidebar Filters */}
            <Sidebar />

            {/* Right Column Book inventory Grid */}
            <div className="flex-1 flex flex-col gap-6">
              
              {/* Controls bar: auto scroll pattern control + Sorting criteria */}
              <div className={`p-4.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700/80 text-white shadow-lg shadow-black/10' 
                  : 'bg-white border-slate-200/60 text-slate-800 shadow-xs'
              }`}>
                
                {/* Auto Scroll continuous player (Implements "auto scroll down pattern" beautifully) */}
                <div className="flex items-center gap-2.5 font-sans">
                  <div className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'bg-mustard-805/20 text-mustard-400 border-mustard-705/30' 
                      : 'bg-mustard-100 text-mustard-805 border-mustard-300'
                  }`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${autoScrollSpeed > 0 ? 'bg-mustard-500' : 'bg-slate-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${autoScrollSpeed > 0 ? 'bg-mustard-600' : 'bg-slate-400'}`}></span>
                    </span>
                    <span className="text-xs font-black leading-none uppercase tracking-wide">
                      Hands-Free Auto Scroll
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 p-1 rounded-lg border transition-colors ${
                    isDarkMode ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <button
                      onClick={() => setAutoScrollSpeed(autoScrollSpeed === 0 ? 1 : 0)}
                      className={`p-1.5 rounded-md transition-all ${autoScrollSpeed > 0 ? 'bg-mustard-500 hover:bg-mustard-600 text-white shadow-xs' : (isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-200/50')}`}
                      title={autoScrollSpeed > 0 ? 'Pause Scroll' : 'Play Smooth Scrolling'}
                    >
                      {autoScrollSpeed > 0 ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    
                    {/* Multi Speed Selector */}
                    {autoScrollSpeed > 0 && (
                      <div className={`flex items-center gap-1 px-2.5 animate-fade-in border-l ml-1.5 ${isDarkMode ? 'border-slate-800' : 'border-slate-200/60'}`}>
                        <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Speed:</span>
                        {[1, 2, 3].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => setAutoScrollSpeed(spd)}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-colors ${autoScrollSpeed === spd ? (isDarkMode ? 'bg-mustard-805/40 text-mustard-400 font-extrabold' : 'bg-mustard-300 text-mustard-805 font-black') : (isDarkMode ? 'text-slate-400 hover:text-slate-100' : 'text-slate-400 hover:text-slate-700')}`}
                          >
                            x{spd}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sort Bar elements matching right side of screenshot: "sort by: title author popularity rating" */}
                <div className={`flex items-center gap-2.5 text-xs sm:text-sm font-sans transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>sort by:</span>
                  <div className="flex items-center gap-2">
                    {(['title', 'author', 'popularity', 'rating'] as const).map((criteria) => {
                      const isActive = sortBy === criteria;
                      return (
                        <button
                          key={criteria}
                          onClick={() => setSortBy(criteria)}
                          className={`font-semibold transition-all capitalize ${
                            isActive
                              ? (isDarkMode ? 'text-mustard-400 border-b-2 py-0.5 border-mustard-400 scale-105 font-black' : 'text-slate-900 border-b-2 py-0.5 border-mustard-500 scale-105 font-black')
                              : (isDarkMode ? 'text-slate-400 hover:text-slate-150' : 'text-slate-400 hover:text-slate-700')
                          }`}
                        >
                          {criteria}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Dynamic Book Grid rendering matching screenshot layout */}
              {filteredAndSortedBooks.length === 0 ? (
                <div className={`rounded-2xl border p-12 text-center flex flex-col items-center justify-center gap-4 animate-fade-in ${
                  isDarkMode ? 'bg-slate-800 border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-900 text-slate-600' : 'bg-slate-50 text-slate-300'}`}>
                    <Layers className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h3 className="font-bold text-base">No Matching Books</h3>
                    <p className={`text-xs leading-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Try resetting your rating filters, expanding search terms, or head to the editable theme dashboard to instantly create dynamic customized books!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      resetToDefaults();
                    }}
                    className={`mt-2 py-2 px-6 font-bold text-xs rounded-xl transition-all border ${
                      isDarkMode 
                        ? 'bg-slate-900 hover:bg-slate-950 text-slate-300 border-slate-800' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    }`}
                  >
                    Reset Grid Filters
                  </button>
                </div>
              ) : (
                <div 
                  id="books-list-grid" 
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-8 gap-x-5.5"
                >
                  {paginatedBooks.map((book, idx) => (
                    <BookCard key={`${book.id}-${idx}`} book={book} />
                  ))}
                </div>
              )}

              {/* Modern Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-12 border-t border-slate-200/50 dark:border-slate-800/80 mt-4 select-none">
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500 font-medium'}`}>
                    Showing <span className="font-bold text-mustard-600 dark:text-mustard-400">{startIndex + 1}</span> to{' '}
                    <span className="font-bold text-mustard-600 dark:text-mustard-400">{Math.min(endIndex, filteredAndSortedBooks.length)}</span> of{' '}
                    <span className="font-bold">{filteredAndSortedBooks.length}</span> total books
                  </p>
                  
                  <div className="flex items-center gap-1.5 font-sans">
                    {/* Previous page */}
                    <button
                      onClick={() => {
                        if (currentPageNum > 1) {
                          setCurrentPageNum((p) => p - 1);
                          const gridElement = document.getElementById('books-list-grid');
                          if (gridElement) {
                            gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }
                      }}
                      disabled={currentPageNum === 1}
                      className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                        currentPageNum === 1
                          ? 'opacity-40 cursor-not-allowed border-transparent text-slate-400'
                          : (isDarkMode 
                              ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-950 hover:text-white cursor-pointer' 
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950 cursor-pointer')
                      }`}
                    >
                      Prev
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }).map((_, pageIdx) => {
                      const page = pageIdx + 1;
                      const isActive = currentPageNum === page;
                      return (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPageNum(page);
                            const gridElement = document.getElementById('books-list-grid');
                            if (gridElement) {
                              gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                          className={`w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer border ${
                            isActive
                              ? 'bg-mustard-500 border-mustard-600 text-white shadow-xs'
                              : (isDarkMode 
                                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-950' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950')
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    {/* Next page */}
                    <button
                      onClick={() => {
                        if (currentPageNum < totalPages) {
                          setCurrentPageNum((p) => p + 1);
                          const gridElement = document.getElementById('books-list-grid');
                          if (gridElement) {
                            gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }
                      }}
                      disabled={currentPageNum === totalPages}
                      className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                        currentPageNum === totalPages
                          ? 'opacity-40 cursor-not-allowed border-transparent text-slate-400'
                          : (isDarkMode 
                              ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-950 hover:text-white cursor-pointer' 
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950 cursor-pointer')
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

            </div>

          </main>
        </>
      )}

      {/* Floating play scroll-up helpers */}
      {autoScrollSpeed > 0 && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5 animate-bounce-subtle">
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-mustard-500 text-white flex items-center justify-center shadow-lg hover:bg-mustard-600 active:scale-95 transition-all"
            title="Scroll To Top"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => setAutoScrollSpeed(0)}
            className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-500 active:scale-95 transition-all"
            title="Pause Hands-Free Scroll"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global standard human styled footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 mt-auto border-t border-slate-800 select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/10 text-white flex items-center justify-center font-bold text-sm">
              B
            </div>
            <div className="text-left">
              <p className="font-extrabold text-white text-[13px] tracking-tight">Books Library Customizable</p>
              <p className="text-[11px] text-slate-500 leading-none">Designed responsive for Web, Tablet & Mobile</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2.5 font-medium">
            <button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Home Library</button>
            <button onClick={() => setCurrentPage('admin')} className="hover:text-white transition-colors">Admin Customizer</button>
            <button onClick={() => alert('Support information: Connected dynamically using highly performant JSON files and local states.')} className="hover:text-white transition-colors">Help & Support</button>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-500 leading-normal">
            <p>© {new Date().getFullYear()} Books Library. Driven by dynamic categories and book list JSON files.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <LibraryAppContent />
    </AppProvider>
  );
}
