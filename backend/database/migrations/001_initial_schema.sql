-- Initial Database Schema
-- Creates the basic tables for the Epitychia clipboard manager

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    firebase_uid VARCHAR(255) UNIQUE,
    preferences JSONB DEFAULT '{
        "enableNotifications": true,
        "autoSync": true,
        "maxHistoryItems": 100,
        "enableAI": true
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clipboard_items table
CREATE TABLE IF NOT EXISTS clipboard_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    metadata JSONB DEFAULT '{}'::jsonb,
    entities JSONB DEFAULT '[]'::jsonb,
    suggestions JSONB DEFAULT '[]'::jsonb,
    device_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_clipboard_items_user_id ON clipboard_items(user_id);
CREATE INDEX IF NOT EXISTS idx_clipboard_items_created_at ON clipboard_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clipboard_items_content_type ON clipboard_items(content_type);

-- Add full-text search support
CREATE INDEX IF NOT EXISTS idx_clipboard_items_content_search ON clipboard_items USING gin(to_tsvector('english', content));

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clipboard_items_updated_at 
    BEFORE UPDATE ON clipboard_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE users IS 'Application users with authentication and preferences';
COMMENT ON TABLE clipboard_items IS 'Clipboard history items with AI-enhanced metadata';

COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for local authentication';
COMMENT ON COLUMN users.firebase_uid IS 'Firebase UID for Firebase authentication';
COMMENT ON COLUMN users.preferences IS 'User preferences and settings';

COMMENT ON COLUMN clipboard_items.content IS 'The actual clipboard content';
COMMENT ON COLUMN clipboard_items.content_type IS 'Type of content: text, image, file, url';
COMMENT ON COLUMN clipboard_items.metadata IS 'Additional metadata about the content';
COMMENT ON COLUMN clipboard_items.entities IS 'AI-detected entities in the content';
COMMENT ON COLUMN clipboard_items.suggestions IS 'AI-generated action suggestions';