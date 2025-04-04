/**
 * User Service
 * 
 * This service handles user management operations.
 * It provides methods for creating, updating, and deleting users.
 */

import { apiClient } from '@/lib/api/api-client';
import { User, CreateUserData, UpdateUserData, UserSchema, UserRole, UserFilterOptions, UserListResponse, USER_EVENTS } from '../types/user.types';
import { authService } from '@/features/auth/services/authService';
import { AUTH_CONFIG } from '@/features/auth/config/authConfig';
import { ApiHealth, ApiStatus } from '@/lib/api/api-health';
import { AUTH_EVENTS } from '@/features/auth/types/auth.types';

// API endpoint for users
const USERS_ENDPOINT = 'users';

// Create an instance of ApiHealth
const apiHealth = new ApiHealth(apiClient);

// Development mode check
const isDevelopment = import.meta.env.MODE === 'development';

// Authentication bypass check
const isAuthBypassEnabled = AUTH_CONFIG.DEV_MODE.BYPASS_AUTH;

// Mock users for development mode
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
    role: UserRole.ADMIN,
    roleId: 'role-admin',
    permissions: ['*'],
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'manager',
    email: 'manager@example.com',
    firstName: 'Store',
    lastName: 'Manager',
    fullName: 'Store Manager',
    role: UserRole.MANAGER,
    roleId: 'role-manager',
    permissions: ['users.view', 'users.create', 'users.update', 'inventory.view', 'inventory.create', 'inventory.update', 'sales.view', 'sales.create'],
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    username: 'cashier',
    email: 'cashier@example.com',
    firstName: 'Cashier',
    lastName: 'User',
    fullName: 'Cashier User',
    role: UserRole.CASHIER,
    roleId: 'role-cashier',
    permissions: ['sales.view', 'sales.create'],
    isActive: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * User Service
 * Provides methods for user management
 */
class UserService {
  /**
   * Check if we should use mock data
   * @returns True if using mock data
   */
  isUsingMockData(): boolean {
    const forceDevMode = localStorage.getItem('force_dev_mode') === 'true';
    const apiUnavailable = apiHealth.getStatus() !== ApiStatus.AVAILABLE;
    
    return isDevelopment && (forceDevMode || apiUnavailable);
  }
  
  /**
   * Check if authentication can be bypassed
   * @returns True if authentication can be bypassed
   */
  canBypassAuth(): boolean {
    return isAuthBypassEnabled;
  }

  /**
   * Handle authentication errors
   * @param error The error to handle
   * @returns True if the error was handled
   */
  private async handleAuthError(error: any): Promise<boolean> {
    // Check if this is an authentication error
    if (error?.message?.includes('Authentication required') || 
        error?.message?.includes('Unauthorized') ||
        error?.status === 401) {
      
      console.log('[USERS] Authentication error detected, attempting token refresh');
      
      try {
        // Attempt to refresh the token
        const refreshResult = await authService.refreshToken();
        
        if (refreshResult) {
          console.log('[USERS] Token refreshed successfully');
          
          // Dispatch token refreshed event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_REFRESHED, {
              detail: { timestamp: new Date().toISOString() }
            }));
          }
          
