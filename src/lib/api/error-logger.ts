/**
 * API Error Logger
 * 
 * This module provides utilities for logging API errors in the frontend.
 * It can send error logs to the backend for centralized logging.
 */

import { toast } from 'sonner';

// Error types for better categorization
export enum ApiErrorType {
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  SERVER = 'SERVER_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNKNOWN = 'UNKNOWN_ERROR',
  MOCK_DISABLED = 'MOCK_DISABLED'
}

// Standard API error structure
export interface ApiError {
  type: ApiErrorType;
  message: string;
  status?: number;
  code?: string;
  details?: any;
  timestamp: string;
  endpoint?: string;
  requestId?: string;
  retryable: boolean;
  originalError?: Error;
}

// Configuration for the error logger
interface ErrorLoggerConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  remoteLoggingEndpoint: string;
  showToastForErrors: boolean;
  logNetworkErrors: boolean;
  logTimeoutErrors: boolean;
  logServerErrors: boolean;
  logAuthErrors: boolean;
  logValidationErrors: boolean;
  includeStackTrace: boolean;
}

// Default configuration
const DEFAULT_CONFIG: ErrorLoggerConfig = {
  enableConsoleLogging: true,
  enableRemoteLogging: import.meta.env.PROD,
  remoteLoggingEndpoint: '/api/v1/logs/client-error',
  showToastForErrors: true,
  logNetworkErrors: true,
  logTimeoutErrors: true,
  logServerErrors: true,
  logAuthErrors: true,
  logValidationErrors: false, // These can be noisy
  includeStackTrace: import.meta.env.DEV
};

/**
 * Create a standardized API error object
 */
export function createApiError(error: any, endpoint?: string): ApiError {
  // If it's already an ApiError, just return it
  if (error && typeof error === 'object' && 'type' in error && 'message' in error) {
    return {
      ...error,
      timestamp: error.timestamp || new Date().toISOString(),
      endpoint: error.endpoint || endpoint
    };
  }

  // Default error properties
  let type = ApiErrorType.UNKNOWN;
  let message = 'An unknown error occurred';
  let status: number | undefined = undefined;
  let details: any = undefined;
  let retryable = false;

  // Handle different error types
  if (error instanceof Error) {
    message = error.message;

    // Network errors
    if (
      error.name === 'NetworkError' ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection')
    ) {
      type = ApiErrorType.NETWORK;
      retryable = true;
    }
    // Timeout errors
    else if (
      error.name === 'TimeoutError' ||
      message.includes('timeout') ||
      message.includes('timed out')
    ) {
      type = ApiErrorType.TIMEOUT;
      retryable = true;
    }
  }
  // Handle response-like objects
  else if (error && typeof error === 'object') {
    if ('status' in error) {
      status = typeof error.status === 'number' ? error.status : undefined;
    }

    if ('message' in error) {
      message = error.message;
    } else if ('error' in error) {
      message = typeof error.error === 'string' ? error.error : 'API Error';
    }

    if ('details' in error) {
      details = error.details;
    }

    // Determine error type based on status code
    if (status) {
      if (status === 401 || status === 403) {
        type = ApiErrorType.AUTHORIZATION;
      } else if (status === 404) {
        type = ApiErrorType.NOT_FOUND;
      } else if (status === 409) {
        type = ApiErrorType.CONFLICT;
      } else if (status === 422 || status === 400) {
        type = ApiErrorType.VALIDATION;
      } else if (status >= 500) {
        type = ApiErrorType.SERVER;
        retryable = true;
      }
    }
  }

  // Create the standardized error object
  return {
    type,
    message,
    status,
    details,
    timestamp: new Date().toISOString(),
    endpoint,
    retryable,
    originalError: error instanceof Error ? error : undefined
  };
}

/**
 * Show a toast notification for an API error
 */
export function showApiErrorToast(error: ApiError): void {
  const title = (() => {
    switch (error.type) {
      case ApiErrorType.NETWORK:
        return 'Network Error';
      case ApiErrorType.TIMEOUT:
        return 'Request Timeout';
      case ApiErrorType.SERVER:
        return 'Server Error';
      case ApiErrorType.VALIDATION:
        return 'Validation Error';
      case ApiErrorType.AUTHENTICATION:
      case ApiErrorType.AUTHORIZATION:
        return 'Authentication Error';
      case ApiErrorType.NOT_FOUND:
        return 'Not Found';
      case ApiErrorType.CONFLICT:
        return 'Conflict Error';
      case ApiErrorType.MOCK_DISABLED:
        return 'Mock Data Disabled';
      default:
        return 'Error';
    }
  })();

  toast.error(title, {
    description: error.message,
    duration: 5000
  });
}

/**
 * Log an API error to the console and optionally to the server
 */
export async function logApiError(
  error: ApiError | any,
  endpoint?: string,
  config: Partial<ErrorLoggerConfig> = {}
): Promise<void> {
  // Merge configuration
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Standardize the error
  const apiError = error.type ? error : createApiError(error, endpoint);

  // Skip logging for certain error types based on configuration
  if (
    (apiError.type === ApiErrorType.NETWORK && !mergedConfig.logNetworkErrors) ||
    (apiError.type === ApiErrorType.TIMEOUT && !mergedConfig.logTimeoutErrors) ||
    (apiError.type === ApiErrorType.SERVER && !mergedConfig.logServerErrors) ||
    ((apiError.type === ApiErrorType.AUTHENTICATION || apiError.type === ApiErrorType.AUTHORIZATION) &&
      !mergedConfig.logAuthErrors) ||
    (apiError.type === ApiErrorType.VALIDATION && !mergedConfig.logValidationErrors)
  ) {
    return;
  }

  // Log to console if enabled
  if (mergedConfig.enableConsoleLogging) {
    console.error(
      `API Error [${apiError.type}]${endpoint ? ` [${endpoint}]` : ''}: ${apiError.message}`,
      apiError
    );
  }

  // Show toast if enabled
  if (mergedConfig.showToastForErrors) {
    showApiErrorToast(apiError);
  }

  // Log to server if enabled
  if (mergedConfig.enableRemoteLogging) {
    try {
      // Prepare the log data
      const logData = {
        type: apiError.type,
        message: apiError.message,
        status: apiError.status,
        endpoint: apiError.endpoint || endpoint,
        timestamp: apiError.timestamp,
        details: apiError.details,
        userAgent: navigator.userAgent,
        url: window.location.href,
        stack: mergedConfig.includeStackTrace ? apiError.originalError?.stack : undefined
      };

      // Send the log to the server
      await fetch(mergedConfig.remoteLoggingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData),
        // Use keepalive to ensure the request completes even if the page is unloading
        keepalive: true
      });
    } catch (logError) {
      // Don't show a toast for logging errors to avoid infinite loops
      if (mergedConfig.enableConsoleLogging) {
        console.error('Failed to send error log to server:', logError);
      }
    }
  }
}

// Export a default object with all functions
export default {
  createApiError,
  logApiError,
  showApiErrorToast,
  ApiErrorType
};
