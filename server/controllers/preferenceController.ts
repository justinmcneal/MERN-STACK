import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import UserPreference from '../models/UserPreference';
import DataService from '../services/DataService';
import { SUPPORTED_TOKENS, getTokenName } from '../config/tokens';

// GET /api/preferences - Get user preferences
export const getUserPreferences = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  let preferences = await UserPreference.findOne({ userId });

  // Create default preferences if none exist
  if (!preferences) {
    preferences = await UserPreference.create({
      userId,
      tokensTracked: [...SUPPORTED_TOKENS], // Default tokens
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
      theme: 'auto',
      currency: 'USD'
    });
  }

  res.json({
    success: true,
    data: preferences
  });
});

// PUT /api/preferences - Update user preferences
export const updateUserPreferences = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const updates = req.body;

  // Validate tokensTracked if provided
  if (updates.tokensTracked) {
    const dataService = DataService.getInstance();
    const supportedTokens = dataService.getSupportedTokens();
    
    // Filter out unsupported tokens
    updates.tokensTracked = updates.tokensTracked.filter((token: string) => 
      supportedTokens.includes(token.toUpperCase())
    );
    
    // Ensure at least one token is tracked
    if (updates.tokensTracked.length === 0) {
      updates.tokensTracked = ['ETH']; // Default to ETH
    }
  }

  // Validate alert thresholds
  if (updates.alertThresholds) {
    const thresholds = updates.alertThresholds;
    
    if (thresholds.minProfit < 0) thresholds.minProfit = 0;
    if (thresholds.maxGasCost < 0) thresholds.maxGasCost = 1000;
    if (thresholds.minROI < 0) thresholds.minROI = 0;
    if (thresholds.minScore < 0 || thresholds.minScore > 1) {
      thresholds.minScore = Math.max(0, Math.min(1, thresholds.minScore));
    }
  }

  // Validate notification settings
  if (updates.notificationSettings) {
    // Ensure at least dashboard notifications are enabled
    if (!updates.notificationSettings.dashboard) {
      updates.notificationSettings.dashboard = true;
    }
  }

  // Validate refresh interval
  if (updates.refreshInterval) {
    if (updates.refreshInterval < 5) updates.refreshInterval = 5;
    if (updates.refreshInterval > 300) updates.refreshInterval = 300;
  }

  // Validate theme
  if (updates.theme && !['light', 'dark', 'auto'].includes(updates.theme)) {
    updates.theme = 'auto';
  }

  // Validate currency
  if (updates.currency && !['USD', 'EUR', 'GBP', 'JPY', 'PHP'].includes(updates.currency)) {
    updates.currency = 'USD';
  }

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: preferences
  });
});

// PUT /api/preferences/tokens - Update tracked tokens
export const updateTrackedTokens = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  
  // Debug: Log the request body
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  const { tokens } = req.body;

  if (!Array.isArray(tokens)) {
    res.status(400);
    throw new Error('Tokens must be an array');
  }

  const dataService = DataService.getInstance();
  const supportedTokens = dataService.getSupportedTokens();
  
  // Validate and filter tokens
  const validTokens = tokens
    .map((token: string) => token.toUpperCase())
    .filter((token: string) => supportedTokens.includes(token));

  if (validTokens.length === 0) {
    res.status(400);
    throw new Error('No valid tokens provided');
  }

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    { tokensTracked: validTokens },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: 'Tracked tokens updated successfully',
    data: preferences
  });
});

// PUT /api/preferences/alerts - Update alert thresholds
export const updateAlertThresholds = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { alertThresholds } = req.body;

  if (!alertThresholds || typeof alertThresholds !== 'object') {
    res.status(400);
    throw new Error('Alert thresholds must be an object');
  }

  // Validation
  if (alertThresholds.minProfit !== undefined && alertThresholds.minProfit < 0) {
    alertThresholds.minProfit = 0;
  }
  if (alertThresholds.maxGasCost !== undefined && alertThresholds.maxGasCost < 0) {
    alertThresholds.maxGasCost = 1000;
  }
  if (alertThresholds.minROI !== undefined) {
    if (alertThresholds.minROI < 0) {
      alertThresholds.minROI = 0;
    } else if (alertThresholds.minROI > 50) {
      alertThresholds.minROI = 50; // Cap at 50% for realistic arbitrage
    }
  }
  if (alertThresholds.minScore !== undefined && 
      (alertThresholds.minScore < 0 || alertThresholds.minScore > 1)) {
    alertThresholds.minScore = Math.max(0, Math.min(1, alertThresholds.minScore));
  }

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    { alertThresholds },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: 'Alert thresholds updated successfully',
    data: preferences
  });
});

// PUT /api/preferences/notifications - Update notification settings
export const updateNotificationSettings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { notificationSettings } = req.body;

  if (!notificationSettings || typeof notificationSettings !== 'object') {
    res.status(400);
    throw new Error('Notification settings must be an object');
  }

  // Ensure dashboard notifications are always enabled
  notificationSettings.dashboard = true;

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    { notificationSettings },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: 'Notification settings updated successfully',
    data: preferences
  });
});

// PUT /api/preferences/appearance - Update appearance settings
export const updateAppearanceSettings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { theme, refreshInterval } = req.body;

  const updates: any = {};

  if (theme && ['light', 'dark', 'auto'].includes(theme)) {
    updates.theme = theme;
  }

  if (refreshInterval && typeof refreshInterval === 'number') {
    if (refreshInterval < 5) updates.refreshInterval = 5;
    else if (refreshInterval > 300) updates.refreshInterval = 300;
    else updates.refreshInterval = refreshInterval;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error('No valid updates provided');
  }

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: 'Appearance settings updated successfully',
    data: preferences
  });
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
    theme: 'auto'
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

// GET /api/preferences/available-themes - Get available themes
export const getAvailableThemes = asyncHandler(async (req: Request, res: Response) => {
  const themes = [
    { value: 'auto', label: 'Auto (System)' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ];

  res.json({
    success: true,
    data: themes
  });
});

// Helper function now imported from shared config
