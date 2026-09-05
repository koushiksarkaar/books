import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, AppTheme, User } from '../types';
import { INITIAL_BOOKS } from '../data/initialBooks';

interface AppContextType {
  books: Book[];
  theme: AppTheme;
  currentUser: User | null;
  usersList: User[];
  searchQuery: string;
  selectedGenres: string[];
  selectedRatings: number[];
  selectedLanguage: string;
  sortBy: 'title' | 'author' | 'popularity' | 'rating';
  isDiscoverOpen: boolean;
  isProfileOpen: boolean;
  currentPage: 'login' | 'signup' | 'home' | 'admin';
  autoScrollSpeed: number; // 0 for off, 1-3 for speed levels
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  favoriteBookIds: string[];
  toggleFavoriteBook: (id: string) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  wishlistBookIds: string[];
  toggleWishlistBook: (id: string) => void;
  showWishlistOnly: boolean;
  setShowWishlistOnly: (show: boolean) => void;
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  setTheme: React.Dispatch<React.SetStateAction<AppTheme>>;
  setCurrentUser: (user: User | null) => void;
  registerUser: (username: string, mobileNumber: string) => Promise<boolean>;
  loginUser: (mobileNumber: string) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  toggleGenreFilter: (genre: string) => void;
  toggleRatingFilter: (rating: number) => void;
  setSelectedLanguage: (lang: string) => void;
  setSortBy: (sort: 'title' | 'author' | 'popularity' | 'rating') => void;
  setIsDiscoverOpen: (isOpen: boolean) => void;
  setIsProfileOpen: (isOpen: boolean) => void;
  setCurrentPage: (page: 'login' | 'signup' | 'home' | 'admin') => void;
  setAutoScrollSpeed: (speed: number) => void;
  addBook: (book: Omit<Book, 'id' | 'downloadCount'>) => void;
  updateBook: (id: string, updated: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  resetToDefaults: () => void;
  recentlyViewedBookIds: string[];
  addRecentlyViewedBook: (id: string) => void;
}

const defaultTheme: AppTheme = {
  name: 'Books Library Gold',
  headerBg: 'bg-[#D4A311]',
  headerText: 'text-white',
  accentColor: '#DAA520', // Warm Mustard accent
  fontFamily: 'sans',
  bannerText: 'Welcome to Books Library! Read and download free interactive books.',
  bannerButtonText: 'Browse Catalog',
  bannerVisible: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or fallbacks
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('bt_books');
    if (!saved) return INITIAL_BOOKS;
    try {
      const parsed = JSON.parse(saved) as Book[];
      const merged = [...INITIAL_BOOKS];
      parsed.forEach((savedBook) => {
        const index = merged.findIndex((b) => b.id === savedBook.id);
        if (index === -1) {
          merged.push(savedBook);
        } else {
          // Keep dynamic state stats (e.g. downloadCount) but overwrite with fields from INITIAL_BOOKS (such as price 59.00 edits)
          merged[index] = {
            ...savedBook,
            ...INITIAL_BOOKS[index]
          };
        }
      });
      return merged;
    } catch (e) {
      return INITIAL_BOOKS;
    }
  });

  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('bt_theme');
    let parsed = saved ? JSON.parse(saved) : defaultTheme;
    if (parsed && (parsed.name === 'Books Library Coral' || parsed.accentColor === '#0f766e' || !saved)) {
      parsed = defaultTheme;
      localStorage.setItem('bt_theme', JSON.stringify(defaultTheme));
    }
    if (parsed && parsed.bannerText && parsed.bannerText.includes('Support our mission')) {
      parsed.bannerText = 'Welcome to Books Library! Read and download free interactive books.';
    }
    return parsed;
  });

  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem('bt_users');
    // Pre-register some sample users for immediate login testing
    return saved ? JSON.parse(saved) : [
      { username: 'John Doe', mobileNumber: '1234567890' },
      { username: 'Jane Austen', mobileNumber: '9876543210' },
      { username: 'Admin User', mobileNumber: '0000000000' },
      { username: 'adminuser', mobileNumber: '4321' }
    ];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bt_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentPage, setCurrentPage] = useState<'login' | 'signup' | 'home' | 'admin'>(() => {
    const savedPage = localStorage.getItem('bt_current_page');
    if (savedPage) return savedPage as any;
    const savedUser = localStorage.getItem('bt_current_user');
    return savedUser ? 'home' : 'login';
  });

  // Dark/Light Theme Switcher State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bt_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [favoriteBookIds, setFavoriteBookIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('bt_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(() => {
    const saved = localStorage.getItem('bt_filter_showFavoritesOnly');
    return saved ? JSON.parse(saved) : false;
  });

  const [wishlistBookIds, setWishlistBookIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('bt_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(() => {
    const saved = localStorage.getItem('bt_filter_showWishlistOnly');
    return saved ? JSON.parse(saved) : false;
  });

  const [recentlyViewedBookIds, setRecentlyViewedBookIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('bt_recently_viewed');
    return saved ? JSON.parse(saved) : [];
  });

  // Filters State
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('bt_filter_searchQuery') || '';
  });
  const [selectedGenres, setSelectedGenres] = useState<string[]>(() => {
    const saved = localStorage.getItem('bt_filter_selectedGenres');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedRatings, setSelectedRatings] = useState<number[]>(() => {
    const saved = localStorage.getItem('bt_filter_selectedRatings');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('bt_filter_selectedLanguage') || 'English';
  });
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'popularity' | 'rating'>(() => {
    return (localStorage.getItem('bt_filter_sortBy') as any) || 'popularity';
  });
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(0);

  // Modals/Dropdowns
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync state to localStorage when changed
  useEffect(() => {
    localStorage.setItem('bt_books', JSON.stringify(books));
  }, [books]);

  // Sync theme
  useEffect(() => {
    localStorage.setItem('bt_theme', JSON.stringify(theme));
  }, [theme]);

  // Sync dark mode preference
  useEffect(() => {
    localStorage.setItem('bt_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Sync filters and current page to localStorage dynamically
  useEffect(() => {
    localStorage.setItem('bt_current_page', currentPage);
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('bt_filter_searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('bt_filter_selectedGenres', JSON.stringify(selectedGenres));
  }, [selectedGenres]);

  useEffect(() => {
    localStorage.setItem('bt_filter_selectedRatings', JSON.stringify(selectedRatings));
  }, [selectedRatings]);

  useEffect(() => {
    localStorage.setItem('bt_filter_selectedLanguage', selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem('bt_filter_sortBy', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('bt_filter_showFavoritesOnly', JSON.stringify(showFavoritesOnly));
  }, [showFavoritesOnly]);

  useEffect(() => {
    localStorage.setItem('bt_filter_showWishlistOnly', JSON.stringify(showWishlistOnly));
  }, [showWishlistOnly]);

  // Fetch all persistent users on mount
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsersList(data);
        }
      })
      .catch(err => console.error('Error fetching users from server:', err));
  }, []);

  // Sync current user to localStorage and fetch their favorites
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bt_current_user', JSON.stringify(currentUser));
      if (currentUser.wishlist) {
        setWishlistBookIds(currentUser.wishlist);
        localStorage.setItem('bt_wishlist', JSON.stringify(currentUser.wishlist));
      } else {
        setWishlistBookIds([]);
        localStorage.setItem('bt_wishlist', JSON.stringify([]));
      }
      if (currentUser.recentlyViewed) {
        setRecentlyViewedBookIds(currentUser.recentlyViewed);
        localStorage.setItem('bt_recently_viewed', JSON.stringify(currentUser.recentlyViewed));
      } else {
        setRecentlyViewedBookIds([]);
        localStorage.setItem('bt_recently_viewed', JSON.stringify([]));
      }
      // Fetch user specific favorites from sever
      fetch(`/api/favorites?username=${encodeURIComponent(currentUser.username)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const ids = data.map((fav: any) => fav.bookId);
            setFavoriteBookIds(ids);
          }
        })
        .catch(err => console.error('Error fetching user favorites:', err));
    } else {
      localStorage.removeItem('bt_current_user');
      setFavoriteBookIds([]);
      setWishlistBookIds([]);
      setRecentlyViewedBookIds([]);
      localStorage.removeItem('bt_wishlist');
      localStorage.removeItem('bt_recently_viewed');
    }
  }, [currentUser]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Auth Operations - Express-backed
  const registerUser = async (username: string, mobileNumber: string): Promise<boolean> => {
    if (!username.trim() || !mobileNumber.trim()) return false;
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, mobileNumber })
      });
      if (!response.ok) {
        return false;
      }
      const newUser = await response.json();
      setUsersList(prev => {
        const exists = prev.some(u => u.mobileNumber === mobileNumber);
        return exists ? prev : [...prev, newUser];
      });
      setCurrentUser(newUser);
      setCurrentPage('home');
      return true;
    } catch (err) {
      console.error('Error registering user:', err);
      return false;
    }
  };

  const loginUser = async (mobileNumber: string): Promise<boolean> => {
    if (!mobileNumber.trim()) return false;
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber })
      });
      if (!response.ok) {
        return false;
      }
      const user = await response.json();
      setCurrentUser(user);
      setCurrentPage('home');
      return true;
    } catch (err) {
      console.error('Error logging in user:', err);
      return false;
    }
  };

  // Filter Operations
  const toggleGenreFilter = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const toggleRatingFilter = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  // CRUD Operations for Book Management
  const addBook = (newBookData: Omit<Book, 'id' | 'downloadCount'>) => {
    const newBook: Book = {
      ...newBookData,
      id: Date.now().toString(),
      downloadCount: 0
    };
    setBooks(prev => [newBook, ...prev]);
  };

  const updateBook = (id: string, updatedFields: Partial<Book>) => {
    setBooks(prev =>
      prev.map(book => (book.id === id ? { ...book, ...updatedFields } : book))
    );
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  // Server-backed favorite toggling
  const toggleFavoriteBook = (id: string) => {
    if (!currentUser) return;
    const targetBook = books.find(b => b.id === id);
    const bookName = targetBook ? targetBook.title : 'Unknown';

    fetch('/api/favorites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser.username,
        bookId: id,
        bookName: bookName
      })
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const ids = data.map((fav: any) => fav.bookId);
          setFavoriteBookIds(ids);
        }
      })
      .catch(err => console.error('Error toggling server favorite:', err));
  };

  // Server-backed wishlist toggling (stored on user profile JSON in backend)
  const toggleWishlistBook = (id: string) => {
    if (!currentUser) {
      // Local fallback if guest
      setWishlistBookIds(prev => {
        const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
        localStorage.setItem('bt_wishlist', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    fetch('/api/wishlist/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser.username,
        bookId: id,
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to toggle wishlist');
        return res.json();
      })
      .then(updatedUser => {
        setCurrentUser(updatedUser);
        if (updatedUser.wishlist) {
          setWishlistBookIds(updatedUser.wishlist);
          localStorage.setItem('bt_wishlist', JSON.stringify(updatedUser.wishlist));
        }
      })
      .catch(err => console.error('Error toggling server wishlist:', err));
  };

  const addRecentlyViewedBook = (id: string) => {
    if (!currentUser) {
      // Local fallback if guest
      setRecentlyViewedBookIds(prev => {
        const filtered = prev.filter(x => x !== id);
        const updated = [id, ...filtered].slice(0, 5);
        localStorage.setItem('bt_recently_viewed', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    fetch('/api/recently-viewed/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser.username,
        bookId: id,
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update recently viewed');
        return res.json();
      })
      .then(updatedUser => {
        setCurrentUser(updatedUser);
        if (updatedUser.recentlyViewed) {
          setRecentlyViewedBookIds(updatedUser.recentlyViewed);
          localStorage.setItem('bt_recently_viewed', JSON.stringify(updatedUser.recentlyViewed));
        }
      })
      .catch(err => console.error('Error adding to recently viewed:', err));
  };

  const resetToDefaults = () => {
    setBooks(INITIAL_BOOKS);
    setTheme(defaultTheme);
    setSelectedGenres([]);
    setSelectedRatings([]);
    setSelectedLanguage('English');
    setSortBy('popularity');
    setSearchQuery('');
    setFavoriteBookIds([]);
    setShowFavoritesOnly(false);
    setWishlistBookIds([]);
    setShowWishlistOnly(false);
    setRecentlyViewedBookIds([]);
  };

  return (
    <AppContext.Provider
      value={{
        books,
        theme,
        currentUser,
        usersList,
        searchQuery,
        selectedGenres,
        selectedRatings,
        selectedLanguage,
        sortBy,
        isDiscoverOpen,
        isProfileOpen,
        currentPage,
        autoScrollSpeed,
        isDarkMode,
        toggleDarkMode,
        favoriteBookIds,
        toggleFavoriteBook,
        showFavoritesOnly,
        setShowFavoritesOnly,
        wishlistBookIds,
        toggleWishlistBook,
        showWishlistOnly,
        setShowWishlistOnly,
        recentlyViewedBookIds,
        addRecentlyViewedBook,
        setBooks,
        setTheme,
        setCurrentUser,
        registerUser,
        loginUser,
        setSearchQuery,
        toggleGenreFilter,
        toggleRatingFilter,
        setSelectedLanguage,
        setSortBy,
        setIsDiscoverOpen,
        setIsProfileOpen,
        setCurrentPage,
        setAutoScrollSpeed,
        addBook,
        updateBook,
        deleteBook,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
