import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getUserPreferences,
  updateUserPreferences,
  updateTrackedTokens,
  updateAlertThresholds,
  updateNotificationSettings,
  updateAppearanceSettings,
  resetPreferences,
  getSupportedTokensForPreferences,
  getAvailableThemes
} from '../controllers/preferenceController';

const router = Router();

// All routes require authentication
router.use(protect);

// GET /api/preferences - Get user preferences
router.get('/', getUserPreferences);

// PUT /api/preferences - Update user preferences
router.put('/', updateUserPreferences);

// GET /api/preferences/supported-tokens - Get supported tokens list
router.get('/supported-tokens', getSupportedTokensForPreferences);

// GET /api/preferences/available-themes - Get available themes
router.get('/available-themes', getAvailableThemes);

// PUT /api/preferences/tokens - Update tracked tokens
router.put('/tokens', updateTrackedTokens);

// PUT /api/preferences/alerts - Update alert thresholds
router.put('/alerts', updateAlertThresholds);

// PUT /api/preferences/notifications - Update notification settings
router.put('/notifications', updateNotificationSettings);

// PUT /api/preferences/appearance - Update appearance settings
router.put('/appearance', updateAppearanceSettings);

// POST /api/preferences/reset - Reset preferences to defaults
router.post('/reset', resetPreferences);

export default router;
