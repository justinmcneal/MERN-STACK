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

// GET /api/opportunities - Get all opportunities with filtering
router.get('/', getOpportunities);

// GET /api/opportunities/stats - Get opportunity statistics
router.get('/stats', getOpportunityStats);

// GET /api/opportunities/pairs - Get supported chain pairs
router.get('/pairs', getSupportedChainPairs);

// GET /api/opportunities/:id - Get opportunity by ID
router.get('/:id', getOpportunityById);

// POST /api/opportunities/scan - Trigger opportunity scan
router.post('/scan', scanOpportunities);

// POST /api/opportunities/:id/expire - Mark opportunity as expired
router.post('/:id/expire', markOpportunityAsExpired);

// POST /api/opportunities/:id/execute - Mark opportunity as executed
router.post('/:id/execute', markOpportunityAsExecuted);

export default router;
