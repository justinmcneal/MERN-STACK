import { createError } from '../middleware/errorMiddleware';

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

  if (validated.minProfit !== undefined) {
    validated.minProfit = validatePositiveNumber(validated.minProfit, 'minProfit');
  }

  if (validated.maxGasCost !== undefined) {
    validated.maxGasCost = validated.maxGasCost < 0 ? 1000 : validated.maxGasCost;
  }

  if (validated.minROI !== undefined) {
    validated.minROI = validateRange(validated.minROI, 0, 50, 0);
  }

  if (validated.minScore !== undefined) {
    validated.minScore = validateRange(validated.minScore, 0, 1, 0.7);
  }

  return validated;
};

export const validateTokenList = (tokens: string[], supportedTokens: string[]): string[] => {
  const validTokens = tokens
    .map((token: string) => token.toUpperCase())
    .filter((token: string) => supportedTokens.includes(token));

  if (validTokens.length === 0) {
    validTokens.push('ETH');
  }

  return validTokens;
};

export const validateCurrency = (currency: string): string => {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'PHP'];
  return validCurrencies.includes(currency) ? currency : 'USD';
};

export const validateRefreshInterval = (interval: number): number => {
  return validateRange(interval, 5, 300, 30);
};

export const validateEmailFormat = (email: string): string => {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    throw createError('Invalid email format', 400);
  }
  
  return trimmed;
};
