// Contact form API - saves messages
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/contact
// Body: { name, email, phone, message }
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ 
                error: 'Name, email, and message are required' 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }
        
        // Save to database
        await db.query(
            'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4)',
            [name, email, phone || null, message]
        );
        
        // Success response
        res.json({
            success: true,
            message: 'Thank you! We received your message and will contact you soon.'
        });
        
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            error: 'Server error. Please try again later.' 
        });
    }
});

module.exports = router;
