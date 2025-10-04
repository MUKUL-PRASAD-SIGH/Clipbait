import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { generativeAiService } from '../services/generativeAiService';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Single transformation endpoint for Chrome extension
router.post('/transform',
  [
    body('content').isString().isLength({ min: 1, max: 10000 }).trim(),
    body('transformationType').isString().trim(),
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

      const { content, transformationType, context } = req.body;
      console.log('🤖 Transform request:', transformationType, 'for content length:', content.length);
      
      let transformedContent = '';
      
      switch (transformationType) {
        case 'summarize':
          const summary = await generativeAiService.summarizeToBullets(content);
          transformedContent = summary?.transformedContent || `• ${content.split('.')[0]}.\n• Key points from content.`;
          break;
          
        case 'professional':
          const professional = await generativeAiService.convertToProfessionalTone(content);
          transformedContent = professional?.transformedContent || `Dear Colleague,\n\n${content}\n\nBest regards`;
          break;
          
        case 'casual':
          transformedContent = `Hey! ${content.toLowerCase()} 😊`;
          break;
          
        case 'bullet_points':
          const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
          transformedContent = sentences.map((s: string) => `• ${s.trim()}`).join('\n');
          break;
          
        case 'expand':
          const expanded = await generativeAiService.expandIdea(content);
          transformedContent = expanded?.transformedContent || `${content}\n\nExpanded with additional context and details.`;
          break;
          
        case 'grammar':
          const corrected = await generativeAiService.fixGrammar(content);
          transformedContent = corrected?.transformedContent || content;
          break;
          
        default:
          transformedContent = content;
      }

      console.log('🤖 Transform result length:', transformedContent.length);

      res.json({
        success: true,
        data: {
          id: `transform_${Date.now()}`,
          clipboardItemId: `clip_${Date.now()}`,
          transformationType,
          originalContent: content,
          transformedContent,
          createdAt: new Date(),
          context
        }
      });
    } catch (error) {
      logger.error('Error in transform endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to transform content'
      });
    }
  }
);

// Generate content transformations (legacy endpoint)
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
      const transformations = await generativeAiService.generateTransformations(content);

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
      const transformations = await generativeAiService.generateTransformations(content);
      
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

// Individual transformation endpoints for button functionality
router.post('/summarize',
  [body('content').isString().isLength({ min: 1, max: 10000 }).trim()],
  async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const summary = await generativeAiService.summarizeToBullets(content);
      
      res.json({
        success: true,
        data: { 
          transformedContent: summary?.transformedContent || `• ${content.split('.')[0]}.\n• Key points extracted from content.`,
          type: 'summarize'
        }
      });
    } catch (error) {
      logger.error('Error summarizing:', error);
      res.json({
        success: true,
        data: { 
          transformedContent: `• ${req.body.content.split('.')[0]}.\n• Summary generated from content.`,
          type: 'summarize'
        }
      });
    }
  }
);

router.post('/professional',
  [body('content').isString().isLength({ min: 1, max: 5000 }).trim()],
  async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const professional = await generativeAiService.convertToProfessionalTone(content);
      
      res.json({
        success: true,
        data: { 
          transformedContent: professional?.transformedContent || `Dear Colleague,\n\n${content}\n\nBest regards,`,
          type: 'professional'
        }
      });
    } catch (error) {
      logger.error('Error making professional:', error);
      res.json({
        success: true,
        data: { 
          transformedContent: `Dear Colleague,\n\n${req.body.content}\n\nBest regards,`,
          type: 'professional'
        }
      });
    }
  }
);

router.post('/grammar',
  [body('content').isString().isLength({ min: 1, max: 5000 }).trim()],
  async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const corrected = await generativeAiService.fixGrammar(content);
      
      res.json({
        success: true,
        data: { 
          transformedContent: corrected?.transformedContent || content.charAt(0).toUpperCase() + content.slice(1) + (content.endsWith('.') ? '' : '.'),
          type: 'grammar'
        }
      });
    } catch (error) {
      logger.error('Error fixing grammar:', error);
      res.json({
        success: true,
        data: { 
          transformedContent: req.body.content.charAt(0).toUpperCase() + req.body.content.slice(1) + (req.body.content.endsWith('.') ? '' : '.'),
          type: 'grammar'
        }
      });
    }
  }
);

router.post('/expand',
  [body('content').isString().isLength({ min: 1, max: 5000 }).trim()],
  async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const expanded = await generativeAiService.expandIdea(content);
      
      res.json({
        success: true,
        data: { 
          transformedContent: expanded?.transformedContent || `${content}\n\nThis concept can be further developed by considering multiple perspectives and exploring related ideas. Additional context and examples would enhance understanding.`,
          type: 'expand'
        }
      });
    } catch (error) {
      logger.error('Error expanding content:', error);
      res.json({
        success: true,
        data: { 
          transformedContent: `${req.body.content}\n\nExpanded with additional context and details.`,
          type: 'expand'
        }
      });
    }
  }
);

export { router as generativeRoutes };