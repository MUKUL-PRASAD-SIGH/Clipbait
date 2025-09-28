import { Pool } from "pg";
import { logger } from "../utils/logger";
import { memoryStorage } from "./memory-storage";

let pool: Pool;

export const initializeDatabase = async (): Promise<void> => {
  try {
<<<<<<< HEAD
    if (process.env.SKIP_DATABASE === "true") {
      logger.info("Using memory storage (SKIP_DATABASE=true)");
      memoryStorage.initializeDemoData();

      // Test memory storage
      const result = await memoryStorage.query("SELECT NOW(), version()");
      logger.info("Memory storage initialized successfully");
      logger.info(`Database mode: ${result.rows[0].version}`);
      return;
    }

    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is required when SKIP_DATABASE is not true"
      );
    }

=======
    // First try to connect to the database
>>>>>>> 78d39c8c2afd0d1980716634ccf07602e98a2a2b
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      // Connection pool settings for better performance and security
      max: 20, // Maximum number of connections
      min: 2, // Minimum number of connections
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 2000, // Timeout after 2 seconds
      maxUses: 7500, // Close connection after 7500 uses
    });

    // Test connection
<<<<<<< HEAD
    const result = await pool.query("SELECT NOW(), version()");
    logger.info("Database connected successfully");
    logger.info(`PostgreSQL version: ${result.rows[0].version.split(" ")[1]}`);
=======
    const result = await pool.query('SELECT NOW(), version()');
    logger.info('Database connected successfully');
    logger.info(`PostgreSQL version: ${result.rows[0].version.split(' ')[1]}`);
>>>>>>> 78d39c8c2afd0d1980716634ccf07602e98a2a2b

    // Set up connection event handlers
    pool.on("connect", () => {
      logger.debug("New database connection established");
    });

    pool.on("error", (err) => {
      logger.error("Database pool error:", err);
    });

    // Run migrations
    await runMigrations();
  } catch (error: any) {
    // If database doesn't exist, try to create it
    if (error.code === '3D000') {
      logger.info('Database does not exist, attempting to create it...');
      await createDatabaseIfNotExists();
      // Retry connection after creating database
      return initializeDatabase();
    } else {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }
};

const createDatabaseIfNotExists = async (): Promise<void> => {
  try {
    // Connect to postgres database to create our database
    const dbUrl = process.env.DATABASE_URL!;
    const postgresUrl = dbUrl.replace('/epitychia', '/postgres');

    const adminPool = new Pool({
      connectionString: postgresUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const client = await adminPool.connect();

    try {
      // Create database if it doesn't exist
      await client.query('CREATE DATABASE epitychia');
      logger.info('Database "epitychia" created successfully');
    } catch (error: any) {
      if (error.code === '42P04') {
        logger.info('Database "epitychia" already exists');
      } else {
        throw error;
      }
    } finally {
      client.release();
      await adminPool.end();
    }
  } catch (error) {
<<<<<<< HEAD
    logger.error("Database connection failed:", error);
=======
    logger.error('Failed to create database:', error);
>>>>>>> 78d39c8c2afd0d1980716634ccf07602e98a2a2b
    throw error;
  }
};

export const getPool = (): Pool => {
  if (process.env.SKIP_DATABASE === "true") {
    // Return memory storage as a pool-like object
    return memoryStorage as any;
  }

  if (!pool) {
    throw new Error("Database not initialized");
  }
  return pool;
};

export { pool };

// Graceful shutdown
export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    logger.info("Database connections closed");
  }
};

