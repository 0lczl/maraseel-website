-- Maraseel Shipping Database Schema
-- This creates all the tables your website needs

-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. SHIPMENTS TABLE
-- Stores all shipment/package information
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'Processing',
    origin_city VARCHAR(100),
    origin_country VARCHAR(100),
    destination_city VARCHAR(100),
    destination_country VARCHAR(100),
    weight DECIMAL(10,2),
    sender_name VARCHAR(100),
    sender_phone VARCHAR(20),
    recipient_name VARCHAR(100),
    recipient_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CONTACTS TABLE
-- Stores messages from contact form
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. QUOTES TABLE
-- Stores shipping quote requests
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    shipment_type VARCHAR(50),
    estimated_price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. USERS TABLE
-- For admin login (future feature)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO shipments (
    tracking_number, status, 
    origin_city, origin_country, 
    destination_city, destination_country, 
    weight, sender_name, recipient_name
) VALUES 
    ('MRS-2024-001234', 'In Transit', 'Riyadh', 'Saudi Arabia', 'Dubai', 'UAE', 5.5, 'Ahmed Ali', 'Mohammed Omer'),
    ('MRS-2024-001235', 'Delivered', 'Jeddah', 'Saudi Arabia', 'Cairo', 'Egypt', 3.2, 'Sara Ahmed', 'Fatima Omer'),
    ('MRS-2024-001236', 'Processing', 'Dammam', 'Saudi Arabia', 'London', 'UK', 10.0, 'Ali Khan', 'Hassan is the best');

-- Create indexes for faster searches
CREATE INDEX idx_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_quotes_email ON quotes(email);

-- Success message
SELECT 'Database schema created successfully!' AS message;
