import { generateId } from '@/lib/utils';
import { apiConfig } from './config';
import { AUTH_CONFIG } from '@/features/auth/config/authConfig';
import { isProduction } from '@/lib/utils/env';

// Check if development mode
const isDevelopment = import.meta.env.MODE === 'development';
const isAuthBypassEnabled = AUTH_CONFIG.DEV_MODE.BYPASS_AUTH;

// Development headers to include in every request in dev mode
const DEV_HEADERS = {
  'X-Development-Mode': 'true',
  'X-Auth-Bypass': isAuthBypassEnabled ? 'true' : 'false'
};

/**
 * Normalize URL to prevent issues with double slashes or missing prefixes
 */
const normalizeUrl = (path: string): string => {
  // Remove leading slash if exists
  const trimmedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Construct the full URL with the proper API base URL
  return `${apiConfig.baseUrl}/${apiConfig.apiPrefix}/${trimmedPath}`.replace(/([^:]\/)\/+/g, '$1');
};

/**
 * Get authentication token from storage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
};

/**
 * Build headers with authentication token and content type
 */
const buildHeaders = (contentType: string = 'application/json'): Record<string, string> => {
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  
  // Only add Content-Type for non-empty values (allows FormData to set its own)
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add development headers in dev mode
  if (isDevelopment) {
    Object.assign(headers, DEV_HEADERS);
  }
  
  return headers;
};

/**
 * Process API response
 */
const processResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  // Handle 401 Unauthorized globally by dispatching an auth event
  if (response.status === 401) {
    console.error('[API] Unauthorized request');
    
    // Dispatch an unauthorized event that the auth system can listen for
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized', {
        detail: { timestamp: new Date().toISOString() }
      }));
    }
  }
  
  // Handle 403 Forbidden (e.g., insufficient permissions)
  if (response.status === 403) {
    console.error('[API] Forbidden request - insufficient permissions');
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:forbidden', {
        detail: { timestamp: new Date().toISOString() }
      }));
    }
  }

  try {
    // Try to parse JSON response
    const data = await response.json();
    
    // Standard response format
    return {
      success: response.ok,
      status: response.status,
      data: response.ok ? data as T : null as unknown as T,
      error: !response.ok ? (data.message || data.error || 'Unknown error') : null
    };
  } catch (error) {
    // Handle non-JSON responses (e.g., server errors)
    return {
      success: false,
      status: response.status,
      data: null as unknown as T,
      error: `Failed to parse response: ${response.statusText}`
    };
  }
};

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  status?: number;
  data: T;
  error?: string | null;
  message?: string;
  tokenRefreshed?: boolean;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]> | null;
}

export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  mockDelay?: number;
  useMock?: boolean;
  retryCount?: number;
  retryDelay?: number;
  withCredentials?: boolean;
  apiPrefix?: string;
}

// API constants
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000;
const DEFAULT_API_PREFIX = 'api/v1';

/**
 * Handle API errors in a consistent way
 * @param error Error object from catch block
 * @param fallbackMessage Default message if error cannot be parsed
 * @returns Formatted error message
 */
export function handleApiError(error: any, fallbackMessage = 'An unexpected error occurred'): string {
  // Handle API error responses
  if (error.response) {
    // Try to extract error message from response
    if (error.response.data?.message) return error.response.data.message;
    if (error.response.data?.error) return error.response.data.error;
    if (error.response.statusText) return `${error.response.status}: ${error.response.statusText}`;
    return `Error ${error.response.status}`;
  }

  // Handle network errors
  if (error.request) return 'Network error: Server not responding';

  // Handle other errors
  return error.message || fallbackMessage;
}

/**
 * API Client class for making HTTP requests
 */
export class ApiClient {
  private config: ApiClientConfig;
  private authToken?: string;
  private connectionFailed: boolean = false;

  constructor(config: Partial<ApiClientConfig> = {}) {
    // Set default config values
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:5000',
      headers: config.headers || {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: config.timeout || DEFAULT_TIMEOUT,
      mockDelay: config.mockDelay || 500,
      useMock: config.useMock ?? false,
      retryCount: config.retryCount || DEFAULT_RETRY_COUNT,
      retryDelay: config.retryDelay || DEFAULT_RETRY_DELAY,
      withCredentials: config.withCredentials ?? true,
      apiPrefix: config.apiPrefix || DEFAULT_API_PREFIX
    };
  }

