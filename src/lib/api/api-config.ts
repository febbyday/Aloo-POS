/**
 * API Configuration
 *
 * This file contains configuration for the API client including:
 * - Base URL configuration
 * - Default headers and request options
 *
 * IMPORTANT: This file imports from the centralized config.ts file
 * to ensure consistency across the application.
 */

import { ApiClient, apiClient, ApiClientConfig } from './api-client';
import { apiConfig, API_CONSTANTS } from './config';
import { getApiUrl } from './enhanced-config';

// API Configuration - using values from centralized config
export const API_CONFIG = {
  // Base URL for API requests (without version)
  BASE_URL: API_CONSTANTS.URL,

  // API version prefix
  API_VERSION: API_CONSTANTS.VERSION,

  // Full API URL (with version)
  FULL_API_URL: API_CONSTANTS.FULL_URL,

  TIMEOUT: API_CONSTANTS.TIMEOUT,

  DEFAULT_HEADERS: apiConfig.headers,

  // Mock delay for development
  MOCK_DELAY: 300,
};

console.log('API Client Configuration:', {
  baseUrl: API_CONFIG.BASE_URL,
  apiVersion: API_CONFIG.API_VERSION,
  fullApiUrl: API_CONFIG.FULL_API_URL,
  message: 'Using real API data'
});

// Configure the shared apiClient instance with our config settings
apiClient.setConfig({
  baseUrl: API_CONFIG.FULL_API_URL,
  headers: API_CONFIG.DEFAULT_HEADERS,
  timeout: API_CONFIG.TIMEOUT,
  apiPrefix: '',  // We already included the prefix in FULL_API_URL
});

/**
 * Get current API configuration
 */
export function getApiConfig(): Partial<ApiClientConfig> {
  return {
    baseUrl: API_CONFIG.BASE_URL,
    headers: API_CONFIG.DEFAULT_HEADERS,
    timeout: API_CONFIG.TIMEOUT,
    useMock: false
  };
}

/**
 * Get API endpoint URL
 * @param endpoint Endpoint name
 * @returns Full URL for the endpoint
 * @deprecated CRITICAL: This function is deprecated and will be removed in a future release.
 * Use getApiUrl or getApiPath from enhanced-config instead.
 * Example: Replace getApiEndpoint('shops') with getApiUrl('shops', 'LIST')
 */
export function getApiEndpoint(endpoint: string): string {
  // Get the stack trace to identify where this function is being called from
  const stackTrace = new Error().stack || '';
  const callerInfo = stackTrace.split('\n')[2] || '';

  // Log a more severe warning with caller information
  console.error(
    `DEPRECATED API USAGE: getApiEndpoint('${endpoint}') in api-config.ts is deprecated and will be removed soon.\n` +
    `Called from: ${callerInfo.trim()}\n` +
    `Please migrate to the enhanced API client and endpoint registry.\n` +
    `Use getApiUrl or getApiPath from @/lib/api/enhanced-config instead.`
  );

  // Try to use the enhanced config
  try {
    // Try to map common endpoints
    if (endpoint.includes('/')) {
      // This is likely a path with parameters, just use as-is
      return `${API_CONFIG.FULL_API_URL}/${endpoint}`;
    }

    // Try to map to a module/endpoint pair
    const moduleName = endpoint.split('-')[0] || endpoint;
    return getApiUrl(moduleName, 'LIST');
  } catch (e) {
    // Fall back to the original implementation
    return `${API_CONFIG.FULL_API_URL}/${endpoint}`;
  }
}

// Re-export the apiClient instance and ApiClient class for use throughout the application
export { apiClient, ApiClient };
export default apiClient;
