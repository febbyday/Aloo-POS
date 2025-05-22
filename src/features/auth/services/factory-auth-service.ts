/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Factory-Based Auth Service
 *
 * @deprecated This service is deprecated. Use the enhanced auth service from 'src/features/auth/services/index.ts' instead.
 *
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of auth-related operations with minimal duplication.
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
import { createServiceMethod } from '@/lib/api/service-endpoint-factory';
import { AUTH_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';

// Create module-specific error handler
const errorHandler = createErrorHandler('auth');

// Client-side storage keys
// Note: These are used only for non-sensitive data
// Auth tokens are stored in HttpOnly cookies for security
const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  AUTH_STATE: 'auth_state',
  TOKEN_EXPIRY: 'token_expiry',
  DEV_MODE_AUTH: 'dev_mode_auth'
};

// Define retry configuration
const AUTH_RETRY_CONFIG = {
  maxRetries: 2,
  retryDelay: 1000,
  shouldRetry: (error: any) => {
    // Only retry on network errors, not on auth failures
    return error.type === ApiErrorType.NETWORK ||
           error.type === ApiErrorType.TIMEOUT ||
           error.type === ApiErrorType.SERVER;
  }
};

/**
 * Factory-based Auth Service implementation
 */
class FactoryAuthServiceImpl {
  private user: User | null = null;
  private tokenExpiryTime: number | null = null;
  private _isRefreshing: boolean = false;

  /**
   * Initialize the auth service
   */
  init(): void {
    console.log('[AUTH] Initializing auth service');

    // Try to restore user from storage
    this.restoreUserFromStorage();
  }

