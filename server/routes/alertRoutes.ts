import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getUserAlerts,
  getAlertById,
  markAlertsAsRead,
  deleteAlert,
  deleteAlerts,
  getUnreadAlertCount,
  getAlertStats,
  createTestAlert,
  getAlertTypes,
  getAlertPriorities,
  cleanupOldAlerts,
  createOpportunityAlert,
  sendTestEmailNotification
} from '../controllers/alertController';

const router = Router();

router.use(protect);
router.get('/', getUserAlerts);
router.get('/unread-count', getUnreadAlertCount);
router.get('/stats', getAlertStats);
router.get('/types', getAlertTypes);
router.get('/priorities', getAlertPriorities);
router.get('/:id', getAlertById);
router.post('/mark-read', markAlertsAsRead);
router.post('/test', createTestAlert);
router.post('/test-email', sendTestEmailNotification);
router.post('/cleanup', cleanupOldAlerts);
router.post('/create-opportunity-alert', createOpportunityAlert);
router.delete('/', deleteAlerts);
router.delete('/:id', deleteAlert);

export default router;
