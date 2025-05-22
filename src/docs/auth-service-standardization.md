# Authentication Service Standardization

## Overview

This document explains the standardization of authentication services in the POS application. We have consolidated multiple authentication service implementations into a single, enhanced implementation to improve maintainability and consistency.

## Changes Made

1. **Selected Enhanced Auth Service**: We selected the `enhanced-auth-service.ts` as our standard implementation due to its robust error handling, retry mechanisms, and comprehensive authentication features.

2. **Updated Service Exports**: The `src/features/auth/services/index.ts` file now exports the enhanced auth service as the standard implementation.

3. **Added Deprecation Notices**: We added deprecation notices to the old implementations (`authService.ts`, `factory-auth-service.ts`) to guide developers to use the new standardized service.

4. **Maintained Backward Compatibility**: Legacy services are still exported with deprecation warnings to maintain backward compatibility.

## New Usage Pattern

Import the authentication service from the index file:

```typescript
import { authService } from '@/features/auth/services';
```

This will give you the enhanced authentication service with improved error handling and retry capabilities.

## Benefits

- **Consistent Implementation**: All authentication operations now use a single, consistent implementation.
- **Improved Error Handling**: The enhanced service includes robust error handling and retry mechanisms.
- **Better Token Management**: More secure token storage and refresh mechanisms.
- **Clearer Code Organization**: Reduced confusion about which service to use.

## Migration Guide

If you're currently importing authentication services directly from their implementation files, update your imports to use the index file instead:

### Before:

```typescript
import { authService } from '@/features/auth/services/authService';
// or
import { factoryAuthService } from '@/features/auth/services/factory-auth-service';
```

### After:

```typescript
import { authService } from '@/features/auth/services';
```

## PIN Authentication

PIN authentication continues to use the factory-based implementation (`factory-pin-auth-service.ts`) as it already provides the necessary functionality. It is exported as `pinAuthService` from the index file:

```typescript
import { pinAuthService } from '@/features/auth/services';
```

## Future Improvements

In the future, we plan to:

1. Remove the deprecated implementations once all code has been migrated to use the standardized service.
2. Implement consistent PIN enablement logic (Task #2 in the auth-implementation-tasks.md file).
3. Standardize token storage to use HttpOnly cookies consistently.
