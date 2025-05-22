/**
 * Error Tracking Integration
 * 
 * Integrates the API monitoring system with the error tracking service
 * to provide comprehensive error reporting and analysis.
 */

import { ApiError, ApiErrorType } from '../api/error-handler';
import { apiMonitor, subscribeToMetrics } from './api-monitor';
import { logger } from '../logging/logger';
import { ErrorTracking, ErrorSeverity } from '@/services/error-tracking';

// Create a dedicated logger
const trackingLogger = logger.child('error-tracking');

/**
 * Map API error types to error tracking severity levels
 */
const ERROR_SEVERITY_MAP: Record<ApiErrorType, ErrorSeverity> = {
  [ApiErrorType.NETWORK]: ErrorSeverity.WARNING,
  [ApiErrorType.SERVER]: ErrorSeverity.ERROR,
  [ApiErrorType.AUTHENTICATION]: ErrorSeverity.WARNING,
  [ApiErrorType.AUTHORIZATION]: ErrorSeverity.WARNING,
  [ApiErrorType.VALIDATION]: ErrorSeverity.INFO,
  [ApiErrorType.NOT_FOUND]: ErrorSeverity.INFO,
  [ApiErrorType.TIMEOUT]: ErrorSeverity.WARNING,
  [ApiErrorType.RATE_LIMIT]: ErrorSeverity.WARNING,
  [ApiErrorType.CONFLICT]: ErrorSeverity.WARNING,
  [ApiErrorType.CANCELED]: ErrorSeverity.INFO,
  [ApiErrorType.UNKNOWN]: ErrorSeverity.ERROR
};

/**
 * Report an API error to the error tracking service
 */
export function reportApiError(error: ApiError, endpoint?: string): void {
  const severity = ERROR_SEVERITY_MAP[error.type] || ErrorSeverity.ERROR;
  
  // Create tags for better categorization
  const tags: Record<string, string> = {
    errorType: error.type,
    apiError: 'true'
  };
  
  if (endpoint) {
    tags.endpoint = endpoint;
  }
  
  if (error.status) {
    tags.statusCode = error.status.toString();
  }
  
  // Create extra data for more context
  const extra: Record<string, unknown> = {
    ...error.toDetailedObject(),
    endpoint
  };
  
  // Report to error tracking service
  ErrorTracking.captureError(error, {
    severity,
    tags,
    extra
  });
  
  // Log the reporting
  trackingLogger.debug(
    `Reported API error to tracking service: ${error.message}`,
    { endpoint, errorType: error.type, severity }
  );
}

/**
 * Report a high error rate to the error tracking service
 */
export function reportHighErrorRate(errorRate: number, threshold: number): void {
  const errorMessage = `High API error rate detected: ${errorRate.toFixed(1)}% (threshold: ${threshold}%)`;
  
  // Create a custom error
  const highErrorRateError = new Error(errorMessage);
  
  // Report to error tracking service
  ErrorTracking.captureError(highErrorRateError, {
    severity: ErrorSeverity.ERROR,
    tags: {
      type: 'high_error_rate',
      monitoring: 'true'
    },
    extra: {
      errorRate,
      threshold,
      timestamp: new Date().toISOString()
    }
  });
  
  // Log the reporting
  trackingLogger.warn(
    errorMessage,
    { errorRate, threshold },
    { alertType: 'high_error_rate' }
  );
}

/**
 * Initialize the integration between API monitoring and error tracking
 */
export function initErrorTrackingIntegration(options: {
  reportAllErrors?: boolean;
  errorRateThreshold?: number;
  errorRateCheckInterval?: number;
} = {}): () => void {
  const {
    reportAllErrors = false,
    errorRateThreshold = 10,
    errorRateCheckInterval = 60000 // 1 minute
  } = options;
  
  trackingLogger.info('Initializing error tracking integration', { 
    reportAllErrors, 
    errorRateThreshold,
    errorRateCheckInterval
  });
  
  // Set up error rate monitoring
  const errorRateIntervalId = setInterval(() => {
    const metrics = apiMonitor.getApiMetrics();
    const errorRate = apiMonitor.getErrorRate();
    
    // Check if error rate exceeds threshold
    if (errorRate >= errorRateThreshold && metrics.totalRequests > 10) {
      reportHighErrorRate(errorRate, errorRateThreshold);
    }
  }, errorRateCheckInterval);
  
  // Set up individual error reporting if enabled
  let unsubscribeFromMetrics: (() => void) | null = null;
  
  if (reportAllErrors) {
    // This approach reports all errors to the tracking service
    // which might be too noisy for production
    const handleApiError = (error: ApiError, endpoint?: string) => {
      reportApiError(error, endpoint);
    };
    
    // Monkey patch the original trackError method to also report to error tracking
    const originalTrackError = apiMonitor.trackError;
    apiMonitor.trackError = (error: ApiError, endpoint: string) => {
      // Call the original method
      originalTrackError(error, endpoint);
      
      // Report to error tracking
      reportApiError(error, endpoint);
    };
    
    trackingLogger.info('Enabled reporting of all API errors to tracking service');
  }
  
  // Return a cleanup function
  return () => {
    clearInterval(errorRateIntervalId);
    
    if (unsubscribeFromMetrics) {
      unsubscribeFromMetrics();
    }
    
    trackingLogger.info('Error tracking integration stopped');
  };
}

// Export the integration
export const errorTrackingIntegration = {
  init: initErrorTrackingIntegration,
  reportApiError,
  reportHighErrorRate
};

export default errorTrackingIntegration;
