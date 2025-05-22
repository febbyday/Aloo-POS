/**
 * Batch-Enabled User Service
 * 
 * This service provides methods for interacting with the user API
 * using batch requests during initialization to improve performance.
 */

import { BatchBaseService } from '@/lib/api/services/batch-base-service';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { logger } from '@/lib/logging/logger';
import { User, UserFilter, UserFormData } from '../types/user.types';
import { UserSettings } from '../context/BatchUserSettingsContext';

/**
 * Batch-enabled user service
 */
export class BatchUserService extends BatchBaseService<User> {
  /**
   * Create a new batch-enabled user service
   */
  constructor() {
    super({
      serviceName: 'user',
      endpoint: 'users',
      defaultPriority: RequestPriority.HIGH,
      trackPerformance: true,
      useBatchManager: true
    });
  }
  
  /**
   * Get all users
   * 
   * @param filter Optional filter parameters
   * @returns Promise that resolves with an array of users
   */
  async getAll(filter?: UserFilter): Promise<User[]> {
    try {
      return await this.get<User[]>('LIST', filter);
    } catch (error) {
      logger.error('Error getting all users', { error, filter });
      throw error;
    }
  }
  
  /**
   * Get a user by ID
   * 
   * @param id User ID
   * @returns Promise that resolves with the user
   */
  async getById(id: string): Promise<User> {
    try {
      return await this.get<User>(`GET/${id}`);
    } catch (error) {
      logger.error('Error getting user by ID', { error, id });
      throw error;
    }
  }
  
  /**
   * Get current user profile
   * 
   * @returns Promise that resolves with the current user
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await this.get<User>('PROFILE', undefined, RequestPriority.CRITICAL);
    } catch (error) {
      logger.error('Error getting current user', { error });
      throw error;
    }
  }
  
  /**
   * Create a new user
   * 
   * @param user User data
   * @returns Promise that resolves with the created user
   */
  async create(user: UserFormData): Promise<User> {
    try {
      return await this.post<User>('CREATE', user);
    } catch (error) {
      logger.error('Error creating user', { error, user });
      throw error;
    }
  }
  
  /**
   * Update a user
   * 
   * @param id User ID
   * @param user User data
   * @returns Promise that resolves with the updated user
   */
  async update(id: string, user: Partial<UserFormData>): Promise<User> {
    try {
      return await this.post<User>('UPDATE', {
        id,
        ...user
      });
    } catch (error) {
      logger.error('Error updating user', { error, id, user });
      throw error;
    }
  }
  
  /**
   * Delete a user
   * 
   * @param id User ID
   * @returns Promise that resolves when the user is deleted
   */
  async delete(id: string): Promise<void> {
    try {
      await this.post('DELETE', { id });
    } catch (error) {
      logger.error('Error deleting user', { error, id });
      throw error;
    }
  }
  
  /**
   * Get user permissions
   * 
   * @param id User ID
   * @returns Promise that resolves with the user permissions
   */
  async getPermissions(id?: string): Promise<string[]> {
    try {
      return await this.get<string[]>('PERMISSIONS', id ? { id } : undefined, RequestPriority.CRITICAL);
    } catch (error) {
      logger.error('Error getting user permissions', { error, id });
      throw error;
    }
  }
  
  /**
   * Update user permissions
   * 
   * @param id User ID
   * @param permissions Permissions to update
   * @returns Promise that resolves when the permissions are updated
   */
  async updatePermissions(id: string, permissions: string[]): Promise<void> {
    try {
      await this.post('UPDATE_PERMISSIONS', { id, permissions });
    } catch (error) {
      logger.error('Error updating user permissions', { error, id, permissions });
      throw error;
    }
  }
  
  /**
   * Get user settings
   * 
   * @returns Promise that resolves with the user settings
   */
  async getSettings(): Promise<UserSettings> {
    try {
      return await this.get<UserSettings>('SETTINGS', undefined, RequestPriority.MEDIUM);
    } catch (error) {
      logger.error('Error getting user settings', { error });
      throw error;
    }
  }
  
  /**
   * Update user settings
   * 
   * @param settings Settings to update
   * @returns Promise that resolves when the settings are updated
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      await this.post('UPDATE_SETTINGS', settings, RequestPriority.LOW);
    } catch (error) {
      logger.error('Error updating user settings', { error, settings });
      throw error;
    }
  }
  
  /**
   * Reset user settings
   * 
   * @returns Promise that resolves when the settings are reset
   */
  async resetSettings(): Promise<void> {
    try {
      await this.post('RESET_SETTINGS', undefined, RequestPriority.LOW);
    } catch (error) {
      logger.error('Error resetting user settings', { error });
      throw error;
    }
  }
  
  /**
   * Change user password
   * 
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Promise that resolves when the password is changed
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.post('CHANGE_PASSWORD', { currentPassword, newPassword });
    } catch (error) {
      logger.error('Error changing user password', { error });
      throw error;
    }
  }
  
  /**
   * Set user PIN
   * 
   * @param pin PIN to set
   * @returns Promise that resolves when the PIN is set
   */
  async setPin(pin: string): Promise<void> {
    try {
      await this.post('SET_PIN', { pin });
    } catch (error) {
      logger.error('Error setting user PIN', { error });
      throw error;
    }
  }
  
  /**
   * Verify user PIN
   * 
   * @param pin PIN to verify
   * @returns Promise that resolves with a boolean indicating if the PIN is valid
   */
  async verifyPin(pin: string): Promise<boolean> {
    try {
      const response = await this.post<{ valid: boolean }>('VERIFY_PIN', { pin });
      return response.valid;
    } catch (error) {
      logger.error('Error verifying user PIN', { error });
      return false;
    }
  }
  
  /**
   * Search users
   * 
   * @param query Search query
   * @param filter Optional filter parameters
   * @returns Promise that resolves with an array of users
   */
  async search(query: string, filter?: UserFilter): Promise<User[]> {
    try {
      return await this.get<User[]>('SEARCH', {
        ...filter,
        query
      });
    } catch (error) {
      logger.error('Error searching users', { error, query, filter });
      throw error;
    }
  }
}

// Create a singleton instance
export const batchUserService = new BatchUserService();

export default batchUserService;
