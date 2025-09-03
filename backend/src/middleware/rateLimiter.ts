import rateLimit from 'express-rate-limit';
import { config } from '../config';

// General API rate limiting
export const apiLimiter = rateLimit({
  windowMs: config.rateLimits.api.windowMs,
  max: config.rateLimits.api.max,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Stricter rate limiting for clipboard additions
export const clipboardLimiter = rateLimit({
  windowMs: config.rateLimits.clipboard.windowMs,
  max: config.rateLimits.clipboard.max,
  message: {
    success: false,
    error: 'Too many clipboard items added, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: config.rateLimits.auth.windowMs,
  max: config.rateLimits.auth.max,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});