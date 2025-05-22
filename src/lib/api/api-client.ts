import { generateId } from '@/lib/utils';
import { apiConfig, API_CONSTANTS } from './config';
import { AUTH_CONFIG } from '@/features/auth/config/authConfig';
import { isProduction } from '@/lib/utils/env';
import {
  handleApiError,
  ApiError,
  ApiErrorType,
  safeApiCall
} from './api-error-handler';

// Check if development mode
const isDevelopment = import.meta.env.MODE === 'development';
const isAuthBypassEnabled = AUTH_CONFIG.DEV_MODE.BYPASS_AUTH;

// Development headers to include in every request in dev mode - removed all custom headers
const DEV_HEADERS = {};

/**
 * Normalize URL to prevent issues with double slashes or missing prefixes
 */
const normalizeUrl = (path: string): string => {
  // Skip processing for absolute URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Remove leading slash for consistent processing
  const trimmedPath = path.startsWith('/') ? path.substring(1) : path;

  // Extract API prefix without leading slash for comparison
  const apiPrefixTrimmed = apiConfig.apiPrefix.startsWith('/')
    ? apiConfig.apiPrefix.substring(1)
    : apiConfig.apiPrefix;

  // Special case for empty path - just return the base URL with API prefix
  if (trimmedPath === '') {
    return `${apiConfig.baseUrl}/${apiPrefixTrimmed}`;
  }

  // Check if the path already includes the API prefix
  const hasApiPrefix = trimmedPath.startsWith(apiPrefixTrimmed) ||
                       trimmedPath.startsWith(`${apiPrefixTrimmed}/`);

  // Build the full URL with API prefix only if needed
  const fullUrl = hasApiPrefix
    ? `${apiConfig.baseUrl}/${trimmedPath}`
    : `${apiConfig.baseUrl}/${apiPrefixTrimmed}/${trimmedPath}`;

  // Replace any double slashes that aren't part of http(s)://
  return fullUrl.replace(/([^:]\/)\/+/g, '$1');
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
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Origin': window.location.origin
  };

  // Log the current origin for debugging
  console.log('[API] Request origin:', window.location.origin);

  // Only add Content-Type for non-empty values (allows FormData to set its own)
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[API] Using Bearer token for authentication');
  } else {
    console.log('[API] No Bearer token found, relying on cookies for authentication');
  }

  // Add CSRF token if available
  const csrfToken = localStorage.getItem('csrf_token') || sessionStorage.getItem('csrf_token');
  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken;
    console.log('[API] CSRF token included in request');
  } else {
    console.log('[API] No CSRF token found');
  }

  return headers;
};

/**
 * Process API response
 */
const processResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  // Handle empty responses
  if (response.status === 204 || !isJson) {
    return {
      success: response.ok,
      status: response.status,
      data: null as unknown as T,
      error: response.ok ? null : 'Non-JSON response received',
      message: response.ok ? 'Success' : 'Error'
    };
  }

  try {
    const data = await response.json();

    // Check if response includes a refreshed token
    const newToken = response.headers.get('X-Refreshed-Token');
    const tokenRefreshed = !!newToken;

    if (tokenRefreshed && newToken) {
      // Store the new token
      localStorage.setItem('auth_token', newToken);
    }

    if (!response.ok) {
      // Handle error responses
      return {
        success: false,
        status: response.status,
        data: data.data || null as unknown as T,
        error: data.message || data.error || 'Unknown error',
        message: data.message || 'Error',
        tokenRefreshed
      };
    }

    // Handle successful responses
    return {
      success: true,
      status: response.status,
      data: data.data || data,
      message: data.message || 'Success',
      tokenRefreshed
    };
  } catch (err) {
    // Handle JSON parsing errors
    const error = err instanceof Error ? err : new Error('Failed to parse response');

    console.error('Error parsing API response:', error);

    return {
      success: false,
      status: response.status,
      data: null as unknown as T,
      error: error.message || 'Failed to parse response',
      message: 'Error parsing response'
    };
  }
};

// API response types
export interface ApiResponse<T> {
  success: boolean;
  status?: number;
  data: T;
  error?: string | null;
  message?: string;
  tokenRefreshed?: boolean;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API client configuration
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

// API constants - using values from centralized config
const DEFAULT_TIMEOUT = API_CONSTANTS.TIMEOUT;
const DEFAULT_RETRY_COUNT = API_CONSTANTS.RETRY_COUNT;
const DEFAULT_RETRY_DELAY = API_CONSTANTS.RETRY_DELAY;
const DEFAULT_API_PREFIX = API_CONSTANTS.PREFIX.substring(1); // Remove leading slash

/**
 * API Client class for making HTTP requests
 */
export class ApiClient<T = any> {
  private config: ApiClientConfig;
  private authToken?: string;
  private connectionFailed: boolean = false;

