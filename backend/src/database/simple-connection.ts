import { Pool } from "pg";
import { logger } from "../utils/logger";
import { memoryStorage } from "./memory-storage";

let pool: Pool;

export async function initializeDatabase(): Promise<void> {
  try {
    if (process.env.SKIP_DATABASE === "true") {
      logger.info("Using memory storage (SKIP_DATABASE=true)");
      memoryStorage.initializeDemoData();
      const result = await memoryStorage.query("SELECT NOW(), version()");
      logger.info("Memory storage initialized successfully");
      logger.info(`Database mode: ${result.rows[0].version}`);
      return;
    }

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required when SKIP_DATABASE is not true");
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      maxUses: 7500,
    });

    const result = await pool.query("SELECT NOW(), version()");
    logger.info("Database connected successfully");
    logger.info(`PostgreSQL version: ${result.rows[0].version.split(" ")[1]}`);

    pool.on("connect", () => {
      logger.debug("New database connection established");
    });

    pool.on("error", (err) => {
      logger.error("Database pool error:", err);
    });

    await runMigrations();
  } catch (error: any) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

export function getPool(): Pool {
  if (process.env.SKIP_DATABASE === "true") {
    return memoryStorage as any;
  }
  if (!pool) {
    throw new Error("Database not initialized");
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    logger.info("Database connections closed");
  }
}

async function runMigrations(): Promise<void> {
  if (process.env.SKIP_DATABASE === "true") {
    logger.info("Skipping database migrations (using memory storage)");
    return;
  }

  const client = await pool.connect();
  try {
    logger.info("Starting database migrations...");
    
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        firebase_uid VARCHAR(255) UNIQUE,
        preferences JSONB DEFAULT '{"enableNotifications": true, "autoSync": true, "maxHistoryItems": 100, "enableAI": true}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    logger.info("✅ Users table created");

    await client.query(`
      CREATE TABLE IF NOT EXISTS clipboard_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        content_type VARCHAR(50) DEFAULT 'text',
        metadata JSONB DEFAULT '{}'::jsonb,
        entities JSONB DEFAULT '[]'::jsonb,
        suggestions JSONB DEFAULT '[]'::jsonb,
        device_id VARCHAR(255),
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    logger.info("✅ Clipboard items table created");

    logger.info("🎉 Database migrations completed successfully");
  } catch (error) {
    logger.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
}