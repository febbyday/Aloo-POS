/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * API Monitoring Service
 * 
 * Tracks API errors, retries, and performance metrics to provide
 * insights into API health and reliability.
 */

import { ApiError } from '../api/error-handler';
import { logger } from '../logging/logger';

// Create a module-specific logger
const apiLogger = logger.child('api');

// Helper function to safely create error type record
const createErrorTypeRecord = (): Record<string, number> => {
  return {
    'network': 0,
    'server': 0,
    'authentication': 0,
    'authorization': 0,
    'validation': 0,
    'not_found': 0,
    'timeout': 0,
    'rate_limit': 0,
    'conflict': 0,
    'canceled': 0,
    'unknown': 0
  };
};

// Metrics storage
interface ApiMetrics {
  // Request counts
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  
  // Error counts by type
  errorsByType: Record<string, number>;
  
  // Retry metrics
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
  
  // Performance metrics
  responseTimes: number[]; // in milliseconds
  
  // Endpoint-specific metrics
  endpointMetrics: Record<string, {
    totalRequests: number;
    failedRequests: number;
    retries: number;
    averageResponseTime: number;
    lastError?: {
      message: string;
      timestamp: string;
      type: string;
    };
  }>;
  
  // Time-based metrics
  timeBasedMetrics: {
    lastHour: {
      requests: number;
      errors: number;
      retries: number;
    };
    lastDay: {
      requests: number;
      errors: number;
      retries: number;
    };
  };
}

// Initialize metrics
const metrics: ApiMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  
  errorsByType: createErrorTypeRecord(),
  
  totalRetries: 0,
  successfulRetries: 0,
  failedRetries: 0,
  
  responseTimes: [],
  
  endpointMetrics: {},
  
  timeBasedMetrics: {
    lastHour: {
      requests: 0,
      errors: 0,
      retries: 0
    },
    lastDay: {
      requests: 0,
      errors: 0,
      retries: 0
    }
  }
};

// Listeners for metric updates
type MetricsListener = (metrics: ApiMetrics) => void;
const listeners: MetricsListener[] = [];

// Time-based cleanup
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Set up periodic cleanup of time-based metrics
setInterval(() => {
  metrics.timeBasedMetrics.lastHour = {
    requests: 0,
    errors: 0,
    retries: 0
  };
}, HOUR_MS);

setInterval(() => {
  metrics.timeBasedMetrics.lastDay = {
    requests: 0,
    errors: 0,
    retries: 0
  };
}, DAY_MS);

/**
 * Track a new API request
 */
export function trackRequest(endpoint: string, startTime: number): void {
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  // Update global metrics
  metrics.totalRequests++;
  metrics.responseTimes.push(responseTime);
  
  // Limit the size of response times array
  if (metrics.responseTimes.length > 1000) {
    metrics.responseTimes.shift();
  }
  
  // Update endpoint metrics
  if (!metrics.endpointMetrics[endpoint]) {
    metrics.endpointMetrics[endpoint] = {
      totalRequests: 0,
      failedRequests: 0,
      retries: 0,
      averageResponseTime: 0
    };
  }
  
  const endpointMetric = metrics.endpointMetrics[endpoint];
  endpointMetric.totalRequests++;
  
  // Update average response time
  const prevTotal = endpointMetric.averageResponseTime * (endpointMetric.totalRequests - 1);
  endpointMetric.averageResponseTime = (prevTotal + responseTime) / endpointMetric.totalRequests;
  
  // Update time-based metrics
  metrics.timeBasedMetrics.lastHour.requests++;
  metrics.timeBasedMetrics.lastDay.requests++;
  
  // Log request
  apiLogger.debug(`Request to ${endpoint} completed in ${responseTime}ms`);
  
  // Notify listeners
  notifyListeners();
}

/**
 * Track a successful API request
 */
export function trackSuccess(endpoint: string): void {
  metrics.successfulRequests++;
  
  // Log success
  apiLogger.debug(`Request to ${endpoint} succeeded`);
  
  // Notify listeners
  notifyListeners();
}

/**
 * Track an API error
 */
export function trackError(error: ApiError, endpoint: string): void {
  // Update global metrics
  metrics.failedRequests++;
  
  // Safely increment error type counter (ensure the type exists in our record)
  const errorType = error.type || 'unknown';
  metrics.errorsByType[errorType] = (metrics.errorsByType[errorType] || 0) + 1;
  
  // Update endpoint metrics
  if (!metrics.endpointMetrics[endpoint]) {
    metrics.endpointMetrics[endpoint] = {
      totalRequests: 1,
      failedRequests: 0,
      retries: 0,
      averageResponseTime: 0
    };
  }
  
  metrics.endpointMetrics[endpoint].failedRequests++;
  metrics.endpointMetrics[endpoint].lastError = {
    message: error.message,
    timestamp: new Date().toISOString(),
    type: error.type
  };
  
  // Update time-based metrics
  metrics.timeBasedMetrics.lastHour.errors++;
  metrics.timeBasedMetrics.lastDay.errors++;
  
  // Log error with context
  apiLogger.error(`Request to ${endpoint} failed: ${error.message}`, {
    type: error.type,
    status: error.status,
    details: error.details
  }, {
    endpoint,
    errorType: error.type
  });
  
  // Notify listeners
  notifyListeners();
}

