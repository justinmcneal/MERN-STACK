import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import UserPreference from '../models/UserPreference';
import DataService from '../services/DataService';
import { SUPPORTED_TOKENS, getTokenName } from '../config/tokens';
import { createError } from '../middleware/errorMiddleware';
import { sendSuccess, sendUpdateSuccess } from '../utils/responseHelpers';
import { 
  validateAlertThresholds, 
  validateTokenList, 
  validateCurrency, 
  validateRefreshInterval, 
  validateRequired, 
  validateArray 
} from '../utils/validationHelpers';

export const getUserPreferences = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  let preferences = await UserPreference.findOne({ userId });

  if (!preferences) {
    preferences = await UserPreference.create({
      userId,
      tokensTracked: [...SUPPORTED_TOKENS],
      alertThresholds: {
        minProfit: 10,
        maxGasCost: 50,
        minROI: 1,
        minScore: 0.7
      },
      notificationSettings: {
        email: true,
        dashboard: true,
        telegram: false,
        discord: false
      },
      refreshInterval: 30,
      currency: 'USD'
    });
  }

  sendSuccess(res, preferences);
});

export const updateUserPreferences = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const updates = req.body;

  if (updates.tokensTracked) {
    const dataService = DataService.getInstance();
    const supportedTokens = dataService.getSupportedTokens();
    updates.tokensTracked = validateTokenList(updates.tokensTracked, supportedTokens);
  }

  if (updates.alertThresholds) {
    updates.alertThresholds = validateAlertThresholds(updates.alertThresholds);
  }

  if (updates.notificationSettings && !updates.notificationSettings.dashboard) {
    updates.notificationSettings.dashboard = true;
  }

  if (updates.refreshInterval) {
    updates.refreshInterval = validateRefreshInterval(updates.refreshInterval);
  }

  if (updates.currency) {
    updates.currency = validateCurrency(updates.currency);
  }

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, upsert: true }
  );

  sendUpdateSuccess(res, preferences, 'Preferences updated successfully');
});

export const updateTrackedTokens = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { tokens } = req.body;

  validateArray(tokens, 'Tokens');

  const dataService = DataService.getInstance();
  const supportedTokens = dataService.getSupportedTokens();
  
  const validTokens = validateTokenList(tokens, supportedTokens);

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    { tokensTracked: validTokens },
    { new: true, upsert: true }
  );

  sendUpdateSuccess(res, preferences, 'Tracked tokens updated successfully');
});

export const updateAlertThresholds = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { alertThresholds } = req.body;

  if (!alertThresholds || typeof alertThresholds !== 'object') {
    throw createError('Alert thresholds must be an object', 400);
  }

  const validated = validateAlertThresholds(alertThresholds);

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    { alertThresholds: validated },
    { new: true, upsert: true }
  );

  sendUpdateSuccess(res, preferences, 'Alert thresholds updated successfully');
});

export const updateNotificationSettings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { notificationSettings } = req.body;

  if (!notificationSettings || typeof notificationSettings !== 'object') {
    throw createError('Notification settings must be an object', 400);
  }

  notificationSettings.dashboard = true;

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    { notificationSettings },
    { new: true, upsert: true }
  );

  sendUpdateSuccess(res, preferences, 'Notification settings updated successfully');
});

export const updateAppearanceSettings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { currency } = req.body as {
    currency?: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'PHP';
  };

  const isValidCurrency = currency && ['USD', 'EUR', 'GBP', 'JPY', 'PHP'].includes(currency);

  if (!isValidCurrency) {
    throw createError('No valid updates provided', 400);
  }

  let preferences = await UserPreference.findOne({ userId });

  if (!preferences) {
    preferences = new UserPreference({
      userId,
      tokensTracked: [...SUPPORTED_TOKENS],
      alertThresholds: {
        minProfit: 10,
        maxGasCost: 50,
        minROI: 1,
        minScore: 0.7
      },
      notificationSettings: {
        email: true,
        dashboard: true,
        telegram: false,
        discord: false
      },
      refreshInterval: 30,
      currency: isValidCurrency ? currency : 'USD'
    });
  } else {
    if (isValidCurrency) {
      preferences.currency = currency!;
    }
  }

  await preferences.save();

  sendUpdateSuccess(res, preferences, 'Appearance settings updated successfully');
});

// POST /api/preferences/reset - Reset preferences to defaults
export const resetPreferences = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const defaultPreferences = {
    userId,
    tokensTracked: [...SUPPORTED_TOKENS],
    alertThresholds: {
      minProfit: 10,
      maxGasCost: 50,
      minROI: 1, // More realistic default: 1% instead of 5%
      minScore: 0.7
    },
    notificationSettings: {
      email: true,
      dashboard: true,
      telegram: false,
      discord: false
    },
    refreshInterval: 30,
    currency: 'USD'
  };

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    defaultPreferences,
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: 'Preferences reset to defaults',
    data: preferences
  });
});

// GET /api/preferences/supported-tokens - Get list of supported tokens
export const getSupportedTokensForPreferences = asyncHandler(async (req: Request, res: Response) => {
  const dataService = DataService.getInstance();
  const supportedTokens = dataService.getSupportedTokens();
  
  const tokensWithNames = supportedTokens.map(symbol => ({
    symbol,
    name: getTokenName(symbol)
  }));

  res.json({
    success: true,
    data: tokensWithNames
  });
});

// Helper function now imported from shared config
