import request from 'supertest';
import { app } from '../../index';
import { admin } from '../../services/firebase';

// Mock Firebase Admin
jest.mock('../../services/firebase', () => ({
  admin: {
    auth: () => ({
      verifyIdToken: jest.fn()
    })
  }
}));

describe('Auth Routes', () => {
  describe('POST /api/auth/verify', () => {
    it('should verify valid token', async () => {
      const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
      mockVerifyIdToken.mockResolvedValue({
        uid: 'test-uid',
        email: 'test@example.com'
      });

      const response = await request(app)
        .post('/api/auth/verify')
        .send({ token: 'valid-token' });

      expect(response.status).toBe(200);
      expect(response.body.user.uid).toBe('test-uid');
    });

    it('should reject invalid token', async () => {
      const mockVerifyIdToken = admin.auth().verifyIdToken as jest.Mock;
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/api/auth/verify')
        .send({ token: 'invalid-token' });

      expect(response.status).toBe(401);
    });

    it('should require token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});