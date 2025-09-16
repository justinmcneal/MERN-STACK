import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, authUser, getMe, refreshToken, logoutUser } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Rate limiter: max 10 requests per minute per IP for auth endpoints
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  message: 'Too many requests, please try again later.',
});

// Auth routes
router.post('/register', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, authUser);
router.post('/refresh', authRateLimiter, refreshToken);
router.get('/me', protect, getMe);

// Logout route to clear refresh token cookie
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken); // optional endpoint to get new access token

export default router;