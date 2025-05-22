/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Service Endpoint Factory
 *
 * This module provides utility functions for creating service methods that use
 * the centralized endpoint definitions, reducing duplication in service files
 * and ensuring consistent patterns across the application.
 */

import { apiClient } from './api-client';
import { getModuleEndpoint } from './endpoint-registry';
import { enhancedApiClient } from './enhanced-api-client';
import { getFullEndpointUrl } from './enhanced-config';
import { ApiError, handleApiError } from './error-handler';

/**
 * Standard service operation types
 */
export enum ServiceOperation {
  LIST = 'LIST',
  DETAIL = 'DETAIL',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SEARCH = 'SEARCH',
  BATCH_CREATE = 'BATCH_CREATE',
  BATCH_UPDATE = 'BATCH_UPDATE',
  BATCH_DELETE = 'BATCH_DELETE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT'
}

/**
 * Options for service operations
 */
export interface ServiceMethodOptions {
  useEnhancedClient?: boolean;
  withAuth?: boolean;
  withRetry?: boolean | Record<string, any>;
  cacheResponse?: boolean;
  customErrorHandler?: (error: any) => never;
  mapResponse?: (data: any) => any;
}

/**
 * Create a standard service for a resource using centralized endpoints
 * 
 * @param module The API module name
 * @param options Global options for all methods
 * @returns Object with standard CRUD operations
 */
export function createStandardService<T>(
  module: string,
  options: ServiceMethodOptions = {}
) {
  const {
    useEnhancedClient = true,
    withAuth = true,
    withRetry = false,
    cacheResponse = false,
    customErrorHandler,
    mapResponse
  } = options;
  
  // Use the appropriate client
  const client = useEnhancedClient ? enhancedApiClient : apiClient;
  
  // Helper to get endpoint path
  const getEndpoint = (operation: string) => {
    const endpoint = getModuleEndpoint(module, operation);
    if (!endpoint) {
      throw new Error(`Endpoint not found: ${module}.${operation}`);
    }
    return endpoint;
  };
  
  // Helper to handle errors consistently
  const handleError = (error: any, operation: string) => {
    if (customErrorHandler) {
      return customErrorHandler(error);
    }
    
    const apiError = handleApiError(error);
    console.error(`[${module.toUpperCase()}] ${operation} operation failed:`, apiError.message);
    throw apiError;
  };
  
  // Helper to process response
  const processResponse = (data: any) => {
    if (mapResponse) {
      return mapResponse(data);
    }
    return data;
  };
  
  // Create standard service methods
  return {
    /**
     * List all resources
     * 
     * @param params Optional query parameters
     * @returns Promise with array of resources
     */
    async getAll(params?: Record<string, any>): Promise<T[]> {
      try {
        const response = await client.get(
          getEndpoint(ServiceOperation.LIST),
          undefined,
          {
            params,
            retry: withRetry,
            cache: cacheResponse ? 'default' : 'no-store'
          }
        );
        return processResponse(response);
      } catch (error) {
        return handleError(error, 'getAll');
      }
    },
    
    /**
     * Get a resource by ID
     * 
     * @param id Resource ID
     * @returns Promise with resource or null if not found
     */
    async getById(id: string): Promise<T | null> {
      try {
        const response = await client.get(
          getEndpoint(ServiceOperation.DETAIL),
          { id },
          {
            retry: withRetry,
            cache: cacheResponse ? 'default' : 'no-store'
          }
        );
        return processResponse(response);
      } catch (error) {
        // Special case for 404 errors
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        return handleError(error, 'getById');
      }
    },
    
    /**
     * Create a new resource
     * 
     * @param data Resource data
     * @returns Promise with created resource
     */
    async create(data: Partial<T>): Promise<T> {
      try {
        const response = await client.post(
          getEndpoint(ServiceOperation.CREATE),
          data,
          undefined,
          { retry: false } // Don't retry creation to avoid duplicates
        );
        return processResponse(response);
      } catch (error) {
        return handleError(error, 'create');
      }
    },
    
    /**
     * Update an existing resource
     * 
     * @param id Resource ID
     * @param data Resource data
     * @returns Promise with updated resource
     */
    async update(id: string, data: Partial<T>): Promise<T> {
      try {
        const response = await client.put(
          getEndpoint(ServiceOperation.UPDATE),
          data,
          { id },
          { retry: withRetry }
        );
        return processResponse(response);
      } catch (error) {
        return handleError(error, 'update');
      }
    },
    
    /**
     * Delete a resource
     * 
     * @param id Resource ID
     * @returns Promise with success status
     */
    async delete(id: string): Promise<boolean> {
      try {
        await client.delete(
          getEndpoint(ServiceOperation.DELETE),
          { id },
          { retry: false } // Don't retry deletion
        );
        return true;
      } catch (error) {
        // Special case for 404 errors - consider it already deleted
        if (error instanceof ApiError && error.status === 404) {
          return true;
        }
        return handleError(error, 'delete');
      }
    },
    
    /**
     * Search for resources
     * 
     * @param query Search parameters
     * @returns Promise with matching resources
     */
    async search(query: Record<string, any>): Promise<T[]> {
      try {
        const response = await client.get(
          getEndpoint(ServiceOperation.SEARCH),
          undefined,
          {
            params: query,
            retry: withRetry,
            cache: cacheResponse ? 'default' : 'no-store'
          }
        );
        return processResponse(response);
      } catch (error) {
        return handleError(error, 'search');
      }
    },
    
    /**
     * Batch create multiple resources
     * 
     * @param items Array of resources to create
     * @returns Promise with created resources
     */
    async batchCreate(items: Partial<T>[]): Promise<T[]> {
      try {
        const response = await client.post(
          getEndpoint(ServiceOperation.BATCH_CREATE),
          { items },
          undefined,
          { retry: false }
        );
        return processResponse(response);
      } catch (error) {
        return handleError(error, 'batchCreate');
      }
    },
    
    /**
     * Batch update multiple resources
     * 
     * @param updates Array of resource updates
     * @returns Promise with updated resources
     */
    async batchUpdate(updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]> {
      try {
        const response = await client.post(
          getEndpoint(ServiceOperation.BATCH_UPDATE),
          { updates },
          undefined,
          { retry: withRetry }
        );
        return processResponse(response);
      } catch (error) {
        return handleError(error, 'batchUpdate');
      }
    },
    
    /**
     * Batch delete multiple resources
     * 
     * @param ids Array of resource IDs to delete
     * @returns Promise with success status
     */
    async batchDelete(ids: string[]): Promise<boolean> {
      try {
        await client.post(
          getEndpoint(ServiceOperation.BATCH_DELETE),
          { ids },
          undefined,
          { retry: false }
        );
        return true;
      } catch (error) {
        return handleError(error, 'batchDelete');
      }
    },
    
    /**
     * Export resources
     * 
     * @param format Export format (e.g., 'csv', 'xlsx')
     * @param filters Optional filters for export
     * @returns Promise with export data
     */
    async exportData(format: string, filters?: Record<string, any>): Promise<Blob> {
      try {
        const response = await client.get(
          getEndpoint(ServiceOperation.EXPORT),
          undefined,
          {
            params: { format, ...filters },
            headers: {
              Accept: format === 'csv' 
                ? 'text/csv' 
                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            retry: withRetry,
            cache: 'no-store'
          }
        );
        return response as unknown as Blob;
      } catch (error) {
        return handleError(error, 'exportData');
      }
    },
    
    /**
     * Import resources
     * 
     * @param data Import data
     * @param format Import format (e.g., 'csv', 'xlsx')
     * @returns Promise with import results
     */
    async importData(
      data: File | Blob,
      format: string
    ): Promise<{ total: number; success: number; errors: any[] }> {
      try {
        const formData = new FormData();
        formData.append('file', data);
        formData.append('format', format);
        
        const response = await client.post(
          getEndpoint(ServiceOperation.IMPORT),
          formData,
          undefined,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            retry: false
          }
        );
        return response as unknown as { total: number; success: number; errors: any[] };
      } catch (error) {
        return handleError(error, 'importData');
      }
    }
  };
}

