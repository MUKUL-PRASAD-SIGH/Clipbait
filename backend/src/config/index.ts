import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/epitychia',
  
  // Security
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
  encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key',
  
  // Firebase
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  },
  
  // Rate limiting
  rateLimits: {
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'test' ? 1000 : 100,
    },
    clipboard: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: process.env.NODE_ENV === 'test' ? 100 : 30,
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'test' ? 50 : (process.env.NODE_ENV === 'development' ? 50 : 5),
    },
  },
  
  // Data retention
  dataRetention: {
    clipboardItemsDays: parseInt(process.env.CLIPBOARD_RETENTION_DAYS || '30'),
    syncEventsDays: parseInt(process.env.SYNC_EVENTS_RETENTION_DAYS || '7'),
    sessionsDays: parseInt(process.env.SESSIONS_RETENTION_DAYS || '30'),
    maxItemsPerUser: parseInt(process.env.MAX_ITEMS_PER_USER || '1000'),
  },
  
  // Features
  features: {
    aiProcessing: process.env.ENABLE_AI_PROCESSING !== 'false',
    encryption: process.env.ENABLE_ENCRYPTION !== 'false',
    cleanup: process.env.ENABLE_CLEANUP !== 'false',
  },
  
  // External services
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
];

// Only require DATABASE_URL if not skipping database
if (process.env.SKIP_DATABASE !== 'true') {
  requiredEnvVars.push('DATABASE_URL');
}

if (config.isProduction) {
  requiredEnvVars.push(
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'ENCRYPTION_KEY'
  );
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}