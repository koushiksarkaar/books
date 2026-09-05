export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  rating: number; // 1 to 5
  language: string; // e.g., "English"
  genre: string; // e.g., "Romance", "Mystery & Thriller", "Science Fiction"
  popularity: number; // For sorting
  description?: string;
  downloadCount: number;
  price: number;
  downloadUrl: string;
}

export interface AppTheme {
  name: string;
  headerBg: string; // e.g., "bg-[#f26b5b]"
  headerText: string;
  accentColor: string; // e.g., "#00a896"
  fontFamily: 'sans' | 'serif' | 'mono';
  bannerText: string;
  bannerButtonText: string;
  bannerVisible: boolean;
}

export interface User {
  username: string;
  mobileNumber: string;
  wishlist?: string[];
  recentlyViewed?: string[];
}
