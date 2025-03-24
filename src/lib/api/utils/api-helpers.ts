/**
 * API Helper Utilities
 * 
 * This file contains helper functions for working with the API,
 * including error handling, request formatting, and response parsing.
 */

import { ApiError, ApiResponse } from '../api-client';

/**
 * Creates a standardized error object for API errors
 * 
 * @param error - The original error
 * @param context - Additional context about where the error occurred
 * @returns A standardized API error
 */
export function createApiError(error: any, context?: string): ApiError {
  const apiError: ApiError = {
    message: error?.message || 'An unknown error occurred',
    status: error?.status || error?.statusCode || 500,
    code: error?.code || 'UNKNOWN_ERROR',
    details: error?.details || {},
    isApiError: true,
    originalError: error,
  };

  if (context) {
    apiError.context = context;
  }

  // Add timestamp for debugging
  apiError.timestamp = new Date().toISOString();

  return apiError;
}

/**
 * Handles API errors in a standardized way, optionally logging them
 * 
 * @param error - The error to handle
 * @param shouldLog - Whether to log the error to console
 * @returns A rejected promise with a standardized API error
 */
export function handleApiError<T>(error: any, shouldLog = true): Promise<T> {
  // Convert to standardized API error
  const apiError = createApiError(error);
  
  // Log error in development mode if logging is enabled
  if (shouldLog && process.env.NODE_ENV === 'development') {
    console.error('API Error:', apiError);
  }
  
  // Return rejected promise with the standardized error
  return Promise.reject(apiError);
}

/**
 * Determines if network is available
 * 
 * @returns Whether network is currently available
 */
export function isNetworkAvailable(): boolean {
  return navigator.onLine;
}

/**
 * Creates a successful API response
 * 
 * @param data - The response data
 * @param metadata - Additional metadata for the response
 * @returns A standardized API response
 */
export function createApiResponse<T>(data: T, metadata?: Record<string, any>): ApiResponse<T> {
  return {
    success: true,
    data,
    metadata: metadata || {},
  };
}

/**
 * Parses an API response to extract data
 * 
 * @param response - The API response to parse
 * @returns The extracted data
 */
export function parseApiResponse<T>(response: Response): Promise<T> {
  // Check if the response has a JSON content type
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return response.json().then(data => {
      if (!response.ok) {
        throw createApiError({
          message: data.message || response.statusText,
          status: response.status,
          code: data.code || 'API_ERROR',
          details: data.details || {},
        });
      }
      
      return data;
    });
  } else {
    // Handle text responses
    return response.text().then(text => {
      if (!response.ok) {
        throw createApiError({
          message: text || response.statusText,
          status: response.status,
          code: 'API_ERROR',
        });
      }
      
      return text as unknown as T;
    });
  }
}

/**
 * Formats an error message for display to the user
 * 
 * @param error - The error to format
 * @returns A user-friendly error message
 */
export function formatErrorMessage(error: any): string {
  if (error.isApiError) {
    // Format API errors
    switch (error.status) {
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return error.message || 'An error occurred while connecting to the server.';
    }
  } else {
    // Format other errors
    return error.message || 'An unknown error occurred.';
  }
}

/**
 * Debounces an API call to prevent excessive requests
 * 
 * @param func - The function to debounce
 * @param wait - How long to wait in milliseconds
 * @returns A debounced function
 */
export function debounceApiCall<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(() => {
        resolve(func(...args));
      }, wait);
    });
  };
} 