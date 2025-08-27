import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { getPool } from '../database/connection';
import { AuthRequest, ApiResponse, ClipboardItem } from '../types';
import { aiService } from '../services/aiService';
import { logger } from '../utils/logger';

const router = Router();

// Get clipboard history
router.get('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const pool = getPool();
    let query = `
      SELECT * FROM clipboard_items 
      WHERE user_id = $1
    `;
    const params: any[] = [req.user!.id];

    if (search) {
      query += ` AND content ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);

    const response: ApiResponse<ClipboardItem[]> = {
      success: true,
      data: result.rows,
    };
    res.json(response);
  } catch (error) {
    logger.error('Failed to get clipboard history:', error);
    res.status(500).json({ success: false, error: 'Failed to get clipboard history' });
  }
});

// Add clipboard item
router.post('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { content, contentType = 'text', deviceId } = req.body;

    if (!content) {
      res.status(400).json({ success: false, error: 'Content is required' });
      return;
    }

    // Process with AI
    const entities = await aiService.classifyText(content);
    const suggestions = aiService.generateSuggestions(entities);

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO clipboard_items (user_id, content, content_type, entities, suggestions, device_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user!.id, content, contentType, JSON.stringify(entities), JSON.stringify(suggestions), deviceId]
    );

    const clipboardItem: ClipboardItem = result.rows[0];

    const response: ApiResponse<ClipboardItem> = {
      success: true,
      data: clipboardItem,
    };
    res.json(response);
  } catch (error) {
    logger.error('Failed to add clipboard item:', error);
    res.status(500).json({ success: false, error: 'Failed to add clipboard item' });
  }
});

// Get specific clipboard item
router.get('/:id', authenticateUser, async (req: AuthRequest, res) => {
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

    const response: ApiResponse<ClipboardItem> = {
      success: true,
      data: result.rows[0],
    };
    res.json(response);
  } catch (error) {
    logger.error('Failed to get clipboard item:', error);
    res.status(500).json({ success: false, error: 'Failed to get clipboard item' });
  }
});

// Delete clipboard item
router.delete('/:id', authenticateUser, async (req: AuthRequest, res) => {
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
});

export { router as clipboardRoutes };