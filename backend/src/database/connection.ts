import { Pool } from 'pg';
import { logger } from '../utils/logger';

let pool: Pool;

export const initializeDatabase = async (): Promise<void> => {
  try {
    // First try to connect to the database
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      // Connection pool settings for better performance and security
      max: 20, // Maximum number of connections
      min: 2,  // Minimum number of connections
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 2000, // Timeout after 2 seconds
      maxUses: 7500, // Close connection after 7500 uses
    });

    // Test connection
    const result = await pool.query('SELECT NOW(), version()');
    logger.info('Database connected successfully');
    logger.info(`PostgreSQL version: ${result.rows[0].version.split(' ')[1]}`);

    // Set up connection event handlers
    pool.on('connect', () => {
      logger.debug('New database connection established');
    });

    pool.on('error', (err) => {
      logger.error('Database pool error:', err);
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
    logger.error('Failed to create database:', error);
    throw error;
  }
};

export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
};

// Graceful shutdown
export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    logger.info('Database connections closed');
  }
};

const runMigrations = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        firebase_uid VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Clipboard items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clipboard_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        content_type VARCHAR(50) DEFAULT 'text',
        metadata JSONB,
        entities JSONB,
        suggestions JSONB,
        device_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clipboard_items_user_id ON clipboard_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_clipboard_items_created_at ON clipboard_items(created_at);
      CREATE INDEX IF NOT EXISTS idx_clipboard_items_content ON clipboard_items USING gin(to_tsvector('english', content));
    `);

    logger.info('Database migrations completed');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};