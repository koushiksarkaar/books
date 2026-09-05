import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Send, X, Clipboard, CheckCircle, Clock, BookOpen, Sparkles, ReceiptText } from 'lucide-react';

interface EmailFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SentEmailLog {
  id: string;
  recipientEmail: string;
  username: string;
  subject: string;
  booksCount: number;
  reportFormat: string;
  sentAt: string;
}

export const EmailFavoritesModal: React.FC<EmailFavoritesModalProps> = ({ isOpen, onClose }) => {
  const { books, favoriteBookIds, currentUser, isDarkMode } = useApp();
  const [email, setEmail] = useState('');
  const [reportFormat, setReportFormat] = useState<'creative' | 'minimal' | 'table'>('creative');
  const [isSending, setIsSending] = useState(false);
  const [sendingSuccess, setSendingSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [logs, setLogs] = useState<SentEmailLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Get current user's actual favorite books
  const favoriteBooks = books.filter((b) => favoriteBookIds.includes(b.id));

  // Load sent logs for this user from the server
  const fetchLogs = () => {
    if (!currentUser) return;
    fetch(`/api/email-favorites/logs?username=${encodeURIComponent(currentUser.username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLogs(data);
        }
      })
      .catch((err) => console.error('Error fetching email report logs:', err));
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchLogs();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Generate HTML preview matching selected format
  const generateReportHtml = () => {
    const formatName = reportFormat === 'creative' ? 'Creative Editorial' : reportFormat === 'table' ? 'Detailed Sheet' : 'Classic Checklist';
    const accentColor = '#059669'; // Emerald-600
    
    let booksSectionHtml = '';
    
    if (reportFormat === 'table') {
      booksSectionHtml = `
        <table style="width:100%; border-collapse:collapse; font-family:sans-serif; margin-top:15px; font-size:13px;">
          <thead>
            <tr style="background-color:#f1f5f9; border-bottom:2px solid #e2e8f0; text-align:left;">
              <th style="padding:10px;">Book Title</th>
              <th style="padding:10px;">Author</th>
              <th style="padding:10px;">Genre</th>
              <th style="padding:10px; text-align:center;">Rating</th>
              <th style="padding:10px; text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${favoriteBooks.map(book => `
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:10px; font-weight:bold; color:#1e293b;">${book.title}</td>
                <td style="padding:10px; color:#475569;">${book.author}</td>
                <td style="padding:10px; color:#64748b;"><span style="background-color:#f8fafc; padding:3px 8px; border-radius:12px; font-size:11px;">${book.genre}</span></td>
                <td style="padding:10px; text-align:center; color:#eab308;">${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}</td>
                <td style="padding:10px; text-align:right; font-weight:bold; color:#059669;">र ${book.price !== undefined ? book.price : 9}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (reportFormat === 'minimal') {
      booksSectionHtml = `
        <ul style="list-style:none; padding:0; margin:15px 0; font-family:sans-serif;">
          ${favoriteBooks.map((book, idx) => `
            <li style="padding:12px 0; border-bottom:1px dashed #e2e8f0; font-size:14px;">
              <span style="font-weight:bold; color:#1f2937;">${idx + 1}. ${book.title}</span><br/>
              <span style="color:#4b5563; font-size:12px;">by ${book.author} | Rating: ${book.rating}/5 | Price: र ${book.price !== undefined ? book.price : 9}</span>
            </li>
          `).join('')}
        </ul>
      `;
    } else {
      // Creative format
      booksSectionHtml = `
        <div style="font-family:sans-serif;">
          ${favoriteBooks.map(book => `
            <div style="background-color:#fafafa; border:1px solid #f0f0f0; border-left:4px solid #059669; border-radius:6px; padding:15px; margin-bottom:12px; display:block;">
              <h4 style="margin:0 0 4px 0; font-size:15px; color:#0f172a; font-weight:bold;">${book.title}</h4>
              <p style="margin:0 0 8px 0; font-size:12px; color:#475569; font-weight:600;">by ${book.author}</p>
              ${book.description ? `<p style="margin:0 0 10px 0; font-size:11px; color:#64748b; line-height:1.4;">${book.description}</p>` : ''}
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:11px; background-color:#e6f4ea; color:#137333; padding:2px 8px; border-radius:12px; font-weight:bold;">${book.genre}</span>
                <span style="font-size:13px; font-weight:bold; color:#059669;">Price: र ${book.price !== undefined ? book.price : 9}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>My Personal Bookshelf Report</title>
        </head>
        <body style="background-color:#f8fafc; padding:20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#334155;">
          <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <div style="background-color:#059669; color:#ffffff; padding:25px; text-align:center;">
              <h1 style="margin:0; font-size:22px; font-weight:extrabold;">My Bookshelf</h1>
              <p style="margin:8px 0 0 0; opacity:0.9; font-size:13px;">Personalized Summary Report for ${currentUser?.username}</p>
            </div>
            <div style="padding:25px;">
              <p style="margin-top:0; font-size:14px; line-height:1.5;">Hello <strong>${currentUser?.username}</strong>,</p>
              <p style="font-size:14px; line-height:1.5;">Here is your curated list of favorite books from your bookshelf, formatted using the <strong>${formatName}</strong> template.</p>
              
              <div style="margin:20px 0;">
                ${booksSectionHtml}
              </div>

              <div style="background-color:#f8fafc; border-radius:8px; padding:15px; margin-top:25px; border:1px solid #e2e8f0; text-align:center;">
                <p style="margin:0; font-size:12px; color:#64748b; font-weight:bold;">Total Saved Favorites: ${favoriteBooks.length} books</p>
                <p style="margin:4px 0 0 0; font-size:11px; color:#94a3b8;">Generated via Custom Books Library on ${new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter an email address.');
      return;
    }
    if (favoriteBooks.length === 0) {
      setErrorMessage('No books in bookshelf to email. Add books to favorites first!');
      return;
    }

    setIsSending(true);
    setErrorMessage('');
    setSendingSuccess(false);

    try {
      const response = await fetch('/api/email-favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: email.trim(),
          username: currentUser?.username,
          reportFormat: reportFormat,
          booksCount: favoriteBooks.length,
          subject: `${currentUser?.username}'s Saved Bookshelf Summary Report`,
          htmlBody: generateReportHtml(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to dispatch report email.');
      }

      setSendingSuccess(true);
      fetchLogs();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong while sending.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div className={`w-full max-w-4xl rounded-2xl shadow-2xl border flex flex-col md:flex-row overflow-hidden max-h-[90vh] transition-all duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-150' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        
        {/* Left Side: Controller Form & Sending Details */}
        <div className={`p-6 md:w-1/2 flex flex-col gap-4 overflow-y-auto ${isDarkMode ? 'border-r border-slate-800/80' : 'border-r border-slate-100/80'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <h2 className="text-base font-black uppercase tracking-wider">Email Bookshelf Summary</h2>
            </div>
            <button 
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-950'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className={`text-xs ${isDarkMode ? 'text-slate-450' : 'text-slate-500'} leading-relaxed`}>
            Send your current curated favorites list ({favoriteBooks.length} books) to your active email as a beautifully compiled summary report.
          </p>

          {sendingSuccess ? (
            <div className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2.5 animate-scale-in my-2 ${
              isDarkMode ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-300' : 'bg-emerald-55/70 border-emerald-100 text-emerald-800'
            }`}>
              <CheckCircle className="w-10 h-10 text-emerald-500" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold">Email Summary Dispatched!</h3>
                <p className="text-[11px] leading-normal opacity-90 max-w-xs mx-auto">
                  An elegant <strong>{reportFormat}</strong> report has been successfully mailed to <strong>{email}</strong>!
                </p>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setSendingSuccess(false)}
                  className="py-1.5 px-3.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Send Another
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogs(true);
                    setSendingSuccess(false);
                  }}
                  className={`py-1.5 px-3.5 text-xs font-bold rounded-lg transition-colors border ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-850 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-150 border-slate-200/80 text-slate-650'
                  }`}
                >
                  View Logs
                </button>
              </div>
            </div>
          ) : showLogs ? (
            <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
              <div className="flex items-center justify-between border-b pb-1.5 border-slate-100/10">
                <span className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Dispacthed History Log
                </span>
                <button
                  onClick={() => setShowLogs(false)}
                  className="text-[10px] uppercase font-extrabold text-emerald-600 hover:underline"
                >
                  Back to Editor
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 max-h-[290px] pr-1">
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400 italic">
                    No emails sent yet. Generate your first bookshelf report!
                  </div>
                ) : (
                  logs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-3 rounded-lg border text-left text-xs space-y-1.5 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200/60'
                      }`}
                    >
                      <div className="flex justify-between items-start font-bold">
                        <span className="truncate max-w-[130px] font-mono">{log.recipientEmail}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          isDarkMode ? 'bg-emerald-950/45 text-emerald-300' : 'bg-emerald-100/50 text-emerald-800'
                        }`}>
                          {log.booksCount} books
                        </span>
                      </div>
                      <p className={`text-[11px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Format: <span className="font-semibold underline uppercase text-[10px]">{log.reportFormat}</span>
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-dashed border-slate-200/30">
                        <span>Success Status</span>
                        <span>{new Date(log.sentAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendReport} className="flex-1 flex flex-col gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider block">Recipient Email Address</label>
                <div className="relative">
                  <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    @
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@personal.com"
                    className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' 
                        : 'bg-slate-50 border-slate-200 text-slate-850 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider block">Select Report Template Style</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReportFormat('creative')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      reportFormat === 'creative'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 scale-102 font-black'
                        : (isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-slate-50/50 text-slate-600')
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mx-auto mb-1 opacity-90" />
                    <span className="text-[10px] font-black uppercase block">Editorial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportFormat('minimal')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      reportFormat === 'minimal'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 scale-102 font-black'
                        : (isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-slate-50/50 text-slate-600')
                    }`}
                  >
                    <ReceiptText className="w-4 h-4 mx-auto mb-1 opacity-90" />
                    <span className="text-[10px] font-black uppercase block">Minimal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportFormat('table')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      reportFormat === 'table'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 scale-102 font-black'
                        : (isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-slate-50/50 text-slate-600')
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mx-auto mb-1 opacity-90" />
                    <span className="text-[10px] font-black uppercase block">Detailed</span>
                  </button>
                </div>
              </div>

              {errorMessage && (
                <p className="text-red-500 text-xs font-semibold">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isSending || favoriteBooks.length === 0}
                className={`py-2.5 w-full rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  favoriteBooks.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-50'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-[0.99]'
                }`}
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending Report...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Curated Email Report
                  </>
                )}
              </button>

              <div className="flex justify-between items-center text-[10px] text-slate-450 border-t pt-2 border-slate-100/10">
                <button
                  type="button"
                  onClick={() => setShowLogs(true)}
                  className="hover:underline flex items-center gap-1 hover:text-emerald-500 font-bold"
                >
                  <Clock className="w-3 h-3" /> Sent History
                </button>
                <div className="flex items-center gap-1 italic">
                  <span>Bookshelf matches '{currentUser?.username}'</span>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Live Visual HTML Email Preview Panel */}
        <div className={`p-6 md:w-1/2 flex flex-col gap-3 h-[420px] md:h-auto ${isDarkMode ? 'bg-[#0b0f19]' : 'bg-slate-50'}`}>
          <div className="flex justify-between items-center pb-2 border-b border-slate-150/10">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Live Compiled Mail Preview
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-slate-200/50 text-slate-600">
              HTML Output
            </span>
          </div>

          {favoriteBooks.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-xs text-slate-400 gap-2.5">
              <BookOpen className="w-8 h-8 opacity-40 animate-pulse" />
              <span>Your favorites list is empty. Heart some items from the grid to generate a custom book-report preview!</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto border border-slate-200/70 rounded-xl bg-white shadow-inner flex flex-col">
              {/* Mock outer Chrome */}
              <div className="bg-slate-90/50 border-b border-slate-250 p-2.5 flex flex-col gap-1 text-[11px] font-sans text-slate-600">
                <div><span className="font-semibold text-slate-400">From:</span> bookshelf@bookslibrary.org</div>
                <div><span className="font-semibold text-slate-400">To:</span> {email || '(Enter recipient address)'}</div>
                <div><span className="font-semibold text-slate-400">Subject:</span> {currentUser?.username}'s Curated Bookshelf Report</div>
              </div>
              
              <div className="flex-1 p-4 bg-slate-100/50 overflow-y-auto">
                <style>
                  {`
                    .preview-frame h4 { margin:0 0 4px 0; font-size:15px; color:#0f172a; font-weight:bold; }
                    .preview-frame p { margin:0 0 8px 0; font-size:11px; }
                  `}
                </style>
                <div 
                  className="bg-white border rounded-lg shadow-sm overflow-hidden style-all preview-frame text-left"
                  dangerouslySetInnerHTML={{ __html: generateReportHtml() }}
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
