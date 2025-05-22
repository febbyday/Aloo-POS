/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Enhanced User Service
 *
 * This service demonstrates how to use the centralized endpoint registry
 * for API operations related to user management.
 */

import { apiClient } from '@/lib/api/api-client';
import { USER_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { getApiPath } from '@/lib/api/enhanced-config'; 
import { User, CreateUserData, UpdateUserData } from '../types/user.types';

/**
 * Enhanced User Service
 * Demonstrates the use of centralized endpoints
 */
class EnhancedUserService {
  /**
   * Get all users
   * @returns Promise with array of users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      // Using pre-defined endpoint directly from registry
      const response = await apiClient.get<User[]>(USER_ENDPOINTS.LIST);
      
      if (!response.success) {
        console.error('Failed to fetch users');
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
  
  /**
   * Get user by ID
   * @param id User ID
   * @returns User or null if not found
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      // Using getApiPath for parameterized endpoint
      const endpoint = getApiPath('users', 'DETAIL', { id });
      const response = await apiClient.get<User>(endpoint);
      
      if (!response.success) {
        console.error(`Failed to fetch user with ID ${id}`);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching user (${id}):`, error);
      return null;
    }
  }
  
  /**
   * Create a new user
   * @param userData User data
   * @returns Created user
   */
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await apiClient.post<User>(USER_ENDPOINTS.CREATE, userData);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create user');
    }
    
    return response.data;
  }
  
  /**
   * Update existing user
   * @param id User ID
   * @param userData Updated user data
   * @returns Updated user
   */
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    // Using getApiPath with parameter substitution
    const endpoint = getApiPath('users', 'UPDATE', { id });
    const response = await apiClient.put<User>(endpoint, userData);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update user');
    }
    
    return response.data;
  }
  
  /**
   * Delete a user
   * @param id User ID
   * @returns Success status
   */
  async deleteUser(id: string): Promise<boolean> {
    // Using getApiPath with parameter substitution
    const endpoint = getApiPath('users', 'DELETE', { id });
    const response = await apiClient.delete(endpoint);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete user');
    }
    
    return true;
  }
  
  /**
   * Change user password
   * @param id User ID
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Success status
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // Using getApiPath with parameter substitution
    const endpoint = getApiPath('users', 'CHANGE_PASSWORD', { id });
    const response = await apiClient.post(endpoint, {
      currentPassword,
      newPassword
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to change password');
    }
    
    return true;
  }
  
  /**
   * Reset user password
   * @param id User ID
   * @param newPassword New password
   * @returns Success status
   */
  async resetPassword(id: string, newPassword: string): Promise<boolean> {
    // Using getApiPath with parameter substitution
    const endpoint = getApiPath('users', 'RESET_PASSWORD', { id });
    const response = await apiClient.post(endpoint, { newPassword });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to reset password');
    }
    
    return true;
  }
}

// Export singleton instance
export const enhancedUserService = new EnhancedUserService();
