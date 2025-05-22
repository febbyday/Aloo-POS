# Error Handling Guide

This guide explains the standardized error handling approach used throughout the application.

## Overview

The application uses a standardized error handling system that provides:

- Consistent error types and messages
- Retry logic for transient failures
- Fallback mechanisms for critical operations
- Centralized error logging and reporting

## Error Types

The system defines several error types to categorize different kinds of failures:

| Error Type | Description | Retryable |
|------------|-------------|-----------|
| `NETWORK` | Network connectivity issues | Yes |
| `TIMEOUT` | Request timeout | Yes |
| `SERVER` | Server-side errors (5xx) | Yes |
| `AUTHENTICATION` | Authentication failures (401) | No |
| `AUTHORIZATION` | Authorization failures (403) | No |
| `VALIDATION` | Validation errors (400) | No |
| `NOT_FOUND` | Resource not found (404) | No |
| `CONFLICT` | Resource conflict (409) | No |
| `RATE_LIMIT` | Rate limit exceeded (429) | Yes |
| `UNKNOWN` | Unclassified errors | No |
| `CANCELED` | Request canceled | No |

## ApiError Class

The `ApiError` class is the standard error type used throughout the application:

```typescript
class ApiError extends Error {
  type: ApiErrorType;
  status?: number;
  code?: string;
  details?: any;
  retryable: boolean;
  timestamp: string;
  originalError?: any;
  
  // ...methods
}
```

## Error Handling Utilities

### Module-Specific Error Handler

Create a module-specific error handler for consistent error handling:

```typescript
const myModuleErrorHandler = createErrorHandler('my-module');
```

### Safe API Calls

Use the `safeCall` method to handle errors gracefully:

```typescript
const [result, error] = await myModuleErrorHandler.safeCall(
  () => apiClient.get('/endpoint'),
  'Error fetching data'
);

if (error) {
  // Handle error
}

return result;
```

### Retry Logic

Use the `withRetry` method for operations that should be retried on transient failures:

```typescript
const result = await myModuleErrorHandler.withRetry(
  () => apiClient.get('/endpoint'),
  {
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 5000,
    backoffFactor: 2
  }
);
```

### Fallback Mechanisms

For critical operations, use fallback mechanisms:

```typescript
function safeApiCallWithFallback<T>(
  apiCall: () => Promise<T>,
  fallbackFn: () => T,
  errorMessage: string
): Promise<T> {
  const [result, error] = await myModuleErrorHandler.safeCall(apiCall, errorMessage);
  
  if (error) {
    console.warn(`Falling back to local data: ${errorMessage}`);
    return fallbackFn();
  }
  
  return result as T;
}
```

## Best Practices

1. **Use Module-Specific Error Handlers**: Create an error handler for each module to provide context.

2. **Categorize Errors Properly**: Use the appropriate error type for each error.

3. **Provide Meaningful Error Messages**: Error messages should be clear and actionable.

4. **Implement Retry Logic for Transient Failures**: Network and server errors should be retried.

5. **Use Fallback Mechanisms for Critical Operations**: Critical operations should have fallback mechanisms.

6. **Log Errors Consistently**: Use the error handler's logging capabilities.

7. **Handle Errors at the Appropriate Level**: Handle errors at the level where you have enough context.

## Example: Service Method with Error Handling

```typescript
public async getSettings(): Promise<Settings> {
  return safeApiCallWithFallback(
    async () => {
      return await myModuleErrorHandler.withRetry(
        () => enhancedApiClient.get<Settings>(
          'module/SETTINGS',
          undefined,
          { cache: 'default' }
        ),
        RETRY_CONFIG
      );
    },
    this.fallbackToLocalSettings,
    'Error fetching settings'
  );
}
```

## Testing Error Handling

When testing error handling, make sure to:

1. Test successful API calls
2. Test API calls that fail with different error types
3. Test retry logic
4. Test fallback mechanisms

Example:

```typescript
it('should return fallback settings when API call fails', async () => {
  // Arrange
  const mockError = new ApiError('Network error', {
    type: ApiErrorType.NETWORK,
    retryable: true
  });
  
  vi.mocked(enhancedApiClient.get).mockRejectedValueOnce(mockError);
  
  // Act
  const result = await service.getSettings();
  
  // Assert
  expect(result).toEqual(expect.objectContaining({
    // Expected fallback values
  }));
});
```