          return true;
        } else {
          console.error('[USERS] Token refresh failed');
          return false;
        }
      } catch (refreshError) {
        console.error('[USERS] Error during token refresh:', refreshError);
        return false;
      }
    }
    
    return false;
  }

  /**
   * Get all users
   * @param filters Optional filters for the user list
   * @param retryCount Number of retries attempted
   * @returns Promise with array of users
   */
  async getAllUsers(filters?: UserFilterOptions, retryCount = 0): Promise<User[]> {
    // Check authentication first, respecting development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[USERS] Authentication required to fetch users');
      
      // Try to refresh the token
      const refreshResult = await authService.refreshToken();
      
      if (!refreshResult) {
        throw new Error('Authentication required. Please log in to view users.');
      }
    }
    
    if (this.isUsingMockData()) {
      console.log('[USERS] Using mock data for getAllUsers');
      
      // Apply filters to mock data
      let filteredUsers = [...MOCK_USERS];
      
      if (filters) {
        // Apply search filter
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.username.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search) ||
            user.firstName.toLowerCase().includes(search) ||
            user.lastName.toLowerCase().includes(search) ||
            (user.fullName && user.fullName.toLowerCase().includes(search))
          );
        }
        
        // Apply role filter
        if (filters.role) {
          filteredUsers = filteredUsers.filter(user => user.role === filters.role);
        }
        
        // Apply active filter
        if (filters.isActive !== undefined) {
          filteredUsers = filteredUsers.filter(user => user.isActive === filters.isActive);
        }
        
        // Apply sorting
        if (filters.sortBy) {
          filteredUsers.sort((a, b) => {
            let valueA: any = a[filters.sortBy as keyof User];
            let valueB: any = b[filters.sortBy as keyof User];
            
            // Handle null/undefined values
            if (valueA === null || valueA === undefined) valueA = '';
            if (valueB === null || valueB === undefined) valueB = '';
            
            // Compare values
            if (typeof valueA === 'string' && typeof valueB === 'string') {
              return filters.sortOrder === 'desc' 
                ? valueB.localeCompare(valueA) 
                : valueA.localeCompare(valueB);
            } else {
              return filters.sortOrder === 'desc' 
                ? (valueB > valueA ? 1 : -1) 
                : (valueA > valueB ? 1 : -1);
            }
          });
        }
      }
      
      return filteredUsers;
    }
    
    try {
      // Build query parameters
      let queryParams = '';
      
      if (filters) {
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.role) params.append('role', filters.role);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        
        queryParams = `?${params.toString()}`;
      }
      
      const response = await apiClient.get(`${USERS_ENDPOINT}${queryParams}`);
      
      if (response.success && response.data) {
        // Check if the response is a paginated response or just an array
        if (Array.isArray(response.data)) {
          return response.data.map((user: any) => UserSchema.parse(user));
        } else if (response.data.users && Array.isArray(response.data.users)) {
          return response.data.users.map((user: any) => UserSchema.parse(user));
        } else {
          return [];
        }
      } else {
        throw new Error(response.error || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log('[USERS] Retrying getAllUsers after token refresh');
        return this.getAllUsers(filters, retryCount + 1);
      }
      
      // Return mock users in development mode if API fails
      if (isDevelopment) {
        console.log('[USERS] API failed, returning mock data');
        return [...MOCK_USERS];
      }
      
      throw error;
    }
  }

  /**
   * Get paginated user list
   * @param filters Optional filters for the user list
   * @param retryCount Number of retries attempted
   * @returns Promise with paginated user list
   */
  async getUserList(filters?: UserFilterOptions, retryCount = 0): Promise<UserListResponse> {
    // Check authentication first, respecting development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[USERS] Authentication required to fetch users');
      
      // Try to refresh the token
      const refreshResult = await authService.refreshToken();
      
      if (!refreshResult) {
        throw new Error('Authentication required. Please log in to view users.');
      }
    }
    
    if (this.isUsingMockData()) {
      console.log('[USERS] Using mock data for getUserList');
      
      // Apply filters to mock data
      let filteredUsers = [...MOCK_USERS];
      
      if (filters) {
        // Apply search filter
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.username.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search) ||
            user.firstName.toLowerCase().includes(search) ||
            user.lastName.toLowerCase().includes(search) ||
            (user.fullName && user.fullName.toLowerCase().includes(search))
          );
        }
        
        // Apply role filter
        if (filters.role) {
          filteredUsers = filteredUsers.filter(user => user.role === filters.role);
        }
        
        // Apply active filter
        if (filters.isActive !== undefined) {
          filteredUsers = filteredUsers.filter(user => user.isActive === filters.isActive);
        }
        
        // Apply sorting
        if (filters.sortBy) {
          filteredUsers.sort((a, b) => {
            let valueA: any = a[filters.sortBy as keyof User];
            let valueB: any = b[filters.sortBy as keyof User];
            
            // Handle null/undefined values
            if (valueA === null || valueA === undefined) valueA = '';
            if (valueB === null || valueB === undefined) valueB = '';
            
            // Compare values
            if (typeof valueA === 'string' && typeof valueB === 'string') {
              return filters.sortOrder === 'desc' 
                ? valueB.localeCompare(valueA) 
                : valueA.localeCompare(valueB);
            } else {
              return filters.sortOrder === 'desc' 
                ? (valueB > valueA ? 1 : -1) 
                : (valueA > valueB ? 1 : -1);
            }
          });
        }
      }
      
      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      return {
        users: paginatedUsers,
        total: filteredUsers.length,
        page,
        limit,
        totalPages: Math.ceil(filteredUsers.length / limit)
      };
    }
    
    try {
      // Build query parameters
      let queryParams = '';
      
      if (filters) {
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.role) params.append('role', filters.role);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        
        queryParams = `?${params.toString()}`;
      }
      
      const response = await apiClient.get(`${USERS_ENDPOINT}${queryParams}`);
      
      if (response.success && response.data) {
        // Check if the response is a paginated response
        if (response.data.users && Array.isArray(response.data.users)) {
          return {
            users: response.data.users.map((user: any) => UserSchema.parse(user)),
            total: response.data.total || response.data.users.length,
            page: response.data.page || 1,
            limit: response.data.limit || 10,
            totalPages: response.data.totalPages || Math.ceil((response.data.total || response.data.users.length) / (response.data.limit || 10))
          };
        } else if (Array.isArray(response.data)) {
          // If it's just an array, create a pagination response
          const users = response.data.map((user: any) => UserSchema.parse(user));
          const page = filters?.page || 1;
          const limit = filters?.limit || 10;
          
          return {
            users,
            total: users.length,
            page,
            limit,
            totalPages: Math.ceil(users.length / limit)
          };
        } else {
          return {
            users: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
          };
        }
      } else {
        throw new Error(response.error || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log('[USERS] Retrying getUserList after token refresh');
        return this.getUserList(filters, retryCount + 1);
      }
      
      // Return mock users in development mode if API fails
      if (isDevelopment) {
        console.log('[USERS] API failed, returning mock data');
        
        // Apply pagination
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = MOCK_USERS.slice(startIndex, endIndex);
        
        return {
          users: paginatedUsers,
          total: MOCK_USERS.length,
          page,
          limit,
          totalPages: Math.ceil(MOCK_USERS.length / limit)
        };
      }
      
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param id User ID
   * @param retryCount Number of retries attempted
   * @returns Promise with user data
   */
  async getUserById(id: string, retryCount = 0): Promise<User> {
    // Check authentication first, respecting development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[USERS] Authentication required to fetch user');
      
      // Try to refresh the token
      const refreshResult = await authService.refreshToken();
      
      if (!refreshResult) {
        throw new Error('Authentication required. Please log in to view user details.');
      }
    }
    
    if (this.isUsingMockData()) {
      console.log('[USERS] Using mock data for getUserById:', id);
      const mockUser = MOCK_USERS.find(user => user.id === id);
      if (mockUser) {
        return {...mockUser};
      }
      throw new Error('User not found');
    }
    
    try {
      const response = await apiClient.get(`${USERS_ENDPOINT}/${id}`);
      
      if (response.success && response.data) {
        return UserSchema.parse(response.data);
      } else {
        throw new Error(response.error || `Failed to fetch user with ID ${id}`);
      }
    } catch (error: any) {
      console.error(`Error fetching user ${id}:`, error);
      
      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log(`[USERS] Retrying getUserById for ${id} after token refresh`);
        return this.getUserById(id, retryCount + 1);
      }
      
      // Return mock user in development mode if API fails
      if (isDevelopment) {
        const mockUser = MOCK_USERS.find(user => user.id === id);
        if (mockUser) {
          console.log('[USERS] API failed, returning mock data for user:', id);
          return {...mockUser};
        }
      }
      
      throw error;
    }
  }

  /**
   * Create a new user
   * @param userData User data to create
   * @param retryCount Number of retries attempted
   * @returns Promise with created user
   */
  async createUser(userData: CreateUserData, retryCount = 0): Promise<User> {
    // Check authentication first, respecting development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[USERS] Authentication required to create user');
      
      // Try to refresh the token
      const refreshResult = await authService.refreshToken();
      
      if (!refreshResult) {
        throw new Error('Authentication required. Please log in to create users.');
      }
    }
    
    if (this.isUsingMockData()) {
      console.log('[USERS] Using mock data for createUser');
      
      // Create a new mock user
      const newUser: User = {
        id: `mock-${Date.now()}`,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        roleId: `role-${userData.role.toLowerCase()}`,
        permissions: [],
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatar: userData.avatar || null,
        phoneNumber: userData.phoneNumber || null,
        address: userData.address || null,
        notes: userData.notes || null,
        metadata: userData.metadata || null
      };
      
      // Add permissions based on role
      switch (userData.role) {
        case UserRole.ADMIN:
          newUser.permissions = ['*'];
          break;
        case UserRole.MANAGER:
          newUser.permissions = ['users.view', 'users.create', 'users.update', 'inventory.view', 'inventory.create', 'inventory.update', 'sales.view', 'sales.create'];
          break;
        case UserRole.CASHIER:
          newUser.permissions = ['sales.view', 'sales.create'];
          break;
        default:
          newUser.permissions = [];
      }
      
      // Add to mock users
      MOCK_USERS.push(newUser);
      
      // Dispatch user created event
      window.dispatchEvent(new CustomEvent(USER_EVENTS.CREATED, {
        detail: { user: newUser }
      }));
      
      return newUser;
    }
    
    try {
      const response = await apiClient.post(USERS_ENDPOINT, userData);
      
      if (response.success && response.data) {
        const newUser = UserSchema.parse(response.data);
        
        // Dispatch user created event
        window.dispatchEvent(new CustomEvent(USER_EVENTS.CREATED, {
          detail: { user: newUser }
        }));
        
        return newUser;
      } else {
        throw new Error(response.error || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log('[USERS] Retrying createUser after token refresh');
        return this.createUser(userData, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param userData Updated user data
   * @param retryCount Number of retries attempted
   * @returns Promise with updated user
   */
  async updateUser(id: string, userData: UpdateUserData, retryCount = 0): Promise<User> {
    // Check authentication first, respecting development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[USERS] Authentication required to update user');
      
      // Try to refresh the token
      const refreshResult = await authService.refreshToken();
      
      if (!refreshResult) {
        throw new Error('Authentication required. Please log in to update users.');
      }
    }
    
    if (this.isUsingMockData()) {
      console.log('[USERS] Using mock data for updateUser:', id);
      
      // Find the user to update
      const userIndex = MOCK_USERS.findIndex(user => user.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update the user
      const updatedUser = {
        ...MOCK_USERS[userIndex],
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      // Update fullName if firstName or lastName changed
      if (userData.firstName || userData.lastName) {
        updatedUser.fullName = `${userData.firstName || updatedUser.firstName} ${userData.lastName || updatedUser.lastName}`;
      }
      
      // Update permissions if role changed
      if (userData.role && userData.role !== MOCK_USERS[userIndex].role) {
        switch (userData.role) {
          case UserRole.ADMIN:
            updatedUser.permissions = ['*'];
            break;
          case UserRole.MANAGER:
            updatedUser.permissions = ['users.view', 'users.create', 'users.update', 'inventory.view', 'inventory.create', 'inventory.update', 'sales.view', 'sales.create'];
            break;
          case UserRole.CASHIER:
            updatedUser.permissions = ['sales.view', 'sales.create'];
            break;
          default:
            // Keep existing permissions
        }
        
        // Dispatch role changed event
        window.dispatchEvent(new CustomEvent(USER_EVENTS.ROLE_CHANGED, {
          detail: { 
            user: updatedUser,
            oldRole: MOCK_USERS[userIndex].role,
            newRole: userData.role
          }
        }));
      }
      
      // Update status if isActive changed
      if (userData.isActive !== undefined && userData.isActive !== MOCK_USERS[userIndex].isActive) {
        // Dispatch status changed event
        window.dispatchEvent(new CustomEvent(USER_EVENTS.STATUS_CHANGED, {
          detail: { 
            user: updatedUser,
            oldStatus: MOCK_USERS[userIndex].isActive,
            newStatus: userData.isActive
          }
        }));
      }
      
      // Update password if provided
      if (userData.password) {
        // Dispatch password changed event
        window.dispatchEvent(new CustomEvent(USER_EVENTS.PASSWORD_CHANGED, {
          detail: { user: updatedUser }
        }));
      }
      
      // Update the user in the mock data
      MOCK_USERS[userIndex] = updatedUser;
      
      // Dispatch user updated event
      window.dispatchEvent(new CustomEvent(USER_EVENTS.UPDATED, {
        detail: { user: updatedUser }
      }));
      
      return updatedUser;
    }
    
    try {
      const response = await apiClient.put(`${USERS_ENDPOINT}/${id}`, userData);
      
      if (response.success && response.data) {
        const updatedUser = UserSchema.parse(response.data);
        
        // Dispatch user updated event
        window.dispatchEvent(new CustomEvent(USER_EVENTS.UPDATED, {
          detail: { user: updatedUser }
        }));
        
        return updatedUser;
      } else {
        throw new Error(response.error || 'Failed to update user');
      }
    } catch (error: any) {
      console.error(`Error updating user ${id}:`, error);
      
      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log(`[USERS] Retrying updateUser for ${id} after token refresh`);
        return this.updateUser(id, userData, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Delete a user
   * @param id User ID
   * @param retryCount Number of retries attempted
   * @returns Promise with success status
   */
  async deleteUser(id: string, retryCount = 0): Promise<boolean> {
    // Check authentication first, respecting development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[USERS] Authentication required to delete user');
      
      // Try to refresh the token
      const refreshResult = await authService.refreshToken();
      
      if (!refreshResult) {
        throw new Error('Authentication required. Please log in to delete users.');
      }
    }
    
    if (this.isUsingMockData()) {
      console.log('[USERS] Using mock data for deleteUser:', id);
      
      // Find the user to delete
      const userIndex = MOCK_USERS.findIndex(user => user.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Store the user for the event
      const deletedUser = MOCK_USERS[userIndex];
      
      // Remove the user from the mock data
      MOCK_USERS.splice(userIndex, 1);
      
      // Dispatch user deleted event
      window.dispatchEvent(new CustomEvent(USER_EVENTS.DELETED, {
        detail: { user: deletedUser }
      }));
      
      return true;
    }
    
    try {
      const response = await apiClient.delete(`${USERS_ENDPOINT}/${id}`);
      
      if (response.success) {
        // Dispatch user deleted event
        window.dispatchEvent(new CustomEvent(USER_EVENTS.DELETED, {
          detail: { userId: id }
        }));
        
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error(`Error deleting user ${id}:`, error);
      
      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log(`[USERS] Retrying deleteUser for ${id} after token refresh`);
        return this.deleteUser(id, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Change user password
   * @param id User ID
   * @param currentPassword Current password
   * @param newPassword New password
   * @param retryCount Number of retries attempted
   * @returns Promise with success status
   */
  async changePassword(id: string, currentPassword: string, newPassword: string, retryCount = 0): Promise<boolean> {
    // Check authentication first, respecting development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[USERS] Authentication required to change password');
      
      // Try to refresh the token
      const refreshResult = await authService.refreshToken();
      
      if (!refreshResult) {
        throw new Error('Authentication required. Please log in to change passwords.');
      }
    }
    
    if (this.isUsingMockData()) {
      console.log('[USERS] Using mock data for changePassword:', id);
      
      // Find the user
      const userIndex = MOCK_USERS.findIndex(user => user.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update the user
      MOCK_USERS[userIndex].updatedAt = new Date().toISOString();
      
      // Dispatch password changed event
      window.dispatchEvent(new CustomEvent(USER_EVENTS.PASSWORD_CHANGED, {
        detail: { user: MOCK_USERS[userIndex] }
      }));
      
      return true;
    }
    
    try {
      const response = await apiClient.post(`${USERS_ENDPOINT}/${id}/change-password`, {
        currentPassword,
        newPassword
      });
      
      if (response.success) {
        // Dispatch password changed event
        window.dispatchEvent(new CustomEvent(USER_EVENTS.PASSWORD_CHANGED, {
          detail: { userId: id }
        }));
        
        return true;
      } else {
        throw new Error(response.error || 'Failed to change password');
      }
    } catch (error: any) {
      console.error(`Error changing password for user ${id}:`, error);
      
      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log(`[USERS] Retrying changePassword for ${id} after token refresh`);
        return this.changePassword(id, currentPassword, newPassword, retryCount + 1);
      }
      
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