  constructor(config: Partial<ApiClientConfig> = {}) {
    // Set default config values using centralized configuration
    this.config = {
      baseUrl: config.baseUrl || API_CONSTANTS.URL,
      headers: config.headers || apiConfig.headers,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      mockDelay: config.mockDelay || 500,
      useMock: config.useMock ?? apiConfig.useMockData,
      retryCount: config.retryCount || DEFAULT_RETRY_COUNT,
      retryDelay: config.retryDelay || DEFAULT_RETRY_DELAY,
      withCredentials: config.withCredentials ?? true,
      apiPrefix: config.apiPrefix || DEFAULT_API_PREFIX
    };
  }

  /**
   * Set configuration options
   */
  setConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Alias for setConfig for backward compatibility
   */
  updateConfig(config: Partial<ApiClientConfig>): void {
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
  setConnectionFailed(failed: boolean): void {
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
  setAuthToken(token: string | undefined): void {
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
  clearAuthToken(): void {
    this.authToken = undefined;
  }

  /**
   * Build the complete URL for an API request
   */
  buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Start with the normalized URL
    let url = normalizeUrl(endpoint);

    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => queryParams.append(`${key}[]`, String(v)));
          } else {
            queryParams.append(key, String(value));
          }
        }
      }

      const queryString = queryParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    return url;
  }

  /**
   * Process API response with enhanced error handling
   */
  async processResponse<T>(response: Response, endpoint: string): Promise<ApiResponse<T>> {
    try {
      // Process the response normally first
      const result = await processResponse<T>(response);

      // If there's an error, enhance it with our error handling
      if (!result.success) {
        throw new ApiError(
          result.error || 'Unknown error',
          response.status === 0 ? ApiErrorType.NETWORK :
          response.status === 401 || response.status === 403 ? ApiErrorType.AUTHORIZATION :
          response.status === 404 ? ApiErrorType.NOT_FOUND :
          response.status >= 500 ? ApiErrorType.SERVER :
          ApiErrorType.UNKNOWN,
          response.status,
          endpoint
        );
      }

      return result;
    } catch (error) {
      // Use our centralized error handler
      const enhancedError = handleApiError(error, endpoint);

      // Return a standardized error response
      return {
        success: false,
        status: enhancedError.statusCode,
        data: null as unknown as T,
        error: enhancedError.message,
        message: enhancedError.getUserFriendlyMessage()
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
  async get<T = any>(
    path: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const headers = buildHeaders();

    try {
      // Use existing signal from options if provided, otherwise create a new one
      const existingSignal = options.signal as AbortSignal;
      const controller = existingSignal ? null : new AbortController();
      let timeoutId: NodeJS.Timeout | null = null;

      // Only set timeout if we created our own controller
      if (controller) {
        timeoutId = setTimeout(() => {
          controller.abort(new Error('Request timed out'));
        }, this.config.timeout);
      }

      // Merge headers properly
      const mergedHeaders = { ...headers, ...(options.headers || {}) };

      // Use the existing signal or our controller's signal
      const signal = existingSignal || (controller ? controller.signal : undefined);

      const response = await fetch(url, {
        method: 'GET',
        credentials: this.config.withCredentials ? 'include' : 'same-origin',
        signal,
        ...options,
        headers: mergedHeaders
      });

      // Clear timeout if we set one
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      return this.processResponse<T>(response, path);
    } catch (error) {
      // Handle fetch errors (network, timeout, etc.)
      const originalError = error instanceof Error ? error : new Error(String(error));

      // Special handling for aborted requests
      if (originalError.name === 'AbortError') {
        console.log(`Request to ${path} was aborted`, originalError);

        // If it's our timeout abort, we can retry
        if (retryCount < (this.config.retryCount || 0) &&
            originalError.message === 'Request timed out') {
          // Exponential backoff
          const delay = this.config.retryDelay! * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));

          // Retry the request
          return this.get<T>(path, options, retryCount + 1);
        }

        // If it's an external abort (like component unmounting), just return gracefully
        // with a standardized response
        const abortError = new Error('Request was cancelled');
        abortError.name = 'AbortError';

        return {
          success: false,
          status: 0, // Use 0 to indicate client-side abort
          data: null as unknown as T,
          error: 'Request was cancelled',
          message: 'The request was cancelled'
        };
      }

      // For network errors, retry if we haven't exceeded retry count
      if (retryCount < (this.config.retryCount || 0) &&
          originalError.message.includes('network')) {
        // Exponential backoff
        const delay = this.config.retryDelay! * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the request
        return this.get<T>(path, options, retryCount + 1);
      }

      // Use our enhanced error handling
      const apiError = handleApiError(error, path);

      return {
        success: false,
        data: null as unknown as T,
        error: apiError.message,
        message: apiError.getUserFriendlyMessage()
      };
    }
  }

  /**
   * Make a POST request with enhanced error handling
   * @param path API endpoint path
   * @param data Request body data
   * @param options Optional fetch options
   * @param retryCount Number of retries attempted (internal use)
   * @returns Promise with standardized response
   */
  async post<T = any>(
    path: string,
    data: any = {},
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const isFormData = data instanceof FormData;
    const headers = buildHeaders(isFormData ? '' : 'application/json');

    try {
      // Use existing signal from options if provided, otherwise create a new one
      const existingSignal = options.signal as AbortSignal;
      const controller = existingSignal ? null : new AbortController();
      let timeoutId: NodeJS.Timeout | null = null;

      // Only set timeout if we created our own controller
      if (controller) {
        // Use a longer timeout for specific requests that might take longer
        const isUserCreation = path.includes('users') && !path.includes('/');
        const isRoleCreation = path.includes('roles') && (path.includes('CREATE') || !path.includes('/'));

        let timeout = this.config.timeout;

        // Apply longer timeouts for specific operations
        if (isUserCreation || isRoleCreation) {
          timeout = this.config.timeout * 3; // Triple the timeout for user/role creation
          console.log(`Using extended timeout (${timeout}ms) for ${path}`);
        }

        timeoutId = setTimeout(() => {
          console.log(`Request timeout after ${timeout}ms for ${path}`);
          controller.abort(new Error('Request timed out'));
        }, timeout);
      }

      const body = isFormData ? data : JSON.stringify(data);

      // Merge headers properly
      const mergedHeaders = { ...headers, ...(options.headers || {}) };

      // Use the existing signal or our controller's signal
      const signal = existingSignal || (controller ? controller.signal : undefined);

      console.log(`Making POST request to ${path}`, {
        hasExistingSignal: !!existingSignal,
        timeout: controller ? (path.includes('users') && !path.includes('/') ? this.config.timeout * 2 : this.config.timeout) : 'using external signal'
      });

      const response = await fetch(url, {
        method: 'POST',
        credentials: this.config.withCredentials ? 'include' : 'same-origin',
        body,
        signal,
        ...options,
        headers: mergedHeaders
      });

      // Clear timeout if we set one
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      return this.processResponse<T>(response, path);
    } catch (error) {
      // Handle fetch errors (network, timeout, etc.)
      const originalError = error instanceof Error ? error : new Error(String(error));

      // Special handling for aborted requests
      if (originalError.name === 'AbortError') {
        console.log(`POST request to ${path} was aborted`, originalError);

        // If it's our timeout abort, we can retry
        if (retryCount < (this.config.retryCount || 0) &&
            originalError.message === 'Request timed out') {

          // For role-related requests, use more aggressive retry strategy
          const isRoleRequest = path.includes('roles');
          const maxRetries = isRoleRequest ? (this.config.retryCount || 0) + 2 : (this.config.retryCount || 0);

          if (retryCount < maxRetries) {
            console.log(`Retrying POST request to ${path} after timeout (attempt ${retryCount + 1}/${maxRetries})`);

            // Exponential backoff with a base delay
            let delay = this.config.retryDelay! * Math.pow(1.5, retryCount);

            // For role requests, use a more aggressive retry strategy with shorter initial delays
            if (isRoleRequest && retryCount === 0) {
              delay = this.config.retryDelay! / 2; // Start with a shorter delay for the first retry
            }

            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));

            // Retry the request
            return this.post<T>(path, data, options, retryCount + 1);
          }
        }

        // If it's an external abort (like component unmounting), just return gracefully
        // with a standardized response
        console.log(`POST request to ${path} was cancelled externally`);
        const abortError = new Error('Request was cancelled');
        abortError.name = 'AbortError';

        return {
          success: false,
          status: 0, // Use 0 to indicate client-side abort
          data: null as unknown as T,
          error: 'Request was cancelled',
          message: 'The request was cancelled'
        };
      }

      // Check if we should retry for network issues
      if (retryCount < (this.config.retryCount || 0) && originalError.message.includes('network')) {
        // Exponential backoff
        const delay = this.config.retryDelay! * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the request
        return this.post<T>(path, data, options, retryCount + 1);
      }

      // Use our enhanced error handling
      const apiError = handleApiError(error, path);

      return {
        success: false,
        data: null as unknown as T,
        error: apiError.message,
        message: apiError.getUserFriendlyMessage()
      };
    }
  }

  /**
   * Make a PUT request with enhanced error handling
   * @param path API endpoint path
   * @param data Request body data
   * @param options Optional fetch options
   * @param retryCount Number of retries attempted (internal use)
   * @returns Promise with standardized response
   */
  async put<T = any>(
    path: string,
    data: any = {},
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const isFormData = data instanceof FormData;
    const headers = buildHeaders(isFormData ? '' : 'application/json');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const body = isFormData ? data : JSON.stringify(data);

      // Merge headers properly
      const mergedHeaders = { ...headers, ...(options.headers || {}) };

      const response = await fetch(url, {
        method: 'PUT',
        credentials: this.config.withCredentials ? 'include' : 'same-origin',
        body,
        signal: controller.signal,
        ...options,
        headers: mergedHeaders
      });

      clearTimeout(timeoutId);

      return this.processResponse<T>(response, path);
    } catch (error) {
      // Handle fetch errors (network, timeout, etc.)
      const originalError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (retryCount < (this.config.retryCount || 0) &&
         (originalError.name === 'AbortError' || originalError.message.includes('network'))) {
        // Exponential backoff
        const delay = this.config.retryDelay! * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the request
        return this.put<T>(path, data, options, retryCount + 1);
      }

      // Use our enhanced error handling
      const apiError = handleApiError(error, path);

      return {
        success: false,
        data: null as unknown as T,
        error: apiError.message,
        message: apiError.getUserFriendlyMessage()
      };
    }
  }

  /**
   * Make a DELETE request with enhanced error handling
   * @param path API endpoint path
   * @param options Optional fetch options
   * @param retryCount Number of retries attempted (internal use)
   * @returns Promise with standardized response
   */
  async delete<T = any>(
    path: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const headers = buildHeaders();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      // Merge headers properly
      const mergedHeaders = { ...headers, ...(options.headers || {}) };

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: this.config.withCredentials ? 'include' : 'same-origin',
        signal: controller.signal,
        ...options,
        headers: mergedHeaders
      });

      clearTimeout(timeoutId);

      return this.processResponse<T>(response, path);
    } catch (error) {
      // Handle fetch errors (network, timeout, etc.)
      const originalError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (retryCount < (this.config.retryCount || 0) &&
         (originalError.name === 'AbortError' || originalError.message.includes('network'))) {
        // Exponential backoff
        const delay = this.config.retryDelay! * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the request
        return this.delete<T>(path, options, retryCount + 1);
      }

      // Use our enhanced error handling
      const apiError = handleApiError(error, path);

      return {
        success: false,
        data: null as unknown as T,
        error: apiError.message,
        message: apiError.getUserFriendlyMessage()
      };
    }
  }

  /**
   * Make a PATCH request with enhanced error handling
   * @param path API endpoint path
   * @param data Request body data
   * @param options Optional fetch options
   * @param retryCount Number of retries attempted (internal use)
   * @returns Promise with standardized response
   */
  async patch<T = any>(
    path: string,
    data: any = {},
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const isFormData = data instanceof FormData;
    const headers = buildHeaders(isFormData ? '' : 'application/json');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const body = isFormData ? data : JSON.stringify(data);

      // Merge headers properly
      const mergedHeaders = { ...headers, ...(options.headers || {}) };

      const response = await fetch(url, {
        method: 'PATCH',
        credentials: this.config.withCredentials ? 'include' : 'same-origin',
        body,
        signal: controller.signal,
        ...options,
        headers: mergedHeaders
      });

      clearTimeout(timeoutId);

      return this.processResponse<T>(response, path);
    } catch (error) {
      // Handle fetch errors (network, timeout, etc.)
      const originalError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (retryCount < (this.config.retryCount || 0) &&
         (originalError.name === 'AbortError' || originalError.message.includes('network'))) {
        // Exponential backoff
        const delay = this.config.retryDelay! * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the request
        return this.patch<T>(path, data, options, retryCount + 1);
      }

      // Use our enhanced error handling
      const apiError = handleApiError(error, path);

      return {
        success: false,
        data: null as unknown as T,
        error: apiError.message,
        message: apiError.getUserFriendlyMessage()
      };
    }
  }

  /**
   * Make a GET request with pagination support and enhanced error handling
   * @param path API endpoint path
   * @param params Query parameters including pagination options
   * @param options Optional fetch options
   * @param retryCount Number of retries attempted (internal use)
   * @returns Promise with standardized paginated response
   */
  async getPaginated<T = any>(
    path: string,
    params: any = {},
    options: RequestInit = {},
    retryCount = 0
  ): Promise<PaginatedApiResponse<T>> {
    try {
      // Extract pagination params
      const { page = 1, limit = 20, ...restParams } = params;

      // Build query parameters with pagination
      const queryParams = {
        ...restParams,
        page,
        limit
      };

      // Make the request
      const response = await this.get<any>(path, {
        ...options,
        params: queryParams
      }, retryCount);

      // If successful, process pagination
      if (response.success) {
        // Check if response is already in paginated format
        if (response.data &&
            (response.data.pagination ||
             (typeof response.data.total !== 'undefined' &&
              typeof response.data.page !== 'undefined'))) {

          const result: PaginatedApiResponse<T> = {
            ...response,
            data: response.data.data || response.data.items || [],
            pagination: response.data.pagination || {
              page: response.data.page || page,
              limit: response.data.limit || limit,
              total: response.data.total || 0,
              totalPages: response.data.totalPages || Math.ceil((response.data.total || 0) / limit)
            },
            page: response.data.page || page,
            limit: response.data.limit || limit,
            total: response.data.total || 0,
            totalPages: response.data.totalPages || Math.ceil((response.data.total || 0) / limit)
          };

          return result;
        }

        // If response is not in paginated format, create pagination info
        return {
          ...response,
          data: Array.isArray(response.data) ? response.data : [],
          pagination: {
            page,
            limit,
            total: Array.isArray(response.data) ? response.data.length : 0,
            totalPages: 1
          },
          page,
          limit,
          total: Array.isArray(response.data) ? response.data.length : 0,
          totalPages: 1
        };
      }

      // Return error response
      return {
        ...response,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        },
        page,
        limit,
        total: 0,
        totalPages: 0
      };
    } catch (error) {
      // Use our enhanced error handling
      const apiError = handleApiError(error, path);

      return {
        success: false,
        data: [],
        error: apiError.message,
        message: apiError.getUserFriendlyMessage(),
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: 0,
          totalPages: 0
        },
        page: params.page || 1,
        limit: params.limit || 20,
        total: 0,
        totalPages: 0
      };
    }
  }

  /**
   * Safe API call with fallback data support
   * @param apiCall Function that calls an API endpoint
   * @param fallbackData Optional fallback data to return on error
   * @param silent Whether to suppress error messages
   * @returns API response or fallback data
   */
  async safeCall<T = any>(
    apiCall: () => Promise<ApiResponse<T>>,
    fallbackData?: T,
    silent: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      return await apiCall();
    } catch (error) {
      // Log error but don't show toast if silent
      console.error('API call failed:', error);

      const apiError = handleApiError(error);

      // Return fallback response
      return {
        success: false,
        data: fallbackData as unknown as T,
        error: apiError.message,
        message: apiError.getUserFriendlyMessage()
      };
    }
  }

  /**
   * Safe paginated API call with fallback
   * @param apiCall Function that calls a paginated API endpoint
   * @param fallbackData Optional fallback data to return on error
   * @param silent Whether to suppress error messages
   * @returns Paginated API response or fallback data
   */
  async safePaginatedCall<T = any>(
    apiCall: () => Promise<PaginatedApiResponse<T>>,
    fallbackData: T[] = [],
    silent: boolean = false
  ): Promise<PaginatedApiResponse<T>> {
    try {
      return await apiCall();
    } catch (error) {
      // Log error but don't show toast if silent
      console.error('API call failed:', error);

      const apiError = handleApiError(error);

      // Return fallback response
      return {
        success: false,
        data: fallbackData,
        error: apiError.message,
        message: apiError.getUserFriendlyMessage(),
        pagination: {
          page: 1,
          limit: fallbackData.length || 20,
          total: fallbackData.length,
          totalPages: fallbackData.length ? 1 : 0
        },
        page: 1,
        limit: fallbackData.length || 20,
        total: fallbackData.length,
        totalPages: fallbackData.length ? 1 : 0
      };
    }
  }
}

// Create a default instance
export const apiClient = new ApiClient();

// Default export for compatibility
export default apiClient;
