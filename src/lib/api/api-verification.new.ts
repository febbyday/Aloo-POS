/**
 * API Verification Utility
 *
 * This file provides utilities to verify that real APIs are being used
 * and to check the status of API endpoints.
 */

import { apiClient } from './api-client';
import { apiConfig } from './config';
import { ApiStatus } from './api-health';
import { getApiUrl } from './enhanced-config';

// Interface for API check results
interface ApiCheckResult {
  endpoint: string;
  status: 'success' | 'error';
  statusCode?: number;
  message: string;
  responseData?: any;
  error?: any;
  timestamp: string;
}

/**
 * Verifies that the app is using real APIs for the loyalty program
 */
export async function verifyLoyaltyApiConnection(): Promise<void> {
  try {
    // Log the base URL and environment variables for debugging
    console.log('API Verification:', {
      baseUrl: import.meta.env.VITE_API_URL,
      useMock: import.meta.env.VITE_USE_MOCK_API,
      loyaltyEnabled: import.meta.env.VITE_LOYALTY_API_ENABLED,
      mode: import.meta.env.MODE,
      backendUrl: apiConfig.baseUrl,
    });

    // Check if backend is running by accessing a known endpoint
    try {
      console.log('Checking backend health via proxy at /health...');
      // Use the getApiUrl function from enhanced-config to get the correct URL
      const healthUrl = getApiUrl('health', 'CHECK');
      const healthCheck = await fetch(healthUrl);
      const healthData = await healthCheck.json();
      console.log('Backend health check via proxy:', {
        status: healthCheck.status,
        ok: healthCheck.ok,
        data: healthData
      });
    } catch (error) {
      console.error('Backend health check via proxy failed:', error instanceof Error ? error.message : String(error));
    }

    // Try direct backend connection
    try {
      console.log('Checking direct backend connection...');
      // Use the getApiUrl function from enhanced-config to get the correct URL
      const healthUrl = getApiUrl('health', 'CHECK');
      console.log(`Direct health check URL: ${healthUrl}`);

      const directCheck = await fetch(healthUrl, {
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

      const directData = await directCheck.json();
      console.log('Direct backend health check:', {
        status: directCheck.status,
        ok: directCheck.ok,
        data: directData
      });
    } catch (error) {
      console.error('Direct backend health check failed:', error instanceof Error ? error.message : String(error));
    }

    // Check if mock data is being used
    const usingMockData = shouldUseMockData();
    console.log(`Using mock data: ${usingMockData ? 'YES' : 'NO'}`);

    // If using mock data, explain why
    if (usingMockData) {
      console.log('Mock data is being used because:');
      if (import.meta.env.VITE_USE_MOCK_API === 'true') {
        console.log('- VITE_USE_MOCK_API is set to true');
      }

      // Check if backend is unreachable
      try {
        // Use the getApiUrl function from enhanced-config to get the correct URL
        const healthUrl = getApiUrl('health', 'CHECK');
        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors'
        });

        if (!response.ok) {
          console.log(`- Backend returned error status: ${response.status}`);
        }
      } catch (error) {
        console.log('- Backend is unreachable:', error instanceof Error ? error.message : String(error));
      }
    }

    // Provide troubleshooting information
    displayTroubleshootingInfo();

  } catch (error) {
    console.error('API verification failed:', error instanceof Error ? error.message : String(error));

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Unknown error type:', error);
    }
  }
}

/**
 * Checks if all loyalty API endpoints are accessible
 */
