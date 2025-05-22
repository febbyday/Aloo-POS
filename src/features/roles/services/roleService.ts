/**
 * Role Service
 *
 * Centralized service for managing roles across the application.
 */

import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { IRole as Role, CreateRoleData, UpdateRoleData } from '../types/role';
import { authService } from '@/features/auth/services/authService';
import { ApiHealth } from '@/lib/api/api-health';
import { AUTH_CONFIG } from '@/features/auth/config/authConfig';
import { Permissions } from '@/shared/schemas/permissions';
import { permissionsToStringArray, stringArrayToPermissions, convertLegacyPermissions } from '@/shared/utils/permissionUtils';

// Create an instance of ApiHealth
const apiHealth = new ApiHealth(enhancedApiClient);

// Authentication bypass check
const isAuthBypassEnabled = AUTH_CONFIG.DEV_MODE.BYPASS_AUTH;

// Flag to track authentication failures
let authenticationFailed = false;

// No mock roles - using only real API data

export class RoleService {
  /**
   * Check if we should use mock data
   * @returns Always returns false - we only use real API data
   */
  isUsingMockData(): boolean {
    return false;
  }

  /**
   * Clear mock data flags and force using real API
   * @returns Always returns true - no mock data to clear
   */
  clearMockDataFlags(): boolean {
    // Force a new API health check
    apiHealth.checkHealth();
    return true;
  }

  /**
   * Debug API connectivity
   * @returns Debug information
   */
  async debugApiConnectivity(): Promise<any> {
    try {
      // Check API health
      await apiHealth.checkHealth();

      // Try to fetch roles directly using standard LIST endpoint (from createStandardCrudEndpoints)
      const response = await enhancedApiClient.get('roles/LIST');

      return {
        apiHealth: apiHealth.getStatus(),
        apiResponse: response.success ? 'Success' : 'Failed',
        error: response.error || null,
        usingMockData: this.isUsingMockData(),
        preferRealApi: true,
        forceDevMode: false,
        hasLocalRoles: false
      };
    } catch (error) {
      return {
        apiHealth: apiHealth.getStatus(),
        apiResponse: 'Error',
        error: error instanceof Error ? error.message : String(error),
        usingMockData: this.isUsingMockData(),
        preferRealApi: true,
        forceDevMode: false,
        hasLocalRoles: false
      };
    }
  }

  /**
   * Check if authentication can be bypassed
   * @returns True if authentication can be bypassed
   */
  canBypassAuth(): boolean {
    // In development mode, always return true to bypass authentication checks
    if (import.meta.env.DEV) {
      console.log('[ROLES] Development mode: Authentication bypass enabled');
      return true;
    }
    // Use the auth bypass setting from AUTH_CONFIG as fallback
    return isAuthBypassEnabled;
  }

