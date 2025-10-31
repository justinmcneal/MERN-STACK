export const AUTH_CONSTANTS = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCK_TIME_MS: 15 * 60 * 1000,
  COOKIE_MAX_AGE_DEFAULT: 7 * 24 * 60 * 60 * 1000,
  COOKIE_MAX_AGE_REMEMBER: 30 * 24 * 60 * 60 * 1000,
  TOKEN_EXPIRY_EMAIL_HOURS: 24,
  TOKEN_EXPIRY_PASSWORD_HOURS: 1,
  CSRF_TOKEN_BYTES: 32,
  VERIFICATION_TOKEN_BYTES: 32,
} as const;

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/,
  ERROR_MESSAGE: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
} as const;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
