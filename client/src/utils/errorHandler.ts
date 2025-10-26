/**
 * Centralized error handling utilities
 */

export interface ErrorDetails {
  message: string;
  code?: string | number;
  status?: number;
  timestamp: string;
  context?: string;
}

export class AppError extends Error {
  public code?: string | number;
  public status?: number;
  public context?: string;
  public timestamp: string;

  constructor(message: string, code?: string | number, status?: number, context?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

export const ErrorHandler = {
  /**
   * Safely extract error message from various error types
   */
  extractMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      const err = error as any;
      
      // Check for common error message properties
      if (err.message && typeof err.message === 'string') {
        return err.message;
      }
      
      if (err.error && typeof err.error === 'string') {
        return err.error;
      }
      
      if (err.details && typeof err.details === 'string') {
        return err.details;
      }
      
      // Handle Axios errors - check server error format first
      if (err.response?.data) {
        const data = err.response.data;
        
        // Format 1: { error: { message: "..." } } - from error middleware
        if (data.error?.message) {
          return data.error.message;
        }
        
        // Format 2: { error: "Validation Error", message: "..." } - from validation middleware
        if (data.message && typeof data.message === 'string') {
          return data.message;
        }
        
        // Format 3: { error: "string" } - direct error string
        if (typeof data.error === 'string') {
          return data.error;
        }
        
        // Format 4: { error: { message: "..." } } - nested error object
        if (typeof data.error === 'object' && data.error.message) {
          return data.error.message;
        }
      }
      
      // Handle network errors
      if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        return 'Network error. Please check your internet connection.';
      }
      
      // Handle timeout errors
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        return 'Request timeout. Please try again.';
      }
      
      // If it's an object but we can't extract a message, stringify it safely
      try {
        const stringified = JSON.stringify(error);
        if (stringified !== '{}' && stringified !== 'null') {
          return `Error: ${stringified}`;
        }
      } catch {
        // If JSON.stringify fails, try toString
        try {
          return error.toString();
        } catch {
          // Last resort
          return 'An unexpected error occurred. Please try again.';
        }
      }
    }

    return 'An unexpected error occurred. Please try again.';
  },

  /**
   * Create a user-friendly error message
   */
  createUserMessage(error: unknown): string {
    const message = this.extractMessage(error);
    
    // Ensure message is always a string
    if (typeof message !== 'string') {
      return 'An unexpected error occurred. Please try again.';
    }
    
    // Map technical errors to user-friendly messages
    const userFriendlyMessages: Record<string, string> = {
      'Invalid credentials': 'Invalid email or password. Please check your credentials.',
      'Invalid email or password': 'Invalid email or password. Please check your credentials.',
      'User not found': 'No account found with this email address.',
      'Account locked': 'Account temporarily locked due to too many failed attempts.',
      'Too many attempts': 'Too many failed attempts. Please try again later.',
      'Network Error': 'Network error. Please check your internet connection.',
      'timeout': 'Request timeout. Please try again.',
      'Server error': 'Server error. Please try again later.',
      'Unauthorized': 'Session expired. Please log in again.',
      'Forbidden': 'Access denied. Please contact support.',
      'CSRF token mismatch': 'Please refresh the page and try again.',
      'CSRF': 'Please refresh the page and try again.',
      'token mismatch': 'Please refresh the page and try again.',
      'Validation Error': 'Please check your input and try again.',
      'Please provide a valid email address': 'Please enter a valid email address.',
      'Password must be at least 8 characters long': 'Password must be at least 8 characters long.',
      'Password must include uppercase, lowercase, number, and special character': 'Password must include uppercase, lowercase, number, and special character.',
      'User already exists': 'An account with this email already exists. Please try logging in instead.',
      'Email already exists': 'An account with this email already exists. Please try logging in instead.',
      'Invalid or expired password reset token': 'This password reset link is invalid or has expired. Please request a new one.',
      'Password reset token is required': 'Invalid reset link. Please request a new password reset.',
      'Token and password are required': 'Please provide both the reset token and new password.',
      'Failed to send password reset email': 'Unable to send password reset email. Please try again later.',
      'Failed to reset password': 'Unable to reset password. Please try again or request a new reset link.',
      'Current password is incorrect': 'The current password you entered is incorrect. Please try again.',
      'Please provide current and new password': 'Both current and new passwords are required.',
      'New password must be at least 8 characters long and include uppercase, lowercase, number, and special character.': 'New password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
      'Password changed successfully': 'Your password has been changed successfully.',
    };

    // Check for exact matches first
    for (const [key, value] of Object.entries(userFriendlyMessages)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Return the original message if no mapping found
    return message;
  },

  /**
   * Log error for debugging
   */
  logError(error: unknown, context?: string): void {
    const errorDetails: ErrorDetails = {
      message: this.extractMessage(error),
      timestamp: new Date().toISOString(),
      context,
    };

    // Add additional details if available
    if (error && typeof error === 'object') {
      const err = error as any;
      if (err.code) errorDetails.code = err.code;
      if (err.status) errorDetails.status = err.status;
    }

    console.error('Application Error:', errorDetails);
    
    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      // TODO: Send to error reporting service (Sentry, LogRocket, etc.)
    }
  },

  /**
   * Handle form validation errors
   */
  handleValidationError(field: string, value: string): string {
    switch (field) {
      case 'name':
        if (!value) return 'Full name is required';
        if (value.trim().length < 10) return 'Name must be at least 10 characters long';
        if (value.trim().length > 50) return 'Name must not exceed 50 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        return '';
      
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address';
        if (value.length > 254) return 'Email address is too long';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (value.length > 128) return 'Password is too long';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must include at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must include at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must include at least one number';
        if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(value)) return 'Password must include at least one special character';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        return '';
      
      default:
        return '';
    }
  },

  /**
   * Check if error is retryable
   */
  isRetryable(error: unknown): boolean {
    const message = this.extractMessage(error).toLowerCase();
    
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('server error') ||
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    );
  },

  /**
   * Get retry delay based on error type
   */
  getRetryDelay(error: unknown, attempt: number): number {
    if (!this.isRetryable(error)) return 0;
    
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, attempt - 1), 16000);
  }
};

export default ErrorHandler;
