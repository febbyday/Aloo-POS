import { Response, Request } from 'express';
import { ZodError } from 'zod';
import { logger } from './logger';

/**
 * Standard error response format for the API
 * This ensures consistency between frontend and backend error handling
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
  statusCode?: number;
  errorCode?: string;
  requestId?: string;
}

/**
 * Standard success response format for the API
 * This ensures consistency between frontend and backend responses
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Error types for better categorization
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  DATABASE = 'DATABASE_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  BAD_REQUEST = 'BAD_REQUEST'
}

/**
 * Application error class with additional context
 */
export class AppError extends Error {
  statusCode: number;
  errorCode: string;
  details?: any;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = ErrorType.INTERNAL,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Generate a unique request ID for tracking errors across systems
 */
export function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/**
 * Extract request context for logging
 */
export function getRequestContext(req: Request): Record<string, any> {
  return {
    url: req.originalUrl || req.url,
    method: req.method,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.id,
    requestId: (req as any).requestId || generateRequestId()
  };
}

/**
 * Helper function to send standardized error responses with enhanced logging
 *
 * @param res Express response object
 * @param error Error object or message
 * @param statusCode HTTP status code (defaults to 500)
 * @param req Optional request object for context
 */
export const sendErrorResponse = (
  res: Response,
  error: Error | ZodError | AppError | string,
  statusCode: number = 500,
  req?: Request
): Response => {
  // Initialize the error response
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: 'An unexpected error occurred',
    statusCode
  };

  // Generate request ID if not already present
  const requestId = req ? ((req as any).requestId || generateRequestId()) : generateRequestId();
  errorResponse.requestId = requestId;

  // Handle different error types
  if (error instanceof ZodError) {
    errorResponse.error = 'Validation failed';
    errorResponse.details = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }));
    errorResponse.errorCode = ErrorType.VALIDATION;
    statusCode = 400;
  } else if (error instanceof AppError) {
    errorResponse.error = error.message;
    errorResponse.statusCode = error.statusCode;
    errorResponse.errorCode = error.errorCode;
    if (error.details) {
      errorResponse.details = error.details;
    }
    statusCode = error.statusCode;
  } else if (error instanceof Error) {
    errorResponse.error = error.message || 'An unexpected error occurred';
    errorResponse.errorCode = ErrorType.INTERNAL;
  } else if (typeof error === 'string') {
    errorResponse.error = error;
    errorResponse.errorCode = ErrorType.INTERNAL;
  }

  // Get request context for logging if available
  const context = req ? getRequestContext(req) : { requestId };

  // Log the error with our centralized logger
  logger.error(`API Error: ${errorResponse.error}`, error, {
    statusCode,
    errorCode: errorResponse.errorCode,
    ...context
  });

  // Send the response
  return res.status(statusCode).json(errorResponse);
};

/**
 * Helper function to send standardized success responses
 *
 * @param res Express response object
 * @param data Data to include in the response
 * @param message Optional success message
 * @param statusCode HTTP status code (defaults to 200)
 */
export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message })
  };

  return res.status(statusCode).json(response);
};
