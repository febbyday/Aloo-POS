/**
 * API Performance Optimizations
 * 
 * This file contains utilities to optimize API performance.
 */

import { API_CONSTANTS } from './config';
import { logger } from '../logging/logger';

// Default timeout values
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const OPTIMIZED_TIMEOUT = 15000; // 15 seconds for non-critical requests
const SETTINGS_TIMEOUT = 5000; // 5 seconds for settings requests

// Default retry configuration
const DEFAULT_RETRY_COUNT = 2;
const OPTIMIZED_RETRY_COUNT = 1;

/**
 * Optimize API client configuration based on the current environment
 * and request type
 */
export function getOptimizedApiConfig() {
  // Determine if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development';
  
  // Base configuration
  const config = {
    baseUrl: API_CONSTANTS.URL,
    timeout: isDevelopment ? OPTIMIZED_TIMEOUT : DEFAULT_TIMEOUT,
    retryCount: isDevelopment ? OPTIMIZED_RETRY_COUNT : DEFAULT_RETRY_COUNT,
    settingsTimeout: SETTINGS_TIMEOUT,
    useMock: API_CONSTANTS.USE_MOCK_DATA,
    logRequests: isDevelopment
  };
  
  logger.debug('Optimized API configuration', config);
  
  return config;
}

/**
 * Get optimized timeout for a specific endpoint
 * 
 * @param endpoint API endpoint
 * @returns Optimized timeout value in milliseconds
 */
export function getOptimizedTimeout(endpoint: string): number {
  // Settings endpoints get shorter timeout
  if (endpoint.startsWith('settings/')) {
    return SETTINGS_TIMEOUT;
  }
  
  // Critical endpoints get default timeout
  if (
    endpoint.includes('auth/') ||
    endpoint.includes('users/') ||
    endpoint.includes('roles/')
  ) {
    return DEFAULT_TIMEOUT;
  }
  
  // All other endpoints get optimized timeout
  return OPTIMIZED_TIMEOUT;
}

/**
 * Get optimized retry count for a specific endpoint
 * 
 * @param endpoint API endpoint
 * @returns Optimized retry count
 */
export function getOptimizedRetryCount(endpoint: string): number {
  // Critical endpoints get default retry count
  if (
    endpoint.includes('auth/') ||
    endpoint.includes('users/') ||
    endpoint.includes('roles/')
  ) {
    return DEFAULT_RETRY_COUNT;
  }
  
  // All other endpoints get optimized retry count
  return OPTIMIZED_RETRY_COUNT;
}

/**
 * Apply performance optimizations to the API client
 * 
 * @param apiClient API client instance
 */
export function applyApiPerformanceOptimizations(apiClient: any): void {
  // Log that we're applying optimizations
  logger.info('Applying API performance optimizations');
  
  // Apply optimized configuration
  const config = getOptimizedApiConfig();
  
  // Update timeout
  if (apiClient.defaults) {
    apiClient.defaults.timeout = config.timeout;
  }
  
  // Add request interceptor to optimize timeouts per request
  if (apiClient.interceptors && apiClient.interceptors.request) {
    apiClient.interceptors.request.use((config: any) => {
      // Extract endpoint from URL
      const url = config.url || '';
      const endpoint = url.split('/').slice(-2).join('/');
      
      // Set optimized timeout
      config.timeout = getOptimizedTimeout(endpoint);
      
      return config;
    });
  }
}

export default {
  getOptimizedApiConfig,
  getOptimizedTimeout,
  getOptimizedRetryCount,
  applyApiPerformanceOptimizations
};
