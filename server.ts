import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

const USERS_FILE = path.join(process.cwd(), 'src', 'data', 'users.json');
const FAVORITES_FILE = path.join(process.cwd(), 'src', 'data', 'favorites.json');
const EMAILS_FILE = path.join(process.cwd(), 'src', 'data', 'sent_emails.json');

// Ensure data files exist
function initDataFiles() {
  const dir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
      { username: 'John Doe', mobileNumber: '1234567890' },
      { username: 'Jane Austen', mobileNumber: '9876543210' },
      { username: 'Admin User', mobileNumber: '0000000000' },
      { username: 'adminuser', mobileNumber: '4321' }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf-8');
  }

  if (!fs.existsSync(FAVORITES_FILE)) {
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  if (!fs.existsSync(EMAILS_FILE)) {
    fs.writeFileSync(EMAILS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Read JSON helper
function readJSON(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

// Write JSON helper
function writeJSON(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// Initialize files on startup
initDataFiles();

// --- API ENDPOINTS ---

// GET: Server health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET: All persistent users
app.get('/api/users', (req, res) => {
  const users = readJSON(USERS_FILE) || [];
  res.json(users);
});

// POST: Register user
app.post('/api/users/register', (req, res) => {
  const { username, mobileNumber } = req.body;
  if (!username || !mobileNumber) {
    return res.status(400).json({ error: 'Username and mobile number are required.' });
  }

  const users = readJSON(USERS_FILE) || [];
  const exists = users.some((u: any) => u.mobileNumber === mobileNumber);
  
  if (exists) {
    return res.status(400).json({ error: 'A user with this mobile number already exists.' });
  }

  const newUser = { username: username.trim(), mobileNumber: mobileNumber.trim() };
  users.push(newUser);
  writeJSON(USERS_FILE, users);

  res.status(201).json(newUser);
});

// POST: Login user validation
app.post('/api/users/login', (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) {
    return res.status(400).json({ error: 'Mobile number is required.' });
  }

  const users = readJSON(USERS_FILE) || [];
  const user = users.find((u: any) => u.mobileNumber === mobileNumber);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'No user registered with this mobile number.' });
  }
});

// GET: Favorites for a user (by username)
app.get('/api/favorites', (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const favorites = readJSON(FAVORITES_FILE) || [];
  // Filter favorites where username matches
  const userFavorites = favorites.filter((fav: any) => fav.username === username);
  res.json(userFavorites);
});

// POST: Toggle favorite status for a user
// Requires username, bookId, and bookName
app.post('/api/favorites/toggle', (req, res) => {
  const { username, bookId, bookName } = req.body;
  if (!username || !bookId) {
    return res.status(400).json({ error: 'Username and bookId are required.' });
  }

  const favorites = readJSON(FAVORITES_FILE) || [];
  
  // Check if it already exists
  const index = favorites.findIndex(
    (fav: any) => fav.username === username && fav.bookId === bookId
  );

  if (index !== -1) {
    // Remove if exists
    favorites.splice(index, 1);
  } else {
    // Add if not exists
    favorites.push({
      username,
      bookId,
      bookName: bookName || 'Unknown Book'
    });
  }

  writeJSON(FAVORITES_FILE, favorites);
  
  // Return the updated favorites list for this user
  const userFavorites = favorites.filter((fav: any) => fav.username === username);
  res.json(userFavorites);
});

// POST: Toggle wishlist status for a user stored in their user profile JSON
app.post('/api/wishlist/toggle', (req, res) => {
  const { username, bookId } = req.body;
  if (!username || !bookId) {
    return res.status(400).json({ error: 'Username and bookId are required.' });
  }

  const users = readJSON(USERS_FILE) || [];
  const userIndex = users.findIndex((u: any) => u.username === username);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  const user = users[userIndex];
  if (!user.wishlist) {
    user.wishlist = [];
  }

  const wishIndex = user.wishlist.indexOf(bookId);
  if (wishIndex !== -1) {
    // Remove if exists
    user.wishlist.splice(wishIndex, 1);
  } else {
    // Add if does not exist
    user.wishlist.push(bookId);
  }

  writeJSON(USERS_FILE, users);

  // Return the updated user object containing the updated wishlist
  res.json(user);
});

// POST: Add a book to recently viewed for a user (tracks last 5 unique books, latest first)
app.post('/api/recently-viewed/add', (req, res) => {
  const { username, bookId } = req.body;
  if (!username || !bookId) {
    return res.status(400).json({ error: 'Username and bookId are required.' });
  }

  const users = readJSON(USERS_FILE) || [];
  const userIndex = users.findIndex((u: any) => u.username === username);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  const user = users[userIndex];
  if (!user.recentlyViewed) {
    user.recentlyViewed = [];
  }

  // Remove if already exists so we can move it to the front
  const index = user.recentlyViewed.indexOf(bookId);
  if (index !== -1) {
    user.recentlyViewed.splice(index, 1);
  }

  // Add at the beginning of the list
  user.recentlyViewed.unshift(bookId);

  // Limit to last 5
  if (user.recentlyViewed.length > 5) {
    user.recentlyViewed = user.recentlyViewed.slice(0, 5);
  }

  writeJSON(USERS_FILE, users);

  res.json(user);
});

// GET: Sent email report logs for a specific user
app.get('/api/email-favorites/logs', (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const emails = readJSON(EMAILS_FILE) || [];
  const userEmails = emails
    .filter((emailObj: any) => emailObj.username === username)
    .sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()); // Latest first
    
  res.json(userEmails);
});

// POST: Simulate or generate dispatched email report
app.post('/api/email-favorites', (req, res) => {
  const { recipientEmail, username, reportFormat, booksCount, subject, htmlBody } = req.body;
  
  if (!recipientEmail || !username) {
    return res.status(400).json({ error: 'Recipient email and username are required.' });
  }

  // Construct structured persistent log entry
  const emailsList = readJSON(EMAILS_FILE) || [];
  const logEntry = {
    id: 'em_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    recipientEmail: recipientEmail.trim(),
    username: username.trim(),
    subject: subject || ' Curated Bookshelf Report',
    booksCount: booksCount || 0,
    reportFormat: reportFormat || 'creative',
    htmlBody: htmlBody || '',
    sentAt: new Date().toISOString()
  };

  emailsList.push(logEntry);
  writeJSON(EMAILS_FILE, emailsList);

  // Return successful response indicating email was dispatched
  res.status(200).json({
    success: true,
    message: 'Bookshelf email report compiled, personalized and successfully simulated-sent!',
    log: {
      id: logEntry.id,
      recipientEmail: logEntry.recipientEmail,
      username: logEntry.username,
      booksCount: logEntry.booksCount,
      reportFormat: logEntry.reportFormat,
      sentAt: logEntry.sentAt
    }
  });
});

// Setup Vite Dev Server / Static production assets
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server listening on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
