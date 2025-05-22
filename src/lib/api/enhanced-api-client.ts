/**
 * Enhanced API Client
 *
 * This module extends the base API client with robust error handling and retry functionality,
 * providing a consistent approach for making API requests across the application.
 * It also includes CSRF protection for all non-GET requests.
 */

import { apiClient } from './api-client';
import { apiConfig, API_CONSTANTS } from './config';
import { ApiError, RetryConfig, withRetry, handleApiError, safeApiCall } from './error-handler';
import { getFullEndpointUrl } from './enhanced-config';
import { getCsrfToken, refreshCsrfToken, hasCsrfToken } from '../../features/auth/utils/csrfProtection';

// CSRF token header name
const CSRF_HEADER = 'X-CSRF-Token';

/**
 * Request options interface for the enhanced API client
 */
export interface EnhancedRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retry?: Partial<RetryConfig> | boolean;
  signal?: AbortSignal;
  cache?: RequestCache;
}

/**
 * Enhanced API client with built-in error handling and retry capabilities
 */
export const enhancedApiClient = {
  /**
   * Make a GET request with enhanced error handling and retry capability
   *
   * @param endpointKey The endpoint key from the endpoint registry
   * @param pathParams Optional path parameters for the endpoint
   * @param options Additional request options
   * @returns Promise with the response data
   */
  async get<T = any>(
    endpoint: string,
    pathParams?: Record<string, string>,
    options: EnhancedRequestOptions = {}
  ): Promise<T> {
    const url = getFullEndpointUrl(endpoint, pathParams);
    
    // Log the actual URL being requested for debugging
    console.log(`[API] Making GET request to: ${url}`);

    // Use shorter timeout for settings endpoints
    let timeout = options.timeout;
    if (endpoint.startsWith('settings/') && !timeout) {
      timeout = API_CONSTANTS.SETTINGS_TIMEOUT; // Use the shorter settings timeout
    }

    const makeRequest = () => apiClient.get<T>(url, {
      headers: options.headers,
      params: options.params,
      timeout: timeout,
      signal: options.signal,
      cache: options.cache
    });

    if (options.retry) {
      const retryConfig = options.retry === true ? {} : options.retry;
      return withRetry<T>(makeRequest, retryConfig);
    }

    try {
      const result = await makeRequest();
      if (endpoint.includes('roles')) {
        console.log(`[API] Successful response from roles endpoint:`, result);
      }
      return result;
    } catch (error) {
      // Add detailed diagnostics for connectivity issues
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error(`[API] CONNECTIVITY ERROR: Cannot reach server at ${API_CONSTANTS.URL}`);
        console.error('[API] Please ensure your backend server is running and accessible');
        console.error(`[API] Full endpoint URL: ${url}`);
      }
      
      throw handleApiError(error);
    }
  },

  /**
   * Ensure CSRF token is available before making a request
   * If not, try to refresh it
   * In development mode, bypass CSRF token check
   * @returns True if CSRF token is available
   */
  async ensureCsrfToken(): Promise<boolean> {
    // In development mode, bypass CSRF token check
    if (import.meta.env.DEV) {
      console.log('[API] Development mode: CSRF token check bypassed');
      return true;
    }

    // Check if CSRF token exists
    if (hasCsrfToken()) {
      return true;
    }

    // If not, try to refresh it
    console.log('CSRF token not found, attempting to refresh...');
    return await refreshCsrfToken();
  },

  /**
   * Make a POST request with enhanced error handling and retry capability
   *
   * @param endpointKey The endpoint key from the endpoint registry
   * @param data The data to send
   * @param pathParams Optional path parameters for the endpoint
   * @param options Additional request options
   * @returns Promise with the response data
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    pathParams?: Record<string, string>,
    options: EnhancedRequestOptions = {}
  ): Promise<T> {
    const url = getFullEndpointUrl(endpoint, pathParams);

    // Ensure CSRF token is available
    await this.ensureCsrfToken();

    // Add CSRF token to headers for non-GET requests
    const csrfToken = getCsrfToken();
    const headers = { ...options.headers };

    if (csrfToken) {
      headers[CSRF_HEADER] = csrfToken;
    }

    const makeRequest = () => apiClient.post<T>(url, data, {
      headers,
      params: options.params,
      timeout: options.timeout,
      signal: options.signal
    });

    if (options.retry) {
      const retryConfig = options.retry === true ? {} : options.retry;
      return withRetry<T>(makeRequest, retryConfig);
    }

    try {
      return await makeRequest();
    } catch (error) {
      // If we get a 403 Forbidden error, it might be due to an invalid CSRF token
      if (error instanceof ApiError && error.status === 403 && error.message.includes('CSRF')) {
        // Try to refresh the token and retry the request once
        console.log('CSRF validation failed, refreshing token and retrying...');
        const refreshed = await refreshCsrfToken();
        if (refreshed) {
          // Update the CSRF token in headers
          const newToken = getCsrfToken();
          if (newToken) {
            headers[CSRF_HEADER] = newToken;
            // Retry the request with the new token
            return await apiClient.post<T>(url, data, {
              headers,
              params: options.params,
              timeout: options.timeout,
              signal: options.signal
            });
          }
        }
      }
      throw handleApiError(error);
    }
  },

  /**
   * Make a PUT request with enhanced error handling and retry capability
   *
   * @param endpointKey The endpoint key from the endpoint registry
   * @param data The data to send
   * @param pathParams Optional path parameters for the endpoint
   * @param options Additional request options
   * @returns Promise with the response data
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    pathParams?: Record<string, string>,
    options: EnhancedRequestOptions = {}
  ): Promise<T> {
    const url = getFullEndpointUrl(endpoint, pathParams);

    // Ensure CSRF token is available
    await this.ensureCsrfToken();

    // Add CSRF token to headers for non-GET requests
    const csrfToken = getCsrfToken();
    const headers = { ...options.headers };

    if (csrfToken) {
      headers[CSRF_HEADER] = csrfToken;
    }

    const makeRequest = () => apiClient.put<T>(url, data, {
      headers,
      params: options.params,
      timeout: options.timeout,
      signal: options.signal
    });

    if (options.retry) {
      const retryConfig = options.retry === true ? {} : options.retry;
      return withRetry<T>(makeRequest, retryConfig);
    }

    try {
      return await makeRequest();
    } catch (error) {
      // If we get a 403 Forbidden error, it might be due to an invalid CSRF token
      if (error instanceof ApiError && error.status === 403 && error.message.includes('CSRF')) {
        // Try to refresh the token and retry the request once
        console.log('CSRF validation failed, refreshing token and retrying...');
        const refreshed = await refreshCsrfToken();
        if (refreshed) {
          // Update the CSRF token in headers
          const newToken = getCsrfToken();
          if (newToken) {
            headers[CSRF_HEADER] = newToken;
            // Retry the request with the new token
            return await apiClient.put<T>(url, data, {
              headers,
              params: options.params,
              timeout: options.timeout,
              signal: options.signal
            });
          }
        }
      }
      throw handleApiError(error);
    }
  },

  /**
   * Make a PATCH request with enhanced error handling and retry capability
   *
   * @param endpointKey The endpoint key from the endpoint registry
   * @param data The data to send
   * @param pathParams Optional path parameters for the endpoint
   * @param options Additional request options
   * @returns Promise with the response data
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    pathParams?: Record<string, string>,
    options: EnhancedRequestOptions = {}
  ): Promise<T> {
    const url = getFullEndpointUrl(endpoint, pathParams);

    // Ensure CSRF token is available
    await this.ensureCsrfToken();

    // Add CSRF token to headers for non-GET requests
    const csrfToken = getCsrfToken();
    const headers = { ...options.headers };

    if (csrfToken) {
      headers[CSRF_HEADER] = csrfToken;
    }

    const makeRequest = () => apiClient.patch<T>(url, data, {
      headers,
      params: options.params,
      timeout: options.timeout,
      signal: options.signal
    });

    if (options.retry) {
      const retryConfig = options.retry === true ? {} : options.retry;
      return withRetry<T>(makeRequest, retryConfig);
    }

    try {
      return await makeRequest();
    } catch (error) {
      // If we get a 403 Forbidden error, it might be due to an invalid CSRF token
      if (error instanceof ApiError && error.status === 403 && error.message.includes('CSRF')) {
        // Try to refresh the token and retry the request once
        console.log('CSRF validation failed, refreshing token and retrying...');
        const refreshed = await refreshCsrfToken();
        if (refreshed) {
          // Update the CSRF token in headers
          const newToken = getCsrfToken();
          if (newToken) {
            headers[CSRF_HEADER] = newToken;
            // Retry the request with the new token
            return await apiClient.patch<T>(url, data, {
              headers,
              params: options.params,
              timeout: options.timeout,
              signal: options.signal
            });
          }
        }
      }
      throw handleApiError(error);
    }
  },

  /**
   * Make a DELETE request with enhanced error handling and retry capability
   *
   * @param endpointKey The endpoint key from the endpoint registry
   * @param pathParams Optional path parameters for the endpoint
   * @param options Additional request options
   * @returns Promise with the response data
   */
  async delete<T = any>(
    endpoint: string,
    pathParams?: Record<string, string>,
    options: EnhancedRequestOptions = {}
  ): Promise<T> {
    const url = getFullEndpointUrl(endpoint, pathParams);

    // Ensure CSRF token is available
    await this.ensureCsrfToken();

    // Add CSRF token to headers for non-GET requests
    const csrfToken = getCsrfToken();
    const headers = { ...options.headers };

    if (csrfToken) {
      headers[CSRF_HEADER] = csrfToken;
    }

    const makeRequest = () => apiClient.delete<T>(url, {
      headers,
      params: options.params,
      data: options.data,
      timeout: options.timeout,
      signal: options.signal
    });

    if (options.retry) {
      const retryConfig = options.retry === true ? {} : options.retry;
      return withRetry<T>(makeRequest, retryConfig);
    }

    try {
      return await makeRequest();
    } catch (error) {
      // If we get a 403 Forbidden error, it might be due to an invalid CSRF token
      if (error instanceof ApiError && error.status === 403 && error.message.includes('CSRF')) {
        // Try to refresh the token and retry the request once
        console.log('CSRF validation failed, refreshing token and retrying...');
        const refreshed = await refreshCsrfToken();
        if (refreshed) {
          // Update the CSRF token in headers
          const newToken = getCsrfToken();
          if (newToken) {
            headers[CSRF_HEADER] = newToken;
            // Retry the request with the new token
            return await apiClient.delete<T>(url, {
              headers,
              params: options.params,
              data: options.data,
              timeout: options.timeout,
              signal: options.signal
            });
          }
        }
      }
      throw handleApiError(error);
    }
  },

  /**
   * Safe API call with error handling that returns a tuple of [data, error]
   *
   * @param method API method to call
   * @param errorMessage Custom error message
   * @returns Promise with the [data, error] tuple
   */
  safe<T>(
    method: () => Promise<T>,
    errorMessage?: string
  ): Promise<[T | null, ApiError | null]> {
    return safeApiCall(method, errorMessage);
  }
};
