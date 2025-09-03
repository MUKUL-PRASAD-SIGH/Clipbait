import { pool } from '../database/connection';
import { logger } from '../utils/logger';

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    
    // Check if database is accessible
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    logger.info('Database connection successful:', result.rows[0]);
    
    // Run any additional migrations here
    // For now, the init.sql file handles the initial schema
    
    client.release();
    logger.info('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  }
}

runMigrations();