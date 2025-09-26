-- Enhanced Clipboard Features Migration
-- Adds support for collections, staging areas, and enhanced clipboard functionality

-- Add new columns to clipboard_items table
ALTER TABLE clipboard_items 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES clipboard_collections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS staging_group VARCHAR(255),
ADD COLUMN IF NOT EXISTS transformations JSONB DEFAULT '[]'::jsonb;

-- Create clipboard_collections table
CREATE TABLE IF NOT EXISTS clipboard_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    auto_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collection_items junction table
CREATE TABLE IF NOT EXISTS collection_items (
    collection_id UUID NOT NULL REFERENCES clipboard_collections(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES clipboard_items(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (collection_id, item_id)
);

-- Create content_transformations table
CREATE TABLE IF NOT EXISTS content_transformations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clipboard_item_id UUID NOT NULL REFERENCES clipboard_items(id) ON DELETE CASCADE,
    transformation_type VARCHAR(50) NOT NULL,
    original_content TEXT NOT NULL,
    transformed_content TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pinned_items table for quick access
CREATE TABLE IF NOT EXISTS pinned_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clipboard_item_id UUID NOT NULL REFERENCES clipboard_items(id) ON DELETE CASCADE,
    pin_order INTEGER DEFAULT 0,
    context_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, clipboard_item_id)
);

-- Create user_preferences table for enhanced settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enable_ai_transformations BOOLEAN DEFAULT TRUE,
    enable_auto_collections BOOLEAN DEFAULT TRUE,
    enable_smart_paste BOOLEAN DEFAULT TRUE,
    enable_contextual_suggestions BOOLEAN DEFAULT TRUE,
    max_staging_items INTEGER DEFAULT 10,
    default_paste_format VARCHAR(20) DEFAULT 'smart',
    keyboard_shortcuts JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create command_history table for learning user patterns
CREATE TABLE IF NOT EXISTS command_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    command_id VARCHAR(100) NOT NULL,
    command_category VARCHAR(50),
    execution_context JSONB DEFAULT '{}'::jsonb,
    success BOOLEAN DEFAULT TRUE,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_clipboard_items_pinned ON clipboard_items(user_id, is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_clipboard_items_collection ON clipboard_items(collection_id) WHERE collection_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clipboard_items_staging ON clipboard_items(user_id, staging_group) WHERE staging_group IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_collections_user_updated ON clipboard_collections(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_collections_auto_generated ON clipboard_collections(user_id, auto_generated);

CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_item ON collection_items(item_id);

CREATE INDEX IF NOT EXISTS idx_transformations_item ON content_transformations(clipboard_item_id);
CREATE INDEX IF NOT EXISTS idx_transformations_type ON content_transformations(transformation_type);

CREATE INDEX IF NOT EXISTS idx_pinned_items_user_order ON pinned_items(user_id, pin_order);

CREATE INDEX IF NOT EXISTS idx_command_history_user_time ON command_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_command_history_command ON command_history(command_id, created_at DESC);

-- Add full-text search support for collections
CREATE INDEX IF NOT EXISTS idx_collections_search ON clipboard_collections USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_collections_updated_at 
    BEFORE UPDATE ON clipboard_collections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default user preferences for existing users
INSERT INTO user_preferences (user_id)
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Add some sample collections for demo purposes (only in development)
DO $$
BEGIN
    IF current_setting('server_version_num')::int >= 120000 THEN
        -- Only run in development environment
        IF EXISTS (SELECT 1 FROM pg_settings WHERE name = 'log_statement' AND setting != 'none') THEN
            -- This is likely a development environment
            INSERT INTO clipboard_collections (id, user_id, name, description, auto_generated)
            SELECT 
                gen_random_uuid(),
                u.id,
                'Code Snippets',
                'Automatically collected code snippets and examples',
                TRUE
            FROM users u
            WHERE NOT EXISTS (
                SELECT 1 FROM clipboard_collections cc 
                WHERE cc.user_id = u.id AND cc.name = 'Code Snippets'
            );
        END IF;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE clipboard_collections IS 'User-created collections of related clipboard items';
COMMENT ON TABLE collection_items IS 'Junction table linking collections to clipboard items';
COMMENT ON TABLE content_transformations IS 'AI-generated transformations of clipboard content';
COMMENT ON TABLE pinned_items IS 'User-pinned clipboard items for quick access';
COMMENT ON TABLE user_preferences IS 'Enhanced user preferences for clipboard features';
COMMENT ON TABLE command_history IS 'History of executed commands for learning user patterns';

COMMENT ON COLUMN clipboard_items.is_pinned IS 'Whether this item is pinned for quick access';
COMMENT ON COLUMN clipboard_items.collection_id IS 'Optional collection this item belongs to';
COMMENT ON COLUMN clipboard_items.staging_group IS 'Temporary grouping for multi-item operations';
COMMENT ON COLUMN clipboard_items.transformations IS 'JSON array of available content transformations';

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO epitychia_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO epitychia_user;