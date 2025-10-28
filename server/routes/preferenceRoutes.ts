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
  getSupportedTokensForPreferences
} from '../controllers/preferenceController';

const router = Router();
router.use(protect);
router.get('/', getUserPreferences);
router.put('/', updateUserPreferences);
router.get('/supported-tokens', getSupportedTokensForPreferences);
router.put('/tokens', updateTrackedTokens);
router.put('/alerts', updateAlertThresholds);
router.put('/notifications', updateNotificationSettings);
router.put('/appearance', updateAppearanceSettings);
router.post('/reset', resetPreferences);

export default router;