  /**
   * Get all roles
   * @returns List of roles from the API with standardized permissions
   */
  async getAllRoles(): Promise<Role[]> {
    // If we've had authentication failures, don't keep trying until user logs in again
    if (authenticationFailed && !authService.isAuthenticated() && !this.canBypassAuth()) {
      console.warn('[ROLES] Skipping role fetch due to previous authentication failure');
      throw new Error('Authentication required. Please log in to view roles.');
    }

    try {
      console.log('[ROLES] Fetching roles from API');
      const response = await enhancedApiClient.get('roles/LIST');

      if (response.success && Array.isArray(response.data)) {
        authenticationFailed = false;
        console.log('[ROLES] Successfully fetched roles from API');

        // Convert permissions to standardized format for each role
        const rolesWithStandardizedPermissions = response.data.map(role => ({
          ...role,
          permissions: convertLegacyPermissions(role.permissions)
        }));

        return rolesWithStandardizedPermissions;
      } else {
        throw new Error(response.error || 'Failed to fetch roles');
      }
    } catch (error: any) {
      console.error('[ROLES] Error fetching roles from real API:', error);

      // Never use mock data for roles, even in case of API failure
      console.warn('[ROLES] Real API connection required for roles - no fallback to mock data');

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403 ||
          (error.message && (error.message.includes('Authentication') || error.message.includes('token')))) {
        authenticationFailed = true;
        throw new Error('Authentication required. Please log in to view roles.');
      }

      // Always throw the error - never fall back to mock data
      throw error;
    }
  }

  /**
   * Get a role by ID
   * @param id Role ID
   * @returns Role from the API with standardized permissions
   */
  async getRoleById(id: string): Promise<Role> {
    // If we've had authentication failures, don't keep trying until user logs in again
    if (authenticationFailed && !authService.isAuthenticated() && !this.canBypassAuth()) {
      console.warn('[ROLES] Skipping role fetch due to previous authentication failure');
      throw new Error('Authentication required. Please log in to view roles.');
    }

    try {
      console.log('[ROLES] Fetching role by ID from API:', id);
      const response = await enhancedApiClient.get('roles/DETAIL', { id });

      if (response.success && response.data) {
        authenticationFailed = false;
        console.log('[ROLES] Successfully fetched role from API');

        // Convert permissions to standardized format
        const roleWithStandardizedPermissions = {
          ...response.data,
          permissions: convertLegacyPermissions(response.data.permissions)
        };

        return roleWithStandardizedPermissions;
      } else {
        throw new Error(response.error || 'Failed to fetch role');
      }
    } catch (error: any) {
      console.error('[ROLES] Error fetching role by ID:', error);

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403 ||
          (error.message && (error.message.includes('Authentication') || error.message.includes('token')))) {
        authenticationFailed = true;
        throw new Error('Authentication required. Please log in to view roles.');
      }

      throw error;
    }
  }

  /**
   * Create a new role
   * @param roleData Role data
   * @returns Created role from the API with standardized permissions
   */
  async createRole(roleData: CreateRoleData): Promise<Role> {
    // Check authentication first, respecting the development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[ROLES] Authentication required to create role');
      throw new Error('Authentication required. Please log in to create roles.');
    }

    try {
      // Convert permissions to string array format for API
      const permissionsArray = permissionsToStringArray(roleData.permissions as Permissions);

      // Format the data correctly for the API
      const formattedData = {
        name: roleData.name,
        description: roleData.description || '',
        permissions: permissionsArray,
        isActive: roleData.isActive !== undefined ? roleData.isActive : true
      };

      console.log('[ROLES] Attempting to create role via API:', roleData.name);

      // Use a longer timeout for role creation
      const response = await enhancedApiClient.post('roles/CREATE', formattedData, {
        timeout: '60000' // 60 seconds timeout for role creation as a string
      });

      if (response.success && response.data) {
        authenticationFailed = false;
        console.log('[ROLES] Role created successfully via API');

        // Convert permissions to standardized format
        const roleWithStandardizedPermissions = {
          ...response.data,
          permissions: convertLegacyPermissions(response.data.permissions)
        };

        return roleWithStandardizedPermissions;
      } else {
        throw new Error(response.error || 'Failed to create role');
      }
    } catch (error: any) {
      console.error('[ROLES] Error creating role via API:', error);
      throw error;
    }
  }

  /**
   * Update an existing role
   * @param id Role ID
   * @param roleData Updated role data
   * @returns Updated role from the API with standardized permissions
   */
  async updateRole(id: string, roleData: UpdateRoleData): Promise<Role> {
    // Check authentication first, respecting the development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[ROLES] Authentication required to update role');
      throw new Error('Authentication required. Please log in to update roles.');
    }

    try {
      // Convert permissions to string array format for API if present
      const formattedRoleData = { ...roleData };

      if (formattedRoleData.permissions) {
        formattedRoleData.permissions = permissionsToStringArray(formattedRoleData.permissions as Permissions);
      }

      console.log('[ROLES] Updating role via API:', id);
      const response = await enhancedApiClient.put('roles/UPDATE', formattedRoleData, { id });

      if (response.success && response.data) {
        authenticationFailed = false;
        console.log('[ROLES] Role updated successfully via API');

        // Convert permissions to standardized format
        const roleWithStandardizedPermissions = {
          ...response.data,
          permissions: convertLegacyPermissions(response.data.permissions)
        };

        return roleWithStandardizedPermissions;
      } else {
        throw new Error(response.error || 'Failed to update role');
      }
    } catch (error: any) {
      console.error('[ROLES] Error updating role:', error);

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403 ||
          (error.message && (error.message.includes('Authentication') || error.message.includes('token')))) {
        authenticationFailed = true;
        throw new Error('Authentication required. Please log in to update roles.');
      }

      throw error;
    }
  }

  /**
   * Delete a role
   * @param id Role ID
   * @returns True if successful
   */
  async deleteRole(id: string): Promise<boolean> {
    // Check authentication first, respecting the development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[ROLES] Authentication required to delete role');
      throw new Error('Authentication required. Please log in to delete roles.');
    }

    try {
      console.log('[ROLES] Deleting role via API:', id);
      const response = await enhancedApiClient.delete('roles/DELETE', { id });

      if (response.success) {
        authenticationFailed = false;
        console.log('[ROLES] Role deleted successfully via API');
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete role');
      }
    } catch (error: any) {
      console.error('[ROLES] Error deleting role:', error);

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403 ||
          (error.message && (error.message.includes('Authentication') || error.message.includes('token')))) {
        authenticationFailed = true;
        throw new Error('Authentication required. Please log in to delete roles.');
      }

      throw error;
    }
  }

  /**
   * Get users assigned to a role
   * @param roleId Role ID
   * @returns List of users with this role
   */
  async getUsersWithRole(roleId: string): Promise<any[]> {
    // Check authentication first, respecting the development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[ROLES] Authentication required to get users with role');
      throw new Error('Authentication required. Please log in to view role assignments.');
    }

    try {
      console.log('[ROLES] Fetching users with role from API:', roleId);
      const response = await enhancedApiClient.get('roles/USERS', { id: roleId });

      if (response.success && Array.isArray(response.data)) {
        authenticationFailed = false;
        console.log('[ROLES] Successfully fetched users with role from API');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch users with role');
      }
    } catch (error: any) {
      console.error('[ROLES] Error fetching users with role:', error);

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403 ||
          (error.message && (error.message.includes('Authentication') || error.message.includes('token')))) {
        authenticationFailed = true;
        throw new Error('Authentication required. Please log in to view role assignments.');
      }

      throw error;
    }
  }

  /**
   * Assign a user to a role
   * @param userId User ID
   * @param roleId Role ID
   * @returns True if successful
   */
  async assignUserToRole(userId: string, roleId: string): Promise<boolean> {
    // Check authentication first, respecting the development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[ROLES] Authentication required to assign user to role');
      throw new Error('Authentication required. Please log in to manage role assignments.');
    }

    try {
      console.log('[ROLES] Assigning user to role via API:', { userId, roleId });
      const response = await enhancedApiClient.post('roles/ASSIGN_USER', { userId, roleId });

      if (response.success) {
        authenticationFailed = false;
        console.log('[ROLES] User assigned to role successfully via API');
        return true;
      } else {
        throw new Error(response.error || 'Failed to assign user to role');
      }
    } catch (error: any) {
      console.error('[ROLES] Error assigning user to role:', error);

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403 ||
          (error.message && (error.message.includes('Authentication') || error.message.includes('token')))) {
        authenticationFailed = true;
        throw new Error('Authentication required. Please log in to manage role assignments.');
      }

      throw error;
    }
  }

  /**
   * Remove a user from a role
   * @param userId User ID
   * @param roleId Role ID
   * @returns True if successful
   */
  async removeUserFromRole(userId: string, roleId: string): Promise<boolean> {
    // Check authentication first, respecting the development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[ROLES] Authentication required to remove user from role');
      throw new Error('Authentication required. Please log in to manage role assignments.');
    }

    try {
      console.log('[ROLES] Removing user from role via API:', { userId, roleId });
      const response = await enhancedApiClient.delete('roles/REMOVE_USER', { userId, roleId });

      if (response.success) {
        authenticationFailed = false;
        console.log('[ROLES] User removed from role successfully via API');
        return true;
      } else {
        throw new Error(response.error || 'Failed to remove user from role');
      }
    } catch (error: any) {
      console.error('[ROLES] Error removing user from role:', error);

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403 ||
          (error.message && (error.message.includes('Authentication') || error.message.includes('token')))) {
        authenticationFailed = true;
        throw new Error('Authentication required. Please log in to manage role assignments.');
      }

      throw error;
    }
  }
}

// Create and export a singleton instance of the RoleService
export const roleService = new RoleService();
