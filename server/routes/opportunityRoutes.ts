import { Router } from 'express';
import {
  getOpportunities,
  getOpportunityById,
  scanOpportunities,
  markOpportunityAsExpired,
  markOpportunityAsExecuted,
  getOpportunityStats,
  getSupportedChainPairs
} from '../controllers/opportunityController';

const router = Router();

router.get('/', getOpportunities);
router.get('/stats', getOpportunityStats);
router.get('/pairs', getSupportedChainPairs);
router.get('/:id', getOpportunityById);
router.post('/scan', scanOpportunities);
router.post('/:id/expire', markOpportunityAsExpired);
router.post('/:id/execute', markOpportunityAsExecuted);

export default router;
