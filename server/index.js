// Maraseel Shipping Backend Server
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT: Middleware order matters!
// 1. CORS first
app.use(cors());

// 2. Body parsing middleware BEFORE routes (THIS IS CRITICAL)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// 4. Static files
app.use(express.static(path.join(__dirname, '../public')));

// 5. Import API routes
const trackingRoutes = require('./routes/tracking');
const contactRoutes = require('./routes/contact');
const quotesRoutes = require('./routes/quotes');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// 6. Setup API endpoints
app.use('/api/tracking', trackingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// 7. Start the server
app.listen(PORT, () => {
    console.log(`✅ Maraseel server running on http://localhost:${PORT}`);
});
