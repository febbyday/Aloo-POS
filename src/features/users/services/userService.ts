/**
 * User Service
 *
 * This service handles user management operations.
 * It provides methods for creating, updating, and deleting users.
 */

import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { User, CreateUserData, UpdateUserData, UserSchema, UserRole, UserFilterOptions, UserListResponse, USER_EVENTS } from '../types/user.types';
import { authService } from '@/features/auth/services/authService';
import { AUTH_CONFIG } from '@/features/auth/config/authConfig';
import { ApiHealth, ApiStatus } from '@/lib/api/api-health';
import { AUTH_EVENTS } from '@/features/auth/types/auth.types';
import { formatErrorMessage } from '@/lib/api/utils/api-helpers';
import { isStaffRoleWithPin } from '../utils/role-utils';
import { createResourceErrorHandlers } from '@/lib/error/operation-error-handler';
import { ResourceType, OperationType } from '@/lib/error/error-messages';
import { handleValidationError } from '@/lib/validation/validation-error-handler';
import { createEnhancedApiError } from '@/lib/api/enhanced-api-error';

// API endpoint for users
const USERS_ENDPOINT = 'users';

// Create an instance of ApiHealth
const apiHealth = new ApiHealth(enhancedApiClient);

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
    permissions: ['*'],
    isActive: true,
    isPinEnabled: false,
    failedPinAttempts: 0,
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
    permissions: ['users.view', 'users.create', 'users.update', 'inventory.view', 'inventory.create', 'inventory.update', 'sales.view', 'sales.create'],
    isActive: true,
    isPinEnabled: true,
    failedPinAttempts: 0,
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
    permissions: ['sales.view', 'sales.create'],
    isActive: true,
    isPinEnabled: true,
    failedPinAttempts: 0,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
] as User[];

/**
 * User Service
 * Provides methods for user management
 */
class UserService {
  // Create resource-specific error handlers
  private errorHandlers = createResourceErrorHandlers(ResourceType.USER);
  /**
   * Check if we should use mock data
   * @returns True if using mock data
   */
  isUsingMockData(): boolean {
    // Remove forced mock mode
    localStorage.removeItem('force_dev_mode');

    // Check environment variables first
    const disableMock = import.meta.env.VITE_DISABLE_MOCK === 'true';
    if (disableMock) {
      console.log('[USERS] Using real API data - Mock mode disabled by environment variable');
      return false;
    }

    // Check if API is available
    const apiStatus = apiHealth.getStatus();
    const apiUnavailable = apiStatus !== ApiStatus.AVAILABLE;
    console.log('[USERS] API Status:', apiStatus);

    // Only use mock data if explicitly configured or if API is unavailable
    const useMock = apiUnavailable;

    if (useMock) {
      console.log('[USERS] Using mock data - API unavailable');
    } else {
      console.log('[USERS] Using real API data');
    }

    // Comment out the force mock data line
    // console.log('[USERS] FORCING MOCK DATA FOR DEBUGGING');
    // return true;

    return useMock;
  }

