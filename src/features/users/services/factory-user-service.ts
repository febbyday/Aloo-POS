/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Factory-Based User Service
 * 
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of user-related operations with minimal duplication.
 */

import { User, UserRole, Permission } from '../types/user.types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { USER_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType } from '@/lib/api/error-handler';

/**
 * User service with standardized endpoint handling
 */
const userService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<User>('users', {
    useEnhancedClient: true,
    withRetry: {
      maxRetries: 2,
      shouldRetry: (error: any) => {
        // Only retry network or server errors
        return ![
          ApiErrorType.VALIDATION, 
          ApiErrorType.CONFLICT,
          ApiErrorType.AUTHORIZATION
        ].includes(error.type);
      }
    },
    cacheResponse: false,
    // Map response to ensure dates are properly converted
    mapResponse: (data: any) => {
      if (Array.isArray(data)) {
        return data.map(user => ({
          ...user,
          createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined
        }));
      }
      
      if (!data) return null;
      
      return {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : undefined
      };
    }
  }),
  
  // Custom methods for user-specific operations
  
  /**
   * Change user password
   */
  changePassword: createServiceMethod<void, { 
    currentPassword: string; 
    newPassword: string;
  }>('users', 'CHANGE_PASSWORD', 'post', { withRetry: false }),
  
  /**
   * Reset user password (admin operation)
   */
  resetPassword: createServiceMethod<{ 
    temporaryPassword: string 
  }, { userId: string }>('users', 'RESET_PASSWORD', 'post', { withRetry: false }),
  
  /**
   * Get user permissions
   */
  getUserPermissions: createServiceMethod<Permission[]>(
    'users', 'PERMISSIONS', 'get'
  ),
  
  /**
   * Get user roles
   */
  getUserRoles: createServiceMethod<UserRole[]>(
    'users', 'ROLES', 'get'
  ),
  
  /**
   * Assign role to user
   */
  assignRole: createServiceMethod<void, { roleId: string }>(
    'users', 'ASSIGN_ROLE', 'post',
    { withRetry: false }
  ),
  
  /**
   * Remove role from user
   */
  removeRole: createServiceMethod<void>(
    'users', 'REMOVE_ROLE', 'delete',
    { withRetry: false }
  ),
  
  /**
   * Check if username is available
   */
  isUsernameAvailable: async (username: string): Promise<boolean> => {
    try {
      const result = await createServiceMethod<{ available: boolean }>(
        'users', 'SEARCH', 'get'
      )({ username });
      
      return result.available;
    } catch (error) {
      console.error('Error checking username availability:', error);
      // Default to false if there's an error
      return false;
    }
  },
  
  /**
   * Get active users
   */
  getActiveUsers: async (): Promise<User[]> => {
    return userService.getAll({ status: 'active' });
  },
  
  /**
   * Get users by role
   */
  getUsersByRole: async (roleId: string): Promise<User[]> => {
    return createServiceMethod<User[]>(
      'users', 'SEARCH', 'get'
    )({ roleId });
  },
  
  /**
   * Update user status
   */
  updateUserStatus: async (userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<User> => {
    return userService.update(userId, { status });
  }
};

export default userService;
