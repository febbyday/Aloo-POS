/**
 * Monitoring System Initialization
 *
 * This file initializes the monitoring system, including logging and error tracking.
 * It should be imported and called early in the application lifecycle.
 */

import { logger, LogLevel } from '../logging/logger';
import { errorTrackingIntegration } from './error-tracking-integration';
import { ErrorTracking } from '@/services/error-tracking';

// Default configuration
const DEFAULT_CONFIG = {
  enableLogging: true,
  logLevel: import.meta.env.MODE === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableRemoteLogging: import.meta.env.MODE === 'production',
  remoteLoggingUrl: import.meta.env.VITE_LOG_SERVICE_URL,

  enableErrorTracking: true,
  reportAllErrors: import.meta.env.MODE !== 'production', // Too noisy for production
  errorRateThreshold: 10,
  errorRateCheckInterval: 60000, // 1 minute

  captureUnhandledRejections: true,
  captureUnhandledExceptions: true
};

// Store cleanup functions
let cleanupFunctions: Array<() => void> = [];

/**
 * Initialize the monitoring system
 */
export function initMonitoring(config: Partial<typeof DEFAULT_CONFIG> = {}): void {
  // Merge configuration
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Initialize logging
  if (mergedConfig.enableLogging) {
    // Configure logger
    logger.pushContext('app');

    logger.info('Initializing monitoring system', {
      environment: import.meta.env.MODE,
      config: mergedConfig
    });
  }

  // Initialize error tracking
  if (mergedConfig.enableErrorTracking) {
    // Initialize error tracking service
    ErrorTracking.initErrorTracking({
      captureUnhandledRejections: mergedConfig.captureUnhandledRejections,
      captureUnhandledExceptions: mergedConfig.captureUnhandledExceptions
    });

    // Initialize integration with API monitoring
    const cleanup = errorTrackingIntegration.init({
      reportAllErrors: mergedConfig.reportAllErrors,
      errorRateThreshold: mergedConfig.errorRateThreshold,
      errorRateCheckInterval: mergedConfig.errorRateCheckInterval
    });

    cleanupFunctions.push(cleanup);

    logger.info('Error tracking initialized');
  }

  // Log initialization complete
  logger.info('Monitoring system initialized successfully');
}

/**
 * Shutdown the monitoring system
 */
export function shutdownMonitoring(): void {
  logger.info('Shutting down monitoring system');

  // Call all cleanup functions
  cleanupFunctions.forEach(cleanup => {
    try {
      cleanup();
    } catch (error) {
      console.error('Error during monitoring cleanup:', error);
    }
  });

  // Clear cleanup functions
  cleanupFunctions = [];

  logger.info('Monitoring system shutdown complete');
}

// Export the monitoring system
export const monitoring = {
  init: initMonitoring,
  shutdown: shutdownMonitoring
};

export default monitoring;
