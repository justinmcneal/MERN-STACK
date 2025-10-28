import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Alert from '../models/Alert';
import Opportunity from '../models/Opportunity';
import { createError } from '../middleware/errorMiddleware';
import { sendSuccess, sendPaginatedSuccess, sendDeleteSuccess, sendCreatedSuccess } from '../utils/responseHelpers';
import { buildSortObject, parsePaginationParams } from '../utils/queryHelpers';
import { validateRequired } from '../utils/validationHelpers';

export const getUserAlerts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { 
    isRead,
    alertType,
    priority,
  } = req.query;

  const { limit, skip, sortBy, sortOrder } = parsePaginationParams(req.query);

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

  const sort = buildSortObject(sortBy, sortOrder);

  const alerts = await Alert.find(query)
    .populate({
      path: 'opportunityId',
      select: 'tokenId chainFrom chainTo estimatedProfit score status',
      populate: {
        path: 'tokenId',
        select: 'symbol name'
      }
    })
    .sort(sort)
    .limit(limit)
    .skip(skip);

  const total = await Alert.countDocuments(query);

  sendPaginatedSuccess(res, alerts, total);
});

export const getAlertById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const alert = await Alert.findOne({ _id: id, userId })
    .populate({
      path: 'opportunityId',
      select: 'tokenId chainFrom chainTo estimatedProfit score status',
      populate: {
        path: 'tokenId',
        select: 'symbol name'
      }
    });

  if (!alert) {
    throw createError('Alert not found', 404);
  }

  sendSuccess(res, alert);
});

export const markAlertsAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { alertIds, markAll } = req.body;

  let result;
  
  if (markAll) {
    result = await Alert.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  } else if (alertIds && Array.isArray(alertIds)) {
    result = await Alert.updateMany(
      { _id: { $in: alertIds }, userId },
      { isRead: true }
    );
  } else {
    throw createError('Invalid request: provide alertIds array or markAll: true', 400);
  }

  sendSuccess(res, { modifiedCount: result.modifiedCount }, `${result.modifiedCount} alert(s) marked as read`);
});

export const deleteAlert = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const alert = await Alert.findOneAndDelete({ _id: id, userId });

  if (!alert) {
    throw createError('Alert not found', 404);
  }

  sendDeleteSuccess(res, 'Alert deleted successfully');
});

export const deleteAlerts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { alertIds, deleteAll, deleteRead } = req.body;

  let query: any = { userId };

  if (deleteAll) {
    query = { userId };
  } else if (deleteRead) {
    query.isRead = true;
  } else if (alertIds && Array.isArray(alertIds)) {
    query._id = { $in: alertIds };
  } else {
    throw createError('Invalid request: provide alertIds array, deleteAll: true, or deleteRead: true', 400);
  }

  const result = await Alert.deleteMany(query);

  sendSuccess(res, { deletedCount: result.deletedCount }, `${result.deletedCount} alert(s) deleted`);
});

export const getUnreadAlertCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const count = await Alert.countDocuments({ userId, isRead: false });

  sendSuccess(res, { unreadCount: count });
});

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

  sendSuccess(res, {
    byType: stats,
    totalAlerts,
    unreadAlerts,
    readAlerts: totalAlerts - unreadAlerts
  });
});

export const createTestAlert = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { message, priority = 'medium', alertType = 'system' } = req.body;

  validateRequired(message, 'Message');

  const alert = await Alert.create({
    userId,
    message,
    alertType,
    priority,
    isRead: false
  });

  sendCreatedSuccess(res, alert, 'Test alert created successfully');
});

export const getAlertTypes = asyncHandler(async (req: Request, res: Response) => {
  const alertTypes = [
    { value: 'opportunity', label: 'Opportunity Alert', description: 'New profitable arbitrage opportunities' },
    { value: 'price', label: 'Price Alert', description: 'Token price movements' },
    { value: 'system', label: 'System Alert', description: 'Platform notifications' },
    { value: 'custom', label: 'Custom Alert', description: 'User-defined alerts' }
  ];

  sendSuccess(res, alertTypes);
});

export const getAlertPriorities = asyncHandler(async (req: Request, res: Response) => {
  const priorities = [
    { value: 'low', label: 'Low', description: 'Informational alerts', color: '#10b981' },
    { value: 'medium', label: 'Medium', description: 'Moderate importance', color: '#f59e0b' },
    { value: 'high', label: 'High', description: 'Important alerts', color: '#ef4444' },
    { value: 'urgent', label: 'Urgent', description: 'Requires immediate attention', color: '#dc2626' }
  ];

  sendSuccess(res, priorities);
});

export const cleanupOldAlerts = asyncHandler(async (req: Request, res: Response) => {
  const { daysOld = 30 } = req.body;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Alert.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true,
    priority: { $in: ['low', 'medium'] }
  });

  sendSuccess(res, { deletedCount: result.deletedCount, daysOld }, `Cleanup completed: ${result.deletedCount} old alerts deleted`);
});

export const createOpportunityAlert = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { opportunityId, message, priority } = req.body;

  validateRequired(opportunityId, 'opportunityId');
  validateRequired(message, 'message');

  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) {
    throw createError('Opportunity not found', 404);
  }

  const alert = await Alert.create({
    userId,
    opportunityId,
    message,
    alertType: 'opportunity',
    priority: priority || 'medium',
    isRead: false
  });

  sendCreatedSuccess(res, alert, 'Opportunity alert created successfully');
});
