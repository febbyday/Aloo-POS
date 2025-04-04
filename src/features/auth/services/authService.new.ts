/**
 * Auth Service
 * 
 * This service handles authentication, token management, and user session.
 * It provides methods for login, logout, token refresh, and user data access.
 * Implements secure authentication practices including HttpOnly cookies,
 * token rotation, and protection against common security vulnerabilities.
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
import { apiClient } from '@/lib/api/api-client';
import { ApiHealth, ApiStatus } from '@/lib/api/api-health';
import { AUTH_CONFIG } from '../config/authConfig';

// API endpoints
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh-token',
  VERIFY: '/auth/verify',
  REGISTER: '/auth/register',
  CURRENT_USER: '/auth/me',
  SESSION: '/auth/session',
  PASSWORD_RESET: '/auth/password-reset',
  PASSWORD_RESET_CONFIRM: '/auth/password-reset-confirm',
  PASSWORD_CHANGE: '/auth/password-change'
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

// Create an instance of ApiHealth
const apiHealth = new ApiHealth(apiClient);

// Development mode check
const isDevelopment = import.meta.env.MODE === 'development';

// Authentication bypass check
const isAuthBypassEnabled = AUTH_CONFIG.DEV_MODE.BYPASS_AUTH;

/**
 * Authentication Service
 * Provides methods for authentication, token management, and user session
 */
class AuthService {
  private user: User | null = null;
  private tokenExpiryTime: number | null = null;
  private refreshTokenTimeout: number | null = null;
  private sessionCheckInterval: number | null = null;
  
  /**
   * Initialize the auth service
   * Sets up event listeners and session check
   */
  init(): void {
    console.log('[AUTH] Initializing auth service');
    
    // Check if we're in development mode with auth bypass
    if (isDevelopment && isAuthBypassEnabled) {
      console.log('[AUTH] Development mode with auth bypass enabled');
      this.user = AUTH_CONFIG.DEV_MODE.DEFAULT_USER;
      return;
    }
    
    // Try to restore user from storage
    this.restoreUserFromStorage();
    
    // Set up session check interval
    this.setupSessionCheck();
    
    // Set up API health monitoring
    this.setupApiHealthMonitoring();
  }
  
  /**
   * Set up session check interval
   * Periodically checks if the session is still valid
   */
  private setupSessionCheck(): void {
    // Clear any existing interval
    if (this.sessionCheckInterval) {
      window.clearInterval(this.sessionCheckInterval);
    }
    
    // Set up new interval - check every 5 minutes
    this.sessionCheckInterval = window.setInterval(() => {
      this.checkSession();
    }, 5 * 60 * 1000);
  }
  
  /**
   * Set up API health monitoring
   * Listens for API health events
   */
  private setupApiHealthMonitoring(): void {
    // Listen for API availability changes
    window.addEventListener(API_EVENTS.AVAILABLE, () => {
      console.log('[AUTH] API is available, checking session');
      this.checkSession();
    });
    
    window.addEventListener(API_EVENTS.UNAVAILABLE, () => {
      console.log('[AUTH] API is unavailable');
    });
  }
  
  /**
   * Restore user from storage
   * Used during initialization
   */
  private restoreUserFromStorage(): void {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        this.user = JSON.parse(storedUser);
        console.log('[AUTH] User restored from storage');
      }
      
