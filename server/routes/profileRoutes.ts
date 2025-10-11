// routes/profileRoutes.ts
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  getUserStats, 
  deleteAccount,
  uploadProfilePicture
} from '../controllers/profileController';
import { protect } from '../middleware/authMiddleware';
import { validate, profileSchemas } from '../middleware/validationMiddleware';
import { uploadProfilePicture as uploadMiddleware, handleUploadError } from '../middleware/uploadMiddleware';

const router = Router();

// Rate limiter: max 20 requests per minute per IP for profile endpoints
const profileRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 20 : 100,
  message: 'Too many requests, please try again later.',
});

// All profile routes require authentication
router.use(protect);

// Profile routes with validation
router.get('/', profileRateLimiter, getProfile);
router.put('/', profileRateLimiter, validate(profileSchemas.updateProfile), updateProfile);
router.put('/password', profileRateLimiter, validate(profileSchemas.changePassword), changePassword);
router.get('/stats', profileRateLimiter, getUserStats);
router.delete('/', profileRateLimiter, validate(profileSchemas.deleteAccount), deleteAccount);

// Profile picture upload route
router.post('/upload-avatar', profileRateLimiter, uploadMiddleware, handleUploadError, uploadProfilePicture);

export default router;
