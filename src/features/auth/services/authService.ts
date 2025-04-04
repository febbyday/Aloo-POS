/**
 * Auth Service
 * 
 * This service handles authentication, token management, and user session.
 * It provides methods for login, logout, token refresh, and user data access.
 * Implements secure authentication practices including HttpOnly cookies,
 * token rotation, and protection against common security vulnerabilities.
 * 
 * Enhanced with better token refresh handling and fetchCurrentUser method.
 */

import { 
  User, 
  LoginCredentials, 
  RegisterCredentials, 
  LoginResponse, 
  AuthResponse,
  AUTH_EVENTS,
  PASSWORD_EVENTS,
  API_EVENTS,
  TokenVerificationResponse,
  AuthError
} from '../types/auth.types';
import { apiClient } from '../../../lib/api/api-client';
import { ApiHealth, ApiStatus } from '../../../lib/api/api-health';

// API endpoints
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh-token', // Make sure this matches your backend endpoint
  VERIFY: '/auth/verify',
  REGISTER: '/auth/register',
  CURRENT_USER: '/auth/me',
  SESSION: '/auth/session',
  SET_COOKIE: '/auth/set-cookie',
  CLEAR_COOKIE: '/auth/clear-cookie'
} as const;

// Client-side storage keys 
// Note: These are used only for non-sensitive data
// Auth tokens are stored in HttpOnly cookies for security
const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  AUTH_STATE: 'auth_state',
  TOKEN_EXPIRY: 'token_expiry',
  DEV_MODE_AUTH: 'dev_mode_auth'
};

/**
 * Fetch the current user from the server
 * @returns Promise with the current user or null if not authenticated
 */
async function fetchCurrentUser(): Promise<User | null> {
  try {
    console.log('[AUTH] Fetching current user');
    const response = await apiClient.get(AUTH_ENDPOINTS.CURRENT_USER);
    
    if (response.success && response.data) {
      console.log('[AUTH] Current user fetched successfully');
      return response.data as User;
    }
    
    console.warn('[AUTH] Failed to fetch current user');
    return null;
  } catch (error) {
    console.error('[AUTH] Error fetching current user:', error);
    return null;
  }
}

// Add the fetchCurrentUser method to the authService
const authServiceExtension = {
  /**
   * Fetch the current user from the server
   * @returns Promise with the current user or null if not authenticated
   */
  async fetchCurrentUser(): Promise<User | null> {
    return fetchCurrentUser();
  }
};

// Export the extended authService
export const authService = {
  ...window.authService, // Assuming the original authService is available on the window object
  ...authServiceExtension
};
