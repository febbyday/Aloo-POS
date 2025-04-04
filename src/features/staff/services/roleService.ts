// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { apiClient } from '@/lib/api/api-client';
import { IRole as Role, CreateRoleData, UpdateRoleData } from '../types/role';
import { RoleSchema } from '../types/staff.types';
import { apiConfig } from '@/lib/api/config';
import { authService } from '@/features/auth/services/authService';
import { ApiHealth, ApiStatus } from '@/lib/api/api-health';
import { permissionTemplates } from '../types/permissions';
import { AUTH_CONFIG } from '@/features/auth/config/authConfig';

// Create an instance of ApiHealth
const apiHealth = new ApiHealth(apiClient);

// Development mode check
const isDevelopment = import.meta.env.MODE === 'development';

// Authentication bypass check
const isAuthBypassEnabled = AUTH_CONFIG.DEV_MODE.BYPASS_AUTH;

// API endpoint for roles - use the correct path construction
const ROLES_ENDPOINT = 'roles';

// Flag to track authentication failures
let authenticationFailed = false;

// Mock roles data for when the API is unavailable
const MOCK_ROLES: Role[] = [
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Full system access',
    permissions: permissionTemplates.administrator,
    isActive: true,
    staffCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'role-manager',
    name: 'Manager',
    description: 'Store management access',
    permissions: permissionTemplates.storeManager,
    isActive: true,
    staffCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'role-cashier',
    name: 'Cashier',
    description: 'Sales and basic inventory access',
    permissions: permissionTemplates.cashier,
    isActive: true,
    staffCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class RoleService {
  /**
   * Check if we should use mock data
   * @returns True if using mock data
   */
  isUsingMockData(): boolean {
    const forceDevMode = localStorage.getItem('force_dev_mode') === 'true';
    const apiUnavailable = apiHealth.getStatus() !== ApiStatus.AVAILABLE;
    const useLocalRoles = localStorage.getItem('default_roles') !== null;
    
    return isDevelopment && (forceDevMode || apiUnavailable || useLocalRoles);
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
   * Create a new role
   * @param roleData Role data
   * @returns Created role
   */
  async createRole(roleData: CreateRoleData): Promise<Role> {
    // Check authentication first, respecting the development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[ROLES] Authentication required to create role');
      throw new Error('Authentication required. Please log in to create roles.');
    }
    
    // Check if using mock data
    if (this.isUsingMockData()) {
      console.log('[ROLES] Creating role in development mode:', roleData.name);
      
      // Generate ID and create mock role
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: roleData.name,
        description: roleData.description || '',
        permissions: roleData.permissions,
        isActive: roleData.isActive !== undefined ? roleData.isActive : true,
        staffCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      try {
        // Get existing roles
        let roles = this.getLocalRoles();
        
        // Add new role
        roles.push(newRole);
        
        // Save roles
        this.saveLocalRoles(roles);
        
        console.log('[ROLES] Role created successfully in development mode');
        return newRole;
      } catch (error) {
        console.error('[ROLES] Error creating role in development mode:', error);
        throw new Error('Failed to create role in development mode');
      }
    }
    
    // Check if API is available
    if (apiHealth.getStatus() === ApiStatus.UNAVAILABLE) {
      console.warn('[ROLES] API unavailable, cannot create role');
      
      if (isDevelopment) {
        console.log('[ROLES] Enabling development mode for future requests');
        localStorage.setItem('force_dev_mode', 'true');
        return this.createRole(roleData);
      } else {
        throw new Error('Cannot create roles while offline. Please check your connection.');
      }
    }
    
    try {
      // Format the data correctly for the API
      // No need to transform permissions as they should already be in the correct format
      const formattedData = {
        name: roleData.name,
        description: roleData.description || '',
        permissions: roleData.permissions,
        isActive: roleData.isActive !== undefined ? roleData.isActive : true
      };

      console.log('[ROLES] Creating role via API:', roleData.name);
      const response = await apiClient.post(ROLES_ENDPOINT, formattedData);
      
      if (response.success && response.data) {
        authenticationFailed = false;
        console.log('[ROLES] Role created successfully via API');
        return RoleSchema.parse(response.data);
      } else {
        throw new Error(response.error || 'Failed to create role');
      }
    } catch (error: any) {
      console.error('[ROLES] Error creating role:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403 || 
          (error.message && (error.message.includes('Authentication') || error.message.includes('token')))) {
        authenticationFailed = true;
        throw new Error('Authentication required. Please log in to create roles.');
      }
      
      // In development mode, fall back to local roles
      if (isDevelopment && (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error'))) {
        console.log('[ROLES] API call failed, enabling development mode for future requests');
        localStorage.setItem('force_dev_mode', 'true');
        return this.createRole(roleData);
      }
      
      throw error;
    }
  }

  /**
   * Get all roles
   * @returns List of roles
   */
  async getAllRoles(): Promise<Role[]> {
    // If we've had authentication failures, don't keep trying until user logs in again
    if (authenticationFailed && !authService.isAuthenticated() && !this.canBypassAuth()) {
      console.warn('[ROLES] Skipping role fetch due to previous authentication failure');
      throw new Error('Authentication required. Please log in to view roles.');
    }
    
    // Check if using mock data
    if (this.isUsingMockData()) {
      console.log('[ROLES] Using development mode for roles');
      return this.getLocalRoles();
    }
    
    // Check if API is available
    if (apiHealth.getStatus() === ApiStatus.UNAVAILABLE) {
      console.warn('[ROLES] API unavailable, using development fallback for roles');
      
      if (isDevelopment) {
        localStorage.setItem('force_dev_mode', 'true');
        return this.getLocalRoles();
      } else {
        throw new Error('Cannot fetch roles while offline. Please check your connection.');
      }
    }
    
    try {
      console.log('[ROLES] Fetching roles from API');
      const response = await apiClient.get(ROLES_ENDPOINT);
      
      if (response.success && Array.isArray(response.data)) {
        authenticationFailed = false;
        console.log('[ROLES] Successfully fetched roles from API');
        return response.data.map((role: any) => RoleSchema.parse(role));
      } else {
        throw new Error(response.error || 'Failed to fetch roles');
      }
    } catch (error: any) {
      console.error('[ROLES] Error fetching roles:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401 || error.response?.status === 403 || 
          (error.message && (error.message.includes('Authentication') || error.message.includes('token')))) {
        authenticationFailed = true;
        throw new Error('Authentication required. Please log in to view roles.');
      }
      
      // In development mode, fall back to local roles
      if (isDevelopment) {
        console.log('[ROLES] API call failed, using development mode');
        localStorage.setItem('force_dev_mode', 'true');
        return this.getLocalRoles();
      }
      
      throw error;
    }
  }

  /**
   * Get a role by ID
   * @param id Role ID
   * @returns Role
   */
  async getRoleById(id: string): Promise<Role> {
    // If we've had authentication failures, don't keep trying until user logs in again
    if (authenticationFailed && !authService.isAuthenticated() && !this.canBypassAuth()) {
      console.warn('[ROLES] Skipping role fetch due to previous authentication failure');
      throw new Error('Authentication required. Please log in to view roles.');
    }
    
    // Check if using mock data
    if (this.isUsingMockData()) {
      console.log('[ROLES] Getting role by ID in development mode:', id);
      const roles = this.getLocalRoles();
      const role = roles.find(r => r.id === id);
      
      if (!role) {
        throw new Error(`Role with ID ${id} not found`);
      }
      
      return role;
    }
    
    try {
      console.log('[ROLES] Fetching role by ID from API:', id);
      const response = await apiClient.get(`${ROLES_ENDPOINT}/${id}`);
      
      if (response.success && response.data) {
        authenticationFailed = false;
        console.log('[ROLES] Successfully fetched role from API');
        return RoleSchema.parse(response.data);
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
      
      // In development mode, fall back to local roles
      if (isDevelopment) {
        console.log('[ROLES] API call failed, using development mode');
        const roles = this.getLocalRoles();
        const role = roles.find(r => r.id === id);
        
        if (role) {
          return role;
        }
      }
      
      throw error;
    }
  }

  /**
   * Update an existing role
   * @param id Role ID
   * @param roleData Updated role data
   * @returns Updated role
   */
  async updateRole(id: string, roleData: UpdateRoleData): Promise<Role> {
    // Check authentication first, respecting the development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[ROLES] Authentication required to update role');
      throw new Error('Authentication required. Please log in to update roles.');
    }
    
    // Check if using mock data
    if (this.isUsingMockData()) {
      console.log('[ROLES] Updating role in development mode:', id);
      
      try {
        // Get existing roles
        let roles = this.getLocalRoles();
        
        // Find role to update
        const roleIndex = roles.findIndex(r => r.id === id);
        
        if (roleIndex === -1) {
          throw new Error(`Role with ID ${id} not found`);
        }
        
        // Update role
        const updatedRole: Role = {
          ...roles[roleIndex],
          ...roleData,
          updatedAt: new Date().toISOString()
        };
        
        roles[roleIndex] = updatedRole;
        
        // Save roles
        this.saveLocalRoles(roles);
        
        console.log('[ROLES] Role updated successfully in development mode');
        return updatedRole;
      } catch (error) {
        console.error('[ROLES] Error updating role in development mode:', error);
        throw new Error('Failed to update role');
      }
    }
    
    try {
      console.log('[ROLES] Updating role via API:', id);
      const response = await apiClient.put(`${ROLES_ENDPOINT}/${id}`, roleData);
      
      if (response.success && response.data) {
        authenticationFailed = false;
        console.log('[ROLES] Role updated successfully via API');
        return RoleSchema.parse(response.data);
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
      
      // In development mode, fall back to local roles
      if (isDevelopment) {
        console.log('[ROLES] API call failed, using development mode');
        localStorage.setItem('force_dev_mode', 'true');
        return this.updateRole(id, roleData);
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
    
    // Check if using mock data
    if (this.isUsingMockData()) {
      console.log('[ROLES] Deleting role in development mode:', id);
      
      try {
        // Get existing roles
        let roles = this.getLocalRoles();
        
        // Find role to delete
        const roleIndex = roles.findIndex(r => r.id === id);
        
        if (roleIndex === -1) {
          throw new Error(`Role with ID ${id} not found`);
        }
        
        // Delete role
        roles.splice(roleIndex, 1);
        
        // Save roles
        this.saveLocalRoles(roles);
        
        console.log('[ROLES] Role deleted successfully in development mode');
        return true;
      } catch (error) {
        console.error('[ROLES] Error deleting role in development mode:', error);
        throw new Error('Failed to delete role');
      }
    }
    
    try {
      console.log('[ROLES] Deleting role via API:', id);
      const response = await apiClient.delete(`${ROLES_ENDPOINT}/${id}`);
      
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
      
      // In development mode, fall back to local roles
      if (isDevelopment) {
        console.log('[ROLES] API call failed, using development mode');
        localStorage.setItem('force_dev_mode', 'true');
        return this.deleteRole(id);
      }
      
      throw error;
    }
  }
  
  /**
   * Get locally stored roles or default mock roles
   * @private
   * @returns Roles from localStorage or default mock roles
   */
  private getLocalRoles(): Role[] {
    try {
      const storedRoles = localStorage.getItem('default_roles');
      if (storedRoles) {
        const parsedRoles = JSON.parse(storedRoles);
        console.log('[ROLES] Retrieved roles from localStorage');
        return parsedRoles;
      }
    } catch (e) {
      console.error('[ROLES] Error parsing stored roles:', e);
    }
    
    // If no stored roles or error parsing, use mock roles
    console.log('[ROLES] Using default mock roles');
    this.saveLocalRoles(MOCK_ROLES); // Save for future use
    return [...MOCK_ROLES];
  }
  
  /**
   * Save roles to localStorage
   * @private
   * @param roles Roles to save
   */
  private saveLocalRoles(roles: Role[]): void {
    try {
      localStorage.setItem('default_roles', JSON.stringify(roles));
      console.log('[ROLES] Saved roles to localStorage');
    } catch (e) {
      console.error('[ROLES] Error saving roles to localStorage:', e);
    }
  }
}

export const roleService = new RoleService();
