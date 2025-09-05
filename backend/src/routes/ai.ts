import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { authenticateUser } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Process clipboard content with AI (Skip auth for MVP)
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { content, contentType = 'text' } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Content is required'
      });
    }

    const result = await aiService.processContent(content, contentType);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('AI processing error:', error);
    res.status(500).json({
      error: 'Failed to process content',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get AI suggestions for content (Skip auth for MVP)
router.post('/suggestions', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Content is required'
      });
    }

    const result = await aiService.processContent(content);
    
    res.json({
      success: true,
      suggestions: result.suggestions,
      confidence: result.confidence
    });
  } catch (error) {
    logger.error('AI suggestions error:', error);
    res.status(500).json({
      error: 'Failed to generate suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as aiRoutes };