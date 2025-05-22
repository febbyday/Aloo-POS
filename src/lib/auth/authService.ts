/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Authentication Service
 * Provides authentication-related functionality for the application
 *
 * @deprecated Use the factory-based authService from 'src/features/auth/services' instead
 * This service uses the legacy API client and will be removed in a future release.
 */

import { factoryAuthService } from '../../features/auth/services/factory-auth-service';
import { User, LoginResponse, LoginCredentials } from '../../features/auth/types/auth.types';

/**
 * Authentication Service
 * Handles user authentication, token management, and session validation
 *
 * @deprecated Use the factory-based authService from 'src/features/auth/services' instead
 */
export const authService = {
  /**
   * Checks if the user is currently authenticated
   * @returns True if the user has a valid token, false otherwise
   */
  isAuthenticated(): boolean {
    return factoryAuthService.isAuthenticated();
  },

  /**
   * Gets the current user
   * @returns The user object or null if not authenticated
   */
  getUser(): User | null {
    return factoryAuthService.getCurrentUser();
  },

  /**
   * Logs the user in
   * @param credentials The login credentials
   * @returns Promise with the login result
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return factoryAuthService.login(credentials);
  },

  /**
   * Logs the user out
   */
  async logout(): Promise<void> {
    return factoryAuthService.logout();
  },

  /**
   * Gets the current user's information from the API
   * @returns Promise with the user object or null if not authenticated
   */
  async getCurrentUser(): Promise<User | null> {
    return factoryAuthService.fetchCurrentUser();
  },

  /**
   * Refreshes the authentication token
   * @returns Promise with the refresh result
   */
  async refreshToken(): Promise<boolean> {
    return factoryAuthService.refreshToken();
  },

  /**
   * Checks if the current user has a specific permission
   * @param permission The permission to check
   * @returns True if the user has the permission, false otherwise
   */
  hasPermission(permission: string): boolean {
    return factoryAuthService.hasPermission(permission);
  }
};
