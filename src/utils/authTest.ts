/**
 * Authentication Testing Utility
 * 
 * This file provides functions to test authentication and token handling.
 */

import { api } from '@/lib/api';

/**
 * Test the current authentication state
 */
export const testAuthentication = async (): Promise<{
  success: boolean;
  message: string;
  authData?: any;
}> => {
  try {
    console.log('Testing authentication...');
    
    // Check if we have a token in localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found in localStorage.',
      };
    }
    
    // Check token format
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        success: false,
        message: 'Token is not in valid JWT format (should have 3 parts separated by dots).',
      };
    }
    
    // Try to decode the token
    try {
      // Get the payload part (second part of JWT)
      const payloadBase64 = parts[1];
      if (!payloadBase64) {
        return {
          success: false,
          message: 'Token payload section is missing',
        };
      }
      
      const payload = JSON.parse(atob(payloadBase64));
      
      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return {
          success: false,
          message: `Token is expired. Expired at: ${new Date(payload.exp * 1000).toLocaleString()}`,
          authData: payload,
        };
      }
      
      // Make a test API call to verify token works
      try {
        await api.get('/api/v1/auth/verify');
        return {
          success: true,
          message: 'Authentication successful. Token is valid.',
          authData: payload,
        };
      } catch (apiError) {
        // If the token verification endpoint doesn't exist, try a different endpoint
        try {
          // Try getting user profile or another protected endpoint
          await api.get('/api/v1/auth/me');
          return {
            success: true,
            message: 'Authentication successful. Token is valid.',
            authData: payload,
          };
        } catch (secondApiError) {
          // If both APIs fail, report the issue but still return token info
          return {
            success: false,
            message: `Token found but API verification failed: ${secondApiError instanceof Error ? secondApiError.message : 'Unknown error'}`,
            authData: payload,
          };
        }
      }
    } catch (decodeError) {
      return {
        success: false,
        message: `Failed to decode token: ${decodeError instanceof Error ? decodeError.message : 'Unknown error'}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Authentication test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Clear authentication and attempt to login again
 */
export const resetAuthentication = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Clear existing token
    localStorage.removeItem('authToken');
    console.log('Cleared existing authentication token');
    
    // Make a request that will trigger a new login
    await api.get('/api/v1/roles');
    
    // Check if we now have a token
    const token = localStorage.getItem('authToken');
    if (token) {
      return {
        success: true,
        message: 'Authentication reset successful. New token acquired.',
      };
    } else {
      return {
        success: false,
        message: 'Authentication reset failed. No new token was acquired.',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Authentication reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Export a simple function to run from the console for easy testing
 */
(window as any).testAuth = async () => {
  const result = await testAuthentication();
  console.log('Authentication test result:', result);
  return result;
};

(window as any).resetAuth = async () => {
  const result = await resetAuthentication();
  console.log('Authentication reset result:', result);
  return result;
}; 