  /**
   * Restore user from storage
   */
  private restoreUserFromStorage(): void {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        console.log('[AUTH] User restored from storage');
      }
    } catch (error) {
      console.error('[AUTH] Error restoring user from storage:', error);
      this.clearAuthData();
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    this.user = null;
    this.tokenExpiryTime = null;

    // Clear storage
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
  }

  /**
   * Check if the user is authenticated
   * @returns True if authenticated
   */
  isAuthenticated(): boolean {
    // Check if we have a user object
    if (this.user) {
      // If we have a token expiry time, check if it's valid
      if (this.tokenExpiryTime) {
        return this.tokenExpiryTime > Date.now();
      }
      // If no expiry time but we have a user, consider authenticated
      return true;
    }

    // Otherwise not authenticated
    // Also check local/session storage as fallback
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        return true;
      }

      // Check for auth token as last resort
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      return !!token;
    } catch (error) {
      console.error('[AUTH] Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.user;
  }

  /**
   * Fetch current user from server
   */
  async fetchCurrentUser(): Promise<User | null> {
    try {
      console.log('[AUTH] Fetching current user');

      const response = await enhancedApiClient.get<AuthResponse<User>>('auth/CURRENT_USER');

      if (response.success && response.data) {
        console.log('[AUTH] Current user fetched successfully');
        this.user = response.data;
        return this.user;
      }

      console.warn('[AUTH] Failed to fetch current user');
      return null;
    } catch (error) {
      console.error('[AUTH] Error fetching current user:', error);
      return null;
    }
  }

  /**
   * Login user
   * @param credentials Login credentials
   * @returns Login result
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Use the enhanced API client to authenticate
      const response = await enhancedApiClient.post<AuthResponse<User>>(
        'auth/LOGIN',
        credentials,
        undefined,
        { retry: AUTH_RETRY_CONFIG }
      );

      if (response.success && response.data) {
        // Store user data
        this.user = response.data;

        // Extract the token expires time
        let expiresIn = response.expiresIn || 3600;
        if (expiresIn) {
          this.tokenExpiryTime = Date.now() + expiresIn * 1000;
          localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, this.tokenExpiryTime.toString());
        }

        // Store user data in local storage for later restoration
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.user));

        // Notify about successful login
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_SUCCESS, {
            detail: { user: this.user }
          }));
        }

        // Only return a successful response if we have a user
        if (this.user) {
          return {
            success: true,
            data: {
              user: this.user
            }
          };
        } else {
          return {
            success: false,
            error: 'Invalid user data received from server'
          };
        }
      } else {
        // Handle API error with more specific messages
        let errorMessage = response.error || 'Authentication failed';

        // Enhance error messages based on API response patterns
        if (response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (response.status === 403) {
          errorMessage = 'Account is locked or inactive';
        } else if (response.status === 404) {
          errorMessage = 'User not found';
        } else if (response.status === 429) {
          errorMessage = 'Too many login attempts. Please try again later';
        } else if (response.error?.includes('password')) {
          errorMessage = 'Incorrect password';
        } else if (response.error?.includes('username') || response.error?.includes('user')) {
          errorMessage = 'User does not exist';
        } else if (response.error?.includes('inactive')) {
          errorMessage = 'Account is inactive. Please contact support';
        } else if (response.error?.includes('locked')) {
          errorMessage = 'Account is locked. Please contact support';
        }

        // Log the error details for debugging
        console.error('[AUTH] Login error details:', {
          status: response.status,
          error: response.error,
          message: errorMessage
        });

        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error: any) {
      console.error('[AUTH] Login error:', error);

      // Provide user-friendly messages for common network/connection errors
      let errorMessage = error.message || 'Authentication failed';

      if (error.message?.includes('NetworkError') || error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection';
      } else if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        errorMessage = 'Server request timed out. Please try again';
      } else if (error.message?.includes('fetch')) {
        errorMessage = 'Server connection failed. Is the backend running?';
      } else if (error.message?.includes('CORS')) {
        errorMessage = 'Cross-origin request blocked. Please check server configuration';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await enhancedApiClient.post('auth/LOGOUT');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.clearAuthData();

      // Dispatch logout event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGOUT));
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<boolean> {
    // Check if we're already refreshing to prevent multiple simultaneous refresh attempts
    if (this._isRefreshing) {
      console.log('[AUTH] Token refresh already in progress, waiting...');
      return new Promise(resolve => {
        const checkRefreshStatus = () => {
          if (!this._isRefreshing) {
            resolve(this.isAuthenticated());
          } else {
            setTimeout(checkRefreshStatus, 200);
          }
        };
        checkRefreshStatus();
      });
    }

    this._isRefreshing = true;
    console.log('[AUTH] Starting token refresh process');

    try {
      console.log('[AUTH] Attempting to refresh token');

      // Use the enhanced API client for token refresh
      const refreshResult = await enhancedApiClient.post<AuthResponse<any>>(
        'auth/REFRESH_TOKEN',
        undefined,
        undefined,
        { retry: AUTH_RETRY_CONFIG }
      );

      if (refreshResult.success) {
        console.log('[AUTH] Token refreshed successfully');

        // Get current user after refresh
        const currentUser = await this.fetchCurrentUser();
        if (currentUser) {
          this.user = currentUser;

          // Dispatch token refreshed event
          window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_REFRESHED, {
            detail: { timestamp: new Date().toISOString() }
          }));

          this._isRefreshing = false;
          return true;
        }
      } else {
        console.log(`[AUTH] Token refresh failed: ${refreshResult.error || 'Unknown error'}`);
      }

      // If we reach here, the refresh failed
      this._isRefreshing = false;

      // Dispatch token refresh failed event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_REFRESH_FAILED, {
        detail: { timestamp: new Date().toISOString() }
      }));

      return false;
    } catch (error) {
      console.error(`[AUTH] Token refresh error:`, error);

      this._isRefreshing = false;

      // Dispatch token refresh failed event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_REFRESH_FAILED, {
        detail: { timestamp: new Date().toISOString(), error }
      }));

      return false;
    }
  }

  /**
   * Check if the authentication token is valid
   * @returns Promise resolving to boolean indicating token validity
   */
  async checkTokenValidity(): Promise<boolean> {
    console.log('[AUTH] Checking token validity');

    // If we don't have a user, token is invalid
    if (!this.user) {
      console.log('[AUTH] No user object found - token invalid');
      return false;
    }

    // If we have an expiry time, check if it's still valid
    if (this.tokenExpiryTime) {
      const isValid = this.tokenExpiryTime > Date.now();
      console.log(`[AUTH] Token expiry check: ${isValid ? 'valid' : 'expired'}`);
      return isValid;
    }

    // Try to verify token against server
    try {
      console.log('[AUTH] Verifying token with server');
      const response = await enhancedApiClient.get<TokenVerificationResponse>('auth/VERIFY');
      return response.success;
    } catch (error) {
      console.error('[AUTH] Token verification failed:', error);
      return false;
    }
  }

  /**
   * Check if user is authorized to access a specific feature
   * @param permission Permission string to check
   * @returns True if user has permission
   */
  hasPermission(permission: string): boolean {
    // Check if user exists and has permissions
    if (!this.user || !this.user.permissions) {
      // If not authenticated, check if user has role-based permissions
      if (this.user?.roles?.includes('ADMIN')) {
        // Admin has all permissions
        return true;
      }
      return false;
    }

    // Check if user has exact permission
    if (this.user.permissions.includes(permission)) {
      return true;
    }

    // Check if user has wildcard permission (e.g., "user:*" for "user:create")
    const permissionRoot = permission.split(':')[0];
    if (this.user.permissions.includes(`${permissionRoot}:*`)) {
      return true;
    }

    // Check if user is admin (admins have all permissions)
    if (this.user.roles?.includes('ADMIN')) {
      return true;
    }

    // Check if user is manager (managers have specific high-level permissions)
    if (this.user.roles?.includes('MANAGER') &&
      (permission.startsWith('view:') || permission.startsWith('report:'))) {
      return true;
    }

    return false;
  }

  /**
   * Register a new user
   * @param credentials Registration credentials
   * @returns Registration result
   */
  register = createServiceMethod<AuthResponse<User>, RegisterCredentials>(
    'auth',
    'REGISTER',
    'post',
    { withRetry: false }
  );

  /**
   * Request password reset
   * @param email User email
   * @returns Password reset request result
   */
  requestPasswordReset = createServiceMethod<AuthResponse<void>, { email: string }>(
    'auth',
    'REQUEST_PASSWORD_RESET',
    'post',
    { withRetry: false }
  );

  /**
   * Reset password with token
   * @param data Password reset data
   * @returns Password reset result
   */
  resetPassword = createServiceMethod<AuthResponse<void>, { token: string; password: string }>(
    'auth',
    'RESET_PASSWORD',
    'post',
    { withRetry: false }
  );

  /**
   * Change password
   * @param data Password change data
   * @returns Password change result
   */
  changePassword = createServiceMethod<AuthResponse<void>, { currentPassword: string; newPassword: string }>(
    'auth',
    'PASSWORD_CHANGE',
    'post',
    { withRetry: false }
  );

  /**
   * Get session information
   * @returns Session information
   */
  getSession = createServiceMethod<AuthResponse<{ sessionId: string; expiresAt: string; lastActive: string }>>(
    'auth',
    'SESSION',
    'get',
    { withRetry: true }
  );
}

// Export singleton instance
export const factoryAuthService = new FactoryAuthServiceImpl();

// Export for backward compatibility
export default factoryAuthService;
