import admin from 'firebase-admin';
import { logger } from '../utils/logger';

export const initializeFirebase = async (): Promise<void> => {
  try {
    // Skip Firebase in demo mode
    if (process.env.SKIP_DATABASE === 'true') {
      logger.info('Firebase initialization skipped (demo mode)');
      return;
    }

    // Check for required Firebase credentials
    if (!process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_PRIVATE_KEY || 
        !process.env.FIREBASE_CLIENT_EMAIL) {
      logger.warn('Firebase credentials missing, skipping initialization');
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      logger.info('Firebase initialized successfully');
    }
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
    // If Firebase is not initialized, try to initialize it first
    if (!admin.apps.length) {
      await initializeFirebase();
    }
    
    // If still not initialized, throw error
    if (!admin.apps.length) {
      throw new Error('Firebase not initialized');
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    logger.info('Firebase token verified successfully');
    return decodedToken;
  } catch (error) {
    logger.error('Firebase token verification failed:', error);
    throw new Error('Firebase authentication failed');
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