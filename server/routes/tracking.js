// Tracking API - looks up shipments
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/tracking
// Body: { trackingNumber: "MRS-2024-001234" }
router.post('/', async (req, res) => {
    try {
        const { trackingNumber } = req.body;
        
        // Validate input
        if (!trackingNumber) {
            return res.status(400).json({ 
                error: 'Tracking number is required' 
            });
        }
        
        // Query database
        const result = await db.query(
            'SELECT * FROM shipments WHERE tracking_number = $1',
            [trackingNumber]
        );
        
        // Check if found
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Shipment not found. Please check your tracking number.' 
            });
        }
        
        // Return shipment data
        res.json({
            success: true,
            shipment: result.rows[0]
        });
        
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ 
            error: 'Server error. Please try again later.' 
        });
    }
});

module.exports = router;
