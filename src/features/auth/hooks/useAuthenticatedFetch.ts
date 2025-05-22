/**
 * useAuthenticatedFetch Hook
 * 
 * This hook provides a fetch function that includes authentication headers.
 * It handles token refresh and authentication errors automatically.
 */

import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiClient, ApiResponse } from '@/lib/api/api-client';
import { AUTH_EVENTS } from '../constants/authEvents';

export function useAuthenticatedFetch() {
  const { isAuthenticated, refreshAuth } = useAuth();

  /**
   * Authenticated GET request
   * @param url API endpoint
   * @param options Fetch options
   * @returns Promise with API response
   */
  const get = useCallback(async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    if (!isAuthenticated) {
      console.warn('Attempting to make authenticated request while not authenticated');
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
      return {
        success: false,
        data: null as unknown as T,
        error: 'Not authenticated'
      };
    }

    try {
      const response = await apiClient.get<T>(url, options);
      
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        console.log('Received 401 response, attempting token refresh');
        
        // Try to refresh the token
        const refreshed = await refreshAuth();
        
        if (refreshed) {
          // Retry the request with the new token
          return apiClient.get<T>(url, options);
        } else {
          // Token refresh failed, dispatch unauthorized event
          window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
          
          return {
            success: false,
            data: null as unknown as T,
            error: 'Authentication failed'
          };
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error in authenticated GET request:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        data: null as unknown as T,
        error: errorMessage
      };
    }
  }, [isAuthenticated, refreshAuth]);

  /**
   * Authenticated POST request
   * @param url API endpoint
   * @param data Request body
   * @param options Fetch options
   * @returns Promise with API response
   */
  const post = useCallback(async <T>(url: string, data: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    if (!isAuthenticated) {
      console.warn('Attempting to make authenticated request while not authenticated');
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
      return {
        success: false,
        data: null as unknown as T,
        error: 'Not authenticated'
      };
    }

    try {
      const response = await apiClient.post<T>(url, data, options);
      
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        console.log('Received 401 response, attempting token refresh');
        
        // Try to refresh the token
        const refreshed = await refreshAuth();
        
        if (refreshed) {
          // Retry the request with the new token
          return apiClient.post<T>(url, data, options);
        } else {
          // Token refresh failed, dispatch unauthorized event
          window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
          
          return {
            success: false,
            data: null as unknown as T,
            error: 'Authentication failed'
          };
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error in authenticated POST request:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        data: null as unknown as T,
        error: errorMessage
      };
    }
  }, [isAuthenticated, refreshAuth]);

  /**
   * Authenticated PUT request
   * @param url API endpoint
   * @param data Request body
   * @param options Fetch options
   * @returns Promise with API response
   */
  const put = useCallback(async <T>(url: string, data: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    if (!isAuthenticated) {
      console.warn('Attempting to make authenticated request while not authenticated');
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
      return {
        success: false,
        data: null as unknown as T,
        error: 'Not authenticated'
      };
    }

    try {
      const response = await apiClient.put<T>(url, data, options);
      
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        console.log('Received 401 response, attempting token refresh');
        
        // Try to refresh the token
        const refreshed = await refreshAuth();
        
        if (refreshed) {
          // Retry the request with the new token
          return apiClient.put<T>(url, data, options);
        } else {
          // Token refresh failed, dispatch unauthorized event
          window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
          
          return {
            success: false,
            data: null as unknown as T,
            error: 'Authentication failed'
          };
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error in authenticated PUT request:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        data: null as unknown as T,
        error: errorMessage
      };
    }
  }, [isAuthenticated, refreshAuth]);

  /**
   * Authenticated DELETE request
   * @param url API endpoint
   * @param options Fetch options
   * @returns Promise with API response
   */
  const del = useCallback(async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    if (!isAuthenticated) {
      console.warn('Attempting to make authenticated request while not authenticated');
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
      return {
        success: false,
        data: null as unknown as T,
        error: 'Not authenticated'
      };
    }

    try {
      const response = await apiClient.delete<T>(url, options);
      
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        console.log('Received 401 response, attempting token refresh');
        
        // Try to refresh the token
        const refreshed = await refreshAuth();
        
        if (refreshed) {
          // Retry the request with the new token
          return apiClient.delete<T>(url, options);
        } else {
          // Token refresh failed, dispatch unauthorized event
          window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
          
          return {
            success: false,
            data: null as unknown as T,
            error: 'Authentication failed'
          };
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error in authenticated DELETE request:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        data: null as unknown as T,
        error: errorMessage
      };
    }
  }, [isAuthenticated, refreshAuth]);

  /**
   * Authenticated PATCH request
   * @param url API endpoint
   * @param data Request body
   * @param options Fetch options
   * @returns Promise with API response
   */
  const patch = useCallback(async <T>(url: string, data: any, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    if (!isAuthenticated) {
      console.warn('Attempting to make authenticated request while not authenticated');
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
      return {
        success: false,
        data: null as unknown as T,
        error: 'Not authenticated'
      };
    }

    try {
      const response = await apiClient.patch<T>(url, data, options);
      
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        console.log('Received 401 response, attempting token refresh');
        
        // Try to refresh the token
        const refreshed = await refreshAuth();
        
        if (refreshed) {
          // Retry the request with the new token
          return apiClient.patch<T>(url, data, options);
        } else {
          // Token refresh failed, dispatch unauthorized event
          window.dispatchEvent(new CustomEvent(AUTH_EVENTS.UNAUTHORIZED));
          
          return {
            success: false,
            data: null as unknown as T,
            error: 'Authentication failed'
          };
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error in authenticated PATCH request:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        data: null as unknown as T,
        error: errorMessage
      };
    }
  }, [isAuthenticated, refreshAuth]);

  return {
    get,
    post,
    put,
    delete: del,
    patch
  };
}
