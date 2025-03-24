/**
 * Error Tracking Service
 * 
 * This service provides functionality for capturing and reporting errors.
 * It can be configured to send errors to various monitoring services.
 */

// Define the error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Interface for error tracking options
export interface ErrorTrackingOptions {
  /**
   * Additional tags to categorize the error
   */
  tags?: Record<string, string>;
  
  /**
   * Additional metadata about the error
   */
  extra?: Record<string, unknown>;
  
  /**
   * User information if available
   */
  user?: {
    id?: string;
    username?: string;
    email?: string;
  };
  
  /**
   * Error severity level
   */
  severity?: ErrorSeverity;
  
  /**
   * Component information if error is from a component
   */
  componentStack?: string;
  
  /**
   * Error boundary name if caught by an error boundary
   */
  boundary?: string;
}

// Define a default service URL - would be replaced with actual error reporting service
const ERROR_SERVICE_URL = process.env.REACT_APP_ERROR_SERVICE_URL || 'https://api.example.com/errors';

/**
 * Capture and report an error to the monitoring service
 */
export function captureError(
  error: Error | string,
  options: ErrorTrackingOptions = {}
): void {
  // Extract error data
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  const { message, stack, name } = errorObj;
  
  // Get browser information
  const { userAgent, language, platform } = navigator;
  const { href, pathname } = window.location;
  
  // Combine all error data
  const errorData = {
    timestamp: new Date().toISOString(),
    type: name,
    message,
    stack,
    url: href,
    path: pathname,
    userAgent,
    language,
    platform,
    ...options
  };
  
  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('Error captured:');
    console.error(error);
    console.log('Error metadata:', options);
    console.groupEnd();
    
    // In development, don't send to external service
    return;
  }
  
  // Send error to monitoring service in production
  sendErrorToService(errorData).catch(sendError => {
    // If sending fails, log to console as fallback
    console.error('Failed to send error to monitoring service:', sendError);
  });
}

/**
 * Send error data to the monitoring service
 */
async function sendErrorToService(errorData: unknown): Promise<void> {
  try {
    // In a real implementation, this would send to a real error monitoring service
    // For example: Sentry, LogRocket, New Relic, etc.
    
    await fetch(ERROR_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    });
  } catch (error) {
    // Avoid infinite loops of error reporting
    console.error('Error while reporting error:', error);
  }
}

/**
 * Manually report a handled exception
 */
export function reportHandledException(
  error: Error | string,
  options: ErrorTrackingOptions = {}
): void {
  captureError(error, { 
    ...options, 
    tags: { ...options.tags, handled: 'true' },
    severity: options.severity || ErrorSeverity.WARNING
  });
}

/**
 * Initialize error tracking service with global handlers
 */
export function initErrorTracking(options: {
  captureUnhandledRejections?: boolean;
  captureUnhandledExceptions?: boolean;
} = {}): void {
  const { 
    captureUnhandledRejections = true, 
    captureUnhandledExceptions = true 
  } = options;
  
  // Set up global error handler
  if (captureUnhandledExceptions) {
    window.addEventListener('error', (event) => {
      captureError(event.error || new Error(event.message), {
        severity: ErrorSeverity.ERROR,
        extra: {
          lineNo: event.lineno,
          colNo: event.colno,
          filename: event.filename
        }
      });
    });
  }
  
  // Set up unhandled promise rejection handler
  if (captureUnhandledRejections) {
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(`Unhandled promise rejection: ${String(event.reason)}`);
      
      captureError(error, {
        severity: ErrorSeverity.ERROR,
        tags: { type: 'unhandled_promise_rejection' }
      });
    });
  }
}

// Export an object with all error tracking functionality
export const ErrorTracking = {
  captureError,
  reportHandledException,
  initErrorTracking,
  Severity: ErrorSeverity
}; 