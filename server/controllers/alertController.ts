import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Alert from '../models/Alert';
import Opportunity from '../models/Opportunity';

// GET /api/alerts - Get user alerts with filtering
export const getUserAlerts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { 
    isRead,
    alertType,
    priority,
    limit = 50,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  let query: any = { userId };

  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  if (alertType) {
    query.alertType = alertType;
  }

  if (priority) {
    query.priority = priority;
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const alerts = await Alert.find(query)
    .populate('opportunityId', 'tokenId chainFrom chainTo estimatedProfit score status')
    .sort(sort)
    .limit(Number(limit))
    .skip(Number(skip));

  const total = await Alert.countDocuments(query);

  res.json({
    success: true,
    count: alerts.length,
    total,
    data: alerts
  });
});

// GET /api/alerts/:id - Get specific alert
export const getAlertById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const alert = await Alert.findOne({ _id: id, userId })
    .populate('opportunityId', 'tokenId chainFrom chainTo estimatedProfit score status');

  if (!alert) {
    res.status(404);
    throw new Error('Alert not found');
  }

  res.json({
    success: true,
    data: alert
  });
});

// POST /api/alerts/mark-read - Mark alerts as read
export const markAlertsAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { alertIds, markAll } = req.body;

  let result;
  
  if (markAll) {
    // Mark all user alerts as read
    result = await Alert.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  } else if (alertIds && Array.isArray(alertIds)) {
    // Mark specific alerts as read
    result = await Alert.updateMany(
      { _id: { $in: alertIds }, userId },
      { isRead: true }
    );
  } else {
    res.status(400);
    throw new Error('Invalid request: provide alertIds array or markAll: true');
  }

  res.json({
    success: true,
    message: `${result.modifiedCount} alert(s) marked as read`,
    modifiedCount: result.modifiedCount
  });
});

// DELETE /api/alerts/:id - Delete specific alert
export const deleteAlert = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const alert = await Alert.findOneAndDelete({ _id: id, userId });

  if (!alert) {
    res.status(404);
    throw new Error('Alert not found');
  }

  res.json({
    success: true,
    message: 'Alert deleted successfully'
  });
});

// DELETE /api/alerts - Delete multiple alerts
export const deleteAlerts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { alertIds, deleteAll, deleteRead } = req.body;

  let query: any = { userId };

  if (deleteAll) {
    // Delete all user alerts
    query = { userId };
  } else if (deleteRead) {
    // Delete only read alerts
    query.isRead = true;
  } else if (alertIds && Array.isArray(alertIds)) {
    // Delete specific alerts
    query._id = { $in: alertIds };
  } else {
    res.status(400);
    throw new Error('Invalid request: provide alertIds array, deleteAll: true, or deleteRead: true');
  }

  const result = await Alert.deleteMany(query);

  res.json({
    success: true,
    message: `${result.deletedCount} alert(s) deleted`,
    deletedCount: result.deletedCount
  });
});

// GET /api/alerts/unread-count - Get count of unread alerts
export const getUnreadAlertCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const count = await Alert.countDocuments({ userId, isRead: false });

  res.json({
    success: true,
    unreadCount: count
  });
});

// GET /api/alerts/stats - Get alert statistics
export const getAlertStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const stats = await Alert.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: '$alertType',
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        },
        avgPriority: {
          $avg: {
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'urgent'] }, then: 4 },
                { case: { $eq: ['$priority', 'high'] }, then: 3 },
                { case: { $eq: ['$priority', 'medium'] }, then: 2 },
                { case: { $eq: ['$priority', 'low'] }, then: 1 }
              ],
              default: 2
            }
          }
        }
      }
    }
  ]);

  const totalAlerts = await Alert.countDocuments({ userId });
  const unreadAlerts = await Alert.countDocuments({ userId, isRead: false });

  res.json({
    success: true,
    data: {
      byType: stats,
      totalAlerts,
      unreadAlerts,
      readAlerts: totalAlerts - unreadAlerts
    }
  });
});

// POST /api/alerts/test - Create test alert (for development/testing)
export const createTestAlert = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  
  // Debug: Log the request body
  console.log('Alert test - Request body:', req.body);
  console.log('Alert test - Request headers:', req.headers);
  
  const { message, priority = 'medium', alertType = 'system' } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  const alert = await Alert.create({
    userId,
    message,
    alertType,
    priority,
    isRead: false
  });

  res.json({
    success: true,
    message: 'Test alert created successfully',
    data: alert
  });
});

// GET /api/alerts/types - Get available alert types
export const getAlertTypes = asyncHandler(async (req: Request, res: Response) => {
  const alertTypes = [
    { value: 'opportunity', label: 'Opportunity Alert', description: 'New profitable arbitrage opportunities' },
    { value: 'price', label: 'Price Alert', description: 'Token price movements' },
    { value: 'system', label: 'System Alert', description: 'Platform notifications' },
    { value: 'custom', label: 'Custom Alert', description: 'User-defined alerts' }
  ];

  res.json({
    success: true,
    data: alertTypes
  });
});

// GET /api/alerts/priorities - Get available alert priorities
export const getAlertPriorities = asyncHandler(async (req: Request, res: Response) => {
  const priorities = [
    { value: 'low', label: 'Low', description: 'Informational alerts', color: '#10b981' },
    { value: 'medium', label: 'Medium', description: 'Moderate importance', color: '#f59e0b' },
    { value: 'high', label: 'High', description: 'Important alerts', color: '#ef4444' },
    { value: 'urgent', label: 'Urgent', description: 'Requires immediate attention', color: '#dc2626' }
  ];

  res.json({
    success: true,
    data: priorities
  });
});

// POST /api/alerts/cleanup - Clean up old alerts (admin function)
export const cleanupOldAlerts = asyncHandler(async (req: Request, res: Response) => {
  const { daysOld = 30 } = req.body;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Alert.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true,
    priority: { $in: ['low', 'medium'] } // Only delete low/medium priority read alerts
  });

  res.json({
    success: true,
    message: `Cleanup completed: ${result.deletedCount} old alerts deleted`,
    deletedCount: result.deletedCount,
    daysOld
  });
});

// POST /api/alerts/create-opportunity-alert - Helper to create opportunity alert
export const createOpportunityAlert = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { opportunityId, message, priority } = req.body;

  if (!opportunityId || !message) {
    res.status(400);
    throw new Error('opportunityId and message are required');
  }

  // Verify opportunity exists
  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  const alert = await Alert.create({
    userId,
    opportunityId,
    message,
    alertType: 'opportunity',
    priority: priority || 'medium',
    isRead: false
  });

  res.json({
    success: true,
    message: 'Opportunity alert created successfully',
    data: alert
  });
});
