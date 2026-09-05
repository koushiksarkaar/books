export const ANGULAR_SERVICE_TEMPLATE = `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Book {
  id?: string;
  title: string;
  author: string;
  coverUrl: string;
  rating: number;
  language: string;
  genre: string;
  popularity: number;
  description?: string;
  downloadCount: number;
}

export interface User {
  username: string;
  mobileNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:3000/api'; // Swap with your deployed .NET Core WebAPI URL

  constructor(private http: HttpClient) {}

  // 1. Book Records API endpoints
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl + '/books');
  }

  getBook(id: string): Observable<Book> {
    return this.http.get<Book>(this.apiUrl + '/books/' + id);
  }

  addBook(book: Book): Observable<Book> {
    return this.http.post<Book>(this.apiUrl + '/books', book);
  }

  updateBook(id: string, book: Partial<Book>): Observable<any> {
    return this.http.put(this.apiUrl + '/books/' + id, book);
  }

  deleteBook(id: string): Observable<any> {
    return this.http.delete(this.apiUrl + '/books/' + id);
  }

  // 2. Auth API endpoints
  login(mobileNumber: string): Observable<User> {
    return this.http.post<User>(this.apiUrl + '/auth/login', { mobileNumber });
  }

  signup(username: string, mobileNumber: string): Observable<User> {
    return this.http.post<User>(this.apiUrl + '/auth/signup', { username, mobileNumber });
  }
}`;

