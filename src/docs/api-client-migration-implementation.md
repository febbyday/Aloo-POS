# API Client Migration Implementation Guide

This document provides a detailed implementation plan for migrating the remaining services from the legacy API client to the enhanced API client and endpoint registry.

## Current Migration Status

The codebase has made significant progress in migrating to the enhanced API client and endpoint registry. Most core modules are already using the enhanced patterns, but several services still use legacy patterns that need to be migrated.

### Modules Using Enhanced API Client ✅

The following modules are properly using the enhanced API client and endpoint registry:

- **Products Module**
  - `factory-product-service.ts`
  - `enhancedProductService.ts`
- **Customers Module**
  - `factory-customers-service.ts`
- **Suppliers Module**
  - `factory-suppliers-service.ts`
- **Orders Module**
  - `factory-orders-service.ts`
- **Sales Module**
  - `factory-sales-service.ts`
  - `factory-gift-card-service.ts`
  - `factory-template-service.ts`
- **Repairs Module**
  - `repairService.ts`
- **Inventory Module**
  - `enhanced-inventory-service.ts`
- **Staff Module**
  - `documentService.ts`
- **Shops Module**
  - `api-connection-test.ts`

### Modules Using Enhanced API Client ✅

All modules have been successfully migrated to use the enhanced API client and endpoint registry:

- **Customers Module**
  - ~~`dataAseusigService.ts`~~ ✅ Migrated to `factory-data-aseusig-service.ts`
  - ~~`customerService.ts`~~ ✅ Migrated to `factory-customer-service.ts`
- **Auth Module**
  - ~~`authService.ts`~~ ✅ Migrated to `factory-auth-service.ts`
  - ~~`pinAuthService.ts`~~ ✅ Migrated to `factory-pin-auth-service.ts`
- **Suppliers Module**
  - ~~`suppliersConnector.ts`~~ ✅ Migrated to `factory-suppliers-connector.ts`
  - ~~`suppliersService.ts`~~ ✅ Updated to use `factory-suppliers-service.ts`
- **Gift Cards Module**
  - ~~`giftCardService.ts`~~ ✅ Already migrated to `factory-gift-card-service.ts`
  - ~~`templateService.ts`~~ ✅ Already migrated to `factory-template-service.ts`
  - ✅ Added index.ts to properly export factory-based services
- **Shops Module**
  - ~~`config.ts`~~ ✅ Migrated to `factory-config.ts`

## Implementation Plan

### Phase 1: High-Priority Services (Week 1)

#### Auth Module Migration ✅

1. **Register Auth Endpoints** ✅
   - Added PIN Auth endpoints and Trusted Device endpoints to the endpoint registry in `src/lib/api/endpoint-registry.ts`
   - Auth endpoints were already registered

2. **Create Factory-Based Auth Service** ✅
   - Created `src/features/auth/services/factory-auth-service.ts` using the service factory pattern

3. **Create Factory-Based PIN Auth Service** ✅
   - Created `src/features/auth/services/factory-pin-auth-service.ts` using the service factory pattern

4. **Update Auth Service Index** ✅
   - Updated `src/features/auth/services/index.ts` to export the new factory-based services
   - Added deprecation warnings for the legacy services

#### Customers Module Migration ✅

1. **Create Factory-Based Data Aseusig Service** ✅
   - Created `src/features/customers/services/factory-data-aseusig-service.ts` using the service factory pattern
   - Registered Data Aseusig endpoints in the endpoint registry

2. **Create Factory-Based Customer Service** ✅
   - Created `src/features/customers/services/factory-customer-service.ts` using the enhanced API client
   - Updated service index to export the new factory-based service

### Phase 2: Medium-Priority Services (Week 2)

#### Suppliers Module Migration ✅

1. **Create Factory-Based Suppliers Connector** ✅
   - Created `src/features/suppliers/services/factory-suppliers-connector.ts` using the service factory pattern
   - Registered Supplier Connection endpoints in the endpoint registry
   - Updated service index to export the new factory-based connector

2. **Update Suppliers Service** ✅
   - Enhanced `factory-suppliers-service.ts` with all functionality from the legacy service
   - Updated `suppliersService.ts` to re-export the factory-based service with deprecation warning

#### Gift Cards Module Migration ✅

1. **Complete Migration of Legacy Gift Card Services** ✅
   - Factory-based services were already implemented
   - Created index.ts to properly export factory-based services
   - Added deprecation warnings for legacy services

### Phase 3: Low-Priority Services (Week 3)

#### Shops Module Migration ✅

1. **Register Shop Endpoints** ✅
   - Shop endpoints were already registered in the endpoint registry

2. **Update Shops Config** ✅
   - Created `factory-config.ts` using the endpoint registry
   - Updated `config.ts` to re-export the factory-based config with deprecation warning

### Phase 4: Cleanup and Validation (Week 4)

1. **Run Legacy Detection Script**
   - Use the legacy detection script to identify any remaining legacy API usage
   - Address any issues found

2. **Add Deprecation Warnings**
   - Add explicit deprecation warnings to any legacy services that can't be immediately migrated

3. **Update Documentation**
   - Update API client documentation to reflect the completed migration
   - Add examples of best practices for new services

4. **Validate API Functionality**
   - Test all migrated services to ensure they function correctly
   - Verify error handling and retry logic works as expected

## Migration Template

When migrating a service, follow this template:

```typescript
/**
 * Factory-Based [Service Name]
 *
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of [module]-related operations with minimal duplication.
 */

import { [EntityType] } from '../types/[module].types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { [MODULE]_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType } from '@/lib/api/error-handler';

// Define retry configuration if needed
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  shouldRetry: (error: any) => error.type !== ApiErrorType.VALIDATION
};

/**
 * [Service Name] with standardized endpoint handling
 */
export const [serviceName] = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<[EntityType]>('[module]', {
    useEnhancedClient: true,
    withRetry: RETRY_CONFIG,
    cacheResponse: true,
    // Custom response mapping if needed
    mapResponse: (data: any) => {
      // Transform response data if needed
      return data;
    }
  }),

  // Custom methods for specialized operations
  customOperation: createServiceMethod<ReturnType, ParamType>(
    '[module]',
    'OPERATION_NAME',
    'httpMethod',
    { withRetry: true }
  ),

  // Complex operations that don't map directly to endpoints
  async complexOperation(param1: string, param2: number): Promise<ReturnType> {
    // Implementation using createServiceMethod or enhancedApiClient
  }
};

export default [serviceName];
```

## Best Practices

1. **Use the Factory Pattern**
   - Leverage `createServiceMethod` and `createStandardService` for consistent implementation
   - This provides built-in error handling, retry logic, and caching

2. **Register All Endpoints**
   - Always register endpoints in the centralized registry
   - Use descriptive names and include metadata like `requiresAuth` and `cacheable`

3. **Use Type Safety**
   - Specify return types and parameter types for all service methods
   - This improves IDE support and catches errors at compile time

4. **Handle Errors Consistently**
   - Use the built-in error handling from the enhanced API client
   - For custom error handling, use the `createErrorHandler` utility

5. **Document Service Methods**
   - Add JSDoc comments to all service methods
   - Include parameter descriptions and return value information

## Conclusion

By following this implementation plan, we can complete the migration to the enhanced API client and endpoint registry in a structured and efficient manner. This will result in a more maintainable, type-safe, and robust codebase with consistent error handling and retry logic across all services.
