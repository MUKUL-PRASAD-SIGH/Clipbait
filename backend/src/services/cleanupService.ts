import { getPool } from '../database/connection';
import { logger } from '../utils/logger';

export class CleanupService {
  private static instance: CleanupService;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): CleanupService {
    if (!CleanupService.instance) {
      CleanupService.instance = new CleanupService();
    }
    return CleanupService.instance;
  }

  startCleanupJob(): void {
    // Run cleanup every hour
    this.cleanupInterval = setInterval(async () => {
      await this.performCleanup();
    }, 60 * 60 * 1000);

    logger.info('Cleanup service started - running every hour');
  }

  stopCleanupJob(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('Cleanup service stopped');
    }
  }

  async performCleanup(): Promise<void> {
    try {
      const pool = getPool();
      
      // Delete clipboard items older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await pool.query(
        'DELETE FROM clipboard_items WHERE created_at < $1',
        [thirtyDaysAgo]
      );

      if (result.rowCount && result.rowCount > 0) {
        logger.info(`Cleanup: Deleted ${result.rowCount} old clipboard items`);
      }

      // Delete old sync events (older than 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const syncResult = await pool.query(
        'DELETE FROM sync_events WHERE created_at < $1',
        [sevenDaysAgo]
      );

      if (syncResult.rowCount && syncResult.rowCount > 0) {
        logger.info(`Cleanup: Deleted ${syncResult.rowCount} old sync events`);
      }

      // Delete inactive user sessions (older than 30 days)
      const sessionResult = await pool.query(
        'DELETE FROM user_sessions WHERE last_active < $1',
        [thirtyDaysAgo]
      );

      if (sessionResult.rowCount && sessionResult.rowCount > 0) {
        logger.info(`Cleanup: Deleted ${sessionResult.rowCount} inactive sessions`);
      }

    } catch (error) {
      logger.error('Cleanup job failed:', error);
    }
  }

  // Manual cleanup for specific user
  async cleanupUserData(userId: string, retentionDays: number = 30): Promise<number> {
    try {
      const pool = getPool();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await pool.query(
        'DELETE FROM clipboard_items WHERE user_id = $1 AND created_at < $2',
        [userId, cutoffDate]
      );

      logger.info(`Manual cleanup: Deleted ${result.rowCount || 0} items for user ${userId}`);
      return result.rowCount || 0;
    } catch (error) {
      logger.error('Manual cleanup failed:', error);
      throw error;
    }
  }

  // Enforce per-user limits
  async enforceUserLimits(): Promise<void> {
    try {
      const pool = getPool();
      
      // Keep only latest 1000 items per user (configurable)
      const maxItemsPerUser = parseInt(process.env.MAX_ITEMS_PER_USER || '1000');
      
      const result = await pool.query(`
        DELETE FROM clipboard_items 
        WHERE id IN (
          SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
            FROM clipboard_items
          ) t WHERE rn > $1
        )
      `, [maxItemsPerUser]);

      if (result.rowCount && result.rowCount > 0) {
        logger.info(`Enforced user limits: Deleted ${result.rowCount} excess items`);
      }
    } catch (error) {
      logger.error('Failed to enforce user limits:', error);
    }
  }
}

export const cleanupService = CleanupService.getInstance();