/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Staff Service
 * Connects to backend API endpoints for staff management
 */

import { Staff, CreateStaff, UpdateStaff, Shift, CreateShift, UpdateShift } from '../types/staff.types';
import { apiClient } from '@/lib/api/api-client';
import { apiConfig } from '@/lib/api/config';
import { authService } from '@/features/auth/services/authService';

// API endpoint for staff data - use the correct endpoint path
const API_ENDPOINT = 'staff';

// Track authentication failures to prevent repeated API calls when auth has failed
let authenticationFailed = false;

// Track if we're using mock data
let usingMockData = false;

/**
 * Handle API errors and check for authentication issues
 * @param error The error to handle
 * @param message Custom error message
 */
const handleApiError = (error: unknown, message: string): never => {
  // Check if this is an authentication error
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    if (
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('forbidden') ||
      errorMessage.includes('authentication') ||
      errorMessage.includes('token') ||
      errorMessage.includes('login')
    ) {
      console.error('Authentication error in staff service:', error);
      authenticationFailed = true;
      throw new Error('Authentication required. Please log in to access staff data.');
    }

    // Log the original error for debugging
    console.error(`${message}:`, error);
    throw new Error(`${message}: ${error.message}`);
  }

  // For unknown error types
  console.error(`${message} (unknown error type):`, error);
  throw new Error(`${message}: An unexpected error occurred`);
};

/**
 * Staff Service
 * Provides methods for staff management
 */
