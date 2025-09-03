import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';

// Input sanitization and validation
export const validateClipboardContent = [
  body('content')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters')
    .trim()
    .escape(), // Prevent XSS
  body('contentType')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Invalid content type'),
  body('deviceId')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Device ID too long')
    .trim(),
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Search query too long')
    .trim()
    .escape(),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};