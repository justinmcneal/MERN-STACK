import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import UserPreference from '../models/UserPreference';
import DataService from '../services/DataService';
import { getTokenName } from '../config/tokens';
import { createError } from '../middleware/errorMiddleware';
import { sendSuccess, sendUpdateSuccess } from '../utils/responseHelpers';
import {
  validateAlertThresholds,
  validateTokenList,
  validateCurrency,
  validateRefreshInterval,
  validateArray,
  validateManualMonitoringMinutes,
} from '../utils/validationHelpers';
import {
  buildDefaultPreferences,
  PREFERENCE_CURRENCIES,
  PreferenceCurrency,
  DEFAULT_CURRENCY,
} from '../models/userPreferenceDefaults';

export const getUserPreferences = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  let preferences = await UserPreference.findOne({ userId });

  if (!preferences) {
    preferences = await UserPreference.create(buildDefaultPreferences(userId));
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

  if (updates.manualMonitoringMinutes !== undefined) {
    if (updates.manualMonitoringMinutes === null) {
      updates.manualMonitoringMinutes = null;
    } else {
      updates.manualMonitoringMinutes = validateManualMonitoringMinutes(updates.manualMonitoringMinutes);
    }
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

export const updateManualMonitoringTime = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { manualMonitoringMinutes } = req.body as { manualMonitoringMinutes?: number | null };

  if (manualMonitoringMinutes === undefined) {
    throw createError('Manual monitoring time is required', 400);
  }

  const resolvedValue = manualMonitoringMinutes === null
    ? null
    : validateManualMonitoringMinutes(manualMonitoringMinutes);

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    { manualMonitoringMinutes: resolvedValue },
    { new: true, upsert: true }
  );

  sendUpdateSuccess(res, preferences, 'Manual monitoring time updated successfully');
});

export const updateAppearanceSettings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { currency } = req.body as {
    currency?: PreferenceCurrency;
  };

  const isValidCurrency = currency && PREFERENCE_CURRENCIES.includes(currency);

  if (!isValidCurrency) {
    throw createError('No valid updates provided', 400);
  }

  let preferences = await UserPreference.findOne({ userId });

  const resolvedCurrency = currency ?? DEFAULT_CURRENCY;

  if (!preferences) {
    preferences = new UserPreference(buildDefaultPreferences(userId, resolvedCurrency));
  } else {
    preferences.currency = resolvedCurrency;
  }

  await preferences.save();

  sendUpdateSuccess(res, preferences, 'Appearance settings updated successfully');
});

export const resetPreferences = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    buildDefaultPreferences(userId),
    { new: true, upsert: true }
  );

  sendSuccess(res, preferences, 'Preferences reset to defaults');
});

export const getSupportedTokensForPreferences = asyncHandler(async (req: Request, res: Response) => {
  const dataService = DataService.getInstance();
  const supportedTokens = dataService.getSupportedTokens();
  
  const tokensWithNames = supportedTokens.map((symbol) => ({
    symbol,
    name: getTokenName(symbol),
  }));

  sendSuccess(res, tokensWithNames);
});
