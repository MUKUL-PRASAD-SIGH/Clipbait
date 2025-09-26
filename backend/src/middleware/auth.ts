import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../services/firebase';
import { getPool } from '../database/connection';
import { User, AuthRequest } from '../types';
import { logger } from '../utils/logger';

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyFirebaseToken(token);

    // Get or create user
    const pool = getPool();
    let result = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [decodedToken.uid]
    );

    let user: User;
    if (result.rows.length === 0) {
      // Create new user
      const insertResult = await pool.query(
        'INSERT INTO users (email, firebase_uid) VALUES ($1, $2) RETURNING *',
        [decodedToken.email, decodedToken.uid]
      );
      user = insertResult.rows[0];
      logger.info(`New user created: ${user.email}`);
    } else {
      user = result.rows[0];
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Export as authMiddleware for consistency
export const authMiddleware = authenticateUser;