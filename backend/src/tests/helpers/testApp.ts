import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from '../../routes/auth';
import { clipboardRoutes } from '../../routes/clipboard';
import { aiRoutes } from '../../routes/ai';
import { errorHandler } from '../../middleware/errorHandler';
import { apiLimiter } from '../../middleware/rateLimiter';

export async function createTestApp(): Promise<Express> {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting (more lenient for tests)
  app.use('/api', apiLimiter);

  // Test auth endpoint
  app.post('/api/auth/test-login', (req, res) => {
    const { email } = req.body;
    const testUser = {
      id: 'test-user-id',
      email,
      firebase_uid: 'test-firebase-uid'
    };
    
    res.json({
      success: true,
      token: 'test-jwt-token',
      user: testUser
    });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/clipboard', clipboardRoutes);
  app.use('/api/ai', aiRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Error handling
  app.use(errorHandler);

  return app;
}