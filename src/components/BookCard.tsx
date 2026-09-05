import React, { useState } from 'react';
import { Book } from '../types';
import { useApp } from '../context/AppContext';
import { downloadBookPdf } from '../services/pdfGenerator';
import { Star, Download, BookOpen, CheckCircle, ShieldCheck, QrCode, Clipboard, AlertCircle, X, Heart, ArrowLeft, Share2, Twitter, Bookmark } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { theme, updateBook, isDarkMode, favoriteBookIds, toggleFavoriteBook, wishlistBookIds, toggleWishlistBook, addRecentlyViewedBook } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [downloadSuccessFlag, setDownloadSuccessFlag] = useState(false);

  const handleOpenDetails = () => {
    addRecentlyViewedBook(book.id);
    setShowDetailDialog(true);
  };

  const isFavorited = favoriteBookIds.includes(book.id);
  const isWishlisted = wishlistBookIds.includes(book.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteBook(book.id);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlistBook(book.id);
    if (isWishlisted) {
      triggerToast(`Removed "${book.title}" from your wishlist.`);
    } else {
      triggerToast(`📚 Added "${book.title}" to your wishlist for later reading!`);
    }
  };
  
  // Custom QR Download states
  const [showQrModal, setShowQrModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const triggerDownloadRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQrScanned(false);
    setShowQrModal(true);
  };

  const executeActualDownload = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      
      // Trigger the standard browser PDF generation and download
      downloadBookPdf(book.title, book.author);

      // Increment local download count state
      updateBook(book.id, { downloadCount: book.downloadCount + 1 });
      
      // Complete confirmation
      setTimeout(() => {
        setVerificationSuccess(false);
        setShowQrModal(false);
        // Also close detail dialog if it was open
        setShowDetailDialog(false);
        
        setDownloadSuccessFlag(true);
        setTimeout(() => {
          setDownloadSuccessFlag(false);
        }, 2500);
      }, 1500);
    }, 1200);
  };

  return (
    <div
      id={`book-wrapper-${book.id}`}
      className="relative flex flex-col group transition-all duration-300 rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Book Cover representation with custom gradient */}
      <div
        id={`book-cover-container-${book.id}`}
        className="w-full aspect-[2/3] rounded-lg shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 cursor-pointer relative bg-slate-900 border border-slate-200/40 select-none"
        onClick={() => setShowDetailDialog(true)}
      >
        {/* Book cover visual content: gradient background with styled book title */}
        <div
          className="w-full h-full flex flex-col justify-between p-4 text-white relative"
          style={{ background: book.coverUrl }}
        >
          {/* Cover Header */}
          <div className="flex justify-between items-center gap-1 z-30 relative">
            <span className="text-[9px] uppercase tracking-wider bg-black/50 backdrop-blur-xs py-1 px-2 rounded-full font-bold">
              {book.genre}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-white/90 font-bold bg-emerald-600/80 px-1.5 py-0.5 rounded shadow-sm">
                र {book.price !== undefined ? book.price : 9}
              </span>
              <button
                onClick={handleToggleFavorite}
                className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-sm ${
                  isFavorited 
                    ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105' 
                    : 'bg-black/40 hover:bg-black/60 text-white hover:scale-105'
                }`}
                title={isFavorited ? 'Remove from bookshelf' : 'Add to bookshelf'}
                id={`btn-fav-cover-${book.id}`}
              >
                <Heart className={`w-3 h-3 ${isFavorited ? 'fill-white' : ''}`} />
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-sm ${
                  isWishlisted 
                    ? 'bg-amber-500 text-white hover:bg-amber-600 scale-105' 
                    : 'bg-black/40 hover:bg-black/60 text-white hover:scale-105'
                }`}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                id={`btn-wish-cover-${book.id}`}
              >
                <Bookmark className={`w-3 h-3 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Cover Decorative center SVG */}
          <div className="my-auto flex flex-col items-center justify-center opacity-65 group-hover:opacity-90 transition-all duration-300">
            <BookOpen className="w-12 h-12 stroke-[1.2] drop-shadow-md transform group-hover:rotate-6 transition-transform" />
          </div>

          {/* Cover Footer text */}
          <div className="space-y-1 bg-black/20 p-2 rounded-md backdrop-blur-xs">
            <h4 className="font-serif font-black text-sm leading-tight line-clamp-2 drop-shadow-md text-left">
              {book.title}
            </h4>
            <p className="text-[10px] text-white/90 font-medium truncate text-left">
              {book.author}
            </p>
          </div>
        </div>

        {/* Dynamic Hover Download Overlay */}
        {isHovered && (
          <div 
            id={`hover-popup-overlay-${book.id}`}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-2.5 transition-all duration-200 animate-fade-in z-20"
          >
            {/* White floating dialog */}
            <div 
              className="bg-white rounded-xl shadow-2xl p-4 w-full flex flex-col justify-between gap-3 text-slate-800 scale-95 hover:scale-100 transition-transform duration-200 border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-left">
                <h5 className="font-sans font-bold text-sm text-emerald-600 truncate leading-snug" title={book.title}>
                  {book.title}
                </h5>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  by {book.author}
                </p>
              </div>

              {/* Book quick rating and price info in hover popup */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < book.rating 
                          ? 'fill-teal-500 text-teal-500' 
                          : 'fill-slate-100 text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-slate-400 font-bold ml-1">
                    ({book.downloadCount})
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 font-mono">
                  र {book.price !== undefined ? book.price : 9}
                </span>
              </div>

              <div className="space-y-2">
                {/* Download PDF button that triggers the QR scanning popup */}
                <button
                  id={`btn-download-${book.id}`}
                  onClick={triggerDownloadRequest}
                  className="w-full py-2 bg-mustard-500 hover:bg-mustard-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {downloadSuccessFlag ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Downloaded!
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      Download Link
                    </>
                  )}
                </button>

                {/* Read more button link (mustard text) */}
                <button
                  onClick={() => setShowDetailDialog(true)}
                  className="w-full text-center text-xs text-mustard-600 hover:text-mustard-700 font-bold hover:underline py-1 block"
                >
                  Read details
                </button>

                {/* Quick Share Layout on card Hover */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1 select-none">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Quick Share</span>
                  <div className="flex gap-1.5">
                    {/* Share on Twitter/X */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this book: "${book.title}" by ${book.author}! 📖📚 Check details on PDF Books Store.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-100/40 transition-colors"
                      title="Share to Twitter / X"
                      id={`share-twitter-hover-${book.id}`}
                    >
                      <Twitter className="w-3 h-3 fill-current" />
                    </a>
                    {/* Share on WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this exciting book: "${book.title}" by ${book.author}! 📖📚`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md bg-mustard-50 text-mustard-600 hover:bg-mustard-100 border border-mustard-100/40 transition-colors flex items-center justify-center"
                      title="Share to WhatsApp"
                      id={`share-whatsapp-hover-${book.id}`}
                    >
                      <svg className="w-3 h-3 fill-mustard-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.457h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Text elements below grid cover */}
      <div className="mt-2.5 space-y-1 select-none text-left font-sans">
        <h3 
          onClick={() => setShowDetailDialog(true)}
          className={`font-sans font-bold text-sm transition-colors line-clamp-1 cursor-pointer leading-tight ${
            isDarkMode ? 'text-slate-100 hover:text-mustard-400' : 'text-slate-800 hover:text-mustard-600'
          }`}
        >
          {book.title}
        </h3>
        <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          by <span className="font-medium underline decoration-slate-300/40">{book.author}</span>
        </p>
        {book.description && (
          <p className={`text-[11px] line-clamp-2 leading-relaxed min-h-[32px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {book.description}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < book.rating 
                    ? 'fill-teal-500 text-teal-500' 
                    : (isDarkMode ? 'fill-slate-700 text-slate-750' : 'fill-slate-100 text-slate-200')
                }`}
              />
            ))}
          </div>
          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded leading-none font-mono tracking-tight border ${
            isDarkMode 
              ? 'text-teal-400 bg-teal-950/40 border-teal-900/50' 
              : 'text-rose-600 bg-rose-50 border-rose-100/50'
          }`}>
            र {book.price !== undefined ? book.price : 9}
          </span>
        </div>
      </div>

      {/* Immersive Read More popup dialog/modal */}
      {showDetailDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-slate-800">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-slate-100 flex flex-col md:flex-row">
            
            {/* Left Cover block in modal */}
            <div 
              className="w-full md:w-[220px] shrink-0 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100"
              style={{ background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)' }}
            >
              <div 
                className="w-36 aspect-[2/3] rounded-lg shadow-lg overflow-hidden text-white flex flex-col justify-between p-3"
                style={{ background: book.coverUrl }}
              >
                <span className="text-[8px] bg-black/25 px-2 py-0.5 rounded-full font-bold self-start">{book.genre}</span>
                <BookOpen className="w-10 h-10 stroke-[1.2] opacity-70 mx-auto" />
                <div className="bg-black/25 p-1 rounded-sm text-center">
                  <h4 className="font-serif font-black text-xs leading-none">{book.title}</h4>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-bold mt-4 bg-slate-100 py-1 px-2.5 rounded-full">
                Popularity: {book.popularity}%
              </span>
            </div>

            {/* Right Information Details block in modal */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="text-left">
                <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{book.genre}</span>
                <h3 className="text-xl font-sans font-black text-slate-800 leading-tight mt-1 mb-1">{book.title}</h3>
                <p className="text-sm font-medium text-slate-500 mb-3">by {book.author}</p>
                
                {/* Price and Ratings */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <div className="flex items-center gap-1 bg-slate-50 py-1 px-2 rounded-lg border border-slate-100">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 i-3 ${
                            i < book.rating 
                              ? 'fill-teal-500 text-teal-500' 
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 ml-1">({book.rating})</span>
                  </div>

                  <span className="text-xs font-bold text-rose-650 bg-rose-50 border border-rose-100 py-1 px-2.5 rounded-lg font-sans">
                    Price: र {book.price !== undefined ? book.price : 9}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed max-h-[140px] overflow-y-auto pr-1">
                  {book.description || 'This book features an intriguing and customizable plotline. Managed fully by category and item list JSON files, you can alter book summaries, download links, and catalog details anytime.'}
                </p>

                {/* Social Sharing Section */}
                <div className="mt-4 pt-3.5 border-t border-slate-100/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5 select-none">
                    <Share2 className="w-3 h-3 text-teal-600 animate-pulse" />
                    Share Book Details
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {/* Share on Twitter/X */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this book: "${book.title}" by ${book.author}! 📖📚 Check details on PDF Books Store.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800 border border-sky-100/45 transition-all duration-200 cursor-pointer"
                      title="Share to Twitter / X"
                      id={`share-twitter-detail-${book.id}`}
                    >
                      <Twitter className="w-3 h-3 text-sky-500 fill-current" />
                      Twitter / X
                    </a>

                    {/* Share on WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this exciting book: "${book.title}" by ${book.author}! 📖📚 Check details on PDF Books Store.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-100/45 transition-all duration-200 cursor-pointer"
                      title="Share to WhatsApp"
                      id={`share-whatsapp-detail-${book.id}`}
                    >
                      <svg className="w-3 h-3 fill-emerald-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.457h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp
                    </a>

                    {/* Copy Info Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`Book Description: "${book.title}" by ${book.author}`);
                        triggerToast("📋 Copied book details to clipboard!");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 transition-all duration-200 cursor-pointer"
                      title="Copy book details to clipboard"
                      id={`share-copy-detail-${book.id}`}
                    >
                      <Clipboard className="w-3.5 h-3.5 text-slate-400" />
                      Copy Info
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-slate-400 font-mono">
                  Downloads: <span className="text-slate-700 font-bold font-sans">{book.downloadCount}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDetailDialog(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    id={`back-to-list-detail-${book.id}`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                    Back to Book Card List Screen
                  </button>
                  <button
                    onClick={triggerDownloadRequest}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    id={`download-from-detail-${book.id}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Link
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* NEW POPUP: Scan QR to Download the Book PDF */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fade-in text-slate-800">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100 text-center flex flex-col gap-4">
            
            {/* Highly Prominent Close Button on Top-Right */}
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 cursor-pointer transition-all duration-200 shadow-xs hover:scale-105 z-50 flex items-center justify-center"
              title="Close Scan Dialogue"
              id="close-qr-scanner-btn"
            >
              <X className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            {/* Modal Header */}
            <div className="pt-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                <QrCode className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-black text-slate-800 leading-tight">🔒 Scan QR to Download</h3>
              <p className="text-xs text-slate-405 font-semibold mt-1">
                Please scan the payment QR code below to complete authorization for:
              </p>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs font-semibold mt-2.5 font-sans flex flex-col gap-0.5 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Book Name:</span>
                  <span className="text-slate-800 truncate font-black w-[200px] text-right">{book.title}</span>
                </div>
                <span className="h-px bg-slate-200/50 my-1"></span>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Purchase Price:</span>
                  <span className="text-teal-600 font-extrabold">र {book.price !== undefined ? book.price : 9}</span>
                </div>
                <span className="h-px bg-slate-200/50 my-1"></span>
                <div className="flex justify-between leading-tight items-start">
                  <span className="text-slate-400 font-medium">Verify URL:</span>
                  <span className="font-mono text-[10px] text-emerald-600 break-all text-right w-[180px]">{book.downloadUrl}</span>
                </div>
              </div>
            </div>

            {/* HIGH FIDELITY RENDER OF THE USER'S UPLOADED QR IMAGE */}
            <div 
              onClick={() => {
                if (!qrScanned) {
                  setQrScanned(true);
                  triggerToast("📸 Success: QR scanner has validated your transaction proof!");
                } else {
                  // Already scanned! Trigger local verification & download
                  executeActualDownload();
                  triggerToast("📥 Confirming Scan & downloading Book PDF...");
                }
              }}
              className={`relative py-3.5 px-2 rounded-xl border transition-all duration-300 cursor-pointer group select-none ${
                qrScanned 
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-xs' 
                  : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80 hover:border-teal-400/60'
              }`}
              title="Click here to simulate QR scanner contact!"
            >
              <span className="absolute top-1.5 left-2.5 text-[8px] bg-slate-200 text-slate-500 tracking-wider font-extrabold uppercase py-0.5 px-2 rounded-full leading-none z-10 font-sans">
                QR Scanner Source
              </span>
              <span className="absolute top-1.5 right-2.5 text-[9px] bg-teal-500 text-white tracking-wider font-extrabold uppercase py-0.5 px-2 rounded-full leading-none z-10 font-mono shadow-xs">
                र {book.price !== undefined ? book.price : 9}
              </span>
              
              <div className="relative inline-block">
                <svg viewBox="0 0 100 100" className="w-44 h-44 mx-auto border-4 border-slate-100 p-2 rounded-xl bg-white shadow-xs transition-transform duration-200 group-hover:scale-102">
                  {/* Outer positioning boxes (matching real QR codes) */}
                  {/* Top Left */}
                  <rect x="5" y="5" width="22" height="22" fill="black" />
                  <rect x="9" y="9" width="14" height="14" fill="white" />
                  <rect x="12" y="12" width="8" height="8" fill="black" />
                  {/* Top Right */}
                  <rect x="73" y="5" width="22" height="22" fill="black" />
                  <rect x="77" y="9" width="14" height="14" fill="white" />
                  <rect x="80" y="12" width="8" height="8" fill="black" />
                  {/* Bottom Left */}
                  <rect x="5" y="73" width="22" height="22" fill="black" />
                  <rect x="9" y="77" width="14" height="14" fill="white" />
                  <rect x="12" y="80" width="8" height="8" fill="black" />
                  
                  {/* QR Code matrix patterns resembling user's Amazon Pay QR */}
                  <rect x="32" y="5" width="6" height="6" fill="black" />
                  <rect x="42" y="5" width="6" height="4" fill="black" />
                  <rect x="52" y="8" width="4" height="4" fill="black" />
                  <rect x="62" y="5" width="6" height="8" fill="black" />
                  
                  <rect x="32" y="15" width="4" height="4" fill="black" />
                  <rect x="44" y="12" width="8" height="4" fill="black" />
                  <rect x="58" y="16" width="6" height="6" fill="black" />
                  
                  <rect x="5" y="32" width="10" height="4" fill="black" />
                  <rect x="22" y="32" width="6" height="6" fill="black" />
                  <rect x="36" y="28" width="8" height="6" fill="black" />
                  <rect x="50" y="32" width="6" height="4" fill="black" />
                  <rect x="64" y="28" width="10" height="6" fill="black" />
                  <rect x="78" y="32" width="16" height="4" fill="black" />
                  
                  <rect x="10" y="44" width="8" height="6" fill="black" />
                  <rect x="24" y="44" width="4" height="8" fill="black" />
                  <rect x="32" y="40" width="10" height="4" fill="black" />
                  <rect x="68" y="44" width="6" height="6" fill="black" />
                  <rect x="80" y="40" width="12" height="8" fill="black" />
                  
                  <rect x="5" y="56" width="14" height="4" fill="black" />
                  <rect x="24" y="56" width="6" height="6" fill="black" />
                  <rect x="36" y="52" width="8" height="4" fill="black" />
                  <rect x="60" y="56" width="8" height="8" fill="black" />
                  <rect x="74" y="52" width="4" height="10" fill="gray" />
                  <rect x="84" y="56" width="10" height="4" fill="black" />
                  
                  <rect x="32" y="68" width="6" height="6" fill="black" />
                  <rect x="44" y="64" width="8" height="4" fill="black" />
                  <rect x="58" y="68" width="8" height="6" fill="black" />
                  <rect x="32" y="78" width="12" height="4" fill="black" />
                  <rect x="50" y="76" width="12" height="6" fill="black" />
                  <rect x="68" y="78" width="4" height="12" fill="black" />
                  <rect x="76" y="84" width="16" height="10" fill="black" />
                  
                  {/* Center Circle overlay with "pay" text in Amazon pay format */}
                  <circle cx="50" cy="50" r="14" fill="white" />
                  <circle cx="50" cy="50" r="11" fill="#2d3748" />
                  <text x="50" y="49" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="900" fill="white" textAnchor="middle">pay</text>
                  {/* Amazon curved smile shape */}
                  <path d="M 44 51.5 Q 50 55.5 56 51.5" stroke="#f97316" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                  {/* Arrow arrow-head on the right */}
                  <path d="M 54.5 51.8 L 56 51.5 L 56.4 52.8" stroke="#f97316" strokeWidth="1.1" fill="none" strokeLinecap="round" />
                </svg>

                {qrScanned && (
                  <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] rounded-2xl flex items-center justify-center animate-scale-in">
                    <div className="bg-emerald-600 text-white rounded-full p-2.5 shadow-md flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                  </div>
                )}
              </div>

              {/* Status and instructions label below QR */}
              <div className="mt-2 flex flex-col items-center justify-center gap-1">
                {qrScanned ? (
                  <span className="text-[11px] font-bold text-emerald-605 bg-emerald-50 border border-emerald-250/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    QR Scanned successfully!
                  </span>
                ) : (
                  <span className="text-[11px] font-extrabold text-teal-605 bg-teal-50 border border-teal-200/50 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                    📸 Click QR to mock scan code
                  </span>
                )}
                
                {/* Specific Label requested by user */}
                <span className="text-[10px] text-slate-500 font-bold tracking-tight mt-1 bg-slate-100/60 px-2 py-0.5 rounded border border-slate-200/40">
                  Once scanned, click on QR image to download
                </span>
              </div>
            </div>

            {/* Actions block */}
            <div className="flex flex-col gap-2">
              {isVerifying ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-200"
                >
                  <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                  Verifying Transaction Proof...
                </button>
              ) : verificationSuccess ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-emerald-100"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Successfully Scanned! Downloading PDF...
                </button>
              ) : (
                <button
                  onClick={executeActualDownload}
                  disabled={!qrScanned}
                  className={`w-full py-2.5 text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-98 ${
                    qrScanned
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer hover:shadow-lg'
                      : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                  }`}
                  title={!qrScanned ? 'Please click the QR above to scan before downloading' : 'Confirm scan and trigger download'}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-550" />
                  I have Scanned QR - Confirm & Download
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => setShowQrModal(false)}
                  className="py-2.5 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  id="back-to-details-qr-btn"
                  title="Return to Book Details Description"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-550" />
                  Back to Details
                </button>
                <button
                  onClick={() => {
                    setShowQrModal(false);
                    setShowDetailDialog(false);
                  }}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  id="back-to-book-list-qr-btn"
                  title="Close and return back to the book card list screen"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600 font-extrabold animate-pulse" />
                  Back to Books
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-1 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Secure 256-Bit SSL Scanned Download Pipeline</span>
            </div>

          </div>
        </div>
      )}

      {/* Subtle floating overlay toast message */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-black border border-slate-700 animate-fade-in select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
