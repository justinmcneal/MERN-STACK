import express from 'express';
import systemController from '../controllers/systemController';

const router = express.Router();

router.get('/health', systemController.getHealth);
router.get('/debug-smtp', systemController.debugSMTP);

export default router;
