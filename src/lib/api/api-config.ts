/**
 * API Configuration
 * 
 * This file contains configuration for the API client including:
 * - Base URL configuration
 * - Default headers and request options
 */

import { ApiClient, apiClient, ApiClientConfig } from './api-client';

// Environment detection
const isDev = import.meta.env.MODE === 'development';
const isTest = import.meta.env.MODE === 'test';

// Use environment variables if available, otherwise use defaults
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const apiVersion = '/api/v1';

// API Configuration
export const API_CONFIG = {
  // Base URL for API requests (without version)
  BASE_URL: apiUrl,
  
  // API version prefix
  API_VERSION: apiVersion,
  
  // Full API URL (with version)
  FULL_API_URL: `${apiUrl}${apiVersion}`,
  
  TIMEOUT: 30000,
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
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
 */
export function getApiEndpoint(endpoint: string): string {
  return `${API_CONFIG.FULL_API_URL}/${endpoint}`;
}

// Re-export the apiClient instance and ApiClient class for use throughout the application
export { apiClient, ApiClient };
export default apiClient;
