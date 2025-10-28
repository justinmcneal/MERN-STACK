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

const profileRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 100,
  message: 'Too many requests, please try again later.',
});

router.use(protect);

router.get('/', profileRateLimiter, getProfile);
router.put('/', profileRateLimiter, validate(profileSchemas.updateProfile), updateProfile);
router.put('/password', profileRateLimiter, validate(profileSchemas.changePassword), changePassword);
router.get('/stats', profileRateLimiter, getUserStats);
router.delete('/', profileRateLimiter, validate(profileSchemas.deleteAccount), deleteAccount);

router.post('/upload-avatar', profileRateLimiter, uploadMiddleware, handleUploadError, uploadProfilePicture);

export default router;
