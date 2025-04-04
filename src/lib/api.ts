/**
 * API client for making HTTP requests
 * Implements secure authentication using HttpOnly cookies
 */

// Default API configuration
const API_CONFIG = {
  baseURL: 'http://localhost:5000', // Backend server address
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Enable credentials to allow cookies to be sent with requests
  withCredentials: true
};

/**
 * Check if the authentication cookie is present
 * Note: We can't read the HttpOnly cookie content, only check for existence
 */
const hasAuthCookie = (): boolean => {
  return typeof document !== 'undefined' && document.cookie.includes('auth_token=');
};

/**
 * Check if the user session is authenticated
 */
const isAuthenticated = (): boolean => {
  return hasAuthCookie();
};

/**
 * Get headers for API requests
 * Note: We no longer need to manually add auth tokens as they're in HttpOnly cookies
 */
const getRequestHeaders = (): Record<string, string> => {
  return { ...API_CONFIG.headers };
};

/**
 * Handle API response errors
 */
const handleApiResponseError = async (response: Response): Promise<never> => {
  let errorMessage = 'API request failed';
  
  try {
    const errorData = await response.json();
    errorMessage = errorData.error || errorData.message || errorMessage;
  } catch (e) {
    // If parsing fails, use the status text
    errorMessage = `${response.status}: ${response.statusText}`;
  }
  
  const error = new Error(errorMessage);
  (error as any).status = response.status;
  (error as any).response = response;
  
  throw error;
};

// Simple API client that uses HttpOnly cookies for authentication
export const api = {
  /**
   * API configuration
   */
  config: API_CONFIG,
  
  /**
   * Check if user is authenticated (has auth cookie)
   */
  isAuthenticated,
  
  /**
   * Perform GET request with credentials
   */
  async get<T = any>(url: string, params?: Record<string, string>): Promise<T> {
    // Build URL with query parameters
    let requestUrl = `${API_CONFIG.baseURL}${url}`;
    
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        requestUrl += `?${queryString}`;
      }
    }
    
    // Make request with credentials to include cookies
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: getRequestHeaders(),
      credentials: 'include',
    });
    
    // Handle errors
    if (!response.ok) {
      await handleApiResponseError(response);
    }
    
    // Parse response
    return await response.json();
  },
  
  /**
   * Perform POST request with credentials
   */
  async post<T = any>(url: string, body?: any): Promise<T> {
    const response = await fetch(`${API_CONFIG.baseURL}${url}`, {
      method: 'POST',
      headers: getRequestHeaders(),
      credentials: 'include',
      body: body ? JSON.stringify(body) : null
    });
    
    // Handle errors
    if (!response.ok) {
      await handleApiResponseError(response);
    }
    
    // Parse response if it has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  },
  
  /**
   * Perform PUT request with credentials
   */
  async put<T = any>(url: string, body?: any): Promise<T> {
    const response = await fetch(`${API_CONFIG.baseURL}${url}`, {
      method: 'PUT',
      headers: getRequestHeaders(),
      credentials: 'include',
      body: body ? JSON.stringify(body) : null
    });
    
    // Handle errors
    if (!response.ok) {
      await handleApiResponseError(response);
    }
    
    // Parse response
    return await response.json();
  },
  
  /**
   * Perform DELETE request with credentials
   */
  async delete<T = any>(url: string): Promise<T> {
    const response = await fetch(`${API_CONFIG.baseURL}${url}`, {
      method: 'DELETE',
      headers: getRequestHeaders(),
      credentials: 'include'
    });
    
    // Handle errors
    if (!response.ok) {
      await handleApiResponseError(response);
    }
    
    // Parse response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  }
};