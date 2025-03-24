/**
 * API Service Creator
 * 
 * This utility creates a standardized API service interface for making HTTP requests
 * to specific API endpoints. It provides a consistent interface for CRUD operations
 * and handles common concerns like error handling and request cancellation.
 */

import { apiClient, ApiResponse, PaginatedApiResponse } from './api-client';

/**
 * Query parameters interface for API requests
 */
export interface QueryParams {
  [key: string]: any;
}

/**
 * API Service interface with common CRUD operations
 */
export interface ApiService {
  get: <T>(path?: string, params?: QueryParams) => Promise<T>;
  getById: <T>(id: string) => Promise<T>;
  post: <T, D = any>(path?: string, data?: D) => Promise<T>;
  put: <T, D = any>(id: string, data: D) => Promise<T>;
  patch: <T, D = any>(id: string, data: D) => Promise<T>;
  delete: <T>(id: string) => Promise<T>;
  getPaginated: <T>(path?: string, params?: QueryParams) => Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

/**
 * Creates an API service for a specific endpoint
 * 
 * @param baseEndpoint - The base API endpoint for this service
 * @returns An ApiService instance with methods for interacting with the endpoint
 */
export function createApiService(baseEndpoint: string): ApiService {
  // Store active request AbortControllers to enable cancellation
  const activeRequests: Map<string, AbortController> = new Map();

  /**
   * Cancels any active request with the same requestId
   */
  const cancelActiveRequest = (requestId: string) => {
    if (activeRequests.has(requestId)) {
      const controller = activeRequests.get(requestId);
      controller?.abort();
      activeRequests.delete(requestId);
    }
  };

  /**
   * Registers a new request and returns its AbortController
   */
  const registerRequest = (requestId: string): AbortController => {
    // Cancel any existing request with the same ID
    cancelActiveRequest(requestId);
    
    // Create and store a new AbortController
    const controller = new AbortController();
    activeRequests.set(requestId, controller);
    return controller;
  };

  /**
   * Builds the full URL for an API request
   */
  const buildUrl = (path?: string): string => {
    const endpoint = path ? `${baseEndpoint}/${path}` : baseEndpoint;
    return endpoint.replace(/\/+/g, '/'); // Remove duplicate slashes
  };

  /**
   * Handles the API response and extracts the data
   */
  const handleResponse = <T>(response: ApiResponse<T>): T => {
    if (!response.success) {
      throw new Error(response.message || 'API request failed');
    }
    return response.data;
  };

  /**
   * Handles paginated API response and formats it
   */
  const handlePaginatedResponse = <T>(response: PaginatedApiResponse<T>) => {
    if (!response.success) {
      throw new Error(response.message || 'API request failed');
    }
    
    return {
      data: response.data,
      total: response.pagination.totalItems,
      page: response.pagination.page,
      limit: response.pagination.pageSize,
      totalPages: response.pagination.totalPages,
    };
  };

  // Return the API service interface
  return {
    /**
     * Performs a GET request to retrieve data
     */
    async get<T>(path = '', params?: QueryParams): Promise<T> {
      const requestId = `GET:${buildUrl(path)}:${JSON.stringify(params || {})}`;
      const controller = registerRequest(requestId);
      
      try {
        const response = await apiClient.get<T>(
          buildUrl(path),
          params,
          undefined,
          { signal: controller.signal }
        );
        
        return handleResponse(response);
      } finally {
        activeRequests.delete(requestId);
      }
    },

    /**
     * Performs a GET request to retrieve a specific resource by ID
     */
    async getById<T>(id: string): Promise<T> {
      return this.get<T>(id);
    },

    /**
     * Performs a POST request to create a new resource
     */
    async post<T, D = any>(path = '', data?: D): Promise<T> {
      const requestId = `POST:${buildUrl(path)}`;
      const controller = registerRequest(requestId);
      
      try {
        const response = await apiClient.post<T, D>(
          buildUrl(path),
          data,
          undefined,
          { signal: controller.signal }
        );
        
        return handleResponse(response);
      } finally {
        activeRequests.delete(requestId);
      }
    },

    /**
     * Performs a PUT request to replace a resource
     */
    async put<T, D = any>(id: string, data: D): Promise<T> {
      const requestId = `PUT:${buildUrl(id)}`;
      const controller = registerRequest(requestId);
      
      try {
        const response = await apiClient.put<T, D>(
          buildUrl(id),
          data,
          undefined,
          { signal: controller.signal }
        );
        
        return handleResponse(response);
      } finally {
        activeRequests.delete(requestId);
      }
    },

    /**
     * Performs a PATCH request to update a resource
     */
    async patch<T, D = any>(id: string, data: D): Promise<T> {
      const requestId = `PATCH:${buildUrl(id)}`;
      const controller = registerRequest(requestId);
      
      try {
        const response = await apiClient.patch<T, D>(
          buildUrl(id),
          data,
          undefined,
          { signal: controller.signal }
        );
        
        return handleResponse(response);
      } finally {
        activeRequests.delete(requestId);
      }
    },

    /**
     * Performs a DELETE request to remove a resource
     */
    async delete<T>(id: string): Promise<T> {
      const requestId = `DELETE:${buildUrl(id)}`;
      const controller = registerRequest(requestId);
      
      try {
        const response = await apiClient.delete<T>(
          buildUrl(id),
          undefined,
          { signal: controller.signal }
        );
        
        return handleResponse(response);
      } finally {
        activeRequests.delete(requestId);
      }
    },

    /**
     * Performs a GET request with pagination
     */
    async getPaginated<T>(path = '', params?: QueryParams) {
      const requestId = `GET_PAGINATED:${buildUrl(path)}:${JSON.stringify(params || {})}`;
      const controller = registerRequest(requestId);
      
      try {
        const response = await apiClient.getPaginated<T>(
          buildUrl(path),
          params,
          undefined,
          { signal: controller.signal }
        );
        
        return handlePaginatedResponse(response);
      } finally {
        activeRequests.delete(requestId);
      }
    },
  };
} 