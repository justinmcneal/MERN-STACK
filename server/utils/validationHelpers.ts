import { createError } from '../middleware/errorMiddleware';
import {
  PREFERENCE_CURRENCIES,
  DEFAULT_CURRENCY,
  DEFAULT_REFRESH_INTERVAL,
  defaultAlertThresholds,
} from '../models/userPreferenceDefaults';

export const validateRequired = (value: any, fieldName: string): void => {
  if (!value) {
    throw createError(`${fieldName} is required`, 400);
  }
};

export const validateArray = (value: any, fieldName: string): void => {
  if (!Array.isArray(value)) {
    throw createError(`${fieldName} must be an array`, 400);
  }
};

export const validatePositiveNumber = (value: number, fieldName: string): number => {
  return Math.max(0, value);
};

export const validateRange = (value: number, min: number, max: number, defaultValue: number): number => {
  if (value < min || value > max) {
    return Math.max(min, Math.min(max, defaultValue));
  }
  return value;
};

export const validateAlertThresholds = (thresholds: any): any => {
  const validated = { ...thresholds };
  const defaults = defaultAlertThresholds();

  if (validated.minProfit !== undefined) {
    validated.minProfit = validatePositiveNumber(validated.minProfit, 'minProfit');
  }

  if (validated.maxGasCost !== undefined) {
    validated.maxGasCost = validated.maxGasCost < 0 ? 1000 : validated.maxGasCost;
  }

  if (validated.minROI !== undefined) {
    validated.minROI = validateRange(validated.minROI, 0, 50, defaults.minROI);
  }

  if (validated.minScore !== undefined) {
    validated.minScore = validateRange(validated.minScore, 0, 1, defaults.minScore);
  }

  return validated;
};

export const validateTokenList = (tokens: string[], supportedTokens: string[]): string[] => {
  const validTokens = tokens
    .map((token: string) => token.toUpperCase())
    .filter((token: string) => supportedTokens.includes(token));

  if (validTokens.length === 0 && supportedTokens.length > 0) {
    validTokens.push(supportedTokens[0]);
  }

  return validTokens;
};

export const validateCurrency = (currency: string): string => {
  return (PREFERENCE_CURRENCIES as readonly string[]).includes(currency) ? currency : DEFAULT_CURRENCY;
};

export const validateRefreshInterval = (interval: number): number => {
  return validateRange(interval, 5, 300, DEFAULT_REFRESH_INTERVAL);
};

export const validateEmailFormat = (email: string): string => {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    throw createError('Invalid email format', 400);
  }
  
  return trimmed;
};
