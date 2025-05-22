# Centralized Logging System

This document describes the centralized logging system implemented in the POS application.

## Overview

The logging system provides a consistent way to log messages across the application, with support for different log levels, context information, and structured logging. It also includes error handling utilities and integration between frontend and backend.

## Backend Logging

### Logger Utility

The main logger utility is located at `src/utils/logger.ts`. It provides the following features:

- Multiple log levels (error, warn, info, debug)
- Context information for better traceability
- Console and file-based logging
- Log rotation for production environments
- Structured logging with metadata

### Usage Examples

```typescript
import { logger, logError, logInfo } from '../utils/logger';

// Basic logging
logger.info('User logged in successfully');
logger.error('Failed to process payment', new Error('Payment gateway error'));

// Logging with context
const userLogger = logger.child('user-service');
userLogger.info('User created', { userId: '123', email: 'user@example.com' });

// Logging with metadata
logger.warn('Low inventory detected', { 
  productId: '456', 
  currentStock: 5, 
  threshold: 10 
});

// Using helper functions
logError('Database connection failed', error, { critical: true });
logInfo('Server started', { port: 5000 });
```

### Error Handling

The error handling utilities are located at `src/utils/errorHandling.ts`. They provide:

- Standardized error responses
- Error classification by type
- Request context extraction
- Integration with the logger

```typescript
import { AppError, ErrorType, sendErrorResponse } from '../utils/errorHandling';

// Creating application errors
const error = new AppError(
  'User not found', 
  404, 
  ErrorType.NOT_FOUND, 
  { userId: '123' }
);

// Sending error responses
sendErrorResponse(res, error, error.statusCode, req);
```

### Database Error Handling

The database error handler is located at `src/utils/databaseErrorHandler.ts`. It provides:

- Mapping of Prisma errors to application errors
- Consistent error handling for database operations
- Integration with the logger

```typescript
import { executeDbOperation } from '../utils/databaseErrorHandler';

// Safely execute a database operation
const user = await executeDbOperation(
  () => prisma.user.findUnique({ where: { id } }),
  'findUser',
  'user'
);
```

## Frontend Logging

### API Error Logging

The frontend API error logger is located at `src/lib/api/error-logger.ts`. It provides:

- Standardized API error objects
- Error classification by type
- Toast notifications for errors
- Remote logging to the backend

```typescript
import { logApiError, createApiError, ApiErrorType } from '../lib/api/error-logger';

// Log an API error
logApiError(error, 'users/getUser');

// Create and log a custom API error
const apiError = createApiError({
  message: 'Failed to load user data',
  status: 404,
  type: ApiErrorType.NOT_FOUND
});
logApiError(apiError);
```

## Integration Between Frontend and Backend

The frontend can send logs to the backend using the following endpoints:

- `POST /api/v1/logs/client-error`: For client-side error logs
- `POST /api/v1/logs/client-log`: For general client-side logs

This allows for centralized logging of both frontend and backend issues.

## Configuration

### Backend Configuration

The backend logger can be configured using environment variables:

- `LOG_LEVEL`: The minimum log level to record (default: 'info' in production, 'debug' in development)
- `LOG_DIR`: The directory to store log files (default: 'logs')
- `NODE_ENV`: Determines whether to use production or development settings

### Frontend Configuration

The frontend error logger can be configured when calling the `logApiError` function:

```typescript
logApiError(error, 'users/getUser', {
  enableConsoleLogging: true,
  enableRemoteLogging: true,
  showToastForErrors: true,
  logNetworkErrors: true,
  includeStackTrace: false
});
```

## Best Practices

1. **Use appropriate log levels**:
   - `error`: For errors that require attention
   - `warn`: For potential issues or unusual situations
   - `info`: For important events in normal operation
   - `debug`: For detailed debugging information

2. **Include context information**:
   - Use child loggers for service-specific logging
   - Include relevant IDs (user ID, order ID, etc.)
   - Add operation names and resource types

3. **Structure your logs**:
   - Use metadata objects instead of string concatenation
   - Keep message strings concise and descriptive
   - Use consistent naming for metadata fields

4. **Handle errors properly**:
   - Use the `AppError` class for application errors
   - Include appropriate status codes and error types
   - Use the database error handler for Prisma operations

5. **Log sensitive information carefully**:
   - Never log passwords, tokens, or other sensitive data
   - Redact personal information when necessary
   - Be mindful of GDPR and other privacy regulations
