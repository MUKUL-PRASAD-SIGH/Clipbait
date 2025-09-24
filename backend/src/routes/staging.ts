import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { stagingService } from '../services/stagingService';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Get current staging area
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const stagingArea = await stagingService.getStagingArea(userId);

    res.json({
      success: true,
      data: stagingArea
    });
  } catch (error) {
    logger.error('Error fetching staging area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch staging area'
    });
  }
});

// Create new staging area
router.post('/',
  [
    body('targetFormat').isIn(['contact', 'email', 'document', 'custom'])
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
      const { targetFormat } = req.body;

      const stagingArea = await stagingService.createStagingArea(userId, targetFormat);

      res.status(201).json({
        success: true,
        data: stagingArea
      });
    } catch (error) {
      logger.error('Error creating staging area:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create staging area'
      });
    }
  }
);

// Add item to staging area
router.post('/items',
  [
    body('item').isObject(),
    body('item.id').isUUID(),
    body('item.content').isString().isLength({ min: 1, max: 10000 }).trim(),
    body('item.contentType').isIn(['text', 'url', 'image', 'file'])
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
      const { item } = req.body;

      // Ensure the item belongs to the user
      item.userId = userId;

      const stagingArea = await stagingService.addToStaging(userId, item);

      res.json({
        success: true,
        data: stagingArea
      });
    } catch (error) {
      logger.error('Error adding item to staging:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add item to staging area'
      });
    }
  }
);

// Remove item from staging area
router.delete('/items/:itemId',
  [param('itemId').isUUID()],
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
      const { itemId } = req.params;

      const stagingArea = await stagingService.removeFromStaging(userId, itemId);

      res.json({
        success: true,
        data: stagingArea
      });
    } catch (error) {
      logger.error('Error removing item from staging:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove item from staging area'
      });
    }
  }
);

// Generate smart paste formats
router.post('/smart-paste',
  [
    body('targetContext').isString().optional(),
    body('preferredFormat').isIn(['plain', 'rich', 'markdown', 'html', 'citation']).optional()
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
      const { targetContext } = req.body;

      const formats = await stagingService.generateSmartPaste(userId, targetContext);

      res.json({
        success: true,
        data: {
          formats,
          count: formats.length
        }
      });
    } catch (error) {
      logger.error('Error generating smart paste formats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate smart paste formats'
      });
    }
  }
);

// Clear staging area
router.delete('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await stagingService.clearStaging(userId);

    res.json({
      success: true,
      message: 'Staging area cleared'
    });
  } catch (error) {
    logger.error('Error clearing staging area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear staging area'
    });
  }
});

// Get all staging areas (admin/debug endpoint)
router.get('/all', async (req: Request, res: Response) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Not available in production'
      });
    }

    const stagingAreas = await stagingService.getAllStagingAreas();

    res.json({
      success: true,
      data: stagingAreas
    });
  } catch (error) {
    logger.error('Error fetching all staging areas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch staging areas'
    });
  }
});

export { router as stagingRoutes };