export const ANGULAR_COMPONENT_TS_TEMPLATE = `import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { BookService, Book, User } from './book.service';

interface AppTheme {
  name: string;
  headerBg: string;
  headerText: string;
  accentColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  bannerText: string;
  bannerButtonText: string;
  bannerVisible: boolean;
}

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit, OnDestroy {
  // Application lists and state
  books: Book[] = [];
  currentUser: User | null = null;
  currentPage: 'login' | 'signup' | 'home' | 'admin' = 'login';
  
  // Custom theme system (Branding)
  theme: AppTheme = {
    name: 'ManyBooks Coral',
    headerBg: 'bg-[#ff6f61]',
    headerText: 'text-white',
    accentColor: '#00a896',
    fontFamily: 'sans',
    bannerText: 'Support our mission to provide free literature!',
    bannerButtonText: 'Donate',
    bannerVisible: true,
  };

  // Auth inputs
  authUsername = '';
  authMobileNumber = '';
  authError = '';
  authSuccess = '';

  // Filter & Search states
  searchQuery = '';
  selectedLanguage = 'Any';
  sortBy: 'title' | 'author' | 'popularity' | 'rating' = 'popularity';
  
  popularGenres = ['Romance', 'Mystery & Thriller', 'Science Fiction', 'Biographies', 'Action & Adventure'];
  allGenresList = [
    'Action & Adventure', 'Adventure', 'Art', 'Biography', 'Business', 'Classic', 'Computers',
    'Cooking', 'Drama', 'Fantasy', 'Fiction And Literature', 'Mystery & Thriller', 'Science Fiction'
  ];
  discoverGenres = ['Action & Adventure', 'Children\\'s', 'Fantasy', 'Horror', 'Mystery & Thriller', 'Romance', 'Science Fiction'];
  discoverResources = ['Authors', 'Languages', 'Genres', 'Articles', 'Discuss'];

  selectedGenres: string[] = [];
  selectedRatings: number[] = [];

  // Dropdown states
  isDiscoverOpen = false;
  isProfileOpen = false;
  
  // Immersive Modal detail
  selectedBookForModal: Book | null = null;
  hoveredBookId: string | null = null;

  // Hands-Free Auto Scroll engine
  autoScrollSpeed = 0; // 0 for off, 1-3 for speed levels
  private autoScrollInterval: any = null;

  // New book admin form
  newBookTitle = '';
  newBookAuthor = '';
  newBookGenre = 'Romance';
  newBookRating = 5;
  newBookPopularity = 90;
  newBookDescription = '';
  newBookGradient = 'coral';

  // Admin Dashboard views
  activeAdminTab: 'branding' | 'books' | 'backend' = 'branding';

  constructor(private bookService: BookService) {}

  ngOnInit() {
    this.loadInitialBooks();
    this.checkLocalStorageSession();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  loadInitialBooks() {
    // In production, queries the .NET WebAPI. Falls back to mock array for safety
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.books = data;
      },
      error: () => {
        this.books = this.getMockBooks();
      }
    });
  }

  checkLocalStorageSession() {
    const savedUser = localStorage.getItem('bt_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.currentPage = 'home';
    }
  }

  // --- Auth Controls ---
  handleLogin() {
    this.authError = '';
    this.authSuccess = '';

    if (!this.authMobileNumber.trim()) {
      this.authError = 'Mobile number is required.';
      return;
    }

    this.bookService.login(this.authMobileNumber).subscribe({
      next: (user) => {
        this.currentUser = user;
        localStorage.setItem('bt_user', JSON.stringify(user));
        this.currentPage = 'home';
        this.authSuccess = 'Welcome back!';
      },
      error: (err) => {
        this.authError = err.error || 'User not found. Try John Doe (1234567890) or create account!';
      }
    });
  }

  handleSignup() {
    this.authError = '';
    this.authSuccess = '';

    if (!this.authUsername.trim() || !this.authMobileNumber.trim()) {
      this.authError = 'Username and Mobile Number are required.';
      return;
    }

    this.bookService.signup(this.authUsername, this.authMobileNumber).subscribe({
      next: (user) => {
        this.currentUser = user;
        localStorage.setItem('bt_user', JSON.stringify(user));
        this.currentPage = 'home';
      },
      error: (err) => {
        this.authError = err.error || 'Mobile number already registered.';
      }
    });
  }

  handleLogout() {
    this.currentUser = null;
    localStorage.removeItem('bt_user');
    this.currentPage = 'login';
    this.isProfileOpen = false;
  }

  // --- Filter Filters Helpers ---
  toggleGenreFilter(genre: string) {
    const index = this.selectedGenres.indexOf(genre);
    if (index > -1) {
      this.selectedGenres.splice(index, 1);
    } else {
      this.selectedGenres.push(genre);
    }
    this.selectedGenres = [...this.selectedGenres];
  }

  toggleRatingFilter(rating: number) {
    const index = this.selectedRatings.indexOf(rating);
    if (index > -1) {
      this.selectedRatings.splice(index, 1);
    } else {
      this.selectedRatings.push(rating);
    }
    this.selectedRatings = [...this.selectedRatings];
  }

  resetFilters() {
    this.selectedGenres = [];
    this.selectedRatings = [];
    this.selectedLanguage = 'Any';
    this.searchQuery = '';
    this.sortBy = 'popularity';
  }

  getFilteredBooks(): Book[] {
    return this.books.filter(book => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        book.title.toLowerCase().includes(q) || 
        book.author.toLowerCase().includes(q) || 
        book.genre.toLowerCase().includes(q);

      const matchesGenre = this.selectedGenres.length === 0 || this.selectedGenres.includes(book.genre);
      const matchesRating = this.selectedRatings.length === 0 || this.selectedRatings.includes(book.rating);
      const matchesLanguage = this.selectedLanguage === 'Any' || book.language === this.selectedLanguage;

      return matchesSearch && matchesGenre && matchesRating && matchesLanguage;
    }).sort((a, b) => {
      if (this.sortBy === 'title') return a.title.localeCompare(b.title);
      if (this.sortBy === 'author') return a.author.localeCompare(b.author);
      if (this.sortBy === 'rating') return b.rating - a.rating;
      return b.popularity - a.popularity;
    });
  }

  // --- Smooth Scrolling ---
  setScrollSpeed(speed: number) {
    this.autoScrollSpeed = speed;
    this.stopAutoScroll();

    if (speed > 0) {
      this.autoScrollInterval = setInterval(() => {
        window.scrollBy({ top: speed, behavior: 'smooth' });
        
        // Loop back up if we hit page bottom
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 5) {
          window.scrollTo({ top: 300, behavior: 'instant' });
        }
      }, 45);
    }
  }

  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Real PDF Download Trigger ---
  triggerPdfDownload(book: Book, e?: Event) {
    if (e) e.stopPropagation();
    
    // Simulate updating download count in server database
    book.downloadCount++;
    this.bookService.updateBook(book.id!, { downloadCount: book.downloadCount }).subscribe();

    // Create & Trigger binary raw PDF download (matches server output)
    const formattedTitle = book.title.replace(/[\\\\()]/g, '');
    const formattedAuthor = book.author.replace(/[\\\\()]/g, '');
    const ts = new Date().toLocaleString();

    const pdfContent = [
      '%PDF-1.4',
      '1 0 obj', '<< /Type /Catalog /Pages 2 0 R >>', 'endobj',
      '2 0 obj', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', 'endobj',
      '3 0 obj', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', 'endobj',
      '4 0 obj', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', 'endobj',
      '5 0 obj',
      '<< /Length 500 >>',
      'stream',
      'BT', '/F1 22 Tf', '72 750 Td', \`(\${formattedTitle}) Tj\`, 'ET',
      'BT', '/F1 14 Tf', '72 710 Td', \`(by \${formattedAuthor}) Tj\`, 'ET',
      'BT', '/F1 11 Tf', '72 650 Td', \`(Downloaded from optimized Angular + .NET eBook application!) Tj\`, 'ET',
      'BT', '/F1 11 Tf', '72 620 Td', \`(Time code: \${ts}) Tj\`, 'ET',
      'ET',
      'endstream', 'endobj',
      'xref', '0 6', '0000000000 65535 f', 'trailer', '<< /Size 6 /Root 1 0 R >>', 'startxref', '380', '%%EOF'
    ].join('\\n');

    const blob = new Blob([new TextEncoder().encode(pdfContent)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = \`\${book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf\`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // --- CRUD Inventory Operations ---
  handleAddBook() {
    if (!this.newBookTitle.trim() || !this.newBookAuthor.trim()) {
      alert('Book title and author are required.');
      return;
    }

    const gradients: Record<string, string> = {
      coral: 'linear-gradient(135deg, #df8d71 0%, #aa4b3b 100%)',
      charcoal: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      golden: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
      rose: 'linear-gradient(135deg, #fda4af 0%, #e11d48 100%)',
      teal: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)'
    };

    const newBook: Book = {
      title: this.newBookTitle.trim(),
      author: this.newBookAuthor.trim(),
      genre: this.newBookGenre,
      rating: this.newBookRating,
      popularity: this.newBookPopularity,
      coverUrl: gradients[this.newBookGradient] || gradients.coral,
      language: 'English',
      description: this.newBookDescription.trim(),
      downloadCount: 0
    };

    this.bookService.addBook(newBook).subscribe({
      next: (b) => {
        this.books.unshift(b);
        this.newBookTitle = '';
        this.newBookAuthor = '';
        this.newBookDescription = '';
        alert('Book added successfully inside .NET Connected Library database!');
      },
      error: () => {
        // Fallback local save in case API is disconnected
        newBook.id = Date.now().toString();
        this.books.unshift(newBook);
        this.newBookTitle = '';
        this.newBookAuthor = '';
        this.newBookDescription = '';
      }
    });
  }

  deleteBook(bookId: string) {
    if (confirm('Delete this book permanently from catalog?')) {
      this.bookService.deleteBook(bookId).subscribe({
        next: () => {
          this.books = this.books.filter(b => b.id !== bookId);
        },
        error: () => {
          this.books = this.books.filter(b => b.id !== bookId);
        }
      });
    }
  }

  // Preset Theme selector
  applyThemePreset(name: string, bg: string, accent: string) {
    this.theme.name = name;
    this.theme.headerBg = bg;
    this.theme.accentColor = accent;
  }

  private getMockBooks(): Book[] {
    return [
      { id: '1', title: 'A Convenient Risk', author: 'Sara R Turnquist', coverUrl: 'linear-gradient(135deg, #df8d71 0%, #aa4b3b 100%)', rating: 5, language: 'English', genre: 'Romance', popularity: 98, description: 'Victorian love and dramatic choices.', downloadCount: 1420 },
      { id: '2', title: 'War Of The Animals', author: 'Jonathan Decoteau', coverUrl: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', rating: 4, language: 'English', genre: 'Science Fiction', popularity: 89, description: 'Dark and gripping post-apocalyptic saga.', downloadCount: 1105 },
      { id: '3', title: 'Dirt Dealers', author: 'A.W. Kaylen', coverUrl: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)', rating: 4, language: 'English', genre: 'Mystery & Thriller', popularity: 95, description: 'High-stakes FBI investigation.', downloadCount: 890 },
      { id: '4', title: 'Lost to You', author: 'A.L. Jackson', coverUrl: 'linear-gradient(135deg, #fda4af 0%, #e11d48 100%)', rating: 5, language: 'English', genre: 'Romance', popularity: 92, description: 'Memories, romance and second chances.', downloadCount: 2310 }
    ];
  }
}`;