  /**
   * Set configuration options
   */
  setConfig(config: Partial<ApiClientConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Alias for setConfig for backward compatibility
   */
  updateConfig(config: Partial<ApiClientConfig>) {
    this.setConfig(config);
  }

  /**
   * Get the current configuration
   */
  getConfig(): ApiClientConfig {
    return { ...this.config };
  }

  /**
   * Set connection failed state
   */
  setConnectionFailed(failed: boolean) {
    this.connectionFailed = failed;
  }

  /**
   * Check if connection has failed
   */
  hasConnectionFailed(): boolean {
    return this.connectionFailed;
  }

  /**
   * Set authentication token for API requests
   * Note: This is only used for non-cookie authentication as a fallback
   * The primary authentication method is HttpOnly cookies
   */
  setAuthToken(token: string | undefined) {
    this.authToken = token;
  }

  /**
   * Get the current auth token
   * Note: This doesn't reflect HttpOnly cookie state, only the fallback token
   */
  getAuthToken(): string | undefined {
    return this.authToken;
  }

  /**
   * Check if auth token exists
   * Note: This doesn't check HttpOnly cookie state, only the fallback token
   */
  hasAuthToken(): boolean {
    return !!this.authToken;
  }

  /**
   * Clear authentication token
   * Note: This doesn't clear HttpOnly cookies, only the fallback token
   */
  clearAuthToken() {
    this.authToken = undefined;
  }

  /**
   * Build the complete URL for an API request
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Remove any leading slashes from the endpoint
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    // Ensure the base URL doesn't have a trailing slash
    const baseUrl = this.config.baseUrl.endsWith('/')
      ? this.config.baseUrl.slice(0, -1)
      : this.config.baseUrl;

    // Ensure the API prefix has leading slash but no trailing slash
    let apiPrefix = this.config.apiPrefix || '';
    if (!apiPrefix.startsWith('/')) apiPrefix = `/${apiPrefix}`;
    if (apiPrefix.endsWith('/')) apiPrefix = apiPrefix.slice(0, -1);

    // Construct the full URL
    let url = `${baseUrl}${apiPrefix}/${cleanEndpoint}`;

    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params as Record<string, string>).toString();
      url += `?${queryString}`;
    }

    // Add cache-busting parameter in development
    if (!isProduction) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}_=${Date.now()}`;
    }

    return url;
  }

  /**
   * Process API response
   */
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Handle 401 Unauthorized globally by attempting token refresh
    if (response.status === 401) {
      console.log('[API] Unauthorized request, attempting token refresh');

      // Import dynamically to avoid circular dependency
      const { authService } = await import('../../features/auth/services/authService');

      try {
        // Attempt to refresh the token
        const refreshResult = await authService.refreshToken();

        if (refreshResult) {
          console.log('[API] Token refreshed successfully, dispatching token refreshed event');
          // Dispatch token refreshed event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:token:refreshed', {
              detail: { timestamp: new Date().toISOString() }
            }));
          }