const runMigrations = async (): Promise<void> => {
  if (process.env.SKIP_DATABASE === "true") {
    logger.info("Skipping database migrations (using memory storage)");
    return;
  }

  const client = await pool.connect();

  try {
    logger.info("Starting database migrations...");
    
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Step 1: Create users table (basic structure first)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    logger.info("✅ Users table created");

    // Step 2: Add missing columns to users table
    await client.query(`
      DO $$
      BEGIN
        -- Add password_hash column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
          ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
        END IF;
        
        -- Add firebase_uid column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'firebase_uid') THEN
          ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) UNIQUE;
        END IF;
        
        -- Add preferences column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferences') THEN
          ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{
            "enableNotifications": true,
            "autoSync": true,
            "maxHistoryItems": 100,
            "enableAI": true
          }'::jsonb;
        END IF;
        
        -- Add updated_at column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
          ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
      END $$;
    `);
    logger.info("✅ Users table columns updated");

    // Step 3: Create collections table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clipboard_collections (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        tags TEXT[] DEFAULT '{}',
        auto_generated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    logger.info("✅ Collections table ready");

    // Step 4: Create clipboard_items table (basic structure first)
    await client.query(`
      CREATE TABLE IF NOT EXISTS clipboard_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        content_type VARCHAR(50) DEFAULT 'text',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    logger.info("✅ Clipboard items table created");

    // Step 5: Add all missing columns to clipboard_items
    await client.query(`
      DO $$
      BEGIN
        -- Add metadata column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clipboard_items' AND column_name = 'metadata') THEN
          ALTER TABLE clipboard_items ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        -- Add entities column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clipboard_items' AND column_name = 'entities') THEN
          ALTER TABLE clipboard_items ADD COLUMN entities JSONB DEFAULT '[]'::jsonb;
        END IF;
        
        -- Add suggestions column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clipboard_items' AND column_name = 'suggestions') THEN
          ALTER TABLE clipboard_items ADD COLUMN suggestions JSONB DEFAULT '[]'::jsonb;
        END IF;
        
        -- Add device_id column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clipboard_items' AND column_name = 'device_id') THEN
          ALTER TABLE clipboard_items ADD COLUMN device_id VARCHAR(255);
        END IF;
        
        -- Add is_pinned column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clipboard_items' AND column_name = 'is_pinned') THEN
          ALTER TABLE clipboard_items ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Add staging_group column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clipboard_items' AND column_name = 'staging_group') THEN
          ALTER TABLE clipboard_items ADD COLUMN staging_group VARCHAR(255);
        END IF;
        
        -- Add transformations column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clipboard_items' AND column_name = 'transformations') THEN
          ALTER TABLE clipboard_items ADD COLUMN transformations JSONB DEFAULT '[]'::jsonb;
        END IF;
        
        -- Add updated_at column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clipboard_items' AND column_name = 'updated_at') THEN
          ALTER TABLE clipboard_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        -- Add collection_id column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clipboard_items' AND column_name = 'collection_id') THEN
          ALTER TABLE clipboard_items ADD COLUMN collection_id UUID;
        END IF;
      END $$;
    `);
    logger.info("✅ Clipboard items columns updated");

    // Step 6: Add foreign key constraint for collection_id if it doesn't exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'clipboard_items_collection_id_fkey'
        ) THEN
          ALTER TABLE clipboard_items 
          ADD CONSTRAINT clipboard_items_collection_id_fkey 
          FOREIGN KEY (collection_id) REFERENCES clipboard_collections(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Step 7: Create collection_items junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS collection_items (
        collection_id UUID NOT NULL REFERENCES clipboard_collections(id) ON DELETE CASCADE,
        item_id UUID NOT NULL REFERENCES clipboard_items(id) ON DELETE CASCADE,
        added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (collection_id, item_id)
      )
    `);
    logger.info("✅ Junction table ready");

    // Step 8: Create indexes (only if columns exist)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
      CREATE INDEX IF NOT EXISTS idx_clipboard_items_user_id ON clipboard_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_clipboard_items_created_at ON clipboard_items(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_clipboard_items_content ON clipboard_items USING gin(to_tsvector('english', content));
      CREATE INDEX IF NOT EXISTS idx_collections_user_updated ON clipboard_collections(user_id, updated_at DESC);
    `);

    // Step 9: Create pinned index only if is_pinned column exists
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clipboard_items' AND column_name = 'is_pinned') THEN
          CREATE INDEX IF NOT EXISTS idx_clipboard_items_pinned ON clipboard_items(user_id, is_pinned) WHERE is_pinned = TRUE;
        END IF;
      END $$;
    `);
    logger.info("✅ Indexes created");

    // Step 10: Create trigger function for updating timestamps
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Step 11: Create triggers
    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at 
          BEFORE UPDATE ON users 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_clipboard_items_updated_at ON clipboard_items;
      CREATE TRIGGER update_clipboard_items_updated_at 
          BEFORE UPDATE ON clipboard_items 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_collections_updated_at ON clipboard_collections;
      CREATE TRIGGER update_collections_updated_at 
          BEFORE UPDATE ON clipboard_collections 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    logger.info("✅ Triggers created");

    logger.info("🎉 Database migrations completed successfully");
  } catch (error) {
    logger.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
};