export const ANGULAR_COMPONENT_HTML_TEMPLATE = `<!-- Global Support Top Promo Banner -->
<div *ngIf="theme.bannerVisible" id="top-promo-banner" class="bg-emerald-600 text-white text-xs py-2 px-4 flex items-center justify-between z-30 shadow-sm font-sans">
  <div class="flex-1 flex justify-center items-center gap-2">
    <span class="font-semibold tracking-wide">{{ theme.bannerText }}</span>
    <button (click)="alert('Mock Donation clicked!')" class="ml-3 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-full text-[10px] uppercase tracking-wider transition-all">
      {{ theme.bannerButtonText }}
    </button>
  </div>
  <button (click)="theme.bannerVisible = false" class="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10" title="Dismiss">✕</button>
</div>

<!-- Header containing Brand, discovery button and profile menu -->
<header [ngClass]="[theme.headerBg, theme.headerText]" class="shadow-md relative z-40 py-4 px-4 transition-colors duration-300">
  <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
    
    <!-- Left Navigation -->
    <div class="flex items-center justify-between md:justify-start gap-6">
      <div (click)="currentPage = 'home'" class="flex items-center gap-2 cursor-pointer group">
        <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#ff6f61] font-extrabold text-2xl shadow-md">M</div>
        <div class="flex flex-col text-left">
          <span class="font-sans font-black text-2xl tracking-tighter leading-none">ManyBooks</span>
          <span class="text-[10px] tracking-widest text-white/70 uppercase font-mono">Angular Edition</span>
        </div>
      </div>

      <!-- Discover Dropdown -->
      <div class="relative">
        <button (click)="isDiscoverOpen = !isDiscoverOpen" class="flex items-center gap-1.5 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-all font-bold uppercase tracking-wider text-xs border border-white/20">
          Discover ▼
        </button>

        <!-- Discovery mega menu popup -->
        <div *ngIf="isDiscoverOpen" class="absolute left-0 mt-3 w-[290px] sm:w-[540px] bg-white rounded-xl shadow-2xl border border-slate-100 flex flex-col sm:flex-row overflow-hidden text-slate-800 z-50">
          <div class="p-5 flex-1 max-h-[380px] overflow-y-auto">
            <h4 class="text-slate-400 text-xs font-bold tracking-wider uppercase mb-3 pb-1 border-b border-slate-100">Genres</h4>
            <div class="grid grid-cols-2 gap-y-2 gap-x-4">
              <button *ngFor="let gen of discoverGenres" (click)="toggleGenreFilter(gen); isDiscoverOpen = false" class="text-left py-1 text-[13px] text-slate-600 hover:text-emerald-600 font-medium whitespace-nowrap">
                {{ gen }}
              </button>
            </div>
          </div>
          <div class="p-5 w-full sm:w-[210px] bg-emerald-50/70 border-l border-emerald-100">
            <h4 class="text-emerald-700/80 text-xs font-extrabold tracking-wider uppercase mb-3 pb-1 border-b border-emerald-100">Resources</h4>
            <div class="flex flex-col gap-2.5">
              <button *ngFor="let res of discoverResources" (click)="isDiscoverOpen = false" class="text-left text-[13px] text-slate-700 hover:text-emerald-600 font-semibold flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {{ res }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Center Search Bar elements -->
    <div class="flex-1 max-w-xl mx-auto md:mx-4 w-full">
      <div class="relative flex shadow-inner rounded-md overflow-hidden bg-white group border border-slate-200">
        <span class="pl-3.5 flex items-center text-slate-400">🔍</span>
        <input type="text" [(ngModel)]="searchQuery" placeholder="Search by title, author or keyword" class="w-full pl-2.5 pr-4 py-2.5 text-slate-800 text-sm focus:outline-none placeholder-slate-400" />
      </div>
    </div>

    <!-- Right Profile section -->
    <div class="flex items-center gap-3 justify-end relative">
      <button *ngIf="currentUser" (click)="currentPage = (currentPage === 'admin' ? 'home' : 'admin')" class="py-2 px-3 rounded-md text-xs font-bold uppercase hover:bg-white/10 flex items-center gap-1">
        ⚙️ Customize Admin
      </button>

      <div *ngIf="currentUser" class="relative">
        <button (click)="isProfileOpen = !isProfileOpen" class="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 text-sm font-semibold border border-white/15 bg-white/5">
          <div class="w-6 h-6 rounded-full bg-white text-rose-500 font-extrabold text-[11px] flex items-center justify-center">{{ currentUser.username.charAt(0).toUpperCase() }}</div>
          <span class="truncate">{{ currentUser.username }}</span>
        </button>

        <!-- Dropdown on Profile Click -->
        <div *ngIf="isProfileOpen" class="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 p-5 text-slate-800 z-50">
          <div class="flex items-center gap-3 pb-3 mb-3 border-b border-zinc-100">
            <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-base flex items-center justify-center">
              {{ currentUser.username.charAt(0).toUpperCase() }}
            </div>
            <div>
              <span class="font-bold text-sm text-slate-800 block leading-tight">{{ currentUser.username }}</span>
              <span class="text-[10px] text-emerald-600 font-black uppercase">Registered User</span>
            </div>
          </div>
          <p class="text-xs text-slate-500 font-mono mb-4 bg-slate-50 p-2 rounded">Mobile: {{ currentUser.mobileNumber }}</p>
          <button (click)="handleLogout()" class="w-full text-center py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-colors">
            Log Out Account
          </button>
        </div>
      </div>

      <button *ngIf="!currentUser" (click)="currentPage = 'login'" class="py-2 px-5 bg-white text-rose-500 font-bold text-xs rounded shadow uppercase tracking-wider">
        Sign In
      </button>
    </div>
  </div>
</header>

<!-- Main viewport layout -->
<!-- Login / Registration Form -->
<div *ngIf="currentPage === 'login' || currentPage === 'signup'" class="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50 text-slate-800">
  <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
    <div class="bg-[#ff6f61] p-8 text-white text-center">
      <div class="w-12 h-12 bg-white rounded-xl mx-auto flex items-center justify-center text-[#ff6f61] font-black text-2xl shadow-md mb-2">M</div>
      <h2 class="text-2xl font-sans font-black tracking-tight">ManyBooks Library</h2>
      <p class="text-white/80 text-xs">Access your beautiful dynamic customized eBook list database portal.</p>
    </div>

    <!-- Toggle tabs -->
    <div class="flex border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
      <button (click)="currentPage = 'login'" [ngClass]="{'border-emerald-600 text-slate-800 bg-slate-50/50': currentPage === 'login'}" class="flex-1 py-4 border-b-2 text-center">Sign In</button>
      <button (click)="currentPage = 'signup'" [ngClass]="{'border-emerald-600 text-slate-800 bg-slate-50/50': currentPage === 'signup'}" class="flex-1 py-4 border-b-2 text-center">Create Account</button>
    </div>

    <div class="p-6 space-y-4">
      <div *ngIf="authError" class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-medium">{{ authError }}</div>
      
      <div *ngIf="currentPage === 'signup'" class="space-y-1">
        <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
        <input type="text" [(ngModel)]="authUsername" placeholder="Enter Full Name" class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none placeholder-slate-400" />
      </div>

      <div class="space-y-1">
        <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
        <input type="text" [(ngModel)]="authMobileNumber" placeholder="e.g. 1234567890" class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none placeholder-slate-400 font-mono" />
      </div>

      <button (click)="currentPage === 'login' ? handleLogin() : handleSignup()" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs uppercase tracking-wider rounded-lg transition-colors">
        Submit & Open Library
      </button>
    </div>
  </div>
</div>

<!-- Home Library Catalog screen -->
<div *ngIf="currentPage === 'home'" class="bg-slate-50 text-slate-800 flex-1">
  <!-- Genres Bar -->
  <div class="bg-white border-b border-slate-200 py-3 text-sm font-semibold text-slate-700">
    <div class="max-w-7xl mx-auto px-4 flex items-center gap-4 flex-wrap">
      <span class="text-xs uppercase font-extrabold text-slate-900 flex items-center gap-1">🔥 Popular Genres</span>
      <button *ngFor="let genre of popularGenres" (click)="toggleGenreFilter(genre)" [ngClass]="{'bg-rose-500 text-white font-bold': selectedGenres.includes(genre), 'bg-slate-50 hover:bg-slate-100': !selectedGenres.includes(genre)}" class="py-1 px-3 rounded-full text-xs transition-transform">
        {{ genre }}
      </button>
    </div>
  </div>

  <main class="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
    
    <!-- Sidebar Filters -->
    <aside class="w-full lg:w-64 shrink-0 bg-white p-5 rounded-xl border border-slate-200 space-y-6 self-start text-left">
      <!-- Ratings with stars -->
      <div class="space-y-3">
        <h3 class="text-slate-800 text-xs font-black uppercase tracking-wider border-b border-slate-100 pb-2">Ratings</h3>
        <div class="space-y-2">
          <label *ngFor="let starVal of [5,4,3,2,1]" class="flex items-center gap-2.5 cursor-pointer text-slate-600">
            <input type="checkbox" [checked]="selectedRatings.includes(starVal)" (change)="toggleRatingFilter(starVal)" class="w-4 h-4 rounded text-teal-600 border-slate-300" />
            <span class="text-xs text-teal-500 font-bold">&#9733; {{ starVal }} Stars</span>
          </label>
        </div>
      </div>

      <!-- Language selector -->
      <div class="space-y-3">
        <h3 class="text-slate-800 text-xs font-black uppercase tracking-wider border-b border-slate-100 pb-2">Language</h3>
        <select [(ngModel)]="selectedLanguage" class="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded text-xs font-semibold focus:outline-none">
          <option value="Any">Any Language</option>
          <option value="English">English</option>
        </select>
      </div>

      <!-- Genre list scrollbox -->
      <div class="space-y-3">
        <h3 class="text-slate-800 text-xs font-black uppercase tracking-wider border-b border-slate-100 pb-2">Genres</h3>
        <div class="space-y-1.5 max-h-[300px] overflow-y-auto">
          <label *ngFor="let gen of allGenresList" class="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-900">
            <input type="checkbox" [checked]="selectedGenres.includes(gen)" (change)="toggleGenreFilter(gen)" class="w-3.5 h-3.5 rounded text-teal-600 border-slate-300" />
            <span>{{ gen }}</span>
          </label>
        </div>
      </div>
    </aside>

    <!-- Books catalog block -->
    <div class="flex-1 space-y-6">
      
      <!-- Auto Scroll Continuous Option + Sort controller -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <!-- Hands-free scroll continuous play -->
        <div class="flex items-center gap-2">
          <span class="bg-emerald-50 text-emerald-800 text-xs font-bold py-1 px-2.5 rounded border border-emerald-100 uppercase tracking-wider">Hands-Free Scroll</span>
          <div class="flex items-center border border-slate-200 rounded p-1">
            <button (click)="autoScrollSpeed === 0 ? setScrollSpeed(1) : setScrollSpeed(0)" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded text-xs transition-colors">
              {{ autoScrollSpeed > 0 ? '⏸ Pause' : '▶ Play Scroll' }}
            </button>
            <div *ngIf="autoScrollSpeed > 0" class="flex items-center gap-1.5 ml-3 pl-3 border-l text-xs font-bold">
              <button *ngFor="let s of [1,2,3]" (click)="setScrollSpeed(s)" [ngClass]="{'bg-emerald-100 text-emerald-800': autoScrollSpeed === s, 'text-slate-400': autoScrollSpeed !== s}" class="px-1.5 rounded">{{ s }}x</button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
          <span>sort by:</span>
          <button *ngFor="let s of ['title','author','popularity','rating']" (click)="sortBy = s" [ngClass]="{'text-slate-900 border-b-2 font-black border-emerald-600': sortBy === s, 'text-slate-400': sortBy !== s}" class="capitalize font-semibold">{{ s }}</button>
        </div>
      </div>

      <!-- Book Listings Grid -->
      <div *ngIf="getFilteredBooks().length === 0" class="bg-white p-12 text-center rounded-2xl border border-slate-100">
        <p class="text-slate-400 text-sm">No books model fits your filters. Reset grid parameters to resume!</p>
        <button (click)="resetFilters()" class="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-bold">Reset Filters</button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
        <div *ngFor="let book of getFilteredBooks()" (mouseenter)="hoveredBookId = book.id" (mouseleave)="hoveredBookId = null" class="flex flex-col relative group">
          <div (click)="selectedBookForModal = book" class="w-full aspect-[2/3] rounded-lg shadow-md hover:shadow-xl overflow-hidden cursor-pointer relative text-white" [style.background]="book.coverUrl">
            <div class="w-full h-full flex flex-col justify-between p-4 bg-black/10">
              <span class="text-[9px] uppercase tracking-wider bg-black/30 py-0.5 px-2 rounded-full self-start">{{ book.genre }}</span>
              <div class="space-y-1 bg-black/25 p-2 rounded">
                <h4 class="font-serif font-black text-xs leading-tight line-clamp-2">{{ book.title }}</h4>
                <p class="text-[9px] opacity-90 truncate">by {{ book.author }}</p>
              </div>
            </div>

            <!-- Mini popup overlay (matches download.png) -->
            <div *ngIf="hoveredBookId === book.id" class="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
              <div class="bg-white rounded-xl p-3.5 w-full text-slate-800 space-y-2 text-left" (click)="$event.stopPropagation()">
                <h5 class="font-bold text-xs text-emerald-600 truncate mb-1">{{ book.title }}</h5>
                <button (click)="triggerPdfDownload(book, $event)" class="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded flex items-center justify-center gap-1">
                  📥 Download PDF
                </button>
              </div>
            </div>
          </div>
          
          <div class="mt-2 text-left">
            <h3 (click)="selectedBookForModal = book" class="font-bold text-xs text-slate-800 hover:text-emerald-600 transition-colors cursor-pointer line-clamp-1">{{ book.title }}</h3>
            <p class="text-[11px] text-slate-400">by {{ book.author }}</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- Immersive Detail Modal popup -->
<div *ngIf="selectedBookForModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-800">
  <div class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative border flex flex-col md:flex-row text-left">
    <div class="w-full md:w-[200px] shrink-0 p-6 flex flex-col items-center justify-center bg-slate-50 border-r border-slate-100">
      <div class="w-32 aspect-[2/3] rounded-lg shadow-lg text-white p-3 flex flex-col justify-between" [style.background]="selectedBookForModal.coverUrl">
        <span class="text-[8px] bg-black/25 px-2 py-0.5 rounded-full font-bold self-start">{{ selectedBookForModal.genre }}</span>
        <h4 class="font-serif font-black text-[10px] bg-black/25 p-1 rounded">{{ selectedBookForModal.title }}</h4>
      </div>
      <span class="text-[9px] text-slate-400 font-bold mt-3 bg-slate-100 py-1 px-2.5 rounded-full">Popularity: {{ selectedBookForModal.popularity }}%</span>
    </div>
    <div class="p-6 flex-1 flex flex-col justify-between">
      <div>
        <span class="text-[10px] text-emerald-600 font-black uppercase">{{ selectedBookForModal.genre }}</span>
        <h3 class="text-lg font-sans font-black text-slate-800 leading-tight mt-0.5">{{ selectedBookForModal.title }}</h3>
        <p class="text-xs text-slate-500">by {{ selectedBookForModal.author }}</p>
        <p class="text-[11px] text-slate-600 mt-4 leading-relaxed">{{ selectedBookForModal.description || 'This book features customizable plot summary logs in your customizable eBook list database.' }}</p>
      </div>
      <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span class="text-[11px] text-slate-400">Downloads: {{ selectedBookForModal.downloadCount }}</span>
        <div class="flex gap-2">
          <button (click)="selectedBookForModal = null" class="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded font-bold">Close</button>
          <button (click)="triggerPdfDownload(selectedBookForModal)" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded font-bold">Download PDF</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Admin customizer controls panel tab -->
<div *ngIf="currentPage === 'admin'" class="max-w-7xl mx-auto px-4 py-8 text-left text-slate-800">
  <div class="flex items-center justify-between border-b pb-4 mb-6">
    <div>
      <h1 class="text-2xl font-black text-slate-900">Customizer Admin Dashboard</h1>
      <p class="text-xs text-slate-500">Alter current layout branding theme properties, edit book items, or query the C# .NET API Controller modules.</p>
    </div>
    <button (click)="currentPage = 'home'" class="py-1.5 px-4 bg-emerald-600 text-white font-bold text-xs rounded">✕ Close Admin</button>
  </div>

  <div class="flex flex-col lg:flex-row gap-6">
    <div class="w-full lg:w-56 flex flex-col gap-1 bg-slate-100 p-2.5 rounded-xl self-start">
      <button (click)="activeAdminTab = 'branding'" [ngClass]="{'bg-white text-slate-900 font-bold shadow-sm': activeAdminTab === 'branding'}" class="text-left py-2 px-3 rounded text-xs">🎨 Branding & Presets</button>
      <button (click)="activeAdminTab = 'books'" [ngClass]="{'bg-white text-slate-900 font-bold shadow-sm': activeAdminTab === 'books'}" class="text-left py-2 px-3 rounded text-xs">📖 Book inventory</button>
    </div>

    <!-- Right pane content of active admin module tab -->
    <div class="flex-1 bg-white p-6 rounded-xl border border-slate-200">
      
      <!-- Tab 1: Branding and Presets -->
      <div *ngIf="activeAdminTab === 'branding'" class="space-y-6">
        <h3 class="text-base font-bold">Custom Themes & Header Accents</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button (click)="applyThemePreset('ManyBooks Coral', 'bg-[#ff6f61]', '#00a896')" class="p-3 border border-slate-200 rounded text-left text-xs bg-slate-50 hover:bg-slate-100">
            <span class="block font-bold">ManyBooks Coral</span>
            <div class="flex gap-1.5 mt-1.5"><span class="w-4 h-4 rounded bg-[#ff6f61]"></span><span class="w-4 h-4 rounded bg-[#00a896]"></span></div>
          </button>
          <button (click)="applyThemePreset('Forest Moss', 'bg-emerald-800', '#10b981')" class="p-3 border border-slate-200 rounded text-left text-xs bg-slate-50 hover:bg-slate-100">
            <span class="block font-bold">Forest Moss</span>
            <div class="flex gap-1.5 mt-1.5"><span class="w-4 h-4 rounded bg-[#065f46]"></span><span class="w-4 h-4 rounded bg-[#10b981]"></span></div>
          </button>
          <button (click)="applyThemePreset(' sapphire', 'bg-slate-900', '#3b82f6')" class="p-3 border border-slate-200 rounded text-left text-xs bg-slate-50 hover:bg-slate-100">
            <span class="block font-bold">Sapphire</span>
            <div class="flex gap-1.5 mt-1.5"><span class="w-4 h-4 rounded bg-slate-900"></span><span class="w-4 h-4 rounded bg-blue-500"></span></div>
          </button>
        </div>

        <div class="space-y-3 pt-4 border-t">
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500">Banner Support Text</label>
            <input type="text" [(ngModel)]="theme.bannerText" class="w-full border p-2 text-xs rounded focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500">Banner Option Button Label</label>
            <input type="text" [(ngModel)]="theme.bannerButtonText" class="w-full border p-2 text-xs rounded focus:ring-1 focus:ring-emerald-500" />
          </div>
        </div>
      </div>

      <!-- Tab 2: Book inventory CRUD -->
      <div *ngIf="activeAdminTab === 'books'" class="space-y-6">
        <h3 class="text-base font-bold">Create Custom Book Listing</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500">Book Title</label>
            <input type="text" [(ngModel)]="newBookTitle" placeholder="e.g. Victorian Whisperings" class="w-full border p-2 text-xs rounded focus:ring-1" />
          </div>
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500">Author</label>
            <input type="text" [(ngModel)]="newBookAuthor" placeholder="e.g. Evelyn Vance" class="w-full border p-2 text-xs rounded focus:ring-1" />
          </div>
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500">Genre</label>
            <select [(ngModel)]="newBookGenre" class="w-full border p-2 text-xs rounded">
              <option *ngFor="let g of allGenresList" [value]="g">{{ g }}</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500">Gradient Palette</label>
            <select [(ngModel)]="newBookGradient" class="w-full border p-2 text-xs rounded">
              <option value="coral">ManyBooks Coral</option>
              <option value="charcoal">Charcoal Slate</option>
              <option value="golden">Ochre Golden</option>
              <option value="rose">Soft Rose</option>
              <option value="teal">Forest Teal</option>
            </select>
          </div>
          <div class="col-span-2 space-y-1">
            <label class="text-[11px] font-bold text-slate-500">Description Summary</label>
            <textarea [(ngModel)]="newBookDescription" placeholder="Plot line detail description..." class="w-full border p-2 text-xs rounded focus:ring-1"></textarea>
          </div>
        </div>

        <button (click)="handleAddBook()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs uppercase tracking-wide">
          Add Book to Database
        </button>

        <!-- Small Inventory Quick Table -->
        <div class="pt-4 border-t">
          <span class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Book Records</span>
          <div class="overflow-x-auto border rounded-xl">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 font-bold border-b">
                <tr>
                  <th class="p-2.5">Title</th>
                  <th class="p-2.5">Author</th>
                  <th class="p-2.5">Genre</th>
                  <th class="p-2.5">Downloads</th>
                  <th class="p-2.5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody class="divide-y font-medium">
                <tr *ngFor="let b of books" class="hover:bg-slate-50">
                  <td class="p-2.5 font-bold">{{ b.title }}</td>
                  <td class="p-2.5 text-slate-500">{{ b.author }}</td>
                  <td class="p-2.5 text-rose-500 font-bold">{{ b.genre }}</td>
                  <td class="p-2.5 font-mono text-[11px]">{{ b.downloadCount }} dl</td>
                  <td class="p-2.5 text-right">
                    <button (click)="deleteBook(b.id!)" class="text-rose-500 hover:underline">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
`;
