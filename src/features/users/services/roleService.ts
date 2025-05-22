import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { IRole as Role, CreateRoleData, UpdateRoleData } from '../types/role';
import { authService } from '@/features/auth/services/authService';
import { ApiHealth } from '@/lib/api/api-health';
import { AUTH_CONFIG } from '@/features/auth/config/authConfig';
import { Permissions } from '@/shared/schemas/permissions';
import {
  unifiedPermissionConverter,
  enhancedPermissionsToStringArray
} from '@/shared/utils/enhancedPermissionUtils';

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
      // Check if the API server is reachable with a simple fetch
      console.log('[ROLES] Testing direct API connection...');
      try {
        const testUrl = 'http://localhost:5000/api/v1/health';
        console.log('[ROLES] Testing connectivity to:', testUrl);
        const networkTest = await fetch(testUrl, { 
          method: 'GET',
          mode: 'cors',
          headers: { 'Accept': 'application/json' },
          credentials: 'include'
        });
        console.log('[ROLES] Network test result:', networkTest.status, networkTest.statusText);
      } catch (networkError) {
        console.error('[ROLES] Network test failed:', networkError);
        console.error('[ROLES] API SERVER IS NOT RUNNING OR NOT REACHABLE AT http://localhost:5000');
      }

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
      console.error('[ROLES] API Debug connection failed:', error);
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
    // Use the auth bypass setting from AUTH_CONFIG
    return isAuthBypassEnabled;
  }

  /**
   * Get all roles
   * @returns List of roles from the API with standardized permissions
   */
  async getAllRoles(): Promise<Role[]> {
    console.log('[ROLES] Starting getAllRoles() - Dev mode bypass:', this.canBypassAuth(), 'Auth state:', authService.isAuthenticated());
    
    // If we've had authentication failures, don't keep trying until user logs in again
    if (authenticationFailed && !authService.isAuthenticated() && !this.canBypassAuth()) {
      console.warn('[ROLES] Skipping role fetch due to previous authentication failure');
      throw new Error('Authentication required. Please log in to view roles.');
    }

    try {
      console.log('[ROLES] Fetching roles from API');
      
      // Debug the URL construction 
      const api_host = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const api_version = import.meta.env.VITE_API_VERSION || 'v1';
      const expected_url = `${api_host}/api/${api_version}/roles`;
      console.log('[ROLES] Expected API URL:', expected_url);
      
      // Log auth status for debugging
      console.log('[ROLES] Auth status - Authenticated:', authService.isAuthenticated());
      // No need to check for token as it may be in HttpOnly cookies
      
      const response = await enhancedApiClient.get('roles/LIST');
      console.log('[ROLES] API response structure:', Object.keys(response));

      // Handle different API response formats
      let rolesData = [];
      if (response.success && Array.isArray(response.data)) {
        console.log('[ROLES] Found roles in response.data array');
        rolesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Handle format: { success: true, message: "", data: [...] }
        console.log('[ROLES] Found roles in response.data.data array');
        rolesData = response.data.data;
      } else if (Array.isArray(response)) {
        // Handle direct array response
        console.log('[ROLES] Found roles in direct array response');
        rolesData = response;
      } else {
        console.error('[ROLES] Unexpected API response format:', response);
        // Instead of throwing, return empty array to prevent crashes
        console.warn('[ROLES] Returning empty array to prevent application crash');
        return [];
      }

      authenticationFailed = false;
      console.log('[ROLES] Successfully fetched roles from API, count:', rolesData.length);

      // Ensure we have roles data
      if (rolesData.length === 0) {
        console.log('[ROLES] Empty roles array returned from API');
      }

      // Convert permissions to standardized format for each role
      const rolesWithStandardizedPermissions = rolesData.map((role: any) => ({
        ...role,
        // Ensure staffCount exists (default to 0 if not provided)
        staffCount: role.staffCount || 0,
        // Convert permissions to standardized format
        permissions: unifiedPermissionConverter(role.permissions)
      }));

      return rolesWithStandardizedPermissions;
    } catch (error: any) {
      console.error('[ROLES] Error fetching roles from real API:', error);
      console.error('[ROLES] API error details:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('[ROLES] API SERVER IS NOT RUNNING at http://localhost:5000');
        console.error('[ROLES] Start your API server, then refresh the browser');
      }

      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403 ||
          (error.message && (error.message.includes('Authentication') || error.message.includes('token')))) {
        authenticationFailed = true;
      }
      
      // Return empty array to prevent application crash in development
      // No mock data, just an empty array to allow the application to render
      console.warn('[ROLES] Returning empty array to prevent application crash');
      return [];
    }
  }
  
  // No fallback roles - only use real API data



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
          permissions: unifiedPermissionConverter(response.data.permissions)
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
      const permissionsArray = enhancedPermissionsToStringArray ? 
        enhancedPermissionsToStringArray(roleData.permissions as Permissions) : 
        Object.entries(roleData.permissions || {}).map(([key, value]) => `${key}:${Object.keys(value).filter(k => value[k]).join(',')}`);

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
          permissions: unifiedPermissionConverter(response.data.permissions)
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
        formattedRoleData.permissions = enhancedPermissionsToStringArray ? 
          enhancedPermissionsToStringArray(formattedRoleData.permissions as Permissions) : 
          Object.entries(formattedRoleData.permissions as Permissions).map(([key, value]) => 
            `${key}:${Object.keys(value).filter(k => value[k]).join(',')}`);
      }

      console.log('[ROLES] Updating role via API:', id);
      const response = await enhancedApiClient.put('roles/UPDATE', formattedRoleData, { id });

      if (response.success && response.data) {
        authenticationFailed = false;
        console.log('[ROLES] Role updated successfully via API');

        // Convert permissions to standardized format
        const roleWithStandardizedPermissions = {
          ...response.data,
          permissions: unifiedPermissionConverter(response.data.permissions)
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
}

// Create and export a singleton instance of the RoleService
export const roleService = new RoleService();