/**
 * Create a custom service method that uses a specific endpoint
 * 
 * @param module The API module name
 * @param operation The endpoint operation key
 * @param method The HTTP method to use
 * @param options Method-specific options
 * @returns A function that makes the API request
 */
export function createServiceMethod<T, P = any>(
  module: string,
  operation: string,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  options: ServiceMethodOptions = {}
): (params?: Record<string, any>, data?: any, pathParams?: Record<string, string>) => Promise<T> {
  const {
    useEnhancedClient = true,
    withRetry = false,
    cacheResponse = false,
    customErrorHandler,
    mapResponse
  } = options;
  
  // Use the appropriate client
  const client = useEnhancedClient ? enhancedApiClient : apiClient;
  
  // Helper to handle errors consistently
  const handleError = (error: any, operation: string) => {
    if (customErrorHandler) {
      return customErrorHandler(error);
    }
    
    const apiError = handleApiError(error);
    console.error(`[${module.toUpperCase()}] ${operation} operation failed:`, apiError.message);
    throw apiError;
  };
  
  // Helper to process response
  const processResponse = (data: any) => {
    if (mapResponse) {
      return mapResponse(data);
    }
    return data;
  };
  
  // Return the service method function
  return async (
    params?: Record<string, any>,
    data?: any,
    pathParams?: Record<string, string>
  ): Promise<T> => {
    try {
      const endpoint = getModuleEndpoint(module, operation);
      if (!endpoint) {
        throw new Error(`Endpoint not found: ${module}.${operation}`);
      }
      
      let response;
      
      switch (method) {
        case 'get':
          response = await client.get(
            endpoint,
            pathParams,
            {
              params,
              retry: withRetry,
              cache: cacheResponse ? 'default' : 'no-store'
            }
          );
          break;
        case 'post':
          response = await client.post(
            endpoint,
            data,
            pathParams,
            {
              params,
              retry: withRetry
            }
          );
          break;
        case 'put':
          response = await client.put(
            endpoint,
            data,
            pathParams,
            {
              params,
              retry: withRetry
            }
          );
          break;
        case 'patch':
          response = await client.patch(
            endpoint,
            data,
            pathParams,
            {
              params,
              retry: withRetry
            }
          );
          break;
        case 'delete':
          response = await client.delete(
            endpoint,
            pathParams,
            {
              params,
              data,
              retry: withRetry
            }
          );
          break;
      }
      
      return processResponse(response);
    } catch (error) {
      return handleError(error, operation);
    }
  };
}