          // Return a special response indicating token was refreshed
          return {
            success: false,
            status: 401,
            data: null as unknown as T,
            error: 'Token refreshed. Please retry the request.',
            tokenRefreshed: true
          };
        } else {
          console.error('[API] Token refresh failed');
          // Dispatch an unauthorized event that the auth system can listen for
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:unauthorized', {
              detail: { timestamp: new Date().toISOString() }
            }));
          }
        }
      } catch (refreshError) {
        console.error('[API] Error during token refresh:', refreshError);
        // Dispatch an unauthorized event that the auth system can listen for
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized', {
            detail: { timestamp: new Date().toISOString(), error: refreshError }
          }));
        }
      }
    }

    // Handle 403 Forbidden (e.g., insufficient permissions)
    if (response.status === 403) {
      console.error('[API] Forbidden request - insufficient permissions');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:forbidden', {
          detail: { timestamp: new Date().toISOString() }
        }));
      }
    }

    try {
      // Try to parse JSON response
      const data = await response.json();
      
      // Log the response structure in development mode for debugging
      if (isDevelopment) {
        console.debug(`[API] Response structure for ${response.url}:`, {
          status: response.status,
          ok: response.ok,
          dataType: typeof data,
          isArray: Array.isArray(data),
          keys: data && typeof data === 'object' ? Object.keys(data) : 'N/A'
        });
      }

      // Standard response format
      return {
        success: response.ok,
        status: response.status,
        data: response.ok ? data as T : null as unknown as T,
        error: !response.ok ? (data.message || data.error || 'Unknown error') : null
      };
    } catch (error) {
      // Handle non-JSON responses (e.g., server errors)
      console.error(`[API] Failed to parse JSON response from ${response.url}:`, error);
      return {
        success: false,
        status: response.status,
        data: null as unknown as T,
        error: `Failed to parse response: ${response.statusText}`
      };
    }
  }

  /**
   * Make a GET request
   * @param path API endpoint path
   * @param options Optional fetch options
   * @param retryCount Number of retries attempted (internal use)
   * @returns Promise with standardized response
   */
  async get<T = any>(path: string, options: RequestInit = {}, retryCount = 0): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(path);
      const headers = { ...this.config.headers };

      // Only add Authorization header if an auth token is explicitly set
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
        ...options
      });
      
      const processedResponse = await this.processResponse<T>(response);

      // If token was refreshed and we haven't exceeded retry limit, retry the request
      if (processedResponse.tokenRefreshed && retryCount < 1) {
        console.log(`[API] Retrying GET ${path} after token refresh`);
        return this.get<T>(path, options, retryCount + 1);
      }

      return processedResponse;
    } catch (error: any) {
      console.error(`[API] GET ${path} failed:`, error);
      
      return {
        success: false,
        status: 0,
        data: null as unknown as T,
        error: error.message || 'Network error'
      };
    }
  }
  
  /**
   * Make a POST request
   * @param path API endpoint path
   * @param data Request body data
   * @param options Optional fetch options
   * @param retryCount Number of retries attempted (internal use)
   * @returns Promise with standardized response
   */
  async post<T = any>(path: string, data: any = {}, options: RequestInit = {}, retryCount = 0): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(path);
      const headers = { ...this.config.headers };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
        ...options
      });
      
      const processedResponse = await this.processResponse<T>(response);

      // If token was refreshed and we haven't exceeded retry limit, retry the request
      if (processedResponse.tokenRefreshed && retryCount < 1) {
        console.log(`[API] Retrying POST ${path} after token refresh`);
        return this.post<T>(path, data, options, retryCount + 1);
      }

      return processedResponse;
    } catch (error: any) {
      console.error(`[API] POST ${path} failed:`, error);
      
      return {
        success: false,
        status: 0,
        data: null as unknown as T,
        error: error.message || 'Network error'
      };
    }
  }
  
  /**
   * Make a PUT request
   * @param path API endpoint path
   * @param data Request body data
   * @param options Optional fetch options
   * @param retryCount Number of retries attempted (internal use)
   * @returns Promise with standardized response
   */
  async put<T = any>(path: string, data: any = {}, options: RequestInit = {}, retryCount = 0): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(path);
      const headers = { ...this.config.headers };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
        ...options
      });
      
      const processedResponse = await this.processResponse<T>(response);

      // If token was refreshed and we haven't exceeded retry limit, retry the request
      if (processedResponse.tokenRefreshed && retryCount < 1) {
        console.log(`[API] Retrying PUT ${path} after token refresh`);
        return this.put<T>(path, data, options, retryCount + 1);
      }

      return processedResponse;
    } catch (error: any) {
      console.error(`[API] PUT ${path} failed:`, error);
      
      return {
        success: false,
        status: 0,
        data: null as unknown as T,
        error: error.message || 'Network error'
      };
    }
  }
  
  /**
   * Make a DELETE request
   * @param path API endpoint path
   * @param options Optional fetch options
   * @param retryCount Number of retries attempted (internal use)
   * @returns Promise with standardized response
   */
  async delete<T = any>(path: string, options: RequestInit = {}, retryCount = 0): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(path);
      const headers = { ...this.config.headers };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        ...options
      });
      
      const processedResponse = await this.processResponse<T>(response);

      // If token was refreshed and we haven't exceeded retry limit, retry the request
      if (processedResponse.tokenRefreshed && retryCount < 1) {
        console.log(`[API] Retrying DELETE ${path} after token refresh`);
        return this.delete<T>(path, options, retryCount + 1);
      }

      return processedResponse;
    } catch (error: any) {
      console.error(`[API] DELETE ${path} failed:`, error);
      
      return {
        success: false,
        status: 0,
        data: null as unknown as T,
        error: error.message || 'Network error'
      };
    }
  }
  
  /**
   * Make a PATCH request
   * @param path API endpoint path
   * @param data Request body data
   * @param options Optional fetch options
   * @param retryCount Number of retries attempted (internal use)
   * @returns Promise with standardized response
   */
  async patch<T = any>(path: string, data: any = {}, options: RequestInit = {}, retryCount = 0): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(path);
      const headers = { ...this.config.headers };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
        ...options
      });
      
      const processedResponse = await this.processResponse<T>(response);

      // If token was refreshed and we haven't exceeded retry limit, retry the request
      if (processedResponse.tokenRefreshed && retryCount < 1) {
        console.log(`[API] Retrying PATCH ${path} after token refresh`);
        return this.patch<T>(path, data, options, retryCount + 1);
      }

      return processedResponse;
    } catch (error: any) {
      console.error(`[API] PATCH ${path} failed:`, error);
      
      return {
        success: false,
        status: 0,
        data: null as unknown as T,
        error: error.message || 'Network error'
      };
    }
  }
}

// Create a default instance
export const apiClient = new ApiClient();

// Helper functions for mocking API (needed by some imports)
export function createMockEntity<T>(data: T): ApiResponse<T> {
      return {
    success: true,
    status: 201,
    data
  };
}

export function updateMockEntity<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    status: 200,
    data
  };
}

export function deleteMockEntity(): ApiResponse<void> {
  return {
    success: true,
    status: 204,
    data: undefined as any
  };
}

// Default export for compatibility
export default apiClient;
