/**
 * API Configuration
 * 
 * This file contains configuration settings for the API client.
 * It provides different configurations for development and production environments.
 */

// Define environment
const isProduction = import.meta.env.MODE === 'production';

// API URLs
const API_URLS = {
  development: 'http://localhost:5000/api/v1',
  staging: 'https://staging-api.example.com/api/v1',
  production: 'https://api.example.com/api/v1'
};

// Default headers
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// API configuration options
export const apiConfig = {
  baseUrl: isProduction ? API_URLS.production : API_URLS.development,
  headers: DEFAULT_HEADERS,
  timeout: 30000, // 30 seconds
  useMock: false, // Always use the real API, not mock data
  
  // CORS settings
  fetchOptions: {
    credentials: 'include',
    mode: 'cors'
  },
  
  // Module-specific endpoints
  endpoints: {
    shops: '/shops',
    products: '/products',
    customers: '/customers',
    orders: '/orders',
    inventory: '/inventory',
    staff: '/staff',
    auth: '/auth',
    roles: '/roles',
    'employment-types': '/employment-types'
  }
};

/**
 * Get the full API endpoint URL for a specific feature
 * 
 * @param feature - The feature endpoint key
 * @returns The complete API endpoint URL
 */
export const getApiEndpoint = (feature: keyof typeof apiConfig.endpoints): string => {
  if (!apiConfig.endpoints[feature]) {
    console.warn(`No endpoint defined for feature: ${feature}`);
    return apiConfig.baseUrl;
  }
  return `${apiConfig.baseUrl}${apiConfig.endpoints[feature]}`;
}; 