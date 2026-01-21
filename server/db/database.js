// Database connection configuration
const { Pool } = require('pg');


// Create connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }  // Always use SSL for Render
});



// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});


pool.on('error', (err) => {
    console.error('❌ Database error:', err);
});


// Export an object with a query method (so auth.js can use db.query())
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool  // Also export pool in case other routes use it directly
};
