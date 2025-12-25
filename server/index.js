// Maraseel Shipping Backend Server
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - processes incoming requests
app.use(cors());  // Allow frontend to call backend
app.use(express.json());  // Parse JSON from forms
app.use(express.static(path.join(__dirname, '../public')));  // Serve frontend files

// Import API routes (we'll create these next)
const trackingRoutes = require('./routes/tracking');
const contactRoutes = require('./routes/contact');
const quotesRoutes = require('./routes/quotes');

// Setup API endpoints
app.use('/api/tracking', trackingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/quotes', quotesRoutes);

// Serve frontend for all other URLs (Express 5 compatible)
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
  

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Maraseel server running on http://localhost:${PORT}`);
});
