/**
 * Error Handler
 *
 * A centralized error handling utility that provides consistent error handling
 * across the application. This handler standardizes error objects, provides
 * helpful user messages, and supports logging and monitoring.
 */

import { ApiError, ApiErrorType, handleApiError } from '../api/error-handler';
import { logger } from '../logging/logger';

/**
 * Error Handler Interface
 */
interface ErrorHandler {
  /**
   * Process any error into a standardized ApiError
   */
  handleError: (error: any, context?: string) => ApiError;
  
  /**
   * Create a context-specific error handler
   */
  createContextHandler: (context: string) => (error: any) => ApiError;
  
  /**
   * Safely execute a function with error handling
   */
  tryCatch: <T>(fn: () => T, fallback: T, context?: string) => T;
  
  /**
   * Safely execute an async function with error handling
   */
  tryCatchAsync: <T>(fn: () => Promise<T>, context?: string) => Promise<[T | null, ApiError | null]>;
  
  /**
   * Get a user-friendly message for an error
   */
  getUserMessage: (error: any) => string;
}

/**
 * Shared Error Handler Implementation
 */
class ErrorHandlerImpl implements ErrorHandler {
  /**
   * Process any error into a standardized ApiError
   * 
   * @param error Any error object
   * @param context Optional context information
   * @returns Standardized ApiError
   */
  handleError(error: any, context?: string): ApiError {
    // Use the API error handler as the foundation
    const apiError = handleApiError(error, context);
    
    // Log the error with context
    this.logError(apiError, context);
    
    return apiError;
  }
  
  /**
   * Create a context-specific error handler
   * 
   * @param context The context to associate with errors
   * @returns A function that handles errors with the given context
   */
  createContextHandler(context: string): (error: any) => ApiError {
    return (error: any) => this.handleError(error, context);
  }
  
  /**
   * Safely execute a function with error handling
   * 
   * @param fn Function to execute
   * @param fallback Fallback value if the function throws
   * @param context Optional context information
   * @returns The function result or fallback
   */
  tryCatch<T>(fn: () => T, fallback: T, context?: string): T {
    try {
      return fn();
    } catch (error) {
      this.handleError(error, context);
      return fallback;
    }
  }
  
  /**
   * Safely execute an async function with error handling
   * 
   * @param fn Async function to execute
   * @param context Optional context information
   * @returns Promise resolving to [result, error] tuple
   */
  async tryCatchAsync<T>(fn: () => Promise<T>, context?: string): Promise<[T | null, ApiError | null]> {
    try {
      const result = await fn();
      return [result, null];
    } catch (error) {
      const apiError = this.handleError(error, context);
      return [null, apiError];
    }
  }
  
  /**
   * Get a user-friendly message for an error
   * 
   * @param error Any error object
   * @returns User-friendly error message
   */
  getUserMessage(error: any): string {
    if (error instanceof ApiError) {
      return error.getUserMessage();
    }
    
    return error?.message || 'An unexpected error occurred.';
  }
  
  /**
   * Log an error with context
   * 
   * @param error Error to log
   * @param context Optional context
   */
  private logError(error: ApiError, context?: string): void {
    const errorLogger = logger.child('error');
    const logContext = context ? `[${context}]` : '';
    
    // Log based on error severity
    switch (error.type) {
      case ApiErrorType.AUTHENTICATION:
      case ApiErrorType.AUTHORIZATION:
        errorLogger.warn(`${logContext} ${error.message}`, error.toDetailedObject());
        break;
      case ApiErrorType.VALIDATION:
      case ApiErrorType.NOT_FOUND:
      case ApiErrorType.CONFLICT:
        errorLogger.info(`${logContext} ${error.message}`, error.toDetailedObject());
        break;
      default:
        errorLogger.error(`${logContext} ${error.message}`, error.toDetailedObject());
    }
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandlerImpl();

// Default export for backwards compatibility
export default errorHandler;
