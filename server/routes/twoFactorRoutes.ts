// routes/twoFactorRoutes.ts
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { 
  setupTwoFactor, 
  verifyTwoFactorSetup, 
  verifyTwoFactorToken, 
  disableTwoFactor, 
  regenerateBackupCodes, 
  getTwoFactorStatus,
  twoFactorSchemas 
} from '../controllers/twoFactorController';
import { protect } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';

const router = Router();

// Rate limiter: max 5 requests per minute per IP for 2FA endpoints
const twoFactorRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 5 : 20,
  message: 'Too many two-factor authentication attempts, please try again later.',
});

// All 2FA routes require authentication
router.use(protect);

// 2FA setup and management routes
router.post('/setup', twoFactorRateLimiter, validate(twoFactorSchemas.setup), setupTwoFactor);
router.post('/verify-setup', twoFactorRateLimiter, validate(twoFactorSchemas.verifySetup), verifyTwoFactorSetup);
router.post('/verify', twoFactorRateLimiter, validate(twoFactorSchemas.verifyToken), verifyTwoFactorToken);
router.post('/disable', twoFactorRateLimiter, validate(twoFactorSchemas.disable), disableTwoFactor);
router.post('/regenerate-backup-codes', twoFactorRateLimiter, regenerateBackupCodes);
router.get('/status', getTwoFactorStatus);

export default router;
