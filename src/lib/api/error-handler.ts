/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * API Error Handler
 *
 * This module provides standardized error handling and retry logic for API requests.
 * It categorizes errors, provides consistent error messages, and implements
 * configurable retry strategies for transient failures.
 *
 * It also integrates with the monitoring system to track API errors and retries.
 */

import { apiConfig } from './config';
import { endpointRegistry, getModuleEndpoint } from './endpoint-registry';
import { AUTH_EVENTS } from '@/features/auth/types/auth.types';
import { apiMonitor } from '../monitoring/api-monitor';
import { logger } from '../logging/logger';

/**
 * API Error types for categorizing errors
 */
export enum ApiErrorType {
  // Network/infrastructure errors
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  SERVER = 'server',

  // Authentication errors
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',

  // Data errors
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',

  // Other errors
  UNKNOWN = 'unknown',
  CANCELED = 'canceled',
  RATE_LIMIT = 'rate_limit'
}

/**
 * API Error response format
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  type?: ApiErrorType;
  retryable?: boolean;
  timestamp?: string;
}

/**
 * Standardized API Error class
 */
export class ApiError extends Error {
  type: ApiErrorType;
  status?: number;
  code?: string;
  details?: any;
  retryable: boolean;
  timestamp: string;
  originalError?: any;

