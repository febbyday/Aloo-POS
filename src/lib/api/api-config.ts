/**
 * API Configuration
 * 
 * This file contains configuration for the API client including:
 * - Base URL configuration
 * - Default headers and request options
 * - Authentication token management
 */

import { ApiClient, ApiClientConfig } from './api-client';

// Environment detection
const isDev = import.meta.env.MODE === 'development';
const isTest = import.meta.env.MODE === 'test';

// Use environment variables if available, otherwise use defaults
const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
const backendPort = import.meta.env.VITE_BACKEND_PORT || '5000';

// API Configuration
export const API_CONFIG = {
  // In development, always use relative path for proper proxy forwarding
  BASE_URL: apiUrl,
  
  TIMEOUT: 30000,
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Mock delay for development
  MOCK_DELAY: 300,

  // Backend server direct URL (for diagnostic purposes)
  BACKEND_URL: `http://localhost:${backendPort}`,
};

console.log('API Client Configuration:', {
  baseUrl: API_CONFIG.BASE_URL,
  backendUrl: API_CONFIG.BACKEND_URL,
  message: 'Using real API data'
});

// Create and configure API client
export const apiClient = new ApiClient({
  baseUrl: API_CONFIG.BASE_URL,
  headers: API_CONFIG.DEFAULT_HEADERS,
  timeout: API_CONFIG.TIMEOUT,
  useMock: false,
  mockDelay: API_CONFIG.MOCK_DELAY,
});

/**
 * Initialize API client with authentication token
 * 
 * @param token - JWT authentication token
 */
export function initializeApiClient(token?: string): void {
  if (token) {
    apiClient.setAuthToken(token);
  } else {
    // Try to get token from local storage
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      apiClient.setAuthToken(storedToken);
    }
  }
}

/**
 * Clear authentication from API client
 */
export function clearApiAuthentication(): void {
  apiClient.clearAuthToken();
  localStorage.removeItem('auth_token');
}

/**
 * Toggle mock mode for API requests
 * @param useMock - Whether to use mock data
 */
export function setApiMockMode(useMock: boolean): void {
  if (apiClient) {
    apiClient.updateConfig({ useMock });
    console.log(`API Client: Mock mode ${useMock ? 'enabled' : 'disabled'}`);
  } else {
    console.warn('API client not initialized');
  }
}

/**
 * Get current API configuration
 */
export function getApiConfig(): ApiClientConfig {
  return {
    baseUrl: API_CONFIG.BASE_URL,
    headers: API_CONFIG.DEFAULT_HEADERS,
    timeout: API_CONFIG.TIMEOUT,
    useMock: false,
    mockDelay: API_CONFIG.MOCK_DELAY
  };
}

/**
 * Update API configuration
 * 
 * @param options - New API client options
 */
export function updateApiConfig(options: Partial<ApiClientConfig>): void {
  try {
    if (typeof apiClient.updateConfig === 'function') {
      apiClient.updateConfig(options);
    } else if (typeof apiClient.setConfig === 'function') {
      apiClient.setConfig(options);
    } else {
      console.warn('API client configuration update method not available');
    }
  } catch (error) {
    console.error('Error updating API configuration:', error);
  }
}

// Initialize API client on import unless specifically disabled
if (!isTest && import.meta.env.VITE_DISABLE_AUTO_API_INIT !== 'true') {
  initializeApiClient();
}

export default apiClient;
