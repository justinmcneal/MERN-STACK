/**
 * Comprehensive validation utilities for forms and data
 */

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Phone number validation (US format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}$|^\d{10}$|\+1\s?\d{3}\s?\d{3}\s?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * URL validation
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Currency amount validation
 */
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

/**
 * Token symbol validation
 */
export const isValidTokenSymbol = (symbol: string): boolean => {
  const symbolRegex = /^[A-Z0-9]{1,10}$/;
  return symbolRegex.test(symbol);
};

/**
 * Wallet address validation
 */
export const isValidWalletAddress = (address: string, chain?: string): boolean => {
  if (!address) return false;

  const chainPatterns: Record<string, RegExp> = {
    ethereum: /^0x[a-fA-F0-9]{40}$/,
    bsc: /^0x[a-fA-F0-9]{40}$/,
    polygon: /^0x[a-fA-F0-9]{40}$/,
    bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
  };

  if (chain && chainPatterns[chain]) {
    return chainPatterns[chain].test(address);
  }

  // Default to Ethereum pattern if no chain specified
  return chainPatterns.ethereum.test(address);
};

/**
 * Percentage validation
 */
export const isValidPercentage = (percentage: string | number): { valid: boolean; value?: number; error?: string } => {
  const numValue = typeof percentage === 'string' ? parseFloat(percentage.replace(/[%]/g, '')) :percentage;
  
  if (isNaN(numValue)) {
    return { valid: false, error: 'Invalid percentage format' };
  }
  
  if (numValue < 0 || numValue > 100) {
    return { valid: false, error: 'Percentage must be between 0 and 100' };
  }
  
  return { valid: true, value: numValue };
};

/**
 * Password strength validation
 */
export const validatePassword = (password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }

  return {
    valid: score >= 4,
    score,
    feedback,
  };
};

/**
 * Required field validation
 */
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

/**
 * Minimum length validation
 */
export const minLength = (value: string, min: number): { valid: boolean; error?: string } => {
  if (typeof value !== 'string') {
    return { valid: false, error: 'Value must be a string' };
  }
  
  if (value.length < min) {
    return { valid: false, error: `Must be at least ${min} characters long` };
  }
  
  return { valid: true };
};

/**
 * Maximum length validation
 */
export const maxLength = (value: string, max: number): { valid: boolean; error?: string } => {
  if (typeof value !== 'string') {
    return { valid: false, error: 'Value must be a string' };
  }
  
  if (value.length > max) {
    return { valid: false, error: `Must be no more than ${max} characters long` };
  }
  
  return { valid: true };
};

/**
 * Form validation helper
 */
export type ValidationRule<T = any> = {
  validator: (value: T) => { valid: boolean; error?: string };
  customMessage?: string;
};

export const validateFormField = <T>(
  value: T,
  rules: ValidationRule<T>[]
): { valid: boolean; error?: string } => {
  for (const rule of rules) {
    const result = rule.validator(value);
    if (!result.valid) {
      return {
        valid: false,
        error: rule.customMessage || result.error,
      };
    }
  }
  return { valid: true };
};
