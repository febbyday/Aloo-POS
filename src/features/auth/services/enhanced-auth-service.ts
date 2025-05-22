/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Enhanced Authentication Service
 *
 * This service integrates robust error handling and retry mechanisms with authentication operations.
 * It provides robust token management, consistent error feedback, and authentication state synchronization.
 */

import {
  LoginCredentials,
  AuthResponse,
  User,
  PasswordResetRequest
} from '../types/auth.types';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { ApiError, ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';
import { AUTH_EVENTS } from '../types/auth.types';

// Create module-specific error handler
const errorHandler = createErrorHandler('auth');

// CSRF token header name
const CSRF_HEADER = 'X-CSRF-Token';

// Cookie names for reference
const AUTH_COOKIE_NAME = 'auth_token';
const REFRESH_COOKIE_NAME = 'refresh_token';
const IS_AUTHENTICATED_COOKIE = 'is_authenticated';

/**
 * Enhanced authentication service with robust error handling
 */
const enhancedAuthService = {
  /**
   * Login with username and password
   *
   * @param credentials Login credentials
   * @returns Promise with user data and tokens
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await enhancedApiClient.post<AuthResponse>(
        'auth/LOGIN',
        credentials,
        undefined,
        {
          // Don't retry login requests automatically
          retry: false
        }
      );

      // Store tokens securely
      this.setTokens(response.accessToken, response.refreshToken);

      // Dispatch login event for the application
      this.dispatchAuthEvent(AUTH_EVENTS.LOGIN_SUCCESS, {
        user: response.user,
        timestamp: new Date().toISOString()
      });

      return response;
    } catch (error) {
      const apiError = errorHandler.handleError(error, 'login');

      // Enhance the error with auth-specific context
      if (apiError.status === 401) {
        apiError.type = ApiErrorType.AUTHENTICATION;
        apiError.message = 'Invalid username or password';
      }

      // Dispatch login failure event
      this.dispatchAuthEvent(AUTH_EVENTS.LOGIN_FAILURE, {
        error: apiError.getUserMessage(),
        timestamp: new Date().toISOString()
      });

      throw apiError;
    }
  },

  /**
   * Logout the current user with error handling
   *
   * @returns Promise indicating success
   */
  async logout(): Promise<void> {
    try {
      // Attempt to notify the server about logout
      await errorHandler.safeCall(
        () => enhancedApiClient.post<void>(
          'auth/LOGOUT',
          undefined,
          undefined,
          { retry: false }
        ),
        'Failed to log out properly'
      );
    } catch (error) {
      // Log the error but continue with local logout
      console.warn('Server logout failed, proceeding with local logout:', error);
    } finally {
      // Always clear tokens locally regardless of server response
      this.clearTokens();

      // Dispatch logout event
      this.dispatchAuthEvent(AUTH_EVENTS.LOGOUT, {
        timestamp: new Date().toISOString()
      });
    }
  },

  /**
   * Refresh authentication tokens
   *
   * @returns Promise with new tokens
   */
  async refreshTokens(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      const error = new ApiError(
        'No refresh token available',
        { type: ApiErrorType.AUTHENTICATION, retryable: false }
      );

      // Dispatch auth error event
      this.dispatchAuthEvent(AUTH_EVENTS.AUTH_ERROR, {
        error: error.getUserMessage(),
        timestamp: new Date().toISOString()
      });

      throw error;
    }

    try {
      // Use retry functionality with exponential backoff
      const response = await errorHandler.withRetry<AuthResponse>(
        () => enhancedApiClient.post<AuthResponse>(
          'auth/REFRESH_TOKEN',
          { refreshToken },
          undefined,
          {
            retry: {
              maxRetries: 3,
              initialDelay: 500,
              maxDelay: 5000
            }
          }
        ),
        {
          maxRetries: 3,
          initialDelay: 500,
          onRetry: (error, attempt) => {
            console.warn(`Token refresh retry ${attempt}/3: ${error.message}`);
          }
        }
      );

      // Update stored tokens
      this.setTokens(response.accessToken, response.refreshToken);

      // Dispatch token refresh event
      this.dispatchAuthEvent(AUTH_EVENTS.TOKEN_REFRESHED, {
        timestamp: new Date().toISOString()
      });

      return {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      };
    } catch (error) {
      const apiError = errorHandler.handleError(error, 'refreshToken');

      // Clear tokens and notify about auth error
      this.clearTokens();

      // Dispatch session expiration event
      this.dispatchAuthEvent(AUTH_EVENTS.SESSION_EXPIRED, {
        error: apiError.getUserMessage(),
        timestamp: new Date().toISOString()
      });

      throw apiError;
    }
  },

  /**
   * Get user profile with automatic token refresh and retry
   * In development mode, returns a mock admin user
   *
   * @returns Promise with user data
   */
  async getCurrentUser(): Promise<User> {
    // In development mode, return a mock admin user
    if (import.meta.env.DEV) {
      console.log('[AUTH] Development mode: Returning mock admin user');
      return {
        id: 'dev-admin',
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        permissions: ['*'], // Wildcard permission
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    return errorHandler.withRetry(
      async () => {
        try {
          const response = await enhancedApiClient.get<User>(
            'auth/CURRENT_USER',
            undefined,
            {
              retry: {
                shouldRetry: (error) => {
                  // Auto-retry on network or server errors, handle auth errors specially
                  if (error.type === ApiErrorType.AUTHENTICATION) {
                    // Try to refresh the token on auth error
                    return this.handleAuthError();
                  }
                  return error.retryable;
                }
              }
            }
          );
          return response;
        } catch (error) {
          const apiError = errorHandler.handleError(error, 'getCurrentUser');

          if (apiError.type === ApiErrorType.AUTHENTICATION) {
            // Try to refresh the token
            if (await this.handleAuthError()) {
              // If token refresh succeeds, retry the original request
              return enhancedApiClient.get<User>('auth/CURRENT_USER');
            }
          }

          throw apiError;
        }
      },
      {
        maxRetries: 2,
        shouldRetry: (error) => error.type !== ApiErrorType.AUTHORIZATION
      }
    );
  },

  /**
   * Request password reset with more robust error handling
   *
   * @param email User email
   * @returns Promise indicating success
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      await enhancedApiClient.post<void>(
        'auth/REQUEST_PASSWORD_RESET',
        { email },
        undefined,
        { retry: false } // Don't retry password reset requests
      );
      return true;
    } catch (error) {
      const apiError = errorHandler.handleError(error, 'requestPasswordReset');

      // Special case for NOT_FOUND - don't expose if email exists or not
      if (apiError.type === ApiErrorType.NOT_FOUND) {
        // Return true even if email not found for security reasons
        console.log('Password reset requested for non-existent email (security measure)');
        return true;
      }

      throw apiError;
    }
  },

  /**
   * Reset password with validation error handling
   *
   * @param resetData Password reset data
   * @returns Promise indicating success
   */
  async resetPassword(resetData: PasswordResetRequest): Promise<boolean> {
    try {
      await enhancedApiClient.post<void>(
        'auth/RESET_PASSWORD',
        resetData,
        undefined,
        { retry: false }
      );
      return true;
    } catch (error) {
      const apiError = errorHandler.handleError(error, 'resetPassword');

      // Enhance validation errors with specific feedback
      if (apiError.type === ApiErrorType.VALIDATION) {
        if (apiError.details && apiError.details.token) {
          apiError.message = 'Password reset link has expired or is invalid';
        } else if (apiError.details && apiError.details.password) {
          apiError.message = 'Password does not meet the required criteria';
        }
      }

      throw apiError;
    }
  },

  /**
   * Check if user is authenticated by looking for the is_authenticated cookie
   * In development mode, automatically returns true to bypass authentication
   */
  isAuthenticated(): boolean {
    // In development mode, always return true to bypass authentication checks
    if (import.meta.env.DEV) {
      console.log('[AUTH] Development mode: Authentication bypass enabled');
      return true;
    }

    // Normal authentication check for production
    return document.cookie.includes(`${IS_AUTHENTICATED_COOKIE}=true`);
  },

  /**
   * Check if user is authenticated by looking for the is_authenticated cookie
   *
   * Note: The actual token is stored in an HttpOnly cookie that we can't access from JavaScript.
   * We use a separate non-HttpOnly cookie as a flag to indicate authentication status.
   * In development mode, always returns a mock token.
   */
  getAccessToken(): string | null {
    // In development mode, always return a mock token
    if (import.meta.env.DEV) {
      return 'dev-mode-access-token';
    }

    // We can't access the HttpOnly cookie, so we use the is_authenticated cookie as a flag
    return this.isAuthenticated() ? 'cookie-based-auth' : null;
  },

  /**
   * Check if refresh token exists
   *
   * Note: The actual refresh token is stored in an HttpOnly cookie that we can't access from JavaScript.
   * This method now just checks if the user is authenticated.
   * In development mode, always returns a mock refresh token.
   */
  getRefreshToken(): string | null {
    // In development mode, always return a mock refresh token
    if (import.meta.env.DEV) {
      return 'dev-mode-refresh-token';
    }

    // We can't access the HttpOnly cookie, so we just return a placeholder if authenticated
    return this.isAuthenticated() ? 'cookie-based-refresh' : null;
  },

  /**
   * Store authentication tokens
   *
   * Note: With HttpOnly cookies, we don't actually store the tokens in the frontend.
   * This method is kept for compatibility with the existing code, but it doesn't
   * do anything with the tokens since they're managed by the server via cookies.
   */
  setTokens(accessToken: string, refreshToken: string): void {
    // Tokens are now stored in HttpOnly cookies by the server
    // This method is kept for compatibility
    console.debug('Tokens are now managed via HttpOnly cookies');
  },

  /**
   * Clear authentication tokens
   *
   * This method now makes a request to the server to clear the cookies
   */
  async clearTokens(): Promise<void> {
    try {
      // Call the server endpoint to clear cookies
      await errorHandler.safeCall(
        () => enhancedApiClient.post<void>(
          'auth/CLEAR_COOKIES',
          undefined,
          undefined,
          { retry: false }
        ),
        'Failed to clear authentication cookies'
      );
    } catch (error) {
      console.warn('Failed to clear cookies on the server:', error);
    }
  },

  /**
   * Handle authentication errors by attempting to refresh tokens
   * In development mode, always succeeds to bypass authentication errors
   */
  async handleAuthError(): Promise<boolean> {
    // In development mode, always succeed to bypass authentication errors
    if (import.meta.env.DEV) {
      console.log('[AUTH] Development mode: Authentication error bypass enabled');
      return true;
    }

    try {
      // Only try to refresh if we have a refresh token
      if (this.getRefreshToken()) {
        await this.refreshTokens();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh authentication tokens:', error);
      this.clearTokens();

      this.dispatchAuthEvent(AUTH_EVENTS.AUTH_ERROR, {
        error: 'Authentication failed. Please log in again.',
        timestamp: new Date().toISOString()
      });

      return false;
    }
  },

  /**
   * Dispatch authentication event
   */
  dispatchAuthEvent(eventName: string, detail: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  }
};

export default enhancedAuthService;
