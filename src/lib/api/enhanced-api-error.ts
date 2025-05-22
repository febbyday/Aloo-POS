/**
 * Enhanced API Error
 * 
 * Improved API error handling with more specific and informative error messages.
 * This builds on the existing ApiError implementation but adds more context and
 * better user-facing messages.
 */

import { ApiErrorType } from './error-handler';
import { 
  getApiErrorMessage, 
  getValidationErrorMessage, 
  OperationType, 
  ResourceType 
} from '../error/error-messages';

/**
 * Enhanced API Error options
 */
export interface EnhancedApiErrorOptions {
  type: ApiErrorType;
  status?: number;
  code?: string;
  details?: any;
  retryable?: boolean;
  operation?: OperationType;
  resource?: ResourceType;
  resourceId?: string;
  resourceName?: string;
  field?: string;
  value?: string;
  suggestion?: string;
  endpoint?: string;
}

/**
 * Enhanced API Error class with improved error messages
 */
export class EnhancedApiError extends Error {
  type: ApiErrorType;
  status?: number;
  code?: string;
  details?: any;
  retryable: boolean;
  timestamp: string;
  originalError?: any;
  
  // Enhanced context properties
  operation?: OperationType;
  resource?: ResourceType;
  resourceId?: string;
  resourceName?: string;
  field?: string;
  value?: string;
  suggestion?: string;
  endpoint?: string;

  constructor(message: string, options: EnhancedApiErrorOptions, originalError?: any) {
    super(message);
    this.name = 'EnhancedApiError';
    this.type = options.type;
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.retryable = options.retryable ?? this.isRetryableType(options.type);
    this.timestamp = new Date().toISOString();
    this.originalError = originalError;
    
    // Enhanced context
    this.operation = options.operation;
    this.resource = options.resource;
    this.resourceId = options.resourceId;
    this.resourceName = options.resourceName;
    this.field = options.field;
    this.value = options.value;
    this.suggestion = options.suggestion;
    this.endpoint = options.endpoint;

    // Ensure stack trace is properly captured
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnhancedApiError);
    }
  }

  /**
   * Check if an error type is generally retryable
   */
  private isRetryableType(type: ApiErrorType): boolean {
    return [
      ApiErrorType.NETWORK,
      ApiErrorType.TIMEOUT,
      ApiErrorType.SERVER
    ].includes(type);
  }

  /**
   * Get a user-friendly error message with enhanced context
   */
  getUserFriendlyMessage(): string {
    // For validation errors with a specific field
    if (this.type === ApiErrorType.VALIDATION && this.field) {
      return getValidationErrorMessage(this.field, {
        value: this.value,
        resource: this.resource,
        operation: this.operation,
        suggestion: this.suggestion
      });
    }
    
    // For all other error types
    return getApiErrorMessage(this.type, {
      operation: this.operation,
      resource: this.resource,
      resourceId: this.resourceId,
      resourceName: this.resourceName,
      details: this.details?.message || this.details,
      suggestion: this.suggestion,
      retry: this.retryable
    });
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
      operation: this.operation,
      resource: this.resource,
      resourceId: this.resourceId,
      resourceName: this.resourceName,
      field: this.field,
      value: this.value,
      suggestion: this.suggestion,
      endpoint: this.endpoint,
      stack: this.stack
    };
  }
}

/**
 * Create an enhanced API error with improved context
 * 
 * @param error Original error object
 * @param options Enhanced error options
 * @returns Enhanced API error
 */
export function createEnhancedApiError(
  error: any,
  options: Partial<EnhancedApiErrorOptions> = {}
): EnhancedApiError {
  // Extract message from error
  const message = error?.message || 'An unexpected error occurred';
  
  // Determine error type
  const type = options.type || determineErrorType(error);
  
  // Create enhanced error
  return new EnhancedApiError(message, {
    type,
    status: error?.status || error?.statusCode || options.status,
    code: error?.code || options.code,
    details: error?.details || options.details,
    retryable: options.retryable,
    operation: options.operation,
    resource: options.resource,
    resourceId: options.resourceId,
    resourceName: options.resourceName,
    field: options.field,
    value: options.value,
    suggestion: options.suggestion,
    endpoint: options.endpoint
  }, error);
}

/**
 * Determine the error type from an error object
 */
function determineErrorType(error: any): ApiErrorType {
  // If error already has a type, use it
  if (error?.type && Object.values(ApiErrorType).includes(error.type)) {
    return error.type;
  }
  
  // Determine type from status code
  const status = error?.status || error?.statusCode;
  if (status) {
    if (status === 401) return ApiErrorType.AUTHENTICATION;
    if (status === 403) return ApiErrorType.AUTHORIZATION;
    if (status === 404) return ApiErrorType.NOT_FOUND;
    if (status === 409) return ApiErrorType.CONFLICT;
    if (status === 422 || status === 400) return ApiErrorType.VALIDATION;
    if (status === 429) return ApiErrorType.RATE_LIMIT;
    if (status >= 500) return ApiErrorType.SERVER;
  }
  
  // Check for network errors
  if (error?.message?.includes('network') || 
      error?.message?.includes('connection') ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ECONNRESET') {
    return ApiErrorType.NETWORK;
  }
  
  // Check for timeout errors
  if (error?.message?.includes('timeout') || 
      error?.code === 'ETIMEDOUT' ||
      error?.code === 'ECONNABORTED') {
    return ApiErrorType.TIMEOUT;
  }
  
  // Default to unknown
  return ApiErrorType.UNKNOWN;
}
