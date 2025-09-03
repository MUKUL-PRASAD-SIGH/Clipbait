import request from 'supertest';
import { Express } from 'express';
import { getPool } from '../../database/connection';
import { createTestApp } from '../helpers/testApp';

describe('Clipboard Integration Tests', () => {
  let app: Express;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await createTestApp();
    
    // Create test user and get auth token
    const authResponse = await request(app)
      .post('/api/auth/test-login')
      .send({ email: 'test@example.com' });
    
    authToken = authResponse.body.token;
    userId = authResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    const pool = getPool();
    await pool.query('DELETE FROM clipboard_items WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  });

  describe('POST /api/clipboard', () => {
    it('should create clipboard item with AI processing', async () => {
      const response = await request(app)
        .post('/api/clipboard')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Contact John at john@example.com or call (555) 123-4567',
          contentType: 'text'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.content).toBe('Contact John at john@example.com or call (555) 123-4567');
      expect(response.body.data.entities).toHaveLength(2); // email and phone
      expect(response.body.data.suggestions).toHaveLength(2); // send email and call
    });

    it('should enforce rate limiting', async () => {
      // Make multiple requests quickly
      const promises = Array(35).fill(0).map(() =>
        request(app)
          .post('/api/clipboard')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ content: 'test content' })
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should validate input', async () => {
      const response = await request(app)
        .post('/api/clipboard')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '', // Empty content
          contentType: 'text'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should encrypt sensitive content', async () => {
      const sensitiveContent = 'My password is secret123';
      
      const response = await request(app)
        .post('/api/clipboard')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: sensitiveContent,
          contentType: 'text'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.content).toBe(sensitiveContent); // Returned decrypted
      
      // Check database has encrypted version
      const pool = getPool();
      const dbResult = await pool.query(
        'SELECT content, metadata FROM clipboard_items WHERE id = $1',
        [response.body.data.id]
      );
      
      expect(dbResult.rows[0].metadata.encrypted).toBe(true);
      expect(dbResult.rows[0].content).not.toBe(sensitiveContent); // Encrypted in DB
    });
  });

  describe('GET /api/clipboard', () => {
    beforeEach(async () => {
      // Create test items
      await request(app)
        .post('/api/clipboard')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Test item 1' });
      
      await request(app)
        .post('/api/clipboard')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Test item 2' });
    });

    it('should return paginated results', async () => {
      const response = await request(app)
        .get('/api/clipboard?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('should search clipboard items', async () => {
      const response = await request(app)
        .get('/api/clipboard?search=Test item 1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].content).toContain('Test item 1');
    });

    it('should prevent SQL injection in search', async () => {
      const maliciousSearch = "'; DROP TABLE clipboard_items; --";
      
      const response = await request(app)
        .get(`/api/clipboard?search=${encodeURIComponent(maliciousSearch)}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200); // Should not crash
      
      // Verify table still exists
      const pool = getPool();
      const result = await pool.query('SELECT COUNT(*) FROM clipboard_items');
      expect(result.rows).toBeDefined();
    });
  });

  describe('5-item limit enforcement', () => {
    it('should maintain only 5 items per user', async () => {
      // Add 7 items
      for (let i = 1; i <= 7; i++) {
        await request(app)
          .post('/api/clipboard')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ content: `Item ${i}` });
      }

      // Check only 5 items remain
      const response = await request(app)
        .get('/api/clipboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data).toHaveLength(5);
      
      // Should have the latest 5 items (3, 4, 5, 6, 7)
      const contents = response.body.data.map((item: any) => item.content);
      expect(contents).toContain('Item 7');
      expect(contents).toContain('Item 6');
      expect(contents).not.toContain('Item 1');
      expect(contents).not.toContain('Item 2');
    });
  });
});