// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/epitychia_test';

// Mock Firebase Admin SDK
jest.mock('../services/firebase', () => ({
  admin: {
    auth: () => ({
      verifyIdToken: jest.fn()
    }),
    initializeApp: jest.fn()
  }
}));

// Mock database connection
jest.mock('../database/connection', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }
}));

// Mock ONNX Runtime
jest.mock('onnxruntime-node', () => ({
  InferenceSession: {
    create: jest.fn()
  }
}));