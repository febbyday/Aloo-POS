/**
 * API Connection Test
 *
 * This file provides utilities to test the connection to the shops API
 * and diagnose any connection issues.
 * Uses the enhanced API configuration for consistent endpoint access.
 */

import { getApiUrl } from '@/lib/api/enhanced-config';
import { SHOP_ENDPOINTS } from '@/lib/api/endpoint-registry';

/**
 * Test the connection to the shops API
 */
export async function testShopsApiConnection() {
  const apiUrl = getApiUrl('shops', 'LIST');
  console.log('Testing connection to shops API at:', apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Add cache busting to prevent cached responses
      cache: 'no-cache',
      // Add credentials to include cookies if needed
      credentials: 'include'
    });

    console.log('API response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('API response data:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.error('API connection error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Check if the API server is running
 */
export async function isApiServerRunning() {
  try {
    const healthUrl = getApiUrl('health', 'CHECK');
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache'
    });

    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// Expose the test function to the window object for debugging
(window as any).testShopsApi = testShopsApiConnection;