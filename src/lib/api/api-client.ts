import { generateId } from '@/lib/utils';

// API response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  success: boolean;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// API client configuration
export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  mockDelay?: number;
  useMock?: boolean;
}

// Default configuration
const defaultConfig: ApiClientConfig = {
  baseUrl: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  mockDelay: 300, // 300ms delay for mock responses
  useMock: false, // Use real API calls for production
};

// API client class
export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Set configuration
  public setConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Toggle mock mode (older method name - kept for backward compatibility)
  public useMock(useMock: boolean): void {
    this.config.useMock = useMock;
  }

  // Toggle mock mode (new method name)
  public setMockMode(useMock: boolean): void {
    this.config.useMock = useMock;
    console.log(`API client mock mode ${useMock ? 'enabled' : 'disabled'}`);
  }
  
  // Set authentication token in headers
  public setAuthToken(token: string): void {
    this.config.headers = {
      ...this.config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  // Clear authentication token from headers
  public clearAuthToken(): void {
    const { Authorization, ...headers } = this.config.headers || {};
    this.config.headers = headers;
  }
  
  // Update client configuration
  public updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // GET request
  public async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    mockResponse?: T | ((params?: Record<string, any>) => T)
  ): Promise<ApiResponse<T>> {
    if (this.config.useMock && mockResponse) {
      return this.mockRequest<T>(mockResponse, params);
    }

    const url = this.buildUrl(endpoint, params);
    return this.fetchRequest<T>('GET', url);
  }

  // GET paginated request
  public async getPaginated<T>(
    endpoint: string,
    params?: Record<string, any> & { page?: number; pageSize?: number },
    mockResponse?: T[] | ((params?: Record<string, any>) => T[])
  ): Promise<PaginatedApiResponse<T>> {
    if (this.config.useMock && mockResponse) {
      return this.mockPaginatedRequest<T>(mockResponse, params);
    }

    const url = this.buildUrl(endpoint, params);
    return this.fetchRequest<T[]>('GET', url) as Promise<PaginatedApiResponse<T>>;
  }

  // POST request
  public async post<T, U = any>(
    endpoint: string,
    data?: U,
    mockResponse?: T | ((data?: U) => T)
  ): Promise<ApiResponse<T>> {
    if (this.config.useMock && mockResponse) {
      return this.mockRequest<T>(mockResponse, data);
    }

    const url = this.buildUrl(endpoint);
    return this.fetchRequest<T>('POST', url, data);
  }

  // PUT request
  public async put<T, U = any>(
    endpoint: string,
    data?: U,
    mockResponse?: T | ((data?: U) => T)
  ): Promise<ApiResponse<T>> {
    if (this.config.useMock && mockResponse) {
      return this.mockRequest<T>(mockResponse, data);
    }

    const url = this.buildUrl(endpoint);
    return this.fetchRequest<T>('PUT', url, data);
  }

  // PATCH request
  public async patch<T, U = any>(
    endpoint: string,
    data?: U,
    mockResponse?: T | ((data?: U) => T)
  ): Promise<ApiResponse<T>> {
    if (this.config.useMock && mockResponse) {
      return this.mockRequest<T>(mockResponse, data);
    }

    const url = this.buildUrl(endpoint);
    return this.fetchRequest<T>('PATCH', url, data);
  }

  // DELETE request
  public async delete<T>(
    endpoint: string,
    mockResponse?: T | (() => T)
  ): Promise<ApiResponse<T>> {
    if (this.config.useMock && mockResponse) {
      return this.mockRequest<T>(mockResponse);
    }

    const url = this.buildUrl(endpoint);
    return this.fetchRequest<T>('DELETE', url);
  }

  // Build URL with query parameters
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Ensure baseUrl ends with a slash if it doesn't include one and endpoint doesn't start with one
    let baseUrl = this.config.baseUrl;
    if (!baseUrl.endsWith('/') && !endpoint.startsWith('/')) {
      baseUrl = `${baseUrl}/`;
    }
    
    // If endpoint already starts with the baseUrl, don't prepend baseUrl again
    const url = endpoint.startsWith(baseUrl) 
      ? endpoint 
      : `${baseUrl}${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
    
    // Create a new params object with the original params
    const paramsWithCache = params ? { ...params } : {};
    
    // Add a cache-busting parameter for GET requests to prevent browser caching
    if (!params?.disableCacheBusting) {
      paramsWithCache._t = Date.now();
    }
    
    // Remove the disableCacheBusting parameter if it exists
    delete paramsWithCache.disableCacheBusting;
    
    if (Object.keys(paramsWithCache).length === 0) {
      return url;
    }

    const queryParams = Object.entries(paramsWithCache)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

    return queryParams ? `${url}?${queryParams}` : url;
  }

  // Fetch request implementation
  private async fetchRequest<T>(
    method: string,
    url: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // Log request for debugging
      console.log(`API Request:`, {
        method,
        url,
        headers: this.config.headers,
        mockMode: this.config.useMock
      });
      
      const response = await fetch(url, {
        method,
        headers: this.config.headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        // Add credentials to handle CORS issues
        credentials: 'include',
      });

      clearTimeout(timeoutId);

      // Handle response
      const contentType = response.headers.get('content-type');
      let responseData;
      
      try {
        // Try to parse as JSON if appropriate content type
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          const textData = await response.text();
          console.warn('Non-JSON response received:', textData);
          responseData = { message: textData };
        }
      } catch (parseError) {
        // Handle JSON parsing errors
        const textData = await response.text();
        console.error('Failed to parse response:', textData);
        responseData = { message: 'Invalid response format from server' };
      }

      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        
        throw {
          status: response.status,
          message: responseData.message || response.statusText,
          errors: responseData.errors,
        };
      }

      return {
        data: responseData.data || responseData,
        status: response.status,
        message: responseData.message || 'Success',
        success: true,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Handle request timeout
      if (error.name === 'AbortError') {
        console.error('API request timed out');
        throw {
          status: 408,
          message: 'Request timeout',
          errors: undefined,
        };
      }

      console.error('API Request Failed:', {
        method,
        url,
        error: error.message || error
      });
      
      throw {
        status: error.status || 500,
        message: error.message || 'Unknown error',
        errors: error.errors,
      };
    }
  }

  // Mock request implementation
  private async mockRequest<T>(
    mockResponse: T | ((params?: any) => T),
    params?: any
  ): Promise<ApiResponse<T>> {
    await this.delay();

    try {
      const data = typeof mockResponse === 'function'
        ? (mockResponse as Function)(params)
        : mockResponse;

      return {
        data,
        status: 200,
        message: 'Success',
        success: true,
      };
    } catch (error: any) {
      throw {
        status: 500,
        message: error.message || 'Mock error occurred',
      };
    }
  }

  // Mock paginated request implementation
  private async mockPaginatedRequest<T>(
    mockResponse: T[] | ((params?: any) => T[]),
    params?: Record<string, any> & { page?: number; pageSize?: number }
  ): Promise<PaginatedApiResponse<T>> {
    await this.delay();

    try {
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;

      const allData = typeof mockResponse === 'function'
        ? (mockResponse as Function)(params)
        : mockResponse;

      // Apply filtering if search param is provided
      let filteredData = [...allData];
      if (params?.search) {
        const searchTerm = String(params.search).toLowerCase();
        filteredData = allData.filter(item => {
          return Object.values(item as object).some(value => {
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(searchTerm);
          });
        });
      }

      // Apply sorting if sortBy and sortOrder params are provided
      if (params?.sortBy) {
        const sortBy = params.sortBy as keyof T;
        const sortOrder = params?.sortOrder === 'desc' ? -1 : 1;
        
        filteredData.sort((a, b) => {
          const aValue = a[sortBy];
          const bValue = b[sortBy];
          
          if (aValue === bValue) return 0;
          if (aValue === null || aValue === undefined) return -1 * sortOrder;
          if (bValue === null || bValue === undefined) return 1 * sortOrder;
          
          return aValue < bValue ? -1 * sortOrder : 1 * sortOrder;
        });
      }

      const totalItems = filteredData.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

      return {
        data: paginatedData,
        status: 200,
        message: 'Success',
        success: true,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages,
        },
      };
    } catch (error: any) {
      throw {
        status: 500,
        message: error.message || 'Mock pagination error occurred',
      };
    }
  }

  // Delay helper for mock responses
  private async delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.config.mockDelay));
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Error handling utility
export async function handleApiError<T>(
  apiPromise: Promise<ApiResponse<T>>
): Promise<ApiResponse<T>> {
  try {
    return await apiPromise;
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Rethrow with consistent format
    throw {
      status: error.status || 500,
      message: error.message || 'An unknown error occurred',
      errors: error.errors || {},
    };
  }
}

// Helper to create a mock entity with ID
export function createMockEntity<T extends { id?: string }>(data: Omit<T, 'id'>): T {
  return {
    ...data as any,
    id: generateId(),
  } as T;
}

// Helper to update a mock entity
export function updateMockEntity<T extends { id: string }>(
  entities: T[],
  updatedEntity: T
): T[] {
  return entities.map(entity => 
    entity.id === updatedEntity.id ? updatedEntity : entity
  );
}

// Helper to delete a mock entity
export function deleteMockEntity<T extends { id: string }>(
  entities: T[],
  id: string
): T[] {
  return entities.filter(entity => entity.id !== id);
}
