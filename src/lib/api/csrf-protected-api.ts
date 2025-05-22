/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * CSRF Protected API Client
 * 
 * This module wraps the API client with CSRF protection.
 */

import { apiClient, ApiResponse } from './api-client';
import { getCsrfToken, addCsrfHeader } from '../../features/auth/utils/csrfProtection';

/**
 * CSRF Protected API Client
 * Wraps the standard API client with CSRF protection
 */
export const csrfProtectedApi = {
  /**
   * Make a GET request with CSRF protection
   * @param path API endpoint path
   * @param options Optional fetch options
   * @returns Promise with standardized response
   */
  async get<T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Add CSRF token to headers
    const headers = addCsrfHeader(options.headers || {});
    
    // Make the request with CSRF protection
    return apiClient.get<T>(path, { ...options, headers });
  },
  
  /**
   * Make a POST request with CSRF protection
   * @param path API endpoint path
   * @param data Request body data
   * @param options Optional fetch options
   * @returns Promise with standardized response
   */
  async post<T = any>(path: string, data: any = {}, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Add CSRF token to headers
    const headers = addCsrfHeader(options.headers || {});
    
    // Add CSRF token to body for additional protection
    const csrfToken = getCsrfToken();
    const bodyWithCsrf = { ...data, csrfToken };
    
    // Make the request with CSRF protection
    return apiClient.post<T>(path, bodyWithCsrf, { ...options, headers });
  },
  
  /**
   * Make a PUT request with CSRF protection
   * @param path API endpoint path
   * @param data Request body data
   * @param options Optional fetch options
   * @returns Promise with standardized response
   */
  async put<T = any>(path: string, data: any = {}, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Add CSRF token to headers
    const headers = addCsrfHeader(options.headers || {});
    
    // Add CSRF token to body for additional protection
    const csrfToken = getCsrfToken();
    const bodyWithCsrf = { ...data, csrfToken };
    
    // Make the request with CSRF protection
    return apiClient.put<T>(path, bodyWithCsrf, { ...options, headers });
  },
  
  /**
   * Make a DELETE request with CSRF protection
   * @param path API endpoint path
   * @param options Optional fetch options
   * @returns Promise with standardized response
   */
  async delete<T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Add CSRF token to headers
    const headers = addCsrfHeader(options.headers || {});
    
    // Make the request with CSRF protection
    return apiClient.delete<T>(path, { ...options, headers });
  },
  
  /**
   * Make a PATCH request with CSRF protection
   * @param path API endpoint path
   * @param data Request body data
   * @param options Optional fetch options
   * @returns Promise with standardized response
   */
  async patch<T = any>(path: string, data: any = {}, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Add CSRF token to headers
    const headers = addCsrfHeader(options.headers || {});
    
    // Add CSRF token to body for additional protection
    const csrfToken = getCsrfToken();
    const bodyWithCsrf = { ...data, csrfToken };
    
    // Make the request with CSRF protection
    return apiClient.patch<T>(path, bodyWithCsrf, { ...options, headers });
  },
  
  /**
   * Make a GET request with pagination support and CSRF protection
   * @param path API endpoint path
   * @param params Query parameters including pagination options
   * @param mockDataFn Optional function to generate mock data (for development)
   * @param options Optional fetch options
   * @returns Promise with standardized paginated response
   */
  async getPaginated<T = any>(
    path: string, 
    params: any = {}, 
    mockDataFn?: ((params: any) => T[]) | undefined,
    options: RequestInit = {}
  ) {
    // Add CSRF token to headers
    const headers = addCsrfHeader(options.headers || {});
    
    // Make the request with CSRF protection
    return apiClient.getPaginated<T>(path, params, mockDataFn, { ...options, headers });
  }
};

// Default export for compatibility
export default csrfProtectedApi;
