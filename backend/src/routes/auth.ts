import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { AuthRequest, ApiResponse } from '../types';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/verify', authLimiter, authenticateUser, (req: AuthRequest, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      user: req.user,
      message: 'Authentication successful',
    },
  };
  res.json(response);
});

router.post('/logout', authLimiter, authenticateUser, (req: AuthRequest, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'Logout successful',
  };
  res.json(response);
});

export { router as authRoutes };