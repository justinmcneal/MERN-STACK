import { Router } from 'express';
import {
  getWebSocketStatus,
  getWebSocketConnections,
  broadcastMessage,
  getWebSocketRooms
} from '../controllers/websocketController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.route('/status').get(protect, getWebSocketStatus);
router.route('/connections').get(protect, getWebSocketConnections);
router.route('/broadcast').post(protect, broadcastMessage);
router.route('/rooms').get(protect, getWebSocketRooms);

export default router;
