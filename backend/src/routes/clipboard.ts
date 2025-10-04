import { Router, Response } from 'express';
import { authenticateUser } from '../middleware/auth';
import { getPool } from '../database/simple-connection';
import { AuthRequest, ApiResponse, ClipboardItem } from '../types';
import { aiService } from '../services/aiService';
import { logger } from '../utils/logger';
import { validateClipboardContent, validatePagination, handleValidationErrors } from '../middleware/validation';
import { clipboardLimiter, apiLimiter } from '../middleware/rateLimiter';
import { EncryptionService } from '../utils/encryption';

const router = Router();

// Get clipboard history
router.get('/history', 
  apiLimiter,
  authenticateUser, 
  async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const pool = getPool();
      
      const result = await pool.query(
        'SELECT * FROM clipboard_items WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [req.user!.id, limit, offset]
      );

      const response: ApiResponse = {
        success: true,
        data: result.rows,
        pagination: {
          limit,
          offset,
          total: result.rowCount || 0
        }
      };
      res.json(response);
    } catch (error) {
      logger.error('Failed to get clipboard history:', error);
      res.status(500).json({ success: false, error: 'Failed to get clipboard history' });
    }
  }
);

// Get clipboard history with security fixes
router.get('/', 
  apiLimiter,
  validatePagination,
  handleValidationErrors,
  authenticateUser, 
  async (req: AuthRequest, res: Response) => {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const pool = getPool();
      let query: string;
      let params: any[];

      if (search) {
        // Use parameterized query to prevent SQL injection
        query = `
          SELECT id, user_id, content, content_type, metadata, entities, suggestions, device_id, created_at, updated_at
          FROM clipboard_items 
          WHERE user_id = $1 AND content ILIKE $2
          ORDER BY created_at DESC 
          LIMIT $3 OFFSET $4
        `;
        params = [req.user!.id, `%${search}%`, Number(limit), offset];
      } else {
        query = `
          SELECT id, user_id, content, content_type, metadata, entities, suggestions, device_id, created_at, updated_at
          FROM clipboard_items 
          WHERE user_id = $1
          ORDER BY created_at DESC 
          LIMIT $2 OFFSET $3
        `;
        params = [req.user!.id, Number(limit), offset];
      }

      const result = await pool.query(query, params);

      // Decrypt sensitive content if needed
      const decryptedItems = result.rows.map(item => {
        if (item.metadata?.encrypted) {
          try {
            item.content = EncryptionService.decrypt(item.content);
          } catch (error) {
            logger.error('Failed to decrypt content:', error);
          }
        }
        return item;
      });

      const response: ApiResponse<ClipboardItem[]> = {
        success: true,
        data: decryptedItems,
      };
      res.json(response);
    } catch (error) {
      logger.error('Failed to get clipboard history:', error);
      res.status(500).json({ success: false, error: 'Failed to get clipboard history' });
    }
  }
);

