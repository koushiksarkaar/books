import { Book } from '../types';
import booksData from './books.json';
import categoriesData from './categories.json';

// Cast JSON data to appropriate Book type
export const INITIAL_BOOKS: Book[] = booksData as Book[];

export const POPULAR_GENRES: string[] = categoriesData.slice(0, 5);

export const ALL_GENRES_LIST: string[] = categoriesData;

export const DISCOVER_GENRES: string[] = [
  'Action & Adventure',
  'Fantasy',
  'Horror',
  'Mystery & Thriller',
  'Romance',
  'Science Fiction'
];

export const DISCOVER_RESOURCES: string[] = [
  'Authors',
  'Languages',
  'Genres',
  'Articles',
  'Discuss'
];
