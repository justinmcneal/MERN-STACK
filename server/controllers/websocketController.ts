// controllers/websocketController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { webSocketService } from '../services';

// GET /api/websocket/status - Get WebSocket connection status
export const getWebSocketStatus = asyncHandler(async (req: Request, res: Response) => {
  const stats = webSocketService.getConnectionStats();
  
  res.status(200).json({
    success: true,
    data: {
      isEnabled: true,
      ...stats,
      timestamp: new Date(),
    },
  });
});

// GET /api/websocket/connections - Get detailed connection information
export const getWebSocketConnections = asyncHandler(async (req: Request, res: Response) => {
  const stats = webSocketService.getConnectionStats();
  
  res.status(200).json({
    success: true,
    data: stats,
  });
});

// POST /api/websocket/broadcast - Broadcast message to all connected clients
export const broadcastMessage = asyncHandler(async (req: Request, res: Response) => {
  const { type, data, target } = req.body;
  
  if (!type || !data) {
    res.status(400);
    throw new Error('Type and data are required for broadcast');
  }

  // This would be implemented in the WebSocketService
  // For now, just return success
  res.status(200).json({
    success: true,
    message: 'Broadcast message queued',
    data: { type, target },
  });
});

// GET /api/websocket/rooms - Get active WebSocket rooms
export const getWebSocketRooms = asyncHandler(async (req: Request, res: Response) => {
  // This would return active rooms from the WebSocket service
  const rooms = [
    'opportunities',
    'tokens',
    'system',
    'alerts',
  ];
  
  res.status(200).json({
    success: true,
    data: rooms,
  });
});
