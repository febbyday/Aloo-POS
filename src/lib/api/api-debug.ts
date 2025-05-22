/**
 * API Debug Utilities
 * 
 * This file contains utility functions for debugging API requests and connections.
 */

import { API_CONSTANTS } from './config';
import { getApiUrl } from './enhanced-config';

/**
 * Log API configuration details
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
    const healthUrl = getApiUrl('health', 'CHECK');
    console.log('Testing API connectivity at:', healthUrl);
    
    const response = await fetch(healthUrl);
    
    if (response.ok) {
      console.log('✅ API connection successful!', {
        status: response.status,
        statusText: response.statusText
      });
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
 * Test direct API connectivity by making a request directly to the backend server
 */
export async function testDirectApiConnectivity(): Promise<boolean> {
  try {
    // Use a direct URL to the backend server
    const directUrl = 'http://localhost:5000/api/v1/health';
    console.log('Testing direct API connectivity at:', directUrl);
    
    const response = await fetch(directUrl);
    
    if (response.ok) {
      console.log('✅ Direct API connection successful!', {
        status: response.status,
        statusText: response.statusText
      });
      return true;
    } else {
      console.error('❌ Direct API connection failed:', {
        status: response.status,
        statusText: response.statusText
      });
      return false;
    }
  } catch (error) {
    console.error('❌ Direct API connection error:', error);
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
    
    // Test API connectivity
    testApiConnectivity().then(success => {
      if (!success) {
        console.warn(
          '⚠️ API connection test failed. Make sure the backend server is running on port 5000.\n' +
          '⚠️ The Vite dev server should be configured to proxy /api requests to the backend.'
        );
        
        // If proxy connection fails, try direct connection
        testDirectApiConnectivity().then(directSuccess => {
          if (directSuccess) {
            console.warn(
              '⚠️ Direct API connection succeeded but proxy connection failed.\n' +
              '⚠️ This indicates a problem with the Vite proxy configuration.'
            );
          } else {
            console.error(
              '❌ Both proxy and direct API connections failed.\n' +
              '❌ Make sure the backend server is running on port 5000.'
            );
          }
        });
      }
    });
  }
}
