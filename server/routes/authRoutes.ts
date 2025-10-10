// routes/authRoutes.ts
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, authUser, getMe, refreshToken, logoutUser, getCSRFToken, verifyEmail, resendVerification, regenerateVerification, getDebugToken } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validate, authSchemas } from '../middleware/validationMiddleware';

const router = Router();

// Rate limiter: max 10 requests per minute per IP for auth endpoints
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  message: 'Too many requests, please try again later.',
});

// Auth routes with validation
router.post('/register', authRateLimiter, validate(authSchemas.register), registerUser);
router.post('/login', authRateLimiter, validate(authSchemas.login), authUser);
router.post('/refresh', authRateLimiter, refreshToken);
router.get('/csrf', getCSRFToken);
router.get('/me', protect, getMe);
router.post('/logout', logoutUser);

// Email verification routes
router.get('/verify-email', verifyEmail);
router.get('/debug-token', getDebugToken); // DEBUG ONLY
router.post('/regenerate-verification', authRateLimiter, regenerateVerification);
router.post('/resend-verification', authRateLimiter, validate(authSchemas.resendVerification), resendVerification);

export default router;