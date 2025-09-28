import admin from 'firebase-admin';
import { logger } from '../utils/logger';

export const initializeFirebase = async (): Promise<void> => {
  try {
    // Skip Firebase in demo mode or if credentials are not provided
    if (process.env.SKIP_DATABASE === 'true' || 
        !process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_PRIVATE_KEY || 
        !process.env.FIREBASE_CLIENT_EMAIL) {
      logger.info('Firebase initialization skipped (demo mode or missing credentials)');
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
    logger.info('Firebase initialized successfully');
  } catch (error) {
    logger.error('Firebase initialization failed:', error);
    // Don't throw in demo mode, just log the error
    if (process.env.SKIP_DATABASE !== 'true') {
      throw error;
    }
  }
};

export const verifyFirebaseToken = async (token: string): Promise<admin.auth.DecodedIdToken> => {
  try {
    // If Firebase is not initialized (demo mode), throw error to fall back to JWT
    if (!admin.apps.length) {
      throw new Error('Firebase not initialized - falling back to JWT');
    }
    
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    logger.error('Firebase token verification failed:', error);
    throw new Error('Invalid token');
  }
};

export const sendNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  try {
    const message = {
      notification: { title, body },
      data,
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    logger.info(`Notifications sent: ${response.successCount}/${tokens.length}`);
  } catch (error) {
    logger.error('Failed to send notifications:', error);
  }
};