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
  createOpportunityAlert
} from '../controllers/alertController';

const router = Router();

// All routes require authentication
router.use(protect);

// GET /api/alerts - Get user alerts with filtering
router.get('/', getUserAlerts);

// GET /api/alerts/unread-count - Get count of unread alerts
router.get('/unread-count', getUnreadAlertCount);

// GET /api/alerts/stats - Get alert statistics
router.get('/stats', getAlertStats);

// GET /api/alerts/types - Get available alert types
router.get('/types', getAlertTypes);

// GET /api/alerts/priorities - Get available alert priorities
router.get('/priorities', getAlertPriorities);

// GET /api/alerts/:id - Get specific alert
router.get('/:id', getAlertById);

// POST /api/alerts/mark-read - Mark alerts as read
router.post('/mark-read', markAlertsAsRead);

// POST /api/alerts/test - Create test alert
router.post('/test', createTestAlert);

// POST /api/alerts/cleanup - Clean up old alerts
router.post('/cleanup', cleanupOldAlerts);

// POST /api/alerts/create-opportunity-alert - Create opportunity alert
router.post('/create-opportunity-alert', createOpportunityAlert);

// DELETE /api/alerts - Delete multiple alerts
router.delete('/', deleteAlerts);

// DELETE /api/alerts/:id - Delete specific alert
router.delete('/:id', deleteAlert);

export default router;
