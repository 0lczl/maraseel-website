// Quote request API - calculates shipping price
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/quotes
// Body: { name, email, origin, destination, weight, shipmentType }
router.post('/', async (req, res) => {
    try {
        const { name, email, origin, destination, weight, shipmentType } = req.body;
        
        // Validate required fields
        if (!name || !email || !origin || !destination || !weight) {
            return res.status(400).json({ 
                error: 'All fields are required' 
            });
        }
        
        // Simple price calculation
        // Customize this based on your pricing model
        const basePrice = 50;  // Base shipping fee (SAR)
        const pricePerKg = 15;  // Price per kilogram (SAR)
        
        // Calculate based on weight
        let estimatedPrice = basePrice + (parseFloat(weight) * pricePerKg);
        
        // Adjust by shipment type
        if (shipmentType === 'express') {
            estimatedPrice *= 1.5;  // Express is 50% more
        } else if (shipmentType === 'economy') {
            estimatedPrice *= 0.8;  // Economy is 20% less
        }
        
        // Round to 2 decimals
        estimatedPrice = Math.round(estimatedPrice * 100) / 100;
        
        // Save to database
        await db.query(
            `INSERT INTO quotes 
             (name, email, origin, destination, weight, shipment_type, estimated_price) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [name, email, origin, destination, weight, shipmentType, estimatedPrice]
        );
        
        // Return quote
        res.json({
            success: true,
            estimatedPrice: estimatedPrice,
            currency: 'SAR',
            message: `Quote generated! Estimated cost: ${estimatedPrice} SAR`
        });
        
    } catch (error) {
        console.error('Quote error:', error);
        res.status(500).json({ 
            error: 'Server error. Please try again later.' 
        });
    }
});

module.exports = router;