  /**
   * Check if authentication can be bypassed
   * @returns True if authentication can be bypassed
   */
  canBypassAuth(): boolean {
    // In development mode, always return true to bypass authentication checks
    if (import.meta.env.DEV) {
      console.log('[USERS] Development mode: Authentication bypass enabled');
      return true;
    }
    // Use the auth bypass setting from AUTH_CONFIG as fallback
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
   * @param signal Optional AbortSignal to cancel the request
   * @param retryCount Number of retries attempted
   * @returns Promise with array of users
   */
  async getAllUsers(filters?: UserFilterOptions, signal?: AbortSignal, retryCount = 0): Promise<User[]> {
    // Check if the request has already been aborted
    if (signal?.aborted) {
      console.log('[USERS] Request already aborted before processing');
      const abortError = new Error('Request was cancelled');
      abortError.name = 'AbortError';
      throw abortError;
    }

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
      // Check again if the request has been aborted
      if (signal?.aborted) {
        console.log('[USERS] Request aborted before making API call');
        const abortError = new Error('Request was cancelled');
        abortError.name = 'AbortError';
        throw abortError;
      }

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

      // Create proper options object with signal
      const options: RequestInit = {};
      if (signal) {
        options.signal = signal;
      }

      console.log('[USERS] Fetching users with options:', {
        endpoint: `${USERS_ENDPOINT}${queryParams}`,
        hasSignal: !!signal
      });

      const response = await enhancedApiClient.get(`users/LIST${queryParams}`);

      if (response.success && response.data) {
        // Patch: Safely extract error message if response.data is an object
        if (Array.isArray(response.data)) {
          return response.data.map((user: any) => UserSchema.parse(user));
        } else if (response.data.users && Array.isArray(response.data.users)) {
          return response.data.users.map((user: any) => UserSchema.parse(user));
        } else {
          return [];
        }
      } else {
        // Patch: Show actual error message if error is an object
        let errorMsg = 'Failed to fetch users';
        if (typeof response.error === 'object') {
          errorMsg = JSON.stringify(response.error);
        } else if (response.error) {
          errorMsg = response.error;
        }
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      // Check if this is an abort error first
      if (error.name === 'AbortError' ||
          error.code === 'ABORT_ERR' ||
          error.message === 'Request was cancelled' ||
          error?.message?.includes('aborted')) {
        console.log('[USERS] Request was aborted:', error.message);
        const abortError = new Error('Request was cancelled');
        abortError.name = 'AbortError';
        throw abortError;
      }

      // Improved error extraction for user-friendly messages
      let errorMessage = 'Failed to fetch users';
      if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      console.error('Error fetching users:', errorMessage, error);

      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log('[USERS] Retrying getAllUsers after token refresh');
        return this.getAllUsers(filters, signal, retryCount + 1);
      }

      throw new Error(errorMessage);
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

      const response = await enhancedApiClient.get(`users/LIST${queryParams}`);

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
      const errorMessage = formatErrorMessage(error);
      console.error('Error fetching users:', errorMessage, error);

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

      throw new Error(errorMessage);
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
      const response = await enhancedApiClient.get(`users/DETAIL`, { id });

      if (response.success && response.data) {
        return UserSchema.parse(response.data);
      } else {
        throw new Error(response.error || `Failed to fetch user with ID ${id}`);
      }
    } catch (error: any) {
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

      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleFetchError(error, {
        resourceId: id,
        suggestion: 'The user may have been deleted or you may not have permission to view this user.'
      });

      throw createEnhancedApiError(error, {
        resource: ResourceType.USER,
        resourceId: id,
        operation: OperationType.FETCH,
        suggestion: 'Please check if the user exists and you have permission to view it.'
      });
    }
  }

  /**
   * Create a new user
   * @param userData User data to create
   * @param retryCount Number of retries attempted
   * @returns Promise with created user
   */
  async createUser(userData: CreateUserData, retryCount = 0): Promise<User> {
    // Check authentication first
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[USERS] Authentication required to create user');

      // Try to refresh the token
      const refreshResult = await authService.refreshToken();

      if (!refreshResult) {
        throw new Error('Authentication required. Please log in to create a user.');
      }
    }

    // Add validation for required fields
    if (!userData.username || !userData.email || !userData.firstName || !userData.lastName) {
      throw new Error('Required fields are missing: username, email, firstName, and lastName are required');
    }

    // Check if the API is available - if not, use mock data immediately
    const apiStatus = apiHealth.getStatus();
    const useMockData = this.isUsingMockData() || apiStatus !== ApiStatus.AVAILABLE;

    if (useMockData) {
      console.log('[USERS] Using mock data for user creation (API Status:', apiStatus, ')');
      return this.createMockUser(userData);
    }

