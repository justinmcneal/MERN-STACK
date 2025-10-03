// Export mock data generator
export * from './mockData';

// Simple formatting utilities
export const formatCurrency = (
  value: number | string,
  options: {
    currency?: string;
    showSign?: boolean;
  } = {}
): string => {
  const { currency = 'USD', showSign = false } = options;
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[,$]/g, '')) : value;

  if (isNaN(numValue)) return '$0.00';

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);

  return showSign && numValue > 0 ? `+${formatted}` : formatted;
};

export const formatPercentage = (
  value: number | string,
  options: {
    decimals?: number;
    showSign?: boolean;
  } = {}
): string => {
  const { decimals = 2, showSign = false } = options;
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[%]/g, '')) : value;

  if (isNaN(numValue)) return '0%';

  const formatted = numValue.toFixed(decimals);

  return showSign && numValue > 0 ? `+${formatted}%` : `${formatted}%`;
};

export const formatTimeAgo = (date: Date | string | number): string => {
  const now = new Date();
  const pastDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return pastDate.toLocaleDateString();
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidCurrencyAmount = (amount: string | number): { valid: boolean; value?: number; error?: string } => {
  const numValue = typeof amount === 'string' ? parseFloat(amount.replace(/[,$]/g, '')) : amount;

  if (isNaN(numValue)) {
    return { valid: false, error: 'Invalid amount format' };
  }

  if (numValue < 0) {
    return { valid: false, error: 'Amount must be positive' };
  }

  if (numValue > 999999999) {
    return { valid: false, error: 'Amount too large' };
  }

  return { valid: true, value: numValue };
};

export const isRequired = (value: any): { valid: boolean; error?: string } => {
  if (value === null || value === undefined) {
    return { valid: false, error: 'This field is required' };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, error: 'This field is required' };
  }

  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, error: 'This field is required' };
  }

  return { valid: true };
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);

    if (callNow) func(...args);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let lastCallTime = 0;

  return function executedFunction(...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCallTime >= limit) {
      func(...args);
      lastCallTime = now;
    }
  };
};

// Error handling utilities
export const safeExecute = async <T>(
  operation: () => Promise<T> | T,
  fallback: T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.warn('Operation failed:', error);
    return fallback;
  }
};

// Simple error classes
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export const handleAPIError = (error: Error): { userMessage: string; canRetry: boolean } => {
  if (error instanceof APIError) {
    return {
      userMessage: `${error.name} (${error.status}): ${error.message}`,
      canRetry: error.status >= 500,
    };
  }

  if (error instanceof NetworkError) {
    return {
      userMessage: 'Network connection failed. Please check your internet connection.',
      canRetry: true,
    };
  }

  return {
    userMessage: 'An unexpected error occurred. Please try again.',
    canRetry: true,
  };
};