export const staffService = {
  /**
   * Checks if the current user is authenticated
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    // In development mode, always return true to bypass authentication checks
    if (import.meta.env.DEV) {
      console.log('[StaffService] Development mode: Authentication bypass enabled');
      return true;
    }
    return !authenticationFailed && authService.isAuthenticated();
  },

  /**
   * Reset the authentication failed flag
   */
  resetAuthFailure(): void {
    authenticationFailed = false;
  },

  /**
   * Checks if the service is using mock data
   * @returns True if using mock data, false if using real API
   */
  isUsingMockData(): boolean {
    return usingMockData;
  },

  /**
   * Set whether to use mock data
   * @param useMock True to use mock data, false to use real API
   */
  setUseMockData(useMock: boolean): void {
    usingMockData = useMock;
    console.log(`Staff service is now ${useMock ? 'using mock data' : 'using real API'}`);
  },

  /**
   * Fetches all staff records
   * @returns Promise with array of staff members
   */
  async fetchAll(): Promise<Staff[]> {
    // If we already know authentication has failed, throw early
    if (authenticationFailed) {
      throw new Error('Authentication required. Please log in to access staff data.');
    }

    try {
      const response = await apiClient.get<Staff[]>(API_ENDPOINT);

      if (!response.success) {
        // Handle authentication errors in the response
        if (response.error && typeof response.error === 'string' &&
            (response.error.includes('Invalid token') || response.error.includes('Authentication'))) {
          authenticationFailed = true;
          throw new Error('Authentication required. Please log in to access staff data.');
        }
        throw new Error(response.error || 'Failed to fetch staff');
      }

      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error fetching staff');
    }
  },

  /**
   * Gets a single staff member by ID
   * @param id Staff member ID
   * @returns Promise with the staff member details
   */
  async fetchById(id: string): Promise<Staff> {
    // If we already know authentication has failed, throw early
    if (authenticationFailed) {
      throw new Error('Authentication required. Please log in to access staff data.');
    }

    try {
      const response = await apiClient.get<Staff>(`${API_ENDPOINT}/${id}`);

      if (!response.success) {
        // Handle authentication errors in the response
        if (response.error && typeof response.error === 'string' &&
            (response.error.includes('Invalid token') || response.error.includes('Authentication'))) {
          authenticationFailed = true;
          throw new Error('Authentication required. Please log in to access staff data.');
        }
        throw new Error(response.error || 'Failed to fetch staff member');
      }

      return response.data;
    } catch (error) {
      return handleApiError(error, `Error fetching staff member ${id}`);
    }
  },

  /**
   * Creates a new staff member
   * @param data Staff data without ID
   * @returns Promise with the created staff
   */
  async create(data: CreateStaff): Promise<Staff> {
    // If we already know authentication has failed, throw early
    if (authenticationFailed) {
      throw new Error('Authentication required. Please log in to access staff data.');
    }

    try {
      const response = await apiClient.post<Staff>(API_ENDPOINT, data);
      if (!response.success) {
        // Handle authentication errors in the response
        if (response.error && typeof response.error === 'string' &&
            (response.error.includes('Invalid token') || response.error.includes('Authentication'))) {
          authenticationFailed = true;
          throw new Error('Authentication required. Please log in to access staff data.');
        }
        throw new Error(response.error || 'Failed to create staff');
      }
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error creating staff');
    }
  },

  /**
   * Updates an existing staff member
   * @param id Staff ID
   * @param data Updated staff data
   * @returns Promise with the updated staff
   */
  async update(id: string, data: UpdateStaff): Promise<Staff> {
    // If we already know authentication has failed, throw early
    if (authenticationFailed) {
      throw new Error('Authentication required. Please log in to access staff data.');
    }

    try {
      const response = await apiClient.patch<Staff>(`${API_ENDPOINT}/${id}`, data);
      if (!response.success) {
        // Handle authentication errors in the response
        if (response.error && typeof response.error === 'string' &&
            (response.error.includes('Invalid token') || response.error.includes('Authentication'))) {
          authenticationFailed = true;
          throw new Error('Authentication required. Please log in to access staff data.');
        }
        throw new Error(response.error || 'Failed to update staff');
      }
      return response.data;
    } catch (error) {
      return handleApiError(error, `Error updating staff ${id}`);
    }
  },

  /**
   * Deletes a staff member
   * @param id Staff ID
   * @returns Promise with success status
   */
  async delete(id: string): Promise<void> {
    // If we already know authentication has failed, throw early
    if (authenticationFailed) {
      throw new Error('Authentication required. Please log in to access staff data.');
    }

    try {
      const response = await apiClient.delete<void>(`${API_ENDPOINT}/${id}`);
      if (!response.success) {
        // Handle authentication errors in the response
        if (response.error && typeof response.error === 'string' &&
            (response.error.includes('Invalid token') || response.error.includes('Authentication'))) {
          authenticationFailed = true;
          throw new Error('Authentication required. Please log in to access staff data.');
        }
        throw new Error(response.error || 'Failed to delete staff');
      }
    } catch (error) {
      handleApiError(error, `Error deleting staff ${id}`);
    }
  },

  /**
   * Fetches shifts for a staff member
   * @param staffId Staff ID
   * @returns Promise with array of shifts
   */
  async fetchShifts(staffId: string): Promise<Shift[]> {
    // If we already know authentication has failed, throw early
    if (authenticationFailed) {
      throw new Error('Authentication required. Please log in to access staff data.');
    }

    try {
      const response = await apiClient.get<Shift[]>(`${API_ENDPOINT}/${staffId}/shifts`);
      if (!response.success) {
        // Handle authentication errors in the response
        if (response.error && typeof response.error === 'string' &&
            (response.error.includes('Invalid token') || response.error.includes('Authentication'))) {
          authenticationFailed = true;
          throw new Error('Authentication required. Please log in to access staff data.');
        }
        throw new Error(response.error || 'Failed to fetch staff shifts');
      }
      return response.data;
    } catch (error) {
      return handleApiError(error, `Error fetching shifts for staff ${staffId}`);
    }
  },

  /**
   * Creates a new shift for a staff member
   * @param staffId Staff ID
   * @param data Shift data
   * @returns Promise with the created shift
   */
  async createShift(staffId: string, data: CreateShift): Promise<Shift> {
    // If we already know authentication has failed, throw early
    if (authenticationFailed) {
      throw new Error('Authentication required. Please log in to access staff data.');
    }

    try {
      const response = await apiClient.post<Shift>(`${API_ENDPOINT}/${staffId}/shifts`, data);
      if (!response.success) {
        // Handle authentication errors in the response
        if (response.error && typeof response.error === 'string' &&
            (response.error.includes('Invalid token') || response.error.includes('Authentication'))) {
          authenticationFailed = true;
          throw new Error('Authentication required. Please log in to access staff data.');
        }
        throw new Error(response.error || 'Failed to create shift');
      }
      return response.data;
    } catch (error) {
      return handleApiError(error, `Error creating shift for staff ${staffId}`);
    }
  },

  /**
   * Updates a shift for a staff member
   * @param staffId Staff ID
   * @param shiftId Shift ID
   * @param data Updated shift data
   * @returns Promise with the updated shift
   */
  async updateShift(staffId: string, shiftId: string, data: UpdateShift): Promise<Shift> {
    // If we already know authentication has failed, throw early
    if (authenticationFailed) {
      throw new Error('Authentication required. Please log in to access staff data.');
    }

    try {
      const response = await apiClient.put<Shift>(`${API_ENDPOINT}/${staffId}/shifts/${shiftId}`, data);
      if (!response.success) {
        // Handle authentication errors in the response
        if (response.error && typeof response.error === 'string' &&
            (response.error.includes('Invalid token') || response.error.includes('Authentication'))) {
          authenticationFailed = true;
          throw new Error('Authentication required. Please log in to access staff data.');
        }
        throw new Error(response.error || 'Failed to update shift');
      }
      return response.data;
    } catch (error) {
      return handleApiError(error, `Error updating shift ${shiftId} for staff ${staffId}`);
    }
  },

  /**
   * Deletes a shift for a staff member
   * @param staffId Staff ID
   * @param shiftId Shift ID
   * @returns Promise with success status
   */
  async deleteShift(staffId: string, shiftId: string): Promise<void> {
    // If we already know authentication has failed, throw early
    if (authenticationFailed) {
      throw new Error('Authentication required. Please log in to access staff data.');
    }

    try {
      const response = await apiClient.delete<void>(`${API_ENDPOINT}/${staffId}/shifts/${shiftId}`);
      if (!response.success) {
        // Handle authentication errors in the response
        if (response.error && typeof response.error === 'string' &&
            (response.error.includes('Invalid token') || response.error.includes('Authentication'))) {
          authenticationFailed = true;
          throw new Error('Authentication required. Please log in to access staff data.');
        }
        throw new Error(response.error || 'Failed to delete shift');
      }
    } catch (error) {
      handleApiError(error, `Error deleting shift ${shiftId} for staff ${staffId}`);
    }
  }
};
