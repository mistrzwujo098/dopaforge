/**
 * Safe error handling utilities that prevent information leakage in production
 */

export interface SafeError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Get a safe error message for production
 */
export function getSafeErrorMessage(error: unknown, defaultMessage: string = 'An error occurred'): string {
  if (process.env.NODE_ENV !== 'production') {
    // In development, return the actual error message
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  // In production, return generic messages based on error type
  if (error instanceof Error) {
    // Map specific error messages to generic ones
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Network error. Please check your connection.';
    }
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return 'Authentication error. Please login again.';
    }
    if (error.message.includes('permission') || error.message.includes('forbidden')) {
      return 'Permission denied.';
    }
    if (error.message.includes('not found')) {
      return 'Resource not found.';
    }
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return 'Invalid input provided.';
    }
  }

  return defaultMessage;
}

/**
 * Log error details securely (only in development or to secure logging service)
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    context,
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : String(error),
  };

  if (process.env.NODE_ENV === 'production') {
    // In production, send to logging service (e.g., Sentry, LogRocket)
    // For now, just console.error with limited info
    console.error('Application error:', {
      timestamp: errorDetails.timestamp,
      context: context?.endpoint || context?.component || 'unknown',
    });
  } else {
    // In development, log full details
    console.error('Error details:', errorDetails);
  }
}

/**
 * Create a safe error response for APIs
 */
export function createSafeErrorResponse(
  error: unknown,
  statusCode: number = 500,
  context?: Record<string, any>
): SafeError {
  logError(error, context);
  
  return {
    message: getSafeErrorMessage(error),
    code: 'ERROR',
    statusCode,
  };
}