/**
 * Track an API retry attempt
 */
export function trackRetry(error: ApiError, endpoint: string, attempt: number): void {
  // Update global metrics
  metrics.totalRetries++;
  
  // Update endpoint metrics
  if (!metrics.endpointMetrics[endpoint]) {
    metrics.endpointMetrics[endpoint] = {
      totalRequests: 0,
      failedRequests: 0,
      retries: 0,
      averageResponseTime: 0
    };
  }
  
  metrics.endpointMetrics[endpoint].retries++;
  
  // Update time-based metrics
  metrics.timeBasedMetrics.lastHour.retries++;
  metrics.timeBasedMetrics.lastDay.retries++;
  
  // Log retry
  apiLogger.warn(`Retrying request to ${endpoint} (attempt ${attempt}): ${error.message}`, {
    type: error.type,
    attempt,
    details: error.details
  }, {
    endpoint,
    errorType: error.type,
    attempt: attempt.toString()
  });
  
  // Notify listeners
  notifyListeners();
}

/**
 * Track a successful retry
 */
export function trackRetrySuccess(endpoint: string, attempt: number): void {
  metrics.successfulRetries++;
  
  // Log success
  apiLogger.info(`Retry to ${endpoint} succeeded on attempt ${attempt}`);
  
  // Notify listeners
  notifyListeners();
}

/**
 * Track a failed retry (all attempts exhausted)
 */
export function trackRetryFailure(error: ApiError, endpoint: string, maxAttempts: number): void {
  metrics.failedRetries++;
  
  // Log failure
  apiLogger.error(`All ${maxAttempts} retry attempts to ${endpoint} failed: ${error.message}`, {
    type: error.type,
    status: error.status,
    details: error.details,
    maxAttempts
  }, {
    endpoint,
    errorType: error.type,
    maxAttempts: maxAttempts.toString()
  });
  
  // Notify listeners
  notifyListeners();
}

/**
 * Get current API metrics
 */
export function getApiMetrics(): ApiMetrics {
  return { ...metrics };
}

/**
 * Subscribe to metrics updates
 */
export function subscribeToMetrics(listener: MetricsListener): () => void {
  listeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

/**
 * Notify all listeners of metrics updates
 */
function notifyListeners(): void {
  const metricsSnapshot = { ...metrics };
  listeners.forEach(listener => {
    try {
      listener(metricsSnapshot);
    } catch (error) {
      console.error('Error in metrics listener:', error);
    }
  });
}

/**
 * Calculate average response time
 */
export function getAverageResponseTime(): number {
  if (metrics.responseTimes.length === 0) return 0;
  
  const sum = metrics.responseTimes.reduce((acc, time) => acc + time, 0);
  return sum / metrics.responseTimes.length;
}

/**
 * Get error rate as a percentage
 */
export function getErrorRate(): number {
  if (metrics.totalRequests === 0) return 0;
  return (metrics.failedRequests / metrics.totalRequests) * 100;
}

/**
 * Get retry success rate as a percentage
 */
export function getRetrySuccessRate(): number {
  if (metrics.totalRetries === 0) return 0;
  return (metrics.successfulRetries / metrics.totalRetries) * 100;
}

/**
 * Reset all metrics (mainly for testing)
 */
export function resetMetrics(): void {
  Object.keys(metrics.errorsByType).forEach(key => {
    metrics.errorsByType[key] = 0;
  });
  
  metrics.totalRequests = 0;
  metrics.successfulRequests = 0;
  metrics.failedRequests = 0;
  metrics.totalRetries = 0;
  metrics.successfulRetries = 0;
  metrics.failedRetries = 0;
  metrics.responseTimes = [];
  metrics.endpointMetrics = {};
  
  metrics.timeBasedMetrics = {
    lastHour: {
      requests: 0,
      errors: 0,
      retries: 0
    },
    lastDay: {
      requests: 0,
      errors: 0,
      retries: 0
    }
  };
  
  // Notify listeners
  notifyListeners();
}

// Export the API monitor
export const apiMonitor = {
  trackRequest,
  trackSuccess,
  trackError,
  trackRetry,
  trackRetrySuccess,
  trackRetryFailure,
  getApiMetrics,
  subscribeToMetrics,
  getAverageResponseTime,
  getErrorRate,
  getRetrySuccessRate,
  resetMetrics
};

export default apiMonitor;
