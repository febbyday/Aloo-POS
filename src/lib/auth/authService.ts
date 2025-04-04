/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Authentication Service
 * Provides authentication-related functionality for the application
 */

import { apiClient } from '../api/api-client';
import { getApiEndpoint } from '../api/config';
import { User, LoginResponse, LoginCredentials } from '../../features/auth/types/auth.types';

// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// API endpoints
const AUTH_ENDPOINT = getApiEndpoint('auth');

/**
 * Authentication Service
 * Handles user authentication, token management, and session validation
 */
export const authService = {
  /**
   * Checks if the user is currently authenticated
   * @returns True if the user has a valid token, false otherwise
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  /**
   * Gets the current authentication token
   * @returns The authentication token or null if not authenticated
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Sets the authentication token
   * @param token The token to store
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Clears the authentication token and user data
   */
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Gets the current user from local storage
   * @returns The user object or null if not found
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson) as User;
    } catch (err) {
      console.error('Failed to parse user data:', err);
      return null;
    }
  },

  /**
   * Sets the user data in local storage
   * @param user The user object to store
   */
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Logs the user in
   * @param credentials The login credentials
   * @returns Promise with the login result
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse, LoginCredentials>(`${AUTH_ENDPOINT}/login`, credentials);
      
      if (response.success && response.data) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logs the user out
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      
      if (token) {
        // Attempt to invalidate the token on the server
        await apiClient.post(`${AUTH_ENDPOINT}/logout`, { token });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage regardless of API response
      this.clearToken();
    }
  },

  /**
   * Gets the current user's information from the API
   * @returns Promise with the user object or null if not authenticated
   */
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    
    if (!token) {
      return null;
    }
    
    try {
      const response = await apiClient.get<User>(`${AUTH_ENDPOINT}/me`);
      
      if (response.success && response.data) {
        // Update the cached user
        this.setUser(response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      
      // If API call fails, try to use cached user
      return this.getUser();
    }
  },

  /**
   * Refreshes the authentication token
   * @returns Promise with the refresh result
   */
  async refreshToken(): Promise<boolean> {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }
    
    try {
      const response = await apiClient.post<{ token: string }>(`${AUTH_ENDPOINT}/refresh`, { token });
      
      if (response.success && response.data) {
        this.setToken(response.data.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  },

  /**
   * Checks if the current user has a specific permission
   * @param permission The permission to check
   * @returns True if the user has the permission, false otherwise
   */
  hasPermission(permission: string): boolean {
    const user = this.getUser();
    
    if (!user || !user.permissions) {
      return false;
    }
    
    return user.permissions.includes(permission);
  }
};
