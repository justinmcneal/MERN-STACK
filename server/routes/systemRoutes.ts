import { Router } from 'express';
import {
  getSystemStatus,
  getHealthCheck,
  triggerOpportunityScan,
  triggerDataUpdate,
  restartBackgroundJobs,
  getScannerStatus,
  getPipelineStatus
} from '../controllers/systemController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// System status and health routes (public)
router.route('/status').get(getSystemStatus);
router.route('/health').get(getHealthCheck);

// Protected routes for system management
router.route('/scan').post(protect, triggerOpportunityScan);
router.route('/update-data').post(protect, triggerDataUpdate);
router.route('/restart-jobs').post(protect, restartBackgroundJobs);
router.route('/scanner-status').get(protect, getScannerStatus);
router.route('/pipeline-status').get(protect, getPipelineStatus);

export default router;
