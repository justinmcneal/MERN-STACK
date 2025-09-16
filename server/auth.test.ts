require('dotenv').config({ path: __dirname + '/.env' });
import request from 'supertest';
import app from './app';
import connectDB from './config/db';

beforeAll(async () => {
  console.log('MONGO_URI:', process.env.MONGO_URI);
  await connectDB();
});

describe('Auth API', () => {
  const uniqueEmail = `testuser_${Date.now()}@example.com`;

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'testuser',
        email: uniqueEmail,
        password: 'Test1234!'
      });
    if (res.statusCode !== 201) {
      console.error('Register error:', res.body);
    }
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Test1234!'
      });
    if (res.statusCode !== 200) {
      console.error('Login error:', res.body);
    }
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });
});
