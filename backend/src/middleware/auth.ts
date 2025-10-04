import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../services/firebase';
import { getPool } from '../database/simple-connection';
import { User, AuthRequest } from '../types';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

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
    const pool = getPool();
    let user: User;

    try {
      // Try JWT first (for demo/local auth)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret') as any;
      
      const result = await pool.query(
        'SELECT id, email, firebase_uid, preferences, created_at, updated_at FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      user = result.rows[0];
    } catch (jwtError) {
      // If JWT fails, try Firebase token
      try {
        const decodedToken = await verifyFirebaseToken(token);

        // Get or create user
        let result = await pool.query(
          'SELECT * FROM users WHERE firebase_uid = $1',
          [decodedToken.uid]
        );

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
      } catch (firebaseError) {
        throw new Error('Invalid token format');
      }
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