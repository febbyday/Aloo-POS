# Error Logging and Handling

This document describes the error logging and handling system implemented in the frontend of the POS application.

## Overview

The error logging system provides a consistent way to handle and log API errors in the frontend. It includes standardized error objects, error classification, toast notifications, and remote logging to the backend.

## API Error Logging

The main error logging utility is located at `src/lib/api/error-logger.ts`. It provides the following features:

- Standardized API error objects
- Error classification by type
- Toast notifications for errors
- Remote logging to the backend
- Console logging for development

## Usage Examples

### Basic Error Logging

```typescript
import { logApiError } from '@/lib/api/error-logger';

try {
  const response = await fetch('/api/users/123');
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return await response.json();
} catch (error) {
  logApiError(error, 'users/getUser');
  return null;
}
```

### Creating and Logging Custom Errors

```typescript
import { createApiError, ApiErrorType, logApiError } from '@/lib/api/error-logger';

// Create a custom API error
const apiError = createApiError({
  message: 'User not found',
  status: 404,
  type: ApiErrorType.NOT_FOUND
}, 'users/getUser');

// Log the error
logApiError(apiError);
```

### Configuring Error Logging

```typescript
import { logApiError } from '@/lib/api/error-logger';

// Log with custom configuration
logApiError(error, 'users/getUser', {
  enableConsoleLogging: true,
  enableRemoteLogging: true,
  showToastForErrors: true,
  logNetworkErrors: true,
  includeStackTrace: false
});
```

## Error Types

The system classifies errors into the following types:

- `NETWORK`: Network connectivity issues
- `TIMEOUT`: Request timeout issues
- `SERVER`: Server-side errors (5xx status codes)
- `VALIDATION`: Validation errors (400, 422 status codes)
- `AUTHENTICATION`: Authentication errors (401 status code)
- `AUTHORIZATION`: Authorization errors (403 status code)
- `NOT_FOUND`: Resource not found (404 status code)
- `CONFLICT`: Resource conflict (409 status code)
- `UNKNOWN`: Unclassified errors
- `MOCK_DISABLED`: Errors due to mock mode being disabled

## Integration with API Clients

The error logging system integrates with API clients to provide consistent error handling:

```typescript
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { logApiError } from '@/lib/api/error-logger';

async function getUser(id: string) {
  try {
    const response = await enhancedApiClient.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    logApiError(error, `users/getUser/${id}`);
    return null;
  }
}
```

## Integration with Backend

The error logging system can send logs to the backend for centralized logging. This is enabled by default in production environments.

The following endpoints are used:

- `POST /api/v1/logs/client-error`: For client-side error logs
- `POST /api/v1/logs/client-log`: For general client-side logs

## Best Practices

1. **Use consistent error handling**:
   - Use the `logApiError` function for all API errors
   - Include the endpoint in the error log
   - Handle errors at the appropriate level

2. **Provide context information**:
   - Include relevant IDs and parameters
   - Specify the operation that failed
   - Add any relevant state information

3. **Use appropriate error types**:
   - Let the system classify errors when possible
   - Specify the error type for custom errors
   - Use the most specific error type available

4. **Handle sensitive information carefully**:
   - Never log passwords, tokens, or other sensitive data
   - Redact personal information when necessary
   - Be mindful of GDPR and other privacy regulations

5. **Configure logging appropriately**:
   - Enable remote logging in production
   - Enable console logging in development
   - Show toast notifications for user-facing errors
