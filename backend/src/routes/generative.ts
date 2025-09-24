import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { generativeAiService } from '../services/generativeAiService';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Generate content transformations
router.post('/transform',
  [
    body('content').isString().isLength({ min: 1, max: 10000 }).trim(),
    body('contentType').isIn(['text', 'url', 'code']).optional(),
    body('transformTypes').isArray().optional()
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

      const { content, contentType = 'text' } = req.body;
      const transformations = await generativeAiService.generateTransformations(content, contentType);

      res.json({
        success: true,
        data: {
          transformations,
          count: transformations.length
        }
      });
    } catch (error) {
      logger.error('Error generating transformations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate transformations'
      });
    }
  }
);

// Generate email from content
router.post('/email',
  [
    body('content').isString().isLength({ min: 1, max: 5000 }).trim(),
    body('context').isString().optional(),
    body('tone').isIn(['professional', 'casual', 'formal']).optional()
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

      const { content, context } = req.body;
      const email = await generativeAiService.generateEmail(content, context);

      res.json({
        success: true,
        data: { email }
      });
    } catch (error) {
      logger.error('Error generating email:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate email'
      });
    }
  }
);

// Create task list from content
router.post('/tasks',
  [
    body('content').isString().isLength({ min: 1, max: 5000 }).trim(),
    body('priority').isIn(['high', 'medium', 'low']).optional()
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

      const { content } = req.body;
      const taskList = await generativeAiService.createTaskList(content);

      res.json({
        success: true,
        data: { taskList }
      });
    } catch (error) {
      logger.error('Error creating task list:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create task list'
      });
    }
  }
);

// Translate content
router.post('/translate',
  [
    body('content').isString().isLength({ min: 1, max: 5000 }).trim(),
    body('targetLanguage').isString().isLength({ min: 2, max: 50 }).trim(),
    body('sourceLanguage').isString().optional()
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

      const { content, targetLanguage } = req.body;
      const translation = await generativeAiService.translateText(content, targetLanguage);

      res.json({
        success: true,
        data: { 
          translation,
          originalContent: content,
          targetLanguage
        }
      });
    } catch (error) {
      logger.error('Error translating content:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to translate content'
      });
    }
  }
);

// Get enhanced suggestions with generative actions
router.post('/suggestions',
  [
    body('content').isString().isLength({ min: 1, max: 10000 }).trim(),
    body('contentType').isIn(['text', 'url', 'code', 'image']).optional(),
    body('context').isString().optional()
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

      const { content, contentType = 'text' } = req.body;
      
      // Generate transformations first
      const transformations = await generativeAiService.generateTransformations(content, contentType);
      
      // Generate action suggestions based on content and transformations
      const suggestions = await generativeAiService.generateActionSuggestions(content, transformations);

      res.json({
        success: true,
        data: {
          suggestions,
          transformations,
          count: suggestions.length
        }
      });
    } catch (error) {
      logger.error('Error generating suggestions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate suggestions'
      });
    }
  }
);

export { router as generativeRoutes };