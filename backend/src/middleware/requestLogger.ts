/**
 * Request Logger Middleware
 * 
 * This middleware logs all incoming requests and their responses.
 * It adds a unique requestId to each request for traceability.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { generateRequestId, getRequestContext } from '../utils/errorHandling';

/**
 * Middleware to log all incoming requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate a unique request ID
  const requestId = generateRequestId();
  (req as any).requestId = requestId;
  
  // Get request start time
  const startTime = Date.now();
  
  // Get request context for logging
  const context = getRequestContext(req);
  
  // Log the incoming request
  logger.info(`Incoming request: ${req.method} ${req.originalUrl || req.url}`, context);
  
  // Capture the original end method
  const originalEnd = res.end;
  
  // Override the end method to log the response
  res.end = function(this: Response, ...args: any[]): any {
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    // Restore the original end method
    res.end = originalEnd;
    
    // Call the original end method
    const result = originalEnd.apply(this, args);
    
    // Log the response
    const logMethod = res.statusCode >= 400 ? 'warn' : 'info';
    logger[logMethod](`Response: ${req.method} ${req.originalUrl || req.url} - ${res.statusCode} (${duration}ms)`, {
      ...context,
      statusCode: res.statusCode,
      duration
    });
    
    return result;
  };
  
  next();
};

/**
 * Error logging middleware
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // Get request context for logging
  const context = getRequestContext(req);
  
  // Log the error
  logger.error(`Unhandled error in request: ${req.method} ${req.originalUrl || req.url}`, err, context);
  
  // Pass the error to the next error handler
  next(err);
};

export default { requestLogger, errorLogger };