      const tokenExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      if (tokenExpiry) {
        this.tokenExpiryTime = parseInt(tokenExpiry, 10);
        
        // If token is expired, clear it
        if (this.tokenExpiryTime < Date.now()) {
          console.log('[AUTH] Stored token is expired, clearing');
          this.clearAuthData();
        } else {
          // Schedule token refresh
          this.scheduleTokenRefresh();
        }
      }
    } catch (error) {
      console.error('[AUTH] Error restoring user from storage:', error);
      this.clearAuthData();
    }
  }
  
  /**
   * Schedule token refresh
   * Sets up a timeout to refresh the token before it expires
   */
  private scheduleTokenRefresh(): void {
    // Clear any existing timeout
    if (this.refreshTokenTimeout) {
      window.clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
    
    // If no expiry time, can't schedule refresh
    if (!this.tokenExpiryTime) {
      return;
    }
    
    // Calculate time until refresh (refresh 1 minute before expiry)
    const now = Date.now();
    const timeUntilExpiry = this.tokenExpiryTime - now;
    const refreshTime = Math.max(0, timeUntilExpiry - 60000); // 1 minute before expiry
    
    if (refreshTime <= 0) {
      // Token is already expired or about to expire, refresh now
      this.refreshToken();
      return;
    }
    
    console.log(`[AUTH] Scheduling token refresh in ${Math.round(refreshTime / 1000)} seconds`);
    
    // Set timeout to refresh token
    this.refreshTokenTimeout = window.setTimeout(() => {
      console.log('[AUTH] Executing scheduled token refresh');
      this.refreshToken();
    }, refreshTime);
  }
  
  /**
   * Clear authentication data
   * Removes user and token data from storage
   */
  private clearAuthData(): void {
    this.user = null;
    this.tokenExpiryTime = null;
    
    // Clear storage
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
    
    // Clear timeouts
    if (this.refreshTokenTimeout) {
      window.clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
  }
  
  /**
   * Check if the current session is valid
   * @returns Promise with session validity
   */
  async checkSession(): Promise<boolean> {
    // If in development mode with auth bypass, always return true
    if (isDevelopment && isAuthBypassEnabled) {
      return true;
    }
    
    // If API is not available, use stored data
    if (apiHealth.getStatus() !== ApiStatus.AVAILABLE) {
      return this.isAuthenticated();
    }
    
    try {
      const response = await apiClient.get(AUTH_ENDPOINTS.SESSION);
      
      if (response.success) {
        // Session is valid, update user data if provided
        if (response.data?.user) {
          this.user = response.data.user;
          this.saveUserToStorage();
        }
        
        // Update token expiry if provided
        if (response.data?.expiresAt) {
          this.tokenExpiryTime = new Date(response.data.expiresAt).getTime();
          localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, this.tokenExpiryTime.toString());
          this.scheduleTokenRefresh();
        }
        
        return true;
      } else {
        // Session is invalid, clear auth data
        console.log('[AUTH] Session check failed, clearing auth data');
        this.clearAuthData();
        
        // Dispatch session expired event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.SESSION_EXPIRED));
        
        return false;
      }
    } catch (error) {
      console.error('[AUTH] Error checking session:', error);
      
      // If it's a network error, don't clear auth data
      if (error instanceof Error && error.message.includes('network')) {
        console.log('[AUTH] Network error during session check, keeping auth data');
        return this.isAuthenticated();
      }
      
      // For other errors, clear auth data
      this.clearAuthData();
      return false;
    }
  }
  
  /**
   * Save user to storage
   * Stores user data in localStorage (non-sensitive data only)
   */
  private saveUserToStorage(): void {
    if (this.user) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.user));
    }
  }
  
  /**
   * Login user
   * @param credentials User credentials
   * @returns Promise with login response
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // If in development mode with auth bypass, use mock login
    if (isDevelopment && isAuthBypassEnabled) {
      console.log('[AUTH] Development mode login with bypass');
      this.user = AUTH_CONFIG.DEV_MODE.DEFAULT_USER;
      this.saveUserToStorage();
      
      // Dispatch login success event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_SUCCESS, {
        detail: { data: this.user }
      }));
      
      return {
        success: true,
        user: this.user,
        message: 'Development mode login successful'
      };
    }
    
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
      
      if (response.success && response.data) {
        // Extract user and token data
        const { user, expiresIn, expiresAt } = response.data;
        
        // Store user data
        this.user = user;
        this.saveUserToStorage();
        
        // Store token expiry time
        if (expiresAt) {
          this.tokenExpiryTime = new Date(expiresAt).getTime();
          localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, this.tokenExpiryTime.toString());
        } else if (expiresIn) {
          // Calculate expiry time from expiresIn (seconds)
          this.tokenExpiryTime = Date.now() + (expiresIn * 1000);
          localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, this.tokenExpiryTime.toString());
        }
        
        // Schedule token refresh
        this.scheduleTokenRefresh();
        
        // Dispatch login success event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_SUCCESS, {
          detail: { data: user }
        }));
        
        return {
          success: true,
          user,
          message: 'Login successful'
        };
      } else {
        // Login failed
        const errorMessage = response.error || 'Login failed';
        
        // Dispatch login failure event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_FAILURE, {
          detail: { error: errorMessage }
        }));
        
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Dispatch login failure event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGIN_FAILURE, {
        detail: { error: errorMessage }
      }));
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Logout user
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    // If in development mode with auth bypass, just clear local data
    if (isDevelopment && isAuthBypassEnabled) {
      console.log('[AUTH] Development mode logout with bypass');
      this.clearAuthData();
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGOUT));
      
      return;
    }
    
    try {
      // Call logout endpoint to invalidate server-side session
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('[AUTH] Error during logout:', error);
    } finally {
      // Always clear local auth data
      this.clearAuthData();
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGOUT));
    }
  }
  
  /**
   * Register a new user
   * @param data Registration data
   * @returns Promise with registration response
   */
  async register(data: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, data);
      
      if (response.success) {
        // Dispatch register success event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.REGISTER_SUCCESS, {
          detail: { data: response.data }
        }));
        
        return {
          success: true,
          data: response.data,
          message: 'Registration successful'
        };
      } else {
        // Registration failed
        const errorMessage = response.error || 'Registration failed';
        
        // Dispatch register failure event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.REGISTER_FAILURE, {
          detail: { error: errorMessage }
        }));
        
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('[AUTH] Registration error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Dispatch register failure event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.REGISTER_FAILURE, {
        detail: { error: errorMessage }
      }));
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Refresh authentication token
   * @returns Promise that resolves to true if refresh was successful
   */
  async refreshToken(): Promise<boolean> {
    // If in development mode with auth bypass, always return true
    if (isDevelopment && isAuthBypassEnabled) {
      console.log('[AUTH] Development mode token refresh with bypass');
      return true;
    }
    
    // If API is not available, can't refresh token
    if (apiHealth.getStatus() !== ApiStatus.AVAILABLE) {
      console.log('[AUTH] API not available, cannot refresh token');
      return false;
    }
    
    try {
      console.log('[AUTH] Refreshing token');
      const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH);
      
      if (response.success && response.data) {
        // Extract token data
        const { user, expiresIn, expiresAt } = response.data;
        
        // Update user data if provided
        if (user) {
          this.user = user;
          this.saveUserToStorage();
        }
        
        // Update token expiry time
        if (expiresAt) {
          this.tokenExpiryTime = new Date(expiresAt).getTime();
          localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, this.tokenExpiryTime.toString());
        } else if (expiresIn) {
          // Calculate expiry time from expiresIn (seconds)
          this.tokenExpiryTime = Date.now() + (expiresIn * 1000);
          localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, this.tokenExpiryTime.toString());
        }
        
        // Schedule next token refresh
        this.scheduleTokenRefresh();
        
        // Dispatch token refreshed event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_REFRESHED, {
          detail: { timestamp: new Date().toISOString() }
        }));
        
        console.log('[AUTH] Token refreshed successfully');
        return true;
      } else {
        // Token refresh failed
        console.error('[AUTH] Token refresh failed:', response.error);
        
        // If the error indicates the refresh token is invalid, clear auth data
        if (response.error?.includes('invalid refresh token') || 
            response.error?.includes('expired refresh token') ||
            response.status === 401) {
          console.log('[AUTH] Invalid or expired refresh token, clearing auth data');
          this.clearAuthData();
          
          // Dispatch session expired event
          window.dispatchEvent(new CustomEvent(AUTH_EVENTS.SESSION_EXPIRED));
        }
        
        return false;
      }
    } catch (error) {
      console.error('[AUTH] Error refreshing token:', error);
      
      // If it's a network error, don't clear auth data
      if (error instanceof Error && error.message.includes('network')) {
        console.log('[AUTH] Network error during token refresh, keeping auth data');
        return false;
      }
      
      // For other errors, clear auth data
      this.clearAuthData();
      
      // Dispatch session expired event
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.SESSION_EXPIRED));
      
      return false;
    }
  }
  
  /**
   * Check if user is authenticated
   * @returns True if user is authenticated
   */
  isAuthenticated(): boolean {
    // If in development mode with auth bypass, always return true
    if (isDevelopment && isAuthBypassEnabled) {
      return true;
    }
    
    // Check if user exists and token is not expired
    return !!this.user && (!this.tokenExpiryTime || this.tokenExpiryTime > Date.now());
  }
  
  /**
   * Get current user
   * @returns Current user or null if not authenticated
   */
  getCurrentUser(): User | null {
    // If in development mode with auth bypass, return default user
    if (isDevelopment && isAuthBypassEnabled) {
      return AUTH_CONFIG.DEV_MODE.DEFAULT_USER;
    }
    
    return this.user;
  }
  
  /**
   * Fetch current user from server
   * @returns Promise with current user or null if not authenticated
   */
  async fetchCurrentUser(): Promise<User | null> {
    // If in development mode with auth bypass, return default user
    if (isDevelopment && isAuthBypassEnabled) {
      return AUTH_CONFIG.DEV_MODE.DEFAULT_USER;
    }
    
    // If API is not available, use stored user
    if (apiHealth.getStatus() !== ApiStatus.AVAILABLE) {
      return this.user;
    }
    
    try {
      console.log('[AUTH] Fetching current user');
      const response = await apiClient.get(AUTH_ENDPOINTS.CURRENT_USER);
      
      if (response.success && response.data) {
        // Update user data
        this.user = response.data;
        this.saveUserToStorage();
        
        console.log('[AUTH] Current user fetched successfully');
        return this.user;
      } else {
        console.warn('[AUTH] Failed to fetch current user');
        return null;
      }
    } catch (error) {
      console.error('[AUTH] Error fetching current user:', error);
      
      // If it's a 401 error, clear auth data
      if (error instanceof Error && error.message.includes('401')) {
        console.log('[AUTH] Unauthorized error fetching current user, clearing auth data');
        this.clearAuthData();
        
        // Dispatch session expired event
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.SESSION_EXPIRED));
      }
      
      return null;
    }
  }
  
  /**
   * Request password reset
   * @param email User email
   * @returns Promise with password reset response
   */
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.PASSWORD_RESET, { email });
      
      if (response.success) {
        // Dispatch password reset requested event
        window.dispatchEvent(new CustomEvent(PASSWORD_EVENTS.RESET_REQUESTED, {
          detail: { email }
        }));
        
        return {
          success: true,
          message: 'Password reset email sent'
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to request password reset'
        };
      }
    } catch (error) {
      console.error('[AUTH] Error requesting password reset:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Confirm password reset
   * @param token Reset token
   * @param newPassword New password
   * @returns Promise with password reset confirmation response
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.PASSWORD_RESET_CONFIRM, {
        token,
        newPassword
      });
      
      if (response.success) {
        // Dispatch password reset success event
        window.dispatchEvent(new CustomEvent(PASSWORD_EVENTS.RESET_SUCCESS));
        
        return {
          success: true,
          message: 'Password reset successful'
        };
      } else {
        // Dispatch password reset failure event
        window.dispatchEvent(new CustomEvent(PASSWORD_EVENTS.RESET_FAILURE, {
          detail: { error: response.error }
        }));
        
        return {
          success: false,
          error: response.error || 'Failed to reset password'
        };
      }
    } catch (error) {
      console.error('[AUTH] Error confirming password reset:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Dispatch password reset failure event
      window.dispatchEvent(new CustomEvent(PASSWORD_EVENTS.RESET_FAILURE, {
        detail: { error: errorMessage }
      }));
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Change password
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Promise with password change response
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.PASSWORD_CHANGE, {
        currentPassword,
        newPassword
      });
      
      if (response.success) {
        // Dispatch password change success event
        window.dispatchEvent(new CustomEvent(PASSWORD_EVENTS.CHANGE_SUCCESS));
        
        return {
          success: true,
          message: 'Password changed successfully'
        };
      } else {
        // Dispatch password change failure event
        window.dispatchEvent(new CustomEvent(PASSWORD_EVENTS.CHANGE_FAILURE, {
          detail: { error: response.error }
        }));
        
        return {
          success: false,
          error: response.error || 'Failed to change password'
        };
      }
    } catch (error) {
      console.error('[AUTH] Error changing password:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Dispatch password change failure event
      window.dispatchEvent(new CustomEvent(PASSWORD_EVENTS.CHANGE_FAILURE, {
        detail: { error: errorMessage }
      }));
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Verify authentication token
   * @returns Promise with token verification response
   */
  async verifyToken(): Promise<TokenVerificationResponse> {
    // If in development mode with auth bypass, always return valid
    if (isDevelopment && isAuthBypassEnabled) {
      return {
        isValid: true,
        user: AUTH_CONFIG.DEV_MODE.DEFAULT_USER
      };
    }
    
    try {
      const response = await apiClient.get(AUTH_ENDPOINTS.VERIFY);
      
      if (response.success && response.data) {
        // Update user data if provided
        if (response.data.user) {
          this.user = response.data.user;
          this.saveUserToStorage();
        }
        
        return {
          isValid: true,
          user: this.user
        };
      } else {
        return {
          isValid: false,
          error: response.error || 'Token verification failed'
        };
      }
    } catch (error) {
      console.error('[AUTH] Error verifying token:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      return {
        isValid: false,
        error: errorMessage
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
