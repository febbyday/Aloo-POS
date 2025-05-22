/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * API Error Handler
 * 
 * This utility provides centralized error handling for API requests,
 * with special handling for the transition from mock data to real endpoints.
 */

import { toast } from '@/lib/toast';

// Error types for more specific handling
export enum ApiErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
  MOCK_DISABLED = 'mock_disabled'
}

// API Error extended from standard Error
export class ApiError extends Error {
  type: ApiErrorType;
  statusCode?: number;
  endpoint?: string;
  originalError?: Error;
  data?: any;
  
  constructor(
    message: string, 
    type: ApiErrorType = ApiErrorType.UNKNOWN, 
    statusCode?: number,
    endpoint?: string,
    originalError?: Error,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.originalError = originalError;
    this.data = data;
    
    // Ensure stack trace includes this constructor
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
  
  // Get a user-friendly message based on error type
  getUserFriendlyMessage(): string {
    switch (this.type) {
      case ApiErrorType.NETWORK:
        return 'Network error. Please check your internet connection and try again.';
      case ApiErrorType.SERVER:
        return 'The server encountered an error. Our team has been notified.';
      case ApiErrorType.AUTHORIZATION:
        return 'You are not authorized to perform this action. Please log in again.';
      case ApiErrorType.VALIDATION:
        return 'Some of the provided information is invalid. Please check your input.';
      case ApiErrorType.NOT_FOUND:
        return 'The requested resource could not be found.';
      case ApiErrorType.TIMEOUT:
        return 'The request timed out. Please try again.';
      case ApiErrorType.MOCK_DISABLED:
        return 'Mock data has been disabled. This feature requires a connection to the real backend.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }
}

/**
 * Handle API errors centrally
 * @param error Error object from API call
 * @param endpoint Optional endpoint information for better logging
 * @returns Standardized ApiError object
 */
export function handleApiError(error: any, endpoint?: string): ApiError {
  console.error(`API Error [${endpoint || 'unknown endpoint'}]:`, error);
  
  // If it's already an ApiError, just return it
  if (error instanceof ApiError) {
    return error;
  }
  
  let type = ApiErrorType.UNKNOWN;
  let statusCode: number | undefined = undefined;
  let message = error.message || 'An unknown error occurred';
  let data: any = undefined;
  
  // Handle different error types
  if (error.response) {
    // Server returned error response
    statusCode = error.response.status;
    data = error.response.data;
    
    switch (statusCode) {
      case 400:
        type = ApiErrorType.VALIDATION;
        message = error.response.data?.message || 'Invalid request';
        break;
      case 401:
      case 403:
        type = ApiErrorType.AUTHORIZATION;
        message = statusCode === 401 
          ? 'Your session has expired. Please log in again.' 
          : 'You do not have permission to access this resource.';
        break;
      case 404:
        type = ApiErrorType.NOT_FOUND;
        message = 'The requested resource was not found.';
        break;
      case 500:
      case 502:
      case 503:
        type = ApiErrorType.SERVER;
        message = 'Server error. Our team has been notified.';
        break;
      default:
        if (statusCode >= 500) {
          type = ApiErrorType.SERVER;
        } else {
          type = ApiErrorType.UNKNOWN;
        }
    }
  } else if (error.request) {
    // Request was made but no response received
    if (error.code === 'ECONNABORTED') {
      type = ApiErrorType.TIMEOUT;
      message = 'Request timed out. Please try again.';
    } else {
      type = ApiErrorType.NETWORK;
      message = 'Network error. Please check your connection.';
    }
  } else if (error.message && error.message.includes('mock')) {
    // Special case for mock data disabled
    type = ApiErrorType.MOCK_DISABLED;
    message = 'This feature requires connection to the real backend. Mock data is disabled.';
  }
  
  // Create standardized error
  return new ApiError(
    message,
    type,
    statusCode,
    endpoint,
    error,
    data
  );
}

/**
 * Show a toast notification for API errors
 * @param error ApiError or any error object
 * @param title Optional custom title for the toast
 */
export function showApiErrorToast(error: Error | ApiError, title = 'Error') {
  const apiError = error instanceof ApiError 
    ? error 
    : handleApiError(error);
  
  toast.error(title, apiError.getUserFriendlyMessage());
}

/**
 * Gracefully handle API errors during fetch with fallback support
 * @param promise Promise from API fetch
 * @param fallbackData Optional fallback data to use on error
 * @param endpoint Optional endpoint name for better logging
 * @returns Result or fallback data
 */
export async function safeApiCall<T>(
  promise: Promise<T>, 
  fallbackData?: T, 
  endpoint?: string
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    const apiError = handleApiError(error, endpoint);
    
    // Only show toast for errors other than MOCK_DISABLED (which we expect during transition)
    if (apiError.type !== ApiErrorType.MOCK_DISABLED) {
      showApiErrorToast(apiError);
    } else {
      // Log mock disabled errors but don't show toast (too noisy during transition)
      console.warn(`Mock data disabled for endpoint: ${endpoint}`);
    }
    
    // Return fallback data if provided
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    
    // Re-throw the error if no fallback
    throw apiError;
  }
}

export default {
  handleApiError,
  showApiErrorToast,
  safeApiCall,
  ApiErrorType,
  ApiError
};
