import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, authUser, getMe, refreshToken, logoutUser, getCSRFToken, verifyEmail, resendVerification, regenerateVerification, getDebugToken, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validate, authSchemas } from '../middleware/validationMiddleware';

const router = Router();

const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  message: 'Too many requests, please try again later.',
});

router.post('/register', authRateLimiter, validate(authSchemas.register), registerUser);
router.post('/login', authRateLimiter, validate(authSchemas.login), authUser);
router.post('/refresh', authRateLimiter, refreshToken);
router.get('/csrf', getCSRFToken);
router.get('/me', protect, getMe);
router.post('/logout', logoutUser);
router.get('/verify-email', verifyEmail);
router.get('/debug-token', getDebugToken);
router.post('/regenerate-verification', authRateLimiter, regenerateVerification);
router.post('/resend-verification', authRateLimiter, validate(authSchemas.resendVerification), resendVerification);
router.post('/forgot-password', authRateLimiter, validate(authSchemas.forgotPassword), forgotPassword);
router.post('/reset-password', authRateLimiter, validate(authSchemas.resetPassword), resetPassword);

export default router;