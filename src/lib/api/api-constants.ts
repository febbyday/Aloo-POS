/**
 * API Constants
 *
 * This file is the single source of truth for API configuration throughout the application.
 * It provides centralized access to API URLs, timeouts, and other configuration settings.
 *
 * IMPORTANT: All API-related code should import from this file to ensure consistency.
 */

// Environment detection
export const isDevelopment = import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.MODE === 'production';
export const isTest = import.meta.env.MODE === 'test';

// Import environment validator
import { validateEnv } from './env-validator';

// Run validation
validateEnv();

// API URL Configuration
// In development, use relative URLs to leverage Vite's proxy
// In production, use the direct backend URL from environment variables
export const API_URL = isDevelopment
  ? '' // Empty string for relative URLs in development (uses Vite proxy)
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
console.log('[API] Using API URL:', API_URL || '(relative URLs via proxy)');

/**
 * Check API connectivity in a safe manner that won't crash the application
 * Important: This is deliberately wrapped in a setTimeout to ensure it doesn't
 * block the main application load or cause crashes during initial rendering
 */
export const checkApiConnectivity = () => {
  // Delay the check slightly to avoid interfering with app initialization
  setTimeout(() => {
    try {
      // Try a more reliable endpoint - base API path instead of health endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

      // In development, use relative URLs to leverage Vite's proxy
      const apiPath = isDevelopment ? '/api/v1' : `${API_URL}/api/v1`;
      const rootPath = isDevelopment ? '/' : API_URL;

      console.log(`[API] Checking API connectivity at ${apiPath}...`);

      Promise.race([
        fetch(apiPath, {
          method: 'GET',
          signal: controller.signal,
          credentials: 'include'
        }),
        // Fallback to root URL if API path fails
        fetch(rootPath, {
          method: 'GET',
          signal: controller.signal,
          credentials: 'include'
        })
      ])
      .then(response => {
        clearTimeout(timeoutId);
        console.log(`[API] Server is RUNNING. Status: ${response.status}`);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.warn(`[API] Connection attempt timed out after 5 seconds`);
        } else {
          console.warn(`[API] CONNECTIVITY NOTICE: API server may not be running or reachable.`);
          console.warn('[API] This is not fatal - the app will continue in limited functionality mode.');
          console.debug('[API] Error details:', error);
        }
      });
    } catch (e) {
      // Catch any unexpected errors to ensure they don't crash the app
      console.warn('[API] Error checking API connectivity, continuing without API health info', e);
    }
  }, 1000); // 1-second delay
};

// Don't immediately execute this on module import - it will be called when needed
// This prevents application crashes during startup
export const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;
export const FULL_API_URL = `${API_URL}${API_PREFIX}`;

// For direct API access (bypassing the proxy) - useful for debugging
export const DIRECT_API_URL = 'http://localhost:5000';
export const DIRECT_FULL_API_URL = `${DIRECT_API_URL}${API_PREFIX}`;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Request configuration
export const DEFAULT_TIMEOUT = 20000; // 20 seconds (increased from 10 seconds)
export const SETTINGS_TIMEOUT = 5000; // 5 seconds for settings requests
export const LONG_TIMEOUT = 60000; // 60 seconds for long-running operations (increased from 30 seconds)
export const DEFAULT_RETRY_COUNT = 3; // Number of retry attempts (increased from 2)
export const DEFAULT_RETRY_DELAY = 1000; // 1000ms between retries (increased from 500ms)

// CORS and fetch configuration
export const FETCH_OPTIONS = {
  credentials: 'include', // Include cookies in cross-origin requests
  mode: 'cors', // Enable CORS
  timeout: DEFAULT_TIMEOUT,
  retries: DEFAULT_RETRY_COUNT,
  retryDelay: DEFAULT_RETRY_DELAY,
  keepalive: true // Keep the connection alive for longer requests
};

/**
 * Determine if mock data should be used
 * This is controlled by the VITE_DISABLE_MOCK environment variable
 * Always use real data for roles
 */
export const shouldUseMockData = (feature?: string): boolean => {
  const disableMock = import.meta.env.VITE_DISABLE_MOCK === 'true';
  const disableMockRoles = import.meta.env.VITE_DISABLE_MOCK_ROLES === 'true' || true; // Force disable mock for roles

  // Always use real API for roles
  if (feature === 'roles') {
    return !disableMockRoles && isDevelopment;
  }

  return !disableMock && isDevelopment;
};

/**
 * Export all constants for use in other modules
 * This is the preferred way to access API configuration
 */
export const API_CONSTANTS = {
  // Environment
  IS_DEV: isDevelopment,
  IS_PROD: isProduction,
  IS_TEST: isTest,

  // URLs
  URL: API_URL,
  VERSION: API_VERSION,
  PREFIX: API_PREFIX,
  FULL_URL: FULL_API_URL,
  DIRECT_URL: DIRECT_API_URL,
  DIRECT_FULL_URL: DIRECT_FULL_API_URL,

  // Request configuration
  HEADERS: DEFAULT_HEADERS,
  TIMEOUT: DEFAULT_TIMEOUT,
  SETTINGS_TIMEOUT: SETTINGS_TIMEOUT,
  LONG_TIMEOUT: LONG_TIMEOUT,
  RETRY_COUNT: DEFAULT_RETRY_COUNT,
  RETRY_DELAY: DEFAULT_RETRY_DELAY,
  FETCH_OPTIONS: FETCH_OPTIONS,

  // Feature flags
  USE_MOCK_DATA: shouldUseMockData()
};