export async function checkLoyaltyApiEndpoints(): Promise<void> {
  try {
    console.log('Checking loyalty API endpoints...');

    // Define the endpoints to check
    const endpoints = [
      '/loyalty/programs',
      '/loyalty/members',
      '/loyalty/rewards',
      '/loyalty/transactions'
    ];

    // Check each endpoint
    for (const endpoint of endpoints) {
      try {
        const fullUrl = `${apiConfig.baseUrl}${apiConfig.apiPrefix}${endpoint}`;
        console.log(`Checking endpoint: ${fullUrl}`);

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });

        console.log(`Endpoint ${endpoint} status:`, {
          status: response.status,
          ok: response.ok
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Endpoint ${endpoint} data:`, data);
        } else {
          console.warn(`Endpoint ${endpoint} returned error status: ${response.status}`);  
        }
      } catch (error) {
        console.error(`Failed to check endpoint ${endpoint}:`, error instanceof Error ? error.message : String(error));
      }
    }
  } catch (error) {
    console.error('Failed to check loyalty API endpoints:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Displays troubleshooting information for API connection issues
 */
export function displayTroubleshootingInfo(): void {
  console.log('API Troubleshooting Information:');
  console.log('-------------------------------');

  // Environment information
  console.log('Environment:');
  console.log(`- Mode: ${import.meta.env.MODE}`);
  console.log(`- API URL: ${apiConfig.baseUrl}`);
  console.log(`- API Prefix: ${apiConfig.apiPrefix}`);
  console.log(`- Using Mock API: ${import.meta.env.VITE_USE_MOCK_API === 'true' ? 'Yes' : 'No'}`);

  // CORS information
  console.log('\nCORS Information:');
  console.log('- If you see CORS errors, ensure your backend has the correct CORS headers');
  console.log('- The backend should allow requests from your frontend origin');
  console.log(`- Current origin: ${window.location.origin}`);

  // Network information
  console.log('\nNetwork Information:');
  console.log('- Check if you can access the API directly in your browser');
  console.log(`- Try accessing: ${apiConfig.baseUrl}${apiConfig.apiPrefix}/health`);
  console.log('- Check your browser network tab for detailed error information');

  // Common solutions
  console.log('\nCommon Solutions:');
  console.log('1. Ensure the backend server is running');
  console.log('2. Check that the API URL is correct in your environment variables');       
  console.log('3. Verify network connectivity between frontend and backend');
  console.log('4. Check for CORS configuration issues on the backend');
  console.log('5. Look for authentication/authorization errors in the network tab');       
  console.log('-------------------------------');
}

/**
 * Initializes the API verification process
 */
export function initApiVerification(): void {
  console.log('Initializing API verification...');

  // Check if verification is enabled
  if (import.meta.env.VITE_ENABLE_API_VERIFICATION === 'false') {
    console.log('API verification is disabled by environment variable');
    return;
  }

  // Check if we should use mock data
  const usingMockData = shouldUseMockData();
  console.log(`Using mock data: ${usingMockData ? 'YES' : 'NO'}`);

  // If using real API, verify connection
  if (!usingMockData) {
    console.log('Using real API, verifying connection...');
    setTimeout(() => {
      verifyLoyaltyApiConnection().catch(error => {
        console.error('API verification failed:', error instanceof Error ? error.message : String(error));
      });
    }, 2000); // Delay to allow app to initialize
  } else {
    console.log('Using mock API, skipping verification');
  }
}

/**
 * Checks if the application should use mock data instead of real API
 * @returns True if mock data should be used, false otherwise
 */
export function shouldUseMockData(): boolean {
  // Check environment variable
  if (import.meta.env.VITE_USE_MOCK_API === 'true') {
    return true;
  }

  // Add additional checks here if needed
  // For example, checking if API is unreachable

  return false;
}

/**
 * Gets a human-readable API status text
 * @param status The API status
 * @returns Human-readable status text
 */
export function getApiStatusText(status: ApiStatus): string {
  switch (status) {
    case ApiStatus.AVAILABLE:
      return 'Available';
    case ApiStatus.UNAVAILABLE:
      return 'Unavailable';
    case ApiStatus.UNKNOWN:
      return 'Unknown';
    default:
      return 'Unknown';
  }
}

// Automatically run the verification when this module is imported
// unless specifically disabled by environment variable
if (import.meta.env.VITE_ENABLE_API_VERIFICATION !== 'false') {
  initApiVerification();
}
