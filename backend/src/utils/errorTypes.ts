/**
 * Error codes for authentication errors
 */
export enum AuthErrorCode {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_MISSING = 'TOKEN_MISSING',
  TOKEN_BLACKLISTED = 'TOKEN_BLACKLISTED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  PIN_NOT_ENABLED = 'PIN_NOT_ENABLED',
  PIN_LOCKED = 'PIN_LOCKED',
  PIN_ATTEMPTS_EXCEEDED = 'PIN_ATTEMPTS_EXCEEDED',
  PIN_INVALID = 'PIN_INVALID',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  PASSWORD_CHANGE_FAILED = 'PASSWORD_CHANGE_FAILED',
  UNKNOWN_AUTH_ERROR = 'UNKNOWN_AUTH_ERROR'
}

/**
 * Authentication error class
 * Standardized error for authentication-related issues
 */
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public httpStatus: number = 401,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthenticationError';
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }
  }

  /**
   * Convert to a response object for API responses
   */
  toResponse() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details
      }
    };
  }
}

/**
 * Network error codes
 */
export enum NetworkErrorCode {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  TIMEOUT = 'TIMEOUT',
  CORS_ERROR = 'CORS_ERROR',
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  PROXY_ERROR = 'PROXY_ERROR',
  SSL_ERROR = 'SSL_ERROR',
  DNS_ERROR = 'DNS_ERROR',
  UNKNOWN_NETWORK_ERROR = 'UNKNOWN_NETWORK_ERROR'
}

/**
 * Network error class
 * For network and API connectivity issues
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public code: NetworkErrorCode,
    public httpStatus: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'NetworkError';
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }

  /**
   * Convert to a response object for API responses
   */
  toResponse() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details
      }
    };
  }
}

/**
 * Validation error codes
 */
export enum ValidationErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  UNKNOWN_VALIDATION_ERROR = 'UNKNOWN_VALIDATION_ERROR'
}

/**
 * Validation error class
 * For input validation errors
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public code: ValidationErrorCode,
    public httpStatus: number = 400,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Convert to a response object for API responses
   */
  toResponse() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        fields: this.fields
      }
    };
  }
}

/**
 * Helper function to handle common errors
 */
export function handleError(error: any): { status: number; response: any } {
  console.error('Error occurred:', error);
  
  // Handle known error types
  if (error instanceof AuthenticationError) {
    return {
      status: error.httpStatus,
      response: error.toResponse()
    };
  }
  
  if (error instanceof NetworkError) {
    return {
      status: error.httpStatus,
      response: error.toResponse()
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      status: error.httpStatus,
      response: error.toResponse()
    };
  }
  
  // Default error handling
  return {
    status: 500,
    response: {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        // Include original error message in development
        details: process.env.NODE_ENV === 'development' 
          ? { originalError: error.message, stack: error.stack } 
          : undefined
      }
    }
  };
}
