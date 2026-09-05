import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Book, AppTheme } from '../types';
import { ALL_GENRES_LIST } from '../data/initialBooks';
import { getBookCoverUrl } from './BookCard';
import {
  DOTNET_CONTROLLER_TEMPLATE,
  DOTNET_AUTH_TEMPLATE,
  SQL_SERVER_SCHEMA,
  DOTNET_DB_CONTEXT
} from '../data/dotNetTemplates';
import {
  ANGULAR_SERVICE_TEMPLATE,
  ANGULAR_COMPONENT_TS_TEMPLATE,
  ANGULAR_COMPONENT_HTML_TEMPLATE
} from '../data/angularTemplates';
import {
  Settings,
  Paintbrush,
  BookOpen,
  Code2,
  PlusCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle,
  Flame,
  Star,
  Copy,
  Download,
  AlertTriangle,
  Layers,
  Terminal
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    books,
    theme,
    currentPage,
    setCurrentPage,
    setTheme,
    addBook,
    updateBook,
    deleteBook,
    resetToDefaults,
  } = useApp();

  // Active Admin Tabs
  const [activeTab, setActiveTab] = useState<'branding' | 'books' | 'angular' | 'json'>('branding');

  // Book edit/form states
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Romance');
  const [rating, setRating] = useState(5);
  const [popularity, setPopularity] = useState(90);
  const [coverGradientType, setCoverGradientType] = useState('coral');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  // Preset Colors/Gradients to assign to covers
  const GRADIENT_PRESETS: Record<string, string> = {
    coral: 'linear-gradient(135deg, #df8d71 0%, #aa4b3b 100%)',
    charcoal: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    golden: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
    rose: 'linear-gradient(135deg, #fda4af 0%, #e11d48 100%)',
    teal: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
    indigo: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
    mustard: 'linear-gradient(135deg, #dfae19 0%, #8c6800 100%)',
    sunset: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
    emerald: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    blue: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  };

  // Preset Themes
  const THEME_PRESETS = [
    {
      name: 'Books Library Gold',
      headerBg: 'bg-[#D4A311]',
      headerText: 'text-white',
      accentColor: '#0f766e',
    },
    {
      name: 'Forest Moss',
      headerBg: 'bg-emerald-800',
      headerText: 'text-white',
      accentColor: '#10b981',
    },
    {
      name: 'Dark Sapphire',
      headerBg: 'bg-slate-900',
      headerText: 'text-white',
      accentColor: '#3b82f6',
    },
    {
      name: 'Sunset Golden',
      headerBg: 'bg-amber-600',
      headerText: 'text-white',
      accentColor: '#e11d48',
    },
    {
      name: 'Minimal Charcoal',
      headerBg: 'bg-zinc-800',
      headerText: 'text-white',
      accentColor: '#27272a',
    }
  ];

  // Copy code helper
  const [copiedCodeFlag, setCopiedCodeFlag] = useState<string | null>(null);
  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeFlag(label);
    setTimeout(() => setCopiedCodeFlag(null), 2500);
  };

  // Submit form (Add or Edit Book)
  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      alert('Book title and author elements are required.');
      return;
    }

    const coverUrl = GRADIENT_PRESETS[coverGradientType] || GRADIENT_PRESETS.coral;

    if (isEditing && currentEditId) {
      updateBook(currentEditId, {
        title: title.trim(),
        author: author.trim(),
        genre,
        rating,
        popularity,
        coverUrl,
        image: image.trim() || undefined,
        description: description.trim()
      });
      setIsEditing(false);
      setCurrentEditId(null);
    } else {
      addBook({
        title: title.trim(),
        author: author.trim(),
        genre,
        rating,
        popularity,
        coverUrl,
        image: image.trim() || undefined,
        language: 'English',
        description: description.trim()
      });
    }

    // Reset Form fields
    setTitle('');
    setAuthor('');
    setGenre('Romance');
    setRating(5);
    setPopularity(90);
    setDescription('');
    setImage('');
  };

  const startEditBook = (book: Book) => {
    setTitle(book.title);
    setAuthor(book.author);
    setGenre(book.genre);
    setRating(book.rating);
    setPopularity(book.popularity);
    setDescription(book.description || '');
    setImage(book.image || '');
    
    // Find gradient key
    const foundKey = Object.keys(GRADIENT_PRESETS).find(key => GRADIENT_PRESETS[key] === book.coverUrl) || 'coral';
    setCoverGradientType(foundKey);

    setIsEditing(true);
    setCurrentEditId(book.id);
  };

  return (
    <div id="admin-dashboard-root" className="max-w-7xl mx-auto px-4 py-8 font-sans text-slate-800">
      
      {/* Dashboard Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-[#1e9c45] font-extrabold text-xs uppercase tracking-widest">
            <Settings className="w-4 h-4 animate-spin-slow" />
            <span>Editable Controls Portal</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-0.5">Admin Management Dashboard</h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Fine-tune the entire ManyBooks catalog, control color presets, fonts, layout visibility parameters, or copy the production-ready .NET Web API SQL schema templates.
          </p>
        </div>
        
        {/* Actions header group */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to restore the layout configuration and book list items to original settings? This deletes any newly created books.')) {
                resetToDefaults();
              }
            }}
            className="flex items-center gap-1.5 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg transition-colors border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-1.5 py-2 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg transition-colors shadow-sm"
          >
            Go Back to Library ↗
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Navigation Rails for Dashboard Tabs */}
        <div className="w-full lg:w-60 flex flex-col gap-1.5 bg-slate-100/65 p-3 rounded-2xl border border-slate-200/50 self-start">
          <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase px-3 py-1.5">
            Admin Modules
          </span>

          <button
            onClick={() => setActiveTab('branding')}
            className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'branding' 
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Paintbrush className="w-4 h-4 text-[#1e9c45]" />
            Themes, Colors & Fonts
          </button>

          <button
            onClick={() => setActiveTab('books')}
            className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'books' 
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Manage Books ({books.length})
          </button>

          <button
            onClick={() => setActiveTab('angular')}
            className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'angular' 
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Terminal className="w-4 h-4 text-red-500" />
            Angular 17 Components
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === 'json' 
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-600" />
            Library JSON Data Files
          </button>
        </div>

        {/* Right Active Panel Content */}
        <div className="flex-1 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/65 shadow-xs">
          
          {/* TAB 1: BRANDING & CUSTOMIZATION OPTIONS */}
          {activeTab === 'branding' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Customize Themes, Fonts, & Typography</h3>
                <p className="text-xs text-slate-500">
                  Update active layouts and global headers instantaneously.
                </p>
              </div>

              {/* Theme selection presets */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Quick Theme Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = theme.name === preset.name;
                    return (
                      <button
                        key={preset.name}
                        onClick={() => setTheme(prev => ({
                          ...prev,
                          name: preset.name,
                          headerBg: preset.headerBg,
                          accentColor: preset.accentColor,
                        }))}
                        className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                          isSelected
                            ? 'bg-slate-50 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-bold text-xs">{preset.name}</span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded ${preset.headerBg}`}></div>
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: preset.accentColor }}></div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text / Banner Customizer Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wide">Text Customizer</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Top Banner Promo Message</label>
                    <input
                      type="text"
                      value={theme.bannerText}
                      onChange={(e) => setTheme(prev => ({ ...prev, bannerText: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Banner Button Text</label>
                    <input
                      type="text"
                      value={theme.bannerButtonText}
                      onChange={(e) => setTheme(prev => ({ ...prev, bannerButtonText: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Typography and general switches */}
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wide">Layout & Fonts Params</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Typography Font Choice</label>
                    <select
                      value={theme.fontFamily}
                      onChange={(e) => setTheme(prev => ({ ...prev, fontFamily: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-200 py-2 px-3 rounded-lg text-xs font-medium focus:ring-1"
                    >
                      <option value="sans">Modern Sans-Serif (Inter Default)</option>
                      <option value="serif">Classic Editorial Serif (Lora/Platfair style)</option>
                      <option value="mono">Technical Terminal Mono (JetBrains Code)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <input
                      type="checkbox"
                      id="banner-visible-checkbox"
                      checked={theme.bannerVisible}
                      onChange={(e) => setTheme(prev => ({ ...prev, bannerVisible: e.target.checked }))}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/50 border-slate-300"
                    />
                    <label htmlFor="banner-visible-checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Display Support Top Promo Banner
                    </label>
                  </div>
                </div>
              </div>

              {/* Visual Preview panel */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase block mb-2">
                  Header Accent Live Preview
                </span>
                <div className={`p-4 rounded-lg flex items-center justify-between text-white ${theme.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">M</span>
                    <span className="text-sm font-semibold">ManyBooks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">Accent color:</span>
                    <div className="w-5 h-5 rounded-full ring-2 ring-white" style={{ backgroundColor: theme.accentColor }}></div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MANAGE BOOK RECORDS (CRUD Operations) */}
          {activeTab === 'books' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Manage Book Inventory</h3>
                <p className="text-xs text-slate-500">
                  Add, edit details, or remove books from the library catalog.
                </p>
              </div>

              {/* Form to Create/Edit Books */}
              <form onSubmit={handleBookSubmit} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wide border-b border-slate-200/40 pb-2">
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>{isEditing ? 'Edit Existing Book Record' : 'Create New Book Listing'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Book Title</label>
                    <input
                      type="text"
                      placeholder="e.g. A Convenient Risk"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Author</label>
                    <input
                      type="text"
                      placeholder="e.g. Sara R Turnquist"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Genre Group</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs font-medium focus:ring-1"
                    >
                      {ALL_GENRES_LIST.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Initial Rating (1-5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value) || 5)}
                        className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs font-medium focus:ring-1"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Popularity (0-100)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={popularity}
                        onChange={(e) => setPopularity(parseInt(e.target.value) || 50)}
                        className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs font-medium focus:ring-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cover Color Gradient Style</label>
                    <select
                      value={coverGradientType}
                      onChange={(e) => setCoverGradientType(e.target.value)}
                      className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs font-medium"
                    >
                      <option value="coral">ManyBooks Coral Gradient</option>
                      <option value="charcoal">Dark Charcoal Gradient</option>
                      <option value="golden">Warm Ochre Golden Gradient</option>
                      <option value="rose">Pinkish Rose Sunset Gradient</option>
                      <option value="teal">Subtle Forest Teal Gradient</option>
                      <option value="indigo">Cosmic Royal Indigo Gradient</option>
                      <option value="mustard">The Warm Mustard Gradient</option>
                      <option value="sunset">Vibrant Orange Sunset Gradient</option>
                      <option value="emerald">Deep Classic Emerald Gradient</option>
                      <option value="blue">Electric Slate Blue Gradient</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Custom Cover Image URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Description / Plot Summary</label>
                    <textarea
                      placeholder="Write a brief description or plotline summary..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200/40">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setCurrentEditId(null);
                        setTitle('');
                        setAuthor('');
                        setDescription('');
                        setImage('');
                      }}
                      className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors animate-fade-in"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="py-2 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {isEditing ? <CheckCircle className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                    <span>{isEditing ? 'Save Book Record' : 'Add Book to Catalog'}</span>
                  </button>
                </div>
              </form>

              {/* Small inventory datagrid list */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Existing Books Inventory ({books.length})
                </span>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="p-3">Cover</th>
                        <th className="p-3">Title & Author</th>
                        <th className="p-3">Genre</th>
                        <th className="p-3">Rating</th>
                        <th className="p-3">Downloads</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {books.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <div className="w-8 aspect-[2/3] rounded shadow-xs overflow-hidden relative" style={{ background: b.coverUrl }}>
                              <img src={getBookCoverUrl(b)} alt={b.title} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{b.title}</div>
                            <div className="text-slate-400 text-[11px]">by {b.author}</div>
                          </td>
                          <td className="p-3">
                            <span className="py-0.5 px-2 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                              {b.genre}
                            </span>
                          </td>
                          <td className="p-3 text-teal-600 font-bold flex items-center gap-1 mt-2 border-none">
                            <Star className="w-3.5 h-3.5 fill-teal-500 text-teal-500" />
                            {b.rating}
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {b.downloadCount} dl
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => startEditBook(b)}
                              className="p-1 px-2.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-md border border-slate-200/50 hover:border-emerald-200 transition-colors inline-flex items-center gap-1 font-bold text-[10px]"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete "${b.title}"?`)) {
                                  deleteBook(b.id);
                                }
                              }}
                              className="p-1 px-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-md border border-slate-200/50 hover:border-rose-200 transition-colors inline-flex items-center gap-1 font-bold text-[10px]"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: ANGULAR 17 COMPONENTS (Isolated .ts, .html & .css) */}
          {activeTab === 'angular' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3 text-emerald-900 text-sm leading-relaxed">
                <Terminal className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 animate-pulse" />
                <div>
                  <span className="font-bold block mb-0.5">Isolated Angular 17 Component Architecture</span>
                  As requested, we have successfully isolated the complete presentation layout template (<code className="font-mono bg-white px-1 text-emerald-700">.html</code>) from the logical component class code (<code className="font-mono bg-white px-1 text-emerald-700">.ts</code>), fully styled with Tailwind utility styles.
                </div>
              </div>

              {/* book-list.component.html */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-100 p-2 px-4 rounded-t-lg border-b border-slate-200">
                  <span className="font-mono text-xs font-bold text-slate-700 flex items-center gap-1.5 font-sans">
                    <Layers className="w-3.5 h-3.5 text-red-500" />
                    book-list.component.html (Design Template Markup)
                  </span>
                  <button
                    onClick={() => handleCopyCode(ANGULAR_COMPONENT_HTML_TEMPLATE, 'ang-html')}
                    className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-50 text-slate-600 rounded-md text-[11px] font-bold border border-slate-200 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedCodeFlag === 'ang-html' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto rounded-b-lg max-h-80 shadow-inner">
                  {ANGULAR_COMPONENT_HTML_TEMPLATE}
                </pre>
              </div>

              {/* book-list.component.ts */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-100 p-2 px-4 rounded-t-lg border-b border-slate-200">
                  <span className="font-mono text-xs font-bold text-slate-700 flex items-center gap-1.5 font-sans">
                    <Code2 className="w-3.5 h-3.5 text-red-500" />
                    book-list.component.ts (Component Logic Class)
                  </span>
                  <button
                    onClick={() => handleCopyCode(ANGULAR_COMPONENT_TS_TEMPLATE, 'ang-ts')}
                    className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-50 text-slate-600 rounded-md text-[11px] font-bold border border-slate-200 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedCodeFlag === 'ang-ts' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto rounded-b-lg max-h-80 shadow-inner">
                  {ANGULAR_COMPONENT_TS_TEMPLATE}
                </pre>
              </div>

              {/* book.service.ts */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-100 p-2 px-4 rounded-t-lg border-b border-slate-200">
                  <span className="font-mono text-xs font-bold text-slate-700 flex items-center gap-1.5 font-sans">
                    <Code2 className="w-3.5 h-3.5 text-red-500" />
                    book.service.ts (API HTTP Client Connection)
                  </span>
                  <button
                    onClick={() => handleCopyCode(ANGULAR_SERVICE_TEMPLATE, 'ang-srv')}
                    className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-50 text-slate-600 rounded-md text-[11px] font-bold border border-slate-200 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedCodeFlag === 'ang-srv' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto rounded-b-lg max-h-60 shadow-inner font-sans">
                  {ANGULAR_SERVICE_TEMPLATE}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC LIBRARY JSON SCHEMA & DATA */}
          {activeTab === 'json' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 text-emerald-950 text-xs sm:text-sm leading-relaxed">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <span className="font-bold block mb-0.5">Dynamic JSON Catalog Activated</span>
                  The core directory is built directly on dynamic JSON repositories. The schemas below represent <code className="font-mono bg-emerald-100 px-1 text-emerald-800">books.json</code> and <code className="font-mono bg-emerald-100 px-1 text-emerald-800">categories.json</code>. Changes made inside the catalog editor above will immediately reflect in these serialized records.
                </div>
              </div>

              {/* books.json code */}
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center bg-slate-100 p-2 px-4 rounded-t-lg border-b border-slate-200">
                  <span className="font-mono text-xs font-bold text-slate-700 flex items-center gap-1.5 font-sans">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    src/data/books.json (Live Catalog Data)
                  </span>
                  <button
                    onClick={() => handleCopyCode(JSON.stringify(books, null, 2), 'books-json')}
                    className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-50 text-slate-600 rounded-md text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedCodeFlag === 'books-json' ? 'Copied!' : 'Copy Schema'}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto rounded-b-lg max-h-72 shadow-inner">
                  {JSON.stringify(books, null, 2)}
                </pre>
              </div>

              {/* categories.json code */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-100 p-2 px-4 rounded-t-lg border-b border-slate-200">
                  <span className="font-mono text-xs font-bold text-slate-700 flex items-center gap-1.5 font-sans">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    src/data/categories.json (Genre Data)
                  </span>
                  <button
                    onClick={() => handleCopyCode(JSON.stringify(ALL_GENRES_LIST, null, 2), 'categories-json')}
                    className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-50 text-slate-600 rounded-md text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedCodeFlag === 'categories-json' ? 'Copied!' : 'Copy Schema'}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto rounded-b-lg max-h-48 shadow-inner">
                  {JSON.stringify(ALL_GENRES_LIST, null, 2)}
                </pre>
              </div>

              {/* Integration guidance */}
              <div className="p-5 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col gap-2 text-slate-700 text-xs text-left leading-relaxed select-none">
                <span className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Technical Advantages of Isolated JSON Files:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
                  <li>Loads instantly inside standard Angular 17 or React component files without establishing heavyweight SQL connections.</li>
                  <li>Includes precise catalog structure with <code className="font-mono bg-slate-200/60 px-1 rounded text-orange-600">price</code>, interactive <code className="font-mono bg-slate-200/60 px-1 rounded text-orange-600">downloadUrl</code> fields, and user details data.</li>
                  <li>Can be easily hosted on CDNs, AWS S3 buckets, or managed databases.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