// Add clipboard item with validation and encryption
router.post('/', 
  clipboardLimiter,
  validateClipboardContent,
  handleValidationErrors,
  authenticateUser, 
  async (req: AuthRequest, res: Response) => {
    const client = await getPool().connect();
    
    try {
      await client.query('BEGIN');
      
      const { content, contentType = 'text', deviceId } = req.body;

      // Check if content should be encrypted
      const shouldEncrypt = EncryptionService.shouldEncrypt(content);
      const finalContent = shouldEncrypt ? EncryptionService.encrypt(content) : content;
      const metadata = { encrypted: shouldEncrypt };

      // Process with AI (use original content for analysis)
      const aiResult = await aiService.processContent(content, contentType);

      // Implement 5-item limit at database level
      await client.query(
        `DELETE FROM clipboard_items 
         WHERE user_id = $1 AND id NOT IN (
           SELECT id FROM clipboard_items 
           WHERE user_id = $1 
           ORDER BY created_at DESC 
           LIMIT 4
         )`,
        [req.user!.id]
      );

      const result = await client.query(
        `INSERT INTO clipboard_items (user_id, content, content_type, metadata, entities, suggestions, device_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          req.user!.id, 
          finalContent, 
          contentType, 
          JSON.stringify(metadata),
          JSON.stringify(aiResult.entities), 
          JSON.stringify(aiResult.suggestions), 
          deviceId
        ]
      );

      await client.query('COMMIT');

      const clipboardItem: ClipboardItem = result.rows[0];
      
      // Return decrypted content to client
      if (shouldEncrypt) {
        clipboardItem.content = content;
      }

      const response: ApiResponse<ClipboardItem> = {
        success: true,
        data: clipboardItem,
      };
      res.json(response);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to add clipboard item:', error);
      res.status(500).json({ success: false, error: 'Failed to add clipboard item' });
    } finally {
      client.release();
    }
  }
);

// Get specific clipboard item
router.get('/:id', 
  apiLimiter,
  authenticateUser, 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.query(
        'SELECT * FROM clipboard_items WHERE id = $1 AND user_id = $2',
        [id, req.user!.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Clipboard item not found' });
        return;
      }

      const item = result.rows[0];
      
      // Decrypt if needed
      if (item.metadata?.encrypted) {
        try {
          item.content = EncryptionService.decrypt(item.content);
        } catch (error) {
          logger.error('Failed to decrypt content:', error);
        }
      }

      const response: ApiResponse<ClipboardItem> = {
        success: true,
        data: item,
      };
      res.json(response);
    } catch (error) {
      logger.error('Failed to get clipboard item:', error);
      res.status(500).json({ success: false, error: 'Failed to get clipboard item' });
    }
  }
);

// Delete clipboard item
router.delete('/:id', 
  apiLimiter,
  authenticateUser, 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.query(
        'DELETE FROM clipboard_items WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, req.user!.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Clipboard item not found' });
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Clipboard item deleted',
      };
      res.json(response);
    } catch (error) {
      logger.error('Failed to delete clipboard item:', error);
      res.status(500).json({ success: false, error: 'Failed to delete clipboard item' });
    }
  }
);

// Pin clipboard item
router.post('/:id/pin', 
  apiLimiter,
  authenticateUser, 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.query(
        'UPDATE clipboard_items SET is_pinned = true, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, req.user!.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Clipboard item not found' });
        return;
      }

      const response: ApiResponse<ClipboardItem> = {
        success: true,
        data: result.rows[0],
        message: 'Item pinned successfully',
      };
      res.json(response);
    } catch (error) {
      logger.error('Failed to pin clipboard item:', error);
      res.status(500).json({ success: false, error: 'Failed to pin clipboard item' });
    }
  }
);

// Unpin clipboard item
router.post('/:id/unpin', 
  apiLimiter,
  authenticateUser, 
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();
      
      const result = await pool.query(
        'UPDATE clipboard_items SET is_pinned = false, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, req.user!.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Clipboard item not found' });
        return;
      }

      const response: ApiResponse<ClipboardItem> = {
        success: true,
        data: result.rows[0],
        message: 'Item unpinned successfully',
      };
      res.json(response);
    } catch (error) {
      logger.error('Failed to unpin clipboard item:', error);
      res.status(500).json({ success: false, error: 'Failed to unpin clipboard item' });
    }
  }
);

// Clear all clipboard history
router.delete('/clear', 
  apiLimiter,
  authenticateUser, 
  async (req: AuthRequest, res) => {
    try {
      const pool = getPool();
      
      await pool.query(
        'DELETE FROM clipboard_items WHERE user_id = $1',
        [req.user!.id]
      );

      const response: ApiResponse = {
        success: true,
        message: 'Clipboard history cleared',
      };
      res.json(response);
    } catch (error) {
      logger.error('Failed to clear clipboard history:', error);
      res.status(500).json({ success: false, error: 'Failed to clear clipboard history' });
    }
  }
);

export { router as clipboardRoutes };