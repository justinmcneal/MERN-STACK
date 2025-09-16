import { Router } from 'express';
import { registerUser, authUser, getMe, refreshToken, logoutUser } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Auth routes
router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/me', protect, getMe);

// Logout route to clear refresh token cookie
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken); // optional endpoint to get new access token

export default router;