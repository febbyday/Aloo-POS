# Service Standardization Guide

This guide explains the standardized approach for implementing service files in the application.

## Overview

Service files are responsible for handling API communication and data processing. They should follow a consistent pattern to ensure maintainability and reliability.

## Key Components

### 1. Enhanced API Client

All services should use the enhanced API client instead of the legacy API client:

```typescript
// BEFORE
import { apiClient } from '@/lib/api/api-client';
import { getApiEndpoint } from '@/lib/api/config';

// AFTER
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { MODULE_ENDPOINTS } from '@/lib/api/endpoint-registry';
```

### 2. Module-Specific Error Handler

Each service should create a module-specific error handler:

```typescript
import { ApiError, ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';

// Create a module-specific error handler
const moduleErrorHandler = createErrorHandler('module-name');
```

### 3. Retry Configuration

Define a retry configuration for the service:

```typescript
const MODULE_RETRY_CONFIG = {
  maxRetries: 2,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  shouldRetry: (error: ApiError) => {
    // Only retry network or server errors, not validation or auth errors
    return [ApiErrorType.NETWORK, ApiErrorType.SERVER, ApiErrorType.TIMEOUT].includes(error.type);
  }
};
```

### 4. Safe API Calls

Use the `safeCall` method for operations that might fail:

```typescript
async function getData(id: string): Promise<Data> {
  const [result, error] = await moduleErrorHandler.safeCall(
    () => enhancedApiClient.get<Data>(
      'module/ENDPOINT',
      { id },
      { cache: 'default' }
    ),
    `Error fetching data ${id}`
  );
  
  if (error) {
    throw error;
  }
  
  return result as Data;
}
```

### 5. Retry Logic

Use the `withRetry` method for operations that should be retried on transient failures:

```typescript
async function getImportantData(): Promise<Data[]> {
  return moduleErrorHandler.withRetry(
    () => enhancedApiClient.get<Data[]>(
      'module/IMPORTANT_DATA',
      undefined,
      { cache: 'default' }
    ),
    MODULE_RETRY_CONFIG
  );
}
```

### 6. Fallback Mechanisms

For critical operations, use fallback mechanisms:

```typescript
async function getCriticalData(): Promise<Data[]> {
  return safeApiCallWithFallback(
    async () => {
      return await moduleErrorHandler.withRetry(
        () => enhancedApiClient.get<Data[]>(
          'module/CRITICAL_DATA',
          undefined,
          { cache: 'default' }
        ),
        MODULE_RETRY_CONFIG
      );
    },
    () => [], // Fallback to empty array
    'Error fetching critical data'
  );
}
```

## Example Service Implementation

```typescript
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { MODULE_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiError, ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';
import { Data } from '../types';

// Create a module-specific error handler
const moduleErrorHandler = createErrorHandler('module');

// Define retry configuration
const MODULE_RETRY_CONFIG = {
  maxRetries: 2,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  shouldRetry: (error: ApiError) => {
    return [ApiErrorType.NETWORK, ApiErrorType.SERVER, ApiErrorType.TIMEOUT].includes(error.type);
  }
};

// Safe API call with fallback
async function safeApiCallWithFallback<T>(
  apiCall: () => Promise<T>,
  fallbackFn: () => T,
  errorMessage: string
): Promise<T> {
  const [result, error] = await moduleErrorHandler.safeCall(apiCall, errorMessage);
  
  if (error) {
    console.warn(`Falling back to local data: ${errorMessage}`);
    return fallbackFn();
  }
  
  return result as T;
}

class ModuleService {
  async getAllItems(): Promise<Data[]> {
    return safeApiCallWithFallback(
      async () => {
        return await moduleErrorHandler.withRetry(
          () => enhancedApiClient.get<Data[]>(
            'module/LIST',
            undefined,
            { cache: 'default' }
          ),
          MODULE_RETRY_CONFIG
        );
      },
      () => [],
      'Error fetching all items'
    );
  }
  
  async getItemById(id: string): Promise<Data | undefined> {
    const [result, error] = await moduleErrorHandler.safeCall(
      () => enhancedApiClient.get<Data>(
        'module/DETAIL',
        { id },
        { cache: 'default' }
      ),
      `Error fetching item ${id}`
    );
    
    if (error) {
      throw error;
    }
    
    return result;
  }
  
  async createItem(item: Omit<Data, 'id'>): Promise<Data> {
    const [result, error] = await moduleErrorHandler.safeCall(
      () => enhancedApiClient.post<Data>(
        'module/CREATE',
        item
      ),
      'Error creating item'
    );
    
    if (error) {
      throw error;
    }
    
    return result as Data;
  }
  
  async updateItem(id: string, item: Partial<Data>): Promise<Data> {
    const [result, error] = await moduleErrorHandler.safeCall(
      () => enhancedApiClient.put<Data>(
        'module/UPDATE',
        item,
        { id }
      ),
      `Error updating item ${id}`
    );
    
    if (error) {
      throw error;
    }
    
    return result as Data;
  }
  
  async deleteItem(id: string): Promise<void> {
    const [_, error] = await moduleErrorHandler.safeCall(
      () => enhancedApiClient.delete(
        'module/DELETE',
        { id }
      ),
      `Error deleting item ${id}`
    );
    
    if (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const moduleService = new ModuleService();
```

## Testing Services

When testing services, make sure to:

1. Mock the enhanced API client
2. Test successful API calls
3. Test API calls that fail with different error types
4. Test retry logic
5. Test fallback mechanisms

Example:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { moduleService } from '../moduleService';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { ApiError, ApiErrorType } from '@/lib/api/error-handler';

// Mock the enhanced API client
vi.mock('@/lib/api/enhanced-api-client', () => ({
  enhancedApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('ModuleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAllItems', () => {
    it('should return items when API call succeeds', async () => {
      // Arrange
      const mockItems = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];
      
      vi.mocked(enhancedApiClient.get).mockResolvedValueOnce(mockItems);
      
      // Act
      const result = await moduleService.getAllItems();
      
      // Assert
      expect(enhancedApiClient.get).toHaveBeenCalledWith(
        'module/LIST',
        undefined,
        expect.objectContaining({ cache: 'default' })
      );
      expect(result).toEqual(mockItems);
    });
    
    it('should return fallback data when API call fails', async () => {
      // Arrange
      const mockError = new ApiError('Network error', {
        type: ApiErrorType.NETWORK,
        retryable: true
      });
      
      vi.mocked(enhancedApiClient.get).mockRejectedValueOnce(mockError);
      
      // Act
      const result = await moduleService.getAllItems();
      
      // Assert
      expect(result).toEqual([]);
    });
  });
});
```

## Migration Checklist

When migrating a service to the standardized approach:

1. Update imports to use the enhanced API client and endpoint registry
2. Create a module-specific error handler
3. Define retry configuration
4. Update methods to use the enhanced API client
5. Add fallback mechanisms for critical operations
6. Add tests for the service
7. Remove any legacy code or comments

## Best Practices

1. **Use Module-Specific Error Handlers**: Create an error handler for each module to provide context.
2. **Provide Meaningful Error Messages**: Error messages should be clear and actionable.
3. **Implement Retry Logic for Transient Failures**: Network and server errors should be retried.
4. **Use Fallback Mechanisms for Critical Operations**: Critical operations should have fallback mechanisms.
5. **Log Errors Consistently**: Use the error handler's logging capabilities.
6. **Handle Errors at the Appropriate Level**: Handle errors at the level where you have enough context.
7. **Write Tests for All Service Methods**: Ensure all methods are tested for success and failure cases.
