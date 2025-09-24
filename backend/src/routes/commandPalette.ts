import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { commandPaletteService } from '../services/commandPaletteService';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Search across all content types
router.get('/search',
  [
    query('q').isString().isLength({ min: 1, max: 200 }).trim(),
    query('limit').isInt({ min: 1, max: 50 }).optional()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = (req as any).user.id;
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      const results = await commandPaletteService.searchAll(userId, query, limit);

      res.json({
        success: true,
        data: {
          results,
          query,
          count: results.length
        }
      });
    } catch (error) {
      logger.error('Error in command palette search:', error);
      res.status(500).json({
        success: false,
        error: 'Search failed'
      });
    }
  }
);

// Get contextual suggestions
router.get('/suggestions',
  [
    query('context').isString().optional()
  ],
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const context = req.query.context as string;

      const suggestions = await commandPaletteService.getContextualSuggestions(userId, context);

      res.json({
        success: true,
        data: {
          suggestions,
          context,
          count: suggestions.length
        }
      });
    } catch (error) {
      logger.error('Error getting contextual suggestions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get suggestions'
      });
    }
  }
);

// Execute a command
router.post('/execute',
  [
    body('commandId').isString().isLength({ min: 1, max: 100 }).trim(),
    body('params').isObject().optional()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = (req as any).user.id;
      const { commandId, params = {} } = req.body;

      const result = await commandPaletteService.executeCommand(userId, commandId, params);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error executing command:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Command execution failed'
      });
    }
  }
);

// Get available commands
router.get('/commands', async (req: Request, res: Response) => {
  try {
    const commands = commandPaletteService.getAvailableCommands();

    res.json({
      success: true,
      data: {
        commands,
        count: commands.length
      }
    });
  } catch (error) {
    logger.error('Error fetching commands:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch commands'
    });
  }
});

// Add custom command
router.post('/commands',
  [
    body('title').isString().isLength({ min: 1, max: 100 }).trim(),
    body('description').isString().isLength({ min: 1, max: 500 }).trim(),
    body('category').isIn(['clipboard', 'collections', 'actions', 'search', 'settings']),
    body('icon').isString().isLength({ min: 1, max: 10 }).trim(),
    body('action').isString().isLength({ min: 1, max: 100 }).trim(),
    body('shortcut').isString().optional(),
    body('metadata').isObject().optional()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const commandData = req.body;
      const command = commandPaletteService.addCustomCommand(commandData);

      res.status(201).json({
        success: true,
        data: command
      });
    } catch (error) {
      logger.error('Error adding custom command:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add custom command'
      });
    }
  }
);

// Remove custom command
router.delete('/commands/:commandId',
  [param('commandId').isString().isLength({ min: 1, max: 100 }).trim()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { commandId } = req.params;
      const removed = commandPaletteService.removeCustomCommand(commandId);

      if (!removed) {
        return res.status(404).json({
          success: false,
          error: 'Command not found or cannot be removed'
        });
      }

      res.json({
        success: true,
        message: 'Command removed successfully'
      });
    } catch (error) {
      logger.error('Error removing custom command:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove custom command'
      });
    }
  }
);

// Quick actions for common operations
router.post('/quick/:action',
  [
    param('action').isIn(['pin', 'unpin', 'copy', 'delete', 'share']),
    body('targetId').isUUID().optional(),
    body('params').isObject().optional()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = (req as any).user.id;
      const { action } = req.params;
      const { targetId, params = {} } = req.body;

      // Map quick actions to command IDs
      const actionMap: Record<string, string> = {
        'pin': 'pin_item',
        'unpin': 'unpin_item',
        'copy': 'copy_item',
        'delete': 'delete_item',
        'share': 'share_item'
      };

      const commandId = actionMap[action];
      if (!commandId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid quick action'
        });
      }

      const result = await commandPaletteService.executeCommand(userId, commandId, {
        ...params,
        targetId
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error executing quick action:', error);
      res.status(500).json({
        success: false,
        error: 'Quick action failed'
      });
    }
  }
);

export { router as commandPaletteRoutes };