/**
 * API Debug Utilities
 * 
 * This file contains utility functions for debugging API requests.
 */

import { API_CONSTANTS } from './config';

/**
 * Log API configuration details to help debug API connection issues
 */
export function logApiConfiguration(): void {
  console.log('API Configuration:', {
    isDevelopment: import.meta.env.MODE === 'development',
    baseUrl: API_CONSTANTS.URL,
    apiVersion: API_CONSTANTS.VERSION,
    apiPrefix: API_CONSTANTS.PREFIX,
    fullApiUrl: API_CONSTANTS.FULL_URL,
    viteApiUrl: import.meta.env.VITE_API_URL,
    mockDisabled: import.meta.env.VITE_DISABLE_MOCK === 'true',
    proxyEnabled: true,
    message: 'API requests in development should go through the Vite proxy to port 5000'
  });
}

/**
 * Test API connectivity by making a simple request to the health endpoint
 */
export async function testApiConnectivity(): Promise<boolean> {
  try {
    // Use the health endpoint to test connectivity
    const response = await fetch('/api/v1/health');
    
    if (response.ok) {
      console.log('✅ API connection successful!');
      return true;
    } else {
      console.error('❌ API connection failed:', {
        status: response.status,
        statusText: response.statusText
      });
      return false;
    }
  } catch (error) {
    console.error('❌ API connection error:', error);
    return false;
  }
}

/**
 * Initialize API debugging
 * This function should be called early in the application lifecycle
 */
export function initApiDebugging(): void {
  if (import.meta.env.MODE === 'development') {
    logApiConfiguration();
    testApiConnectivity().then(success => {
      if (!success) {
        console.warn(
          '⚠️ API connection test failed. Make sure the backend server is running on port 5000.\n' +
          '⚠️ The Vite dev server should be configured to proxy /api requests to the backend.'
        );
      }
    });
  }
}
