// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Response } from 'express';
import { ZodError } from 'zod';

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
 * Helper function to send standardized error responses
 * 
 * @param res Express response object
 * @param error Error object or message
 * @param statusCode HTTP status code (defaults to 500)
 */
export const sendErrorResponse = (
  res: Response,
  error: Error | ZodError | string,
  statusCode: number = 500
): Response => {
  // Initialize the error response
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: 'An unexpected error occurred',
    statusCode
  };
  
  // Handle different error types
  if (error instanceof ZodError) {
    errorResponse.error = 'Validation failed';
    errorResponse.details = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }));
    statusCode = 400;
  } else if (error instanceof Error) {
    errorResponse.error = error.message || 'An unexpected error occurred';
  } else if (typeof error === 'string') {
    errorResponse.error = error;
  }
  
  // Log the error for debugging (could be replaced with a more sophisticated logger)
  console.error(`[API Error] ${errorResponse.error}`, error);
  
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
