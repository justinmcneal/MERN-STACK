import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { webSocketService } from '../services';

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

export const getWebSocketConnections = asyncHandler(async (req: Request, res: Response) => {
  const stats = webSocketService.getConnectionStats();
  
  res.status(200).json({
    success: true,
    data: stats,
  });
});

export const broadcastMessage = asyncHandler(async (req: Request, res: Response) => {
  const { type, data, target } = req.body;
  
  if (!type || !data) {
    res.status(400);
    throw new Error('Type and data are required for broadcast');
  }

  res.status(200).json({
    success: true,
    message: 'Broadcast message queued',
    data: { type, target },
  });
});

export const getWebSocketRooms = asyncHandler(async (req: Request, res: Response) => {
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