    try {
      console.log('[USERS] Sending create user request to API with data:', {
        ...userData,
        password: userData.password ? '********' : undefined // Mask password for security
      });

      // Create a new AbortController with a longer timeout specifically for user creation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('[USERS] User creation request timed out after 60 seconds');
        controller.abort(new Error('User creation request timed out'));
      }, 60000); // 60 seconds timeout for user creation

      try {
        // Make the API request with our custom signal
        const response = await enhancedApiClient.post('users/CREATE', userData, undefined, {
          signal: controller.signal
        });

        // Clear the timeout since the request completed
        clearTimeout(timeoutId);

        if (response.success && response.data) {
          console.log('[USERS] User created successfully:', response.data);
          const newUser = UserSchema.parse(response.data);

          // Dispatch user created event
          window.dispatchEvent(new CustomEvent(USER_EVENTS.CREATED, {
            detail: { user: newUser }
          }));

          return newUser;
        } else {
          console.error('[USERS] Failed to create user:', response.error);
          throw new Error(response.error || 'Failed to create user');
        }
      } catch (error: any) {
        // Clear the timeout if there was an error
        clearTimeout(timeoutId);

        // Special handling for timeout errors
        if (error.name === 'AbortError') {
          console.log('[USERS] User creation request was aborted:', error.message);

          // If it was our timeout, provide a more specific error
          if (error.message === 'User creation request timed out') {
            throw new Error('User creation timed out. Please try again.');
          }
        }

        // Re-throw other errors for the outer catch block
        throw error;
      }
    } catch (error: any) { // Outer catch block
      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log('[USERS] Retrying createUser after token refresh');
        return this.createUser(userData, retryCount + 1);
      }

      // Fall back to mock data for specific error conditions in development
      if (isDevelopment && (
          (error?.message && (
            error.message.includes('404') ||
            error.message.includes('Not Found') ||
            error.message.includes('Failed to parse') ||
            error.message.includes('Network Error')
          )) ||
          error?.status === 404
      )) {
        console.warn('[USERS] API error detected, falling back to mock data in development mode');
        return this.createMockUser(userData);
      }

      // Check specifically for AbortError here if needed, otherwise use enhanced error handling
      if (error.name === 'AbortError' || error.message === 'Request was cancelled') {
         console.log('[USERS] Create user request was aborted (likely by component unmount or navigation)');
         // Re-throw the original abort error for clarity upstream.
         throw error;
      }

      // Check if it's a validation error
      if (error instanceof Error && error.name === 'ZodError') {
        handleValidationError(error, {
          resource: ResourceType.USER,
          operation: OperationType.CREATE,
          showToasts: true,
          toastTitle: 'User Creation Error'
        });
      } else {
        // Use the resource-specific error handler with detailed context
        this.errorHandlers.handleCreateError(error, {
          resourceName: userData.username || `${userData.firstName} ${userData.lastName}`,
          suggestion: 'Please check your input and try again.'
        });
      }

      throw createEnhancedApiError(error, {
        resource: ResourceType.USER,
        resourceName: userData.username || `${userData.firstName} ${userData.lastName}`,
        operation: OperationType.CREATE,
        suggestion: 'Please check your input and try again.'
      });
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
    if (this.isUsingMockData()) {
      console.log('[USERS] Using mock data for updateUser:', id, userData);

      // Find the user to update
      const userIndex = MOCK_USERS.findIndex(user => user.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Create a properly typed updated user object
      // Start with the existing user to ensure all required fields are present
      const existingUser = MOCK_USERS[userIndex];
      if (!existingUser) {
        throw new Error('User data is corrupted');
      }
      const updatedUser: User = {
        id: existingUser.id,                                                // Keep original ID
        username: userData.username || existingUser.username,               // Use new value or keep original
        email: userData.email || existingUser.email,                        // Use new value or keep original
        firstName: userData.firstName || existingUser.firstName,            // Use new value or keep original
        lastName: userData.lastName || existingUser.lastName,               // Use new value or keep original
        fullName: userData.firstName || userData.lastName                   // Update if first/last name changed
          ? `${userData.firstName || existingUser.firstName} ${userData.lastName || existingUser.lastName}`
          : existingUser.fullName || `${existingUser.firstName} ${existingUser.lastName}`,
        role: userData.role || existingUser.role,                           // Use new value or keep original
        permissions: existingUser.permissions,                              // Start with existing permissions
        isActive: userData.isActive !== undefined
          ? userData.isActive
          : existingUser.isActive,                                          // Use new value or keep original
        updatedAt: new Date().toISOString(),                                // Set to current time
        createdAt: existingUser.createdAt,                                  // Keep original creation time
        lastLogin: existingUser.lastLogin,                                  // Keep original last login

        // Required fields
        failedPinAttempts: existingUser.failedPinAttempts || 0,             // Keep existing or default to 0

        // Optional fields
        isPinEnabled: userData.isPinEnabled !== undefined
          ? userData.isPinEnabled
          : existingUser.isPinEnabled,
        lastPinChange: existingUser.lastPinChange,
        avatar: userData.avatar !== undefined ? userData.avatar : existingUser.avatar,
        // These fields were removed from the schema but might still exist in the mock data
        phoneNumber: (userData as any).phoneNumber !== undefined ? (userData as any).phoneNumber : existingUser.phoneNumber,
        address: (userData as any).address !== undefined ? (userData as any).address : existingUser.address,
        notes: (userData as any).notes !== undefined ? (userData as any).notes : existingUser.notes,
        metadata: (userData as any).metadata !== undefined ? (userData as any).metadata : existingUser.metadata,
      } as User;

      // Update fullName if firstName or lastName changed
      if (userData.firstName || userData.lastName) {
        updatedUser.fullName = `${userData.firstName || updatedUser.firstName} ${userData.lastName || updatedUser.lastName}`;
      }

      // Update permissions if role changed
      if (userData.role && existingUser && userData.role !== existingUser.role) {
        switch (userData.role) {
          case UserRole.ADMIN:
            updatedUser.permissions = ['*'];
            break;
          case UserRole.MANAGER:
            updatedUser.permissions = ['users.view', 'users.create', 'users.update', 'inventory.view', 'inventory.create', 'inventory.update', 'sales.view', 'sales.create', 'sales.update'];
            break;
          case UserRole.USER:
            updatedUser.permissions = ['users.view', 'users.create', 'users.update', 'inventory.view', 'inventory.create', 'inventory.update', 'sales.view', 'sales.create'];
            break;
          case UserRole.CASHIER:
            updatedUser.permissions = ['sales.view', 'sales.create'];
            break;
          default:
            updatedUser.permissions = [];
        }
      }

      // Update in mock data
      MOCK_USERS[userIndex] = updatedUser;

      // Dispatch user updated event
      window.dispatchEvent(new CustomEvent(USER_EVENTS.UPDATED, {
        detail: { user: updatedUser }
      }));

      return updatedUser;
    }

    try {
      console.log('[USERS] Sending update user request to API:', id);
      const response = await enhancedApiClient.put('users/UPDATE', userData, { id });

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
      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log('[USERS] Retrying updateUser after token refresh');
        return this.updateUser(id, userData, retryCount + 1);
      }

      // In development mode, fall back to mock data if we get a 404 or other API error
      if (isDevelopment && (
          (error?.message && error.message.includes('404')) ||
          (error?.message && error.message.includes('Not Found')) ||
          error?.status === 404 ||
          (error?.message && error.message.includes('Failed to parse'))
      )) {
        console.warn('[USERS] API endpoint not found or invalid. Falling back to mock data in development mode.');

        // Force dev mode for this request
        const originalDevMode = localStorage.getItem('force_dev_mode');
        localStorage.setItem('force_dev_mode', 'true');

        try {
          // Try again with mock data
          const result = await this.updateUser(id, userData, retryCount + 1);
          return result;
        } finally {
          // Restore original dev mode setting
          if (originalDevMode) {
            localStorage.setItem('force_dev_mode', originalDevMode);
          } else {
            localStorage.removeItem('force_dev_mode');
          }
        }
      }

      // Check if it's a validation error
      if (error instanceof Error && error.name === 'ZodError') {
        handleValidationError(error, {
          resource: ResourceType.USER,
          operation: OperationType.UPDATE,
          showToasts: true,
          toastTitle: 'User Update Error'
        });
      } else {
        // Use the resource-specific error handler with detailed context
        this.errorHandlers.handleUpdateError(error, {
          resourceId: id,
          resourceName: userData.username || `${userData.firstName || ''} ${userData.lastName || ''}`,
          suggestion: 'Please check your input and try again.'
        });
      }

      throw createEnhancedApiError(error, {
        resource: ResourceType.USER,
        resourceId: id,
        resourceName: userData.username || `${userData.firstName || ''} ${userData.lastName || ''}`,
        operation: OperationType.UPDATE,
        suggestion: 'Please check your input and try again.'
      });
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

      // Get user for the event *before* removing it
      const user = { ...MOCK_USERS[userIndex] }; // Clone user data for the event

      // Remove user from mock data
      MOCK_USERS.splice(userIndex, 1);

      // Dispatch user deleted event
      window.dispatchEvent(new CustomEvent(USER_EVENTS.DELETED, {
        detail: { userId: id, user }
      }));

      return true;
    }

    try {
      console.log('[USERS] Sending delete user request to API:', id);
      const response = await enhancedApiClient.delete('users/DELETE', { id });

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
      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log('[USERS] Retrying deleteUser after token refresh');
        return this.deleteUser(id, retryCount + 1);
      }

      // In development mode, fall back to mock data if we get a 404 or other API error
      if (isDevelopment && (
          (error?.message && error.message.includes('404')) ||
          (error?.message && error.message.includes('Not Found')) ||
          error?.status === 404 ||
          (error?.message && error.message.includes('Failed to parse'))
      )) {
        console.warn('[USERS] API endpoint not found or invalid. Falling back to mock data in development mode.');

        // Force dev mode for this request
        const originalDevMode = localStorage.getItem('force_dev_mode');
        localStorage.setItem('force_dev_mode', 'true');

        try {
          // Try again with mock data
          const result = await this.deleteUser(id, retryCount + 1);
          return result;
        } finally {
          // Restore original dev mode setting
          if (originalDevMode) {
            localStorage.setItem('force_dev_mode', originalDevMode);
          } else {
            localStorage.removeItem('force_dev_mode');
          }
        }
      }

      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleDeleteError(error, {
        resourceId: id,
        suggestion: 'Please check if you have permission to delete this user.'
      });

      throw createEnhancedApiError(error, {
        resource: ResourceType.USER,
        resourceId: id,
        operation: OperationType.DELETE,
        suggestion: 'Please check if the user exists and you have permission to delete it.'
      });
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

      // Get existing user and verify it exists
      const existingUser = MOCK_USERS[userIndex];
      if (!existingUser) {
        throw new Error('User data is corrupted');
      }

      // Update the user's updatedAt field
      existingUser.updatedAt = new Date().toISOString();

      // Dispatch password changed event with the existingUser
      window.dispatchEvent(new CustomEvent(USER_EVENTS.PASSWORD_CHANGED, {
        detail: { user: existingUser }
      }));

      return true;
    }

    try {
      const response = await enhancedApiClient.post('users/CHANGE_PASSWORD', {
        currentPassword,
        newPassword
      }, { id });

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
      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log(`[USERS] Retrying changePassword for ${id} after token refresh`);
        return this.changePassword(id, currentPassword, newPassword, retryCount + 1);
      }

      // Check for specific password-related errors
      if (error?.message?.includes('current password') ||
          error?.message?.includes('incorrect password') ||
          error?.message?.toLowerCase().includes('invalid credentials')) {
        // Use the resource-specific error handler with detailed context
        this.errorHandlers.handleUpdateError(error, {
          resourceId: id,
          suggestion: 'The current password you entered is incorrect. Please try again.'
        });

        throw createEnhancedApiError(error, {
          resource: ResourceType.USER,
          resourceId: id,
          operation: OperationType.UPDATE,
          suggestion: 'The current password you entered is incorrect. Please try again.'
        });
      } else if (error?.message?.includes('password requirements') ||
                error?.message?.includes('password policy') ||
                error?.message?.includes('password strength')) {
        // Use the resource-specific error handler with detailed context
        this.errorHandlers.handleUpdateError(error, {
          resourceId: id,
          suggestion: 'The new password does not meet the requirements. Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.'
        });

        throw createEnhancedApiError(error, {
          resource: ResourceType.USER,
          resourceId: id,
          operation: OperationType.UPDATE,
          suggestion: 'The new password does not meet the requirements. Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.'
        });
      } else {
        // Use the resource-specific error handler with detailed context
        this.errorHandlers.handleUpdateError(error, {
          resourceId: id,
          suggestion: 'Please check if you have permission to change this user\'s password.'
        });

        throw createEnhancedApiError(error, {
          resource: ResourceType.USER,
          resourceId: id,
          operation: OperationType.UPDATE,
          suggestion: 'Please check if the user exists and you have permission to change their password.'
        });
      }
    }
  }

  /**
   * Reset a user's password
   * @param id User ID
   * @param newPassword New password
   * @param retryCount Number of retries attempted
   * @returns Promise with success status
   */
  async resetPassword(id: string, newPassword: string, retryCount = 0): Promise<boolean> {
    // Check authentication first, respecting development mode bypass
    if (!authService.isAuthenticated() && !this.canBypassAuth()) {
      console.error('[USERS] Authentication required to reset user password');

      // Try to refresh the token
      const refreshResult = await authService.refreshToken();

      if (!refreshResult) {
        throw new Error('Authentication required. Please log in to reset user password.');
      }
    }

    if (this.isUsingMockData()) {
      console.log('[USERS] Using mock data for resetPassword:', id);

      // Find the user to update password
      const userIndex = MOCK_USERS.findIndex(user => user.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Create a copy of the existing user with required fields explicitly preserved
      const existingUser = MOCK_USERS[userIndex];
      if (!existingUser) {
        throw new Error('User data is corrupted');
      }
      const updatedUser: User = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        fullName: existingUser.fullName || `${existingUser.firstName} ${existingUser.lastName}`,
        role: existingUser.role,
        permissions: existingUser.permissions,
        isActive: existingUser.isActive,
        updatedAt: new Date().toISOString(), // Only this field is changed

        // Required fields
        failedPinAttempts: existingUser.failedPinAttempts || 0,

        // Keep all other fields as is
        createdAt: existingUser.createdAt,
        lastLogin: existingUser.lastLogin,
        isPinEnabled: existingUser.isPinEnabled,
        lastPinChange: existingUser.lastPinChange,
        avatar: existingUser.avatar,
        phoneNumber: existingUser.phoneNumber,
        address: existingUser.address,
        notes: existingUser.notes,
        metadata: existingUser.metadata
      } as User;

      // Update the user in the mock data
      MOCK_USERS[userIndex] = updatedUser;

      // Dispatch user updated event (using the updatedUser variable)
      window.dispatchEvent(new CustomEvent(USER_EVENTS.UPDATED, {
        detail: { userId: id, user: updatedUser }
      }));

      return true;
    }

    try {
      console.log('[USERS] Sending reset password request to API:', id);
      const response = await enhancedApiClient.post('users/RESET_PASSWORD', {
        newPassword
      }, { id });

      if (response.success) {
        // Dispatch user updated event
        window.dispatchEvent(new CustomEvent(USER_EVENTS.UPDATED, {
          detail: { userId: id }
        }));

        return true;
      } else {
        throw new Error(response.error || 'Failed to reset user password');
      }
    } catch (error: any) {
      // Handle authentication errors with retry
      if (await this.handleAuthError(error) && retryCount < 1) {
        console.log('[USERS] Retrying resetPassword after token refresh');
        return this.resetPassword(id, newPassword, retryCount + 1);
      }

      // Check for specific password-related errors
      if (error?.message?.includes('password requirements') ||
          error?.message?.includes('password policy') ||
          error?.message?.includes('password strength')) {
        // Use the resource-specific error handler with detailed context
        this.errorHandlers.handleUpdateError(error, {
          resourceId: id,
          suggestion: 'The new password does not meet the requirements. Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.'
        });

        throw createEnhancedApiError(error, {
          resource: ResourceType.USER,
          resourceId: id,
          operation: OperationType.UPDATE,
          suggestion: 'The new password does not meet the requirements. Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.'
        });
      } else {
        // Use the resource-specific error handler with detailed context
        this.errorHandlers.handleUpdateError(error, {
          resourceId: id,
          suggestion: 'Please check if you have permission to reset this user\'s password.'
        });

        throw createEnhancedApiError(error, {
          resource: ResourceType.USER,
          resourceId: id,
          operation: OperationType.UPDATE,
          suggestion: 'Please check if the user exists and you have permission to reset their password.'
        });
      }
    }
  }

  private async createMockUser(userData: CreateUserData): Promise<User> {
    console.log('[USERS] Creating mock user with data:', userData);

    // Define the permissions array based on the role first
    let permissions: string[] = [];

    // Set up default permissions based on role
    const role = userData.role || UserRole.USER;
    switch (role) {
      case UserRole.ADMIN:
        permissions = ['*']; // All permissions
        break;
      case UserRole.MANAGER:
        permissions = ['users.view', 'users.create', 'inventory.manage', 'sales.manage'];
        break;
      case UserRole.CASHIER:
        permissions = ['sales.view', 'sales.create'];
        break;
      default:
        permissions = ['users.view']; // Basic permissions
    }

    // The CreateUserData type might not have permissions, so handle it specially
    // Use userData.permissions if available or available through type assertion
    const providedPermissions = (userData as any).permissions;
    if (providedPermissions && Array.isArray(providedPermissions) && providedPermissions.length > 0) {
      permissions = providedPermissions;
    }

    // Create the user object with all required fields
    const mockUser: User = {
      id: `mock-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      fullName: `${userData.firstName} ${userData.lastName}`,
      role: role,
      // roleId is not in the User type, so we won't include it
      permissions: permissions,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      // Set isPinEnabled based on role using the shared utility function
      isPinEnabled: userData.isPinEnabled !== undefined ? userData.isPinEnabled : isStaffRoleWithPin(role),
      failedPinAttempts: 0, // Add required field
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    } as User;

    // We no longer need this switch statement as we've already set the permissions above
    /* if (!userData.permissions || userData.permissions.length === 0) {
    } */

    // Simulate network delay for more realistic behavior
    await new Promise(resolve => setTimeout(resolve, 500));

    // Add to mock users collection
    MOCK_USERS.push(mockUser);

    // Dispatch user created event
    window.dispatchEvent(new CustomEvent(USER_EVENTS.CREATED, {
      detail: { user: mockUser }
    }));

    console.log('[USERS] Created mock user:', mockUser);
    return mockUser;
  }
}

// Export singleton instance
export const userService = new UserService();