  constructor(message: string, options: Partial<ApiErrorResponse> = {}, originalError?: any) {
    super(message);
    this.name = 'ApiError';
    this.type = options.type || ApiErrorType.UNKNOWN;
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.retryable = options.retryable ?? this.isRetryableType(this.type);
    this.timestamp = options.timestamp || new Date().toISOString();
    this.originalError = originalError;

    // Ensure stack trace is properly captured
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if the error type is generally retryable
   */
  private isRetryableType(type: ApiErrorType): boolean {
    return [
      ApiErrorType.NETWORK,
      ApiErrorType.TIMEOUT,
      ApiErrorType.SERVER
    ].includes(type);
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    switch (this.type) {
      case ApiErrorType.NETWORK:
        return 'Unable to connect to the server. Please check your internet connection.';
      case ApiErrorType.TIMEOUT:
        return 'The request timed out. Please try again later.';
      case ApiErrorType.SERVER:
        return 'The server encountered an error. Our team has been notified.';
      case ApiErrorType.AUTHENTICATION:
        return 'Your session has expired. Please log in again.';
      case ApiErrorType.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      case ApiErrorType.VALIDATION:
        return this.message || 'Please check the form for errors.';
      case ApiErrorType.NOT_FOUND:
        return 'The requested information could not be found.';
      case ApiErrorType.CONFLICT:
        return 'A conflict occurred with your request. Please refresh and try again.';
      case ApiErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }

  /**
   * Get a detailed error object for logging
   */
  toDetailedObject(): Record<string, any> {
    return {
      message: this.message,
      type: this.type,
      status: this.status,
      code: this.code,
      details: this.details,
      retryable: this.retryable,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  shouldRetry?: (error: ApiError, attempt: number) => boolean;
  onRetry?: (error: ApiError, attempt: number) => void;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 500, // ms
  maxDelay: 10000,   // 10 seconds
  backoffFactor: 2,  // Exponential backoff
  shouldRetry: (error, attempt) => {
    // Only retry if the error is retryable and we haven't exceeded max retries
    return error.retryable && attempt < DEFAULT_RETRY_CONFIG.maxRetries;
  },
  onRetry: (error, attempt) => {
    console.log(`[API] Retrying request (${attempt}/${DEFAULT_RETRY_CONFIG.maxRetries}): ${error.message}`);
  }
};

/**
 * Error classification map for HTTP status codes
 */
const HTTP_ERROR_MAP: Record<number, ApiErrorType> = {
  400: ApiErrorType.VALIDATION,
  401: ApiErrorType.AUTHENTICATION,
  403: ApiErrorType.AUTHORIZATION,
  404: ApiErrorType.NOT_FOUND,
  409: ApiErrorType.CONFLICT,
  429: ApiErrorType.RATE_LIMIT,
  500: ApiErrorType.SERVER,
  501: ApiErrorType.SERVER,
  502: ApiErrorType.SERVER,
  503: ApiErrorType.SERVER,
  504: ApiErrorType.TIMEOUT
};

/**
 * Process and classify an error from any source
 *
 * @param error Any thrown error
 * @param endpoint Optional endpoint information for better logging and monitoring
 * @returns Standardized ApiError object
 */
export function handleApiError(error: any, endpoint?: string): ApiError {
  // Create a logger for API errors
  const apiLogger = logger.child('api.error');

  // If it's already an ApiError, just return it
  if (error instanceof ApiError) {
    // Still log it for monitoring
    if (endpoint) {
      apiMonitor.trackError(error, endpoint);
    }
    return error;
  }

  let apiError: ApiError;

  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    apiError = new ApiError('Network connection error', {
      type: ApiErrorType.NETWORK,
      retryable: true
    }, error);
  }
  // Handle AbortError (request canceled)
  else if (error.name === 'AbortError') {
    apiError = new ApiError('Request was canceled', {
      type: ApiErrorType.CANCELED,
      retryable: false
    }, error);
  }
  // Handle timeout
  else if (error.message && error.message.includes('timeout')) {
    apiError = new ApiError('Request timed out', {
      type: ApiErrorType.TIMEOUT,
      retryable: true
    }, error);
  }
  // Handle HTTP responses with error status
  else if (error.status && typeof error.status === 'number') {
    const type = HTTP_ERROR_MAP[error.status] || ApiErrorType.UNKNOWN;
    let message = error.message || 'An error occurred';

    if (error.data?.message) {
      message = error.data.message;
    } else if (error.data?.error) {
      message = error.data.error;
    }

    // Handle special cases for auth errors
    if (type === ApiErrorType.AUTHENTICATION) {
      // Dispatch authentication error event
      dispatchAuthEvent(AUTH_EVENTS.AUTH_ERROR, {
        message: 'Authentication error',
        status: error.status,
        timestamp: new Date().toISOString()
      });
    }

    apiError = new ApiError(message, {
      type,
      status: error.status,
      code: error.data?.code,
      details: error.data?.details,
      retryable: type === ApiErrorType.SERVER || type === ApiErrorType.TIMEOUT
    }, error);
  }
  // Default case for unhandled error types
  else {
    apiError = new ApiError(
      error.message || 'An unexpected error occurred',
      {
        type: ApiErrorType.UNKNOWN,
        retryable: false
      },
      error
    );
  }

  // Log the error with context
  apiLogger.error(
    `API Error${endpoint ? ` [${endpoint}]` : ''}: ${apiError.message}`,
    apiError.toDetailedObject(),
    { errorType: apiError.type, endpoint }
  );

  // Track the error in monitoring system
  if (endpoint) {
    apiMonitor.trackError(apiError, endpoint);
  }

  return apiError;
}

/**
 * Dispatch an authentication event
 */
function dispatchAuthEvent(eventName: string, detail: any): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

/**
 * Delay execution with exponential backoff
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate backoff delay with jitter
 */
function calculateBackoff(attempt: number, config: RetryConfig): number {
  const jitter = Math.random() * 0.3 + 0.85; // Random factor between 0.85 and 1.15
  const backoff = Math.min(
    config.maxDelay,
    config.initialDelay * Math.pow(config.backoffFactor, attempt) * jitter
  );

  return Math.round(backoff);
}

/**
 * Execute an API call with retries
 *
 * @param apiCall Function that makes the API request
 * @param options Retry configuration options
 * @param endpoint Optional endpoint information for better logging and monitoring
 * @returns Promise with the result of the API call
 */
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  options: Partial<RetryConfig> = {},
  endpoint?: string
): Promise<T> {
  const config: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...options };
  let attempt = 0;
  const startTime = Date.now();

  // Create a logger for retries
  const retryLogger = logger.child('api.retry');

  while (true) {
    try {
      const result = await apiCall();

      // Track successful request
      if (endpoint) {
        apiMonitor.trackRequest(endpoint, startTime);
        apiMonitor.trackSuccess(endpoint);

        // If this was a retry attempt that succeeded, track it
        if (attempt > 0) {
          apiMonitor.trackRetrySuccess(endpoint, attempt);
        }
      }

      return result;
    } catch (error) {
      attempt++;

      // Process the error to standardize it
      const apiError = handleApiError(error, endpoint);

      // Check if we should retry
      const shouldRetry = config.shouldRetry?.(apiError, attempt) ??
        (apiError.retryable && attempt < config.maxRetries);

      if (!shouldRetry) {
        // Track failed retries if we've exhausted all attempts
        if (endpoint && attempt > 1) {
          apiMonitor.trackRetryFailure(apiError, endpoint, config.maxRetries);
        }

        throw apiError;
      }

      // Calculate backoff delay
      const backoffMs = calculateBackoff(attempt, config);

      // Track retry attempt
      if (endpoint) {
        apiMonitor.trackRetry(apiError, endpoint, attempt);
      }

      // Log retry attempt
      retryLogger.warn(
        `Retrying request${endpoint ? ` to ${endpoint}` : ''} (attempt ${attempt}/${config.maxRetries}): ${apiError.message}`,
        {
          error: apiError.toDetailedObject(),
          attempt,
          backoffMs,
          maxRetries: config.maxRetries
        },
        { endpoint, attempt: attempt.toString(), errorType: apiError.type }
      );

      // Notify about retry
      if (config.onRetry) {
        config.onRetry(apiError, attempt);
      }

      // Wait before retrying
      await delay(backoffMs);
    }
  }
}

/**
 * Safely execute an async function with standardized error handling
 *
 * @param asyncFn Async function to execute
 * @param errorMessage Error message if the function fails
 * @returns [result, error] tuple
 */
export async function safeApiCall<T>(
  asyncFn: () => Promise<T>,
  errorMessage: string = 'An error occurred'
): Promise<[T | null, ApiError | null]> {
  try {
    const result = await asyncFn();
    return [result, null];
  } catch (error) {
    const apiError = handleApiError(error);

    // Add custom message if none is present
    if (!apiError.message) {
      apiError.message = errorMessage;
    }

    return [null, apiError];
  }
}

/**
 * Create a module-specific error handler function
 *
 * @param module Module name for error context
 * @returns Error handler function with module context
 */
export function createErrorHandler(module: string) {
  // Create a module-specific logger
  const moduleLogger = logger.child(`module.${module}`);

  return {
    /**
     * Handle an error with module context
     *
     * @param error The error to handle
     * @param operation The operation that failed (optional)
     * @returns Standardized ApiError
     */
    handleError(error: any, operation?: string): ApiError {
      const endpoint = operation ? `${module}/${operation}` : module;
      const apiError = handleApiError(error, endpoint);

      // Add module context to error logging
      moduleLogger.error(
        `${operation ? `${operation}: ` : ''}${apiError.message}`,
        apiError.toDetailedObject(),
        { module, operation, errorType: apiError.type }
      );

      return apiError;
    },

    /**
     * Execute an operation with retries in module context
     *
     * @param apiCall The API call function
     * @param options Retry configuration
     * @param operation Optional operation name for better logging
     * @returns Promise with operation result
     */
    withRetry<T>(
      apiCall: () => Promise<T>,
      options: Partial<RetryConfig> = {},
      operation?: string
    ): Promise<T> {
      const endpoint = operation ? `${module}/${operation}` : module;

      return withRetry(
        apiCall,
        {
          ...options,
          onRetry: (error, attempt) => {
            moduleLogger.warn(
              `Retrying ${operation || 'operation'} (${attempt}/${
                options.maxRetries || DEFAULT_RETRY_CONFIG.maxRetries
              }): ${error.message}`,
              {
                error: error.toDetailedObject(),
                attempt,
                maxRetries: options.maxRetries || DEFAULT_RETRY_CONFIG.maxRetries
              },
              { module, operation, attempt: attempt.toString() }
            );

            if (options.onRetry) {
              options.onRetry(error, attempt);
            }
          }
        },
        endpoint
      );
    },

    /**
     * Safely execute an operation with module context
     *
     * @param asyncFn The async function to execute
     * @param errorMessage Default error message
     * @param operation Optional operation name for better logging
     * @returns [result, error] tuple
     */
    safeCall<T>(
      asyncFn: () => Promise<T>,
      errorMessage: string = `An error occurred in ${module}`,
      operation?: string
    ): Promise<[T | null, ApiError | null]> {
      return safeApiCall(
        async () => {
          const startTime = Date.now();
          const endpoint = operation ? `${module}/${operation}` : module;

          try {
            const result = await asyncFn();

            // Track successful request
            apiMonitor.trackRequest(endpoint, startTime);
            apiMonitor.trackSuccess(endpoint);

            return result;
          } catch (error) {
            // Error will be handled by safeApiCall
            throw error;
          }
        },
        errorMessage
      );
    }
  };
}
