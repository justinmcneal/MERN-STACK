// test/profile.test.ts
import request from 'supertest';
import app from '../app';
import User from '../models/User';
import UserPreference from '../models/UserPreference';
import jwt from 'jsonwebtoken';

describe('Profile API', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123!',
      refreshTokens: [],
      failedLoginAttempts: 0,
      lockUntil: null
    });

    // Generate auth token
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    // Clean up test data
    await UserPreference.deleteMany({ userId: testUser._id });
    await User.findByIdAndDelete(testUser._id);
  });

  describe('GET /api/profile', () => {
    it('should get user profile with preferences', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user).toHaveProperty('name');
      expect(response.body.data.user).toHaveProperty('email');
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/profile')
        .expect(401);
    });
  });

  describe('PUT /api/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Test User'
      };

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Updated Test User');
    });

    it('should validate profile update data', async () => {
      const invalidData = {
        name: 'A' // Too short
      };

      await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('PUT /api/profile/preferences', () => {
    it('should update user preferences', async () => {
      const preferencesData = {
        tokensTracked: ['ETH', 'BTC'],
        alertThresholds: {
          minProfit: 15
        },
        notificationSettings: {
          email: false
        }
      };

      const response = await request(app)
        .put('/api/profile/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(preferencesData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tokensTracked).toContain('ETH');
      expect(response.body.data.tokensTracked).toContain('BTC');
    });
  });

  describe('PUT /api/profile/password', () => {
    it('should change user password', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123!',
        newPassword: 'NewPassword123!'
      };

      const response = await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should validate password strength', async () => {
      const weakPasswordData = {
        currentPassword: 'NewPassword123!',
        newPassword: 'weak'
      };

      await request(app)
        .put('/api/profile/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(weakPasswordData)
        .expect(400);
    });
  });

  describe('GET /api/profile/stats', () => {
    it('should get user statistics', async () => {
      const response = await request(app)
        .get('/api/profile/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalOpportunities');
      expect(response.body.data).toHaveProperty('totalAlerts');
      expect(response.body.data).toHaveProperty('accountAge');
      expect(response.body.data).toHaveProperty('lastLogin');
    });
  });
});
