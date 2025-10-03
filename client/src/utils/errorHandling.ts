/**
 * Comprehensive error handling utilities
 */

/**
 * Custom error types
 */
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

  get formattedMessage(): string {
    return `API Error (${this.status}): ${this.message}`;
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string, public value?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

/**
 * Error logging service
 */
class ErrorLogger {
  private logs: Array<{
    timestamp: Date;
    level: 'error' | 'warning' | 'info' | 'debug';
    message: string;
    context?: any;
    stack?: string;
  }> = [];

  log(level: 'error' | 'warning' | 'info' | 'debug', message: string, context?: any, error?: Error) {
    const logEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      stack: error?.stack,
    };

    this.logs.push(logEntry);

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'error' ? console.error : 
                           level === 'warning' ? console.warn : 
                           level === 'info' ? console.info : console.debug;
      
      consoleMethod(`[${level.toUpperCase()}] ${message}`, {
        context,
        stack: error?.stack,
      });
    }

    // In production, you would typically send this to an error reporting service
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      this.sendToErrorService(logEntry);
    }
  }

  private sendToErrorService(logEntry: any) {
    // Example: Send to Sentry, LogRocket, or other error reporting service
    console.log('Sending error to reporting service:', logEntry);
    
    // Implementation would depend on your chosen error reporting service
    // Example for Sentry:
    // Sentry.captureException(error, {
    //   extra: logEntry.context,
    //   level: logEntry.level === 'error' ? 'error' : 'info',
    // });
  }

  getLogs(level?: 'error' | 'warning' | 'info' | 'debug') {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs.length = 0;
  }
}

export const errorLogger = new ErrorLogger();

/**
 * Global error handler for unhandled errors
 */
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    errorLogger.log('error', 'Unhandled Promise Rejection', {
      reason: error?.message || 'Unknown error',
      stack: error?.stack,
    }, error);
  });

  // Handle JavaScript runtime errors
  window.addEventListener('error', (event) => {
    errorLogger.log('error', 'JavaScript Runtime Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }, event.error);
  });
};

/**
 * Safe function execution wrapper
 */
export const safeExecute = async <T>(
  operation: () => Promise<T> | T,
  fallback: T,
  context?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    errorLogger.log('error', `Operation failed${context ? ` (${context})` : ''}`, {
      error: errorMessage,
      fallbackValue: fallback,
    }, error instanceof Error ? error : new Error(errorMessage));

    return fallback;
  }
};

/**
 * Retry mechanism for failed operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        errorLogger.log('error', `Operation failed after ${attempt + 1} attempts`, {
          maxRetries,
          finalError: lastError.message,
        }, lastError);
        throw lastError;
      }

      errorLogger.log('warning', `Operation failed, retrying (attempt ${attempt + 1}/${maxRetries})`, {
        error: lastError.message,
        nextDelay: delay * Math.pow(backoffMultiplier, attempt),
      });

      await new Promise(resolve => 
        setTimeout(resolve, delay * Math.pow(backoffMultiplier, attempt))
      );
    }
  }

  // This should never be reached due to the loop condition, but TypeScript needs it
  throw lastError!;
};

/**
 * Error boundary hook for React error handling
 */
export const createErrorBoundaryHandler = (componentName: string) => {
  return (error: Error, errorInfo: { componentStack: string }) => {
    errorLogger.log('error', `Error in ${componentName}`, {
      componentStack: errorInfo.componentStack,
    }, error);
  };
};

/**
 * Form validation error handler
 */
export const handleFormErrors = (
  errors: Record<string, string[]>,
  onSubmit?: () => void
) => {
  const errorCount = Object.keys(errors).length;
  const totalErrorCount = Object.values(errors).flat().length;

  errorLogger.log('warning', 'Form validation failed', {
    fieldErrors: errorCount,
    totalErrors: totalErrorCount,
  });

  if (onSubmit) {
    onSubmit();
  }

  return {
    errorCount,
    totalErrorCount,
    hasErrors: totalErrorCount > 0,
  };
};

/**
 * API error handler
 */
export const handleAPIError = (error: Error): { userMessage: string; canRetry: boolean } => {
  errorLogger.log('error', 'API request failed', { error: error.message }, error);

  if (error instanceof APIError) {
    return {
      userMessage: error.formattedMessage,
      canRetry: error.status >= 500 || error.status === 429, // Server errors or rate limiting
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
