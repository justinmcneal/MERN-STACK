import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { submitContactSupport } from '../controllers/contactSupportController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

const contactSupportRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  message: 'Too many support requests, please try again later.',
});

router.post('/contact', contactSupportRateLimiter, protect, submitContactSupport);

export default router;
