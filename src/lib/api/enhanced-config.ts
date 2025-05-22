/**
 * Enhanced API Configuration
 *
 * This module enhances the existing API configuration with the centralized
 * endpoint registry to provide a unified interface for API endpoint access.
 *
 * IMPORTANT: This is the recommended way to access API endpoints throughout the application.
 * It provides type-safe access to endpoints and handles parameter substitution.
 */

// Import constants directly to avoid circular dependencies
import {
  API_URL,
  API_VERSION,
  API_PREFIX,
  FULL_API_URL
} from './api-constants';
import { apiConfig } from './config';
import { endpointRegistry, getModuleEndpoint } from './endpoint-registry';

/**
 * Enhanced API configuration with integrated endpoint registry
 */
export const enhancedApiConfig = {
  ...apiConfig,

  // Include the full endpoint registry
  endpointRegistry,

  /**
   * Get a fully qualified URL for an API endpoint
   *
   * @param module - The module name (e.g., 'users', 'products')
   * @param endpoint - The endpoint key (e.g., 'LIST', 'DETAIL')
   * @param params - Optional parameter replacements (e.g., { id: '123' })
   * @returns The complete API URL
   */
  getEndpointUrl(module: string, endpoint: string, params?: Record<string, string>): string {
    const path = getModuleEndpoint(module, endpoint);

    if (!path) {
      console.warn(`Endpoint not found: ${module}.${endpoint}`);
      return `${apiConfig.baseUrl}${apiConfig.apiPrefix}/${module}`;
    }

    // Replace any path parameters
    let processedPath = path;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        processedPath = processedPath.replace(`:${key}`, encodeURIComponent(value));
      });
    }

    // Construct the full URL
    return `${apiConfig.baseUrl}${apiConfig.apiPrefix}${processedPath}`;
  },

  /**
   * Get a relative API path for an endpoint
   *
   * @param module - The module name
   * @param endpoint - The endpoint key
   * @param params - Optional parameter replacements
   * @returns The relative API path
   */
  getEndpointPath(module: string, endpoint: string, params?: Record<string, string>): string {
    const path = getModuleEndpoint(module, endpoint);

    if (!path) {
      console.warn(`Endpoint not found: ${module}.${endpoint}`);
      return `/${module}`;
    }

    // Replace any path parameters
    let processedPath = path;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        processedPath = processedPath.replace(`:${key}`, encodeURIComponent(value));
      });
    }

    return processedPath;
  },

  /**
   * Check if an endpoint requires authentication
   *
   * @param module - The module name
   * @param endpoint - The endpoint key
   * @returns True if the endpoint requires authentication
   */
  requiresAuth(module: string, endpoint: string): boolean {
    if (endpointRegistry[module]?.meta?.[endpoint]) {
      return !!endpointRegistry[module].meta[endpoint].requiresAuth;
    }
    return false;
  },

  /**
   * Check if an endpoint is cacheable
   *
   * @param module - The module name
   * @param endpoint - The endpoint key
   * @returns True if the endpoint is cacheable
   */
  isCacheable(module: string, endpoint: string): boolean {
    if (endpointRegistry[module]?.meta?.[endpoint]) {
      return !!endpointRegistry[module].meta[endpoint].cacheable;
    }
    return false;
  }
};

/**
 * Export a convenient function to get relative API paths
 * This is the preferred method for API calls using the API client
 *
 * @param module - The module name
 * @param endpoint - The endpoint key
 * @param params - Optional parameter replacements
 * @returns The relative API path
 */
export function getApiPath(
  module: string,
  endpoint: string,
  params?: Record<string, string>
): string {
  return enhancedApiConfig.getEndpointPath(module, endpoint, params);
}

/**
 * Export a convenient function to get full API URLs
 * Useful for direct fetch calls or external integrations
 *
 * @param module - The module name
 * @param endpoint - The endpoint key
 * @param params - Optional parameter replacements
 * @returns The complete API URL
 */
export function getApiUrl(
  module: string,
  endpoint: string,
  params?: Record<string, string>
): string {
  return enhancedApiConfig.getEndpointUrl(module, endpoint, params);
}

/**
 * Get the full endpoint URL from a combined module/endpoint string
 * This is used by the enhanced API client
 *
 * @param endpointKey - The combined module/endpoint key (e.g., 'products/LIST')
 * @param params - Optional parameter replacements
 * @returns The complete API URL
 */
export function getFullEndpointUrl(
  endpointKey: string,
  params?: Record<string, string>
): string {
  // Split the endpoint key into module and endpoint
  const [module, endpoint] = endpointKey.split('/');

  if (!module || !endpoint) {
    console.warn(`Invalid endpoint key: ${endpointKey}. Expected format: 'module/endpoint'`);
    return `${apiConfig.baseUrl}${apiConfig.apiPrefix}/${endpointKey}`;
  }

  return getApiUrl(module, endpoint, params);
}
