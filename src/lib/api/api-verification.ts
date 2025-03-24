/**
 * API Verification Utility
 * 
 * This file provides utilities to verify that real APIs are being used
 * and to check the status of API endpoints.
 */

import { apiClient, API_CONFIG, getApiConfig } from './api-config';

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
export async function verifyLoyaltyApiConnection() {
  try {
    // Log the base URL and environment variables for debugging
    console.log('API Verification:', {
      baseUrl: import.meta.env.VITE_API_URL,
      useMock: import.meta.env.VITE_USE_MOCK_API,
      loyaltyEnabled: import.meta.env.VITE_LOYALTY_API_ENABLED,
      mode: import.meta.env.MODE,
      backendUrl: API_CONFIG.BACKEND_URL,
    });

    // Check if backend is running by accessing a known endpoint
    try {
      console.log('Checking backend health via proxy at /api/v1/health...');
      const healthCheck = await fetch('/api/v1/health');
      const healthData = await healthCheck.json();
      console.log('Backend health check via proxy:', {
        status: healthCheck.status,
        ok: healthCheck.ok,
        data: healthData
      });
    } catch (error) {
      console.error('Backend health check via proxy failed:', error);
    }

    // Try direct backend connection
    try {
      console.log(`Checking direct backend connection at ${API_CONFIG.BACKEND_URL}/api/v1/health...`);
      const directCheck = await fetch(`${API_CONFIG.BACKEND_URL}/api/v1/health`);
      const directData = await directCheck.json();
      console.log('Direct backend check:', {
        status: directCheck.status,
        ok: directCheck.ok,
        data: directData
      });
      
      if (!directCheck.ok) {
        console.error('Direct backend connection failed with status:', directCheck.status);
      } else {
        console.log('✅ Direct backend connection successful');
      }
    } catch (error) {
      console.error('Direct backend connection failed:', error);
      console.log('This may indicate the backend server is not running');
    }
    
    // Check if mock mode is disabled
    console.log('Checking API config...');
    try {
      const configResult = await apiClient.get('/api/v1/config');
      const isUsingMock = configResult.data?.useMock || false;
      
      console.log('API config check:', {
        mockMode: isUsingMock,
        data: configResult.data
      });
      
      if (isUsingMock) {
        console.warn('⚠️ Application is currently using mock data for APIs');
        return false;
      }
    } catch (error) {
      console.error('API config check failed:', error);
      console.log('This may indicate an issue with the API server');
      
      // Try direct connection to config endpoint
      try {
        console.log(`Trying direct connection to config endpoint at ${API_CONFIG.BACKEND_URL}/api/v1/config...`);
        const directConfigCheck = await fetch(`${API_CONFIG.BACKEND_URL}/api/v1/config`);
        const directConfigData = await directConfigCheck.json();
        console.log('Direct config check:', {
          status: directConfigCheck.status,
          ok: directConfigCheck.ok,
          data: directConfigData
        });
        
        if (directConfigCheck.ok) {
          console.log('✅ Direct config connection successful - proxy issue suspected');
        }
      } catch (configError) {
        console.error('Direct config connection also failed:', configError);
      }
    }
    
    // Try to access a loyalty API endpoint
    try {
      console.log('Checking loyalty tiers endpoint via proxy...');
      const tiersResult = await apiClient.get('/api/v1/loyalty/tiers');
      
      console.log('✅ Successfully connected to loyalty API via proxy', {
        endpoint: '/api/v1/loyalty/tiers',
        status: tiersResult.status,
        dataCount: Array.isArray(tiersResult.data) ? tiersResult.data.length : 'not an array',
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to access loyalty tiers endpoint via proxy:', 
        error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : error
      );
      
      // Try direct connection to tiers endpoint
      try {
        console.log(`Trying direct connection to tiers endpoint at ${API_CONFIG.BACKEND_URL}/api/v1/loyalty/tiers...`);
        const directTiersCheck = await fetch(`${API_CONFIG.BACKEND_URL}/api/v1/loyalty/tiers`);
        const directTiersData = await directTiersCheck.json();
        console.log('Direct tiers check:', {
          status: directTiersCheck.status,
          ok: directTiersCheck.ok,
          data: directTiersData
        });
        
        if (directTiersCheck.ok) {
          console.log('✅ Direct tiers connection successful - proxy issue suspected');
          return true;
        }
      } catch (tiersError) {
        console.error('Direct tiers connection also failed:', tiersError);
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to verify loyalty API connection', error);
    return false;
  }
}

/**
 * Checks if all loyalty API endpoints are accessible
 */
export async function checkLoyaltyApiEndpoints() {
  const endpoints = [
    '/api/v1/loyalty/tiers',
    '/api/v1/loyalty/rewards',
    '/api/v1/loyalty/events',
    '/api/v1/loyalty/settings',
    '/api/v1/loyalty/transactions'
  ];
  
  const results: Record<string, { success: boolean; error?: string; status?: number; data?: any }> = {};
  
  console.log('Checking loyalty API endpoints via proxy...');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint via proxy: ${endpoint}...`);
      const response = await fetch(endpoint);
      let responseData = null;
      try {
        responseData = await response.json();
      } catch (e) {
        console.warn(`Could not parse JSON from ${endpoint}`);
      }
      
      results[endpoint] = { 
        success: response.ok, 
        status: response.status,
        data: responseData
      };
      console.log(`Endpoint ${endpoint}: ${response.ok ? '✅' : '❌'} (${response.status})`);
      
      // If proxy fails, try direct connection
      if (!response.ok) {
        try {
          console.log(`Testing endpoint directly: ${API_CONFIG.BACKEND_URL}${endpoint}...`);
          const directResponse = await fetch(`${API_CONFIG.BACKEND_URL}${endpoint}`);
          let directData = null;
          try {
            directData = await directResponse.json();
          } catch (e) {
            console.warn(`Could not parse JSON from direct ${endpoint}`);
          }
          
          console.log(`Direct endpoint ${endpoint}: ${directResponse.ok ? '✅' : '❌'} (${directResponse.status})`);
          
          if (directResponse.ok) {
            console.log('Direct connection succeeded where proxy failed - proxy issue confirmed');
          }
        } catch (directError) {
          console.error(`Direct connection to ${endpoint} also failed:`, directError);
        }
      }
    } catch (error) {
      results[endpoint] = { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
      console.error(`Endpoint ${endpoint}: ❌ (Error: ${error instanceof Error ? error.message : String(error)})`);
    }
  }
  
  const allSuccessful = Object.values(results).every(r => r.success);
  
  console.log(`Loyalty API Endpoints Check: ${allSuccessful ? '✅ All OK' : '❌ Some Failed'}`, results);
  
  return { 
    success: allSuccessful, 
    results 
  };
}

/**
 * Troubleshooting information to help diagnose API connection issues
 */
export function displayTroubleshootingInfo() {
  console.log(`
    ========== API Troubleshooting Guide ==========
    
    Current Configuration:
    - API URL: ${import.meta.env.VITE_API_URL || '/api/v1'}
    - Mock API: ${import.meta.env.VITE_USE_MOCK_API || 'false'}
    - Backend Port: ${import.meta.env.VITE_BACKEND_PORT || '5000'}
    - Environment: ${import.meta.env.MODE}
    - Backend URL: ${API_CONFIG.BACKEND_URL}
    
    Common Issues:
    1. Backend server not running - Start with: cd backend && npm run dev
    2. Backend running on wrong port - Check PORT in backend/.env
    3. Database connection issues - Check DATABASE_URL in .env
    4. CORS issues - Backend CORS settings may need updating
    5. Proxy misconfiguration - Check vite.config.ts proxy settings
    
    Debug Steps:
    - Check browser network tab for detailed error responses
    - Verify the backend is running (localhost:${import.meta.env.VITE_BACKEND_PORT || '5000'}/api/v1/health)
    - Check console for database connection errors
    - Try direct API access: ${API_CONFIG.BACKEND_URL}/api/v1/health
    
    Fixing Proxy Issues:
    - Make sure backend is running on port ${import.meta.env.VITE_BACKEND_PORT || '5000'}
    - Restart both frontend and backend servers
    - Clear browser cache and refresh
    - Check for conflicting port usage with: netstat -ano | findstr :5000
    
    =============================================
  `);
}

/**
 * Initializes the verification process on application startup
 */
export function initApiVerification() {
  // Only run in non-production environments
  if (import.meta.env.MODE !== 'production') {
    console.log('Starting API verification process...');
    
    // Display troubleshooting info right away
    displayTroubleshootingInfo();
    
    // Wait for the application to finish loading
    setTimeout(async () => {
      try {
        const connected = await verifyLoyaltyApiConnection();
        await checkLoyaltyApiEndpoints();
        
        // If connection failed, show troubleshooting info again
        if (!connected) {
          console.log('API connection issues detected. Showing troubleshooting information:');
          displayTroubleshootingInfo();
        }
      } catch (error) {
        console.error('API verification process failed:', error);
        console.log('Showing troubleshooting information due to verification failure:');
        displayTroubleshootingInfo();
      }
    }, 2000);
  }
}

// Automatically run the verification when this module is imported
// unless specifically disabled by environment variable
if (import.meta.env.VITE_ENABLE_API_VERIFICATION !== 'false') {
  initApiVerification();
}

/**
 * Detailed API verification to diagnose connection issues
 */
export async function verifyApiConnection(): Promise<void> {
  console.group('🔍 API Connection Verification');
  console.log('Starting API verification...');
  
  // Get the current API configuration
  const apiConfig = getApiConfig();
  
  // Log environment configuration
  console.log('Environment Configuration:');
  console.log(`- Base URL: ${API_CONFIG.BASE_URL}`);
  console.log(`- Using Mock API: ${apiConfig.useMock ? 'Yes' : 'No'}`);
  console.log(`- API Version: ${import.meta.env.VITE_API_VERSION || 'v1'}`);
  console.log(`- Loyalty API Enabled: ${import.meta.env.VITE_LOYALTY_API_ENABLED === 'true' ? 'Yes' : 'No'}`);
  
  // Check if we're in dev mode running on the same domain
  const isSameOrigin = window.location.origin === new URL(API_CONFIG.BASE_URL, window.location.origin).origin;
  console.log(`- Same Origin: ${isSameOrigin ? 'Yes (proxy should be working)' : 'No (ensure CORS is enabled)'}`);
  
  // Verify basic connectivity
  try {
    await checkHealthEndpoint();
    
    // Only check loyalty endpoints if loyalty is enabled
    if (import.meta.env.VITE_LOYALTY_API_ENABLED === 'true') {
      await checkLoyaltyEndpoints();
    } else {
      console.log('Loyalty API is disabled. Skipping loyalty endpoint checks.');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API verification failed with an unexpected error:', errorMessage);
  }
  
  console.log('API verification complete.');
  console.log('If you\'re seeing 404 errors, ensure your backend server is running and routes are configured correctly.');
  
  // Output troubleshooting guide
  outputTroubleshootingGuide();
  
  console.groupEnd();
}

/**
 * Checks the health endpoint to verify basic API connectivity
 */
async function checkHealthEndpoint(): Promise<void> {
  console.group('Health Check');
  
  try {
    const healthResult = await checkEndpoint('/health');
    if (healthResult.status === 'success') {
      console.log('✅ Backend server is responding');
    } else {
      console.error('❌ Backend server health check failed');
      console.log('This indicates your backend might not be running or the health endpoint is not configured.');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to perform health check:', errorMessage);
  }
  
  console.groupEnd();
}

/**
 * Checks all loyalty endpoints to verify they are working
 */
async function checkLoyaltyEndpoints(): Promise<void> {
  console.group('Loyalty API Endpoints');
  
  const endpoints = [
    '/loyalty/settings',
    '/loyalty/tiers',
    '/loyalty/rewards',
    '/loyalty/events',
    '/loyalty/transactions'
  ];
  
  const results: ApiCheckResult[] = [];
  
  for (const endpoint of endpoints) {
    try {
      const result = await checkEndpoint(endpoint);
      results.push(result);
      
      if (result.status === 'success') {
        console.log(`✅ ${endpoint}: Success (${result.statusCode})`);
      } else {
        console.error(`❌ ${endpoint}: Failed (${result.statusCode})`);
        console.log(`   Error: ${result.message}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ ${endpoint}: Exception`, errorMessage);
    }
  }
  
  // Log summary
  const successCount = results.filter(r => r.status === 'success').length;
  console.log(`Summary: ${successCount}/${endpoints.length} endpoints working`);
  
  console.groupEnd();
}

/**
 * Checks a specific API endpoint and returns detailed results
 */
async function checkEndpoint(endpoint: string): Promise<ApiCheckResult> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log(`Checking endpoint: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Include credentials if needed for auth
      credentials: 'include'
    });
    const endTime = Date.now();
    
    let responseData: any = null;
    let message = `Request completed in ${endTime - startTime}ms`;
    
    // Try to parse response as JSON
    try {
      if (response.headers.get('content-type')?.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        message += `. Response is not JSON. First 100 chars: ${text.substring(0, 100)}`;
      }
    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      message += `. Failed to parse response: ${errorMessage}`;
    }
    
    return {
      endpoint,
      status: response.ok ? 'success' : 'error',
      statusCode: response.status,
      message,
      responseData,
      timestamp: new Date().toISOString()
    };
  } catch (error: unknown) {
    return {
      endpoint,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      error,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Outputs a troubleshooting guide for common API connection issues
 */
function outputTroubleshootingGuide() {
  console.group('🔧 Troubleshooting Guide');
  
  console.log('If you\'re experiencing API connection issues, check the following:');
  
  console.log('1. Backend Server:');
  console.log('   - Is your backend server running? (npm run dev in the backend directory)');
  console.log('   - Is it running on the correct port (default: 5000)?');
  
  console.log('2. Proxy Configuration:');
  console.log('   - Check your vite.config.ts file for the correct proxy settings');
  console.log('   - Ensure /api/v1 is proxied to http://localhost:5000');
  
  console.log('3. API Routes:');
  console.log('   - Verify that all routes are properly defined in your backend');
  console.log('   - Check backend/src/routes/ directory for missing route definitions');
  
  console.log('4. Environment Variables:');
  console.log('   - Ensure .env file has VITE_API_URL set correctly (typically "/api/v1")');
  console.log('   - Check VITE_USE_MOCK_API is set to "false" if you want to use real API');
  
  console.log('5. Network Issues:');
  console.log('   - Check browser console for CORS errors');
  console.log('   - Ensure your backend CORS configuration allows requests from your frontend');
  
  console.groupEnd();
}

// Auto-run verification when this module is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment, not during SSR
  setTimeout(() => {
    verifyApiConnection().catch(err => {
      console.error('API verification failed to run:', err);
    });
  }, 2000); // Delay to ensure app is fully loaded
} 