import { Router, Request, Response } from 'express';
import { authenticateUser } from '../middleware/auth';
import { AuthRequest, ApiResponse, User } from '../types';
import { authLimiter } from '../middleware/rateLimiter';
import { body, validationResult } from 'express-validator';
import { getPool } from '../database/simple-connection';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Register new user
router.post('/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;
      const pool = getPool();

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'User already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const userId = uuidv4();
      const result = await pool.query(
        `INSERT INTO users (id, email, password_hash, firebase_uid, preferences, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, email, preferences, created_at, updated_at`,
        [
          userId,
          email,
          hashedPassword,
          `demo_${userId}`, // Demo firebase UID
          JSON.stringify({
            enableNotifications: true,
            autoSync: true,
            maxHistoryItems: 100,
            enableAI: true
          })
        ]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'demo-secret',
        { expiresIn: '7d' }
      );

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firebaseUid: `demo_${userId}`,
            preferences: user.preferences,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          },
          token
        }
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  }
);

// Login user
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;
      const pool = getPool();

      // Find user
      const result = await pool.query(
        'SELECT id, email, password_hash, firebase_uid, preferences, created_at, updated_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'demo-secret',
        { expiresIn: '7d' }
      );

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firebaseUid: user.firebase_uid,
            preferences: user.preferences,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          },
          token
        }
      };

      res.json(response);
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }
);

// Get current user
router.get('/me', authLimiter, authenticateUser, (req: AuthRequest, res) => {
  const response: ApiResponse = {
    success: true,
    data: req.user
  };
  res.json(response);
});

// Update user profile
router.put('/profile',
  authLimiter,
  authenticateUser,
  [
    body('preferences').isObject().optional()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { preferences } = req.body;
      const pool = getPool();

      const result = await pool.query(
        `UPDATE users 
         SET preferences = COALESCE($2, preferences), updated_at = NOW()
         WHERE id = $1
         RETURNING id, email, firebase_uid, preferences, created_at, updated_at`,
        [req.user!.id, preferences ? JSON.stringify(preferences) : null]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        data: result.rows[0]
      };

      res.json(response);
    } catch (error) {
      logger.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        error: 'Profile update failed'
      });
    }
  }
);

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

// Firebase authentication
router.post('/firebase',
  authLimiter,
  [
    body('firebaseToken').notEmpty().withMessage('Firebase token is required'),
    body('email').isEmail().normalizeEmail()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { firebaseToken, email, displayName } = req.body;
      const pool = getPool();

      // Verify Firebase token
      const { verifyFirebaseToken } = await import('../services/firebase');
      const decodedToken = await verifyFirebaseToken(firebaseToken);

      // Check if user exists
      let result = await pool.query(
        'SELECT id, email, firebase_uid, preferences, created_at, updated_at FROM users WHERE firebase_uid = $1 OR email = $2',
        [decodedToken.uid, email]
      );

      let user;
      if (result.rows.length === 0) {
        // Create new user
        const userId = uuidv4();
        const insertResult = await pool.query(
          `INSERT INTO users (id, email, firebase_uid, preferences, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           RETURNING id, email, firebase_uid, preferences, created_at, updated_at`,
          [
            userId,
            email,
            decodedToken.uid,
            JSON.stringify({
              enableNotifications: true,
              autoSync: true,
              maxHistoryItems: 100,
              enableAI: true
            })
          ]
        );
        user = insertResult.rows[0];
        logger.info(`New user created via Firebase: ${email}`);
      } else {
        user = result.rows[0];
        // Update firebase_uid if it's missing
        if (!user.firebase_uid) {
          await pool.query(
            'UPDATE users SET firebase_uid = $1, updated_at = NOW() WHERE id = $2',
            [decodedToken.uid, user.id]
          );
          user.firebase_uid = decodedToken.uid;
        }
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firebaseUid: user.firebase_uid,
            preferences: user.preferences,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          },
          token: jwtToken
        }
      };

      res.json(response);
    } catch (error) {
      logger.error('Firebase authentication error:', error);
      res.status(401).json({
        success: false,
        error: 'Firebase authentication failed'
      });
    }
  }
);

export { router as authRoutes };