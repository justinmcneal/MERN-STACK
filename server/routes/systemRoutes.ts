import express from 'express';
import systemController from '../controllers/systemController';

const router = express.Router();

// GET /api/system/health
router.get('/health', systemController.getHealth);

export default router;
