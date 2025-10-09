// test/auth.test.ts
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import User from '../models/User';
import PendingUser from '../models/PendingUser';
import { TokenService } from '../services/TokenService';

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    // Clean up users before each test
    await User.deleteMany({});
    await PendingUser.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        name: 'Test User 1',
        email: 'test@example.com',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'A LINK HAS BEEN SENT TO YOUR EMAIL',
        email: userData.email.toLowerCase(),
      });
      expect(response.body).toHaveProperty('expiresAt');

      const savedUser = await User.findOne({ email: userData.email.toLowerCase() });
      expect(savedUser).toBeNull();

      const pendingUser = await PendingUser.findOne({ email: userData.email.toLowerCase() });
      expect(pendingUser).toBeTruthy();
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        name: 'Test User 1',
        email: 'invalid-email',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('Validation Error');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        name: 'Test User 1',
        email: 'test2@example.com',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('Validation Error');
    });

    it('should reject registration with missing fields', async () => {
      const userData = {
        name: 'Test User 1'
        // Missing email and password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('Validation Error');
    });

    it('should allow re-registering pending users with the same email', async () => {
      const userData = {
        name: 'Test User 1',
        email: 'duplicate@example.com',
        password: 'TestPass123!'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({ success: true });
      const pendingUsers = await PendingUser.find({ email: userData.email.toLowerCase() });
      expect(pendingUsers).toHaveLength(1);
    });

    it('should reject registration when a verified user already exists', async () => {
      const userData = {
        name: 'Existing User 1',
        email: 'existing@example.com',
        password: 'TestPass123!'
      };

      await User.create({
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: await bcrypt.hash(userData.password, 10),
        isEmailVerified: true,
        refreshTokens: [],
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

  expect(response.body.error.message).toContain('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const userData = {
        name: 'Test User 1',
        email: 'test@example.com',
        password: 'TestPass123!'
      };

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        isEmailVerified: true,
        refreshTokens: [],
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user._id');
      expect(response.body.user).toMatchObject({
        email: loginData.email,
        isEmailVerified: true,
      });
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('csrfToken');
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

  expect(response.body.error.message).toContain('Invalid email or password');
    });

    it('should reject login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

  expect(response.body.error.message).toContain('Invalid email or password');
    });

    it('should reject login with missing fields', async () => {
      const loginData = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

  expect(response.body.error).toContain('Validation Error');
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create a test user and get access token
      const userData = {
        name: 'Test User 1',
        email: 'test@example.com',
        password: 'TestPass123!'
      };

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        isEmailVerified: true,
        refreshTokens: [],
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      accessToken = loginResponse.body.accessToken;
    });

    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
  expect(response.body).toHaveProperty('name', 'Test User 1');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

  expect(response.body.error.message).toContain('Not authorized');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

  expect(response.body.error.message).toContain('Not authorized');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out');
    });
  });

  describe('Email verification flow', () => {
    const baseUser = {
      name: 'Verify User 1',
      email: 'verify@example.com',
      password: 'TestPass123!',
    };

    it('should verify email with a valid token for pending user', async () => {
      const verificationToken = 'verify-token';
      const hashedToken = TokenService.hashToken(verificationToken);

      await PendingUser.create({
        name: baseUser.name,
        email: baseUser.email,
        passwordHash: await bcrypt.hash(baseUser.password, 10),
        verificationToken: hashedToken,
        verificationExpires: new Date(Date.now() + 60 * 60 * 1000),
      });

      const response = await request(app)
        .get(`/api/auth/verify-email?token=${verificationToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('Email verified'),
      });

      const createdUser = await User.findOne({ email: baseUser.email });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.isEmailVerified).toBe(true);

      const pendingAfter = await PendingUser.findOne({ email: baseUser.email });
      expect(pendingAfter).toBeNull();
    });

    it('should reject verification with invalid token', async () => {
      await request(app)
        .get('/api/auth/verify-email?token=invalid-token')
        .expect(400);
    });

    it('should resend verification email for pending users', async () => {
      const originalToken = TokenService.hashToken('initial-token');
      await PendingUser.create({
        name: baseUser.name,
        email: 'resend@example.com',
        passwordHash: await bcrypt.hash(baseUser.password, 10),
        verificationToken: originalToken,
        verificationExpires: new Date(Date.now() + 60 * 60 * 1000),
      });

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'resend@example.com' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('Verification email sent'),
      });

      const updatedPending = await PendingUser.findOne({ email: 'resend@example.com' });
      expect(updatedPending?.verificationToken).toBeTruthy();
      expect(updatedPending?.verificationToken).not.toEqual(originalToken);
      expect(updatedPending?.verificationExpires).toBeTruthy();
    });

    it('should not resend verification for already verified users', async () => {
      const user = await User.create({
        ...baseUser,
        email: 'verified@example.com',
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        refreshTokens: [],
      });

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: user.email })
        .expect(400);

      expect(response.body.error.message).toContain('already verified');
    });
  });
});
