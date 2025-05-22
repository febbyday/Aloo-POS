# Legacy API Migration Guide

This guide provides instructions for migrating from the legacy API configuration to the enhanced API client and endpoint registry.

## Why Migrate?

The legacy API configuration system has several limitations:

- Inconsistent endpoint naming
- No type safety for endpoints
- Limited error handling
- No built-in retry mechanism
- No centralized endpoint registry

The enhanced API client and endpoint registry address these issues and provide a more robust and maintainable solution.

## Detecting Legacy API Usage

To help identify code that needs to be migrated, we've added a legacy API detection system. When enabled, it will log warnings to the console whenever legacy API functions are used.

To enable legacy API detection during development:

1. Import the detection script in your main.ts file:

```typescript
// Only in development mode
if (import.meta.env.MODE === 'development') {
  import('./scripts/detect-legacy-api');
}
```

2. Check the console for warnings about legacy API usage.

3. To see a summary of detected files, run:

```javascript
window.__getLegacyApiUsage()
```

## Migration Steps

### 1. Update Imports

Replace imports from the legacy API configuration with imports from the enhanced API client and endpoint registry:

```typescript
// BEFORE
import { getApiEndpoint } from '@/lib/api/config';
// or
import { API_CONFIG } from '@/lib/api/api-config';

// AFTER
import { getApiUrl, getApiPath } from '@/lib/api/enhanced-config';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
```

### 2. Replace API Endpoint Access

Replace direct endpoint access with the new endpoint registry:

```typescript
// BEFORE
const url = getApiEndpoint('products');
// or
const url = `${API_CONFIG.FULL_API_URL}/products`;

// AFTER
const url = getApiUrl('products', 'LIST');
```

### 3. Replace API Calls

Replace direct API calls with the enhanced API client:

```typescript
// BEFORE
const response = await fetch(getApiEndpoint('products'));
// or
const response = await apiClient.get('products');

// AFTER
const response = await enhancedApiClient.get('products/LIST');
```

### 4. Handle Path Parameters

Use the parameter substitution feature for endpoints with path parameters:

```typescript
// BEFORE
const url = `${getApiEndpoint('products')}/${productId}`;
// or
const response = await apiClient.get(`products/${productId}`);

// AFTER
const url = getApiUrl('products', 'DETAIL', { id: productId });
// or
const response = await enhancedApiClient.get('products/DETAIL', { id: productId });
```

## Common Replacements

Here are some common replacements for legacy API endpoints:

| Legacy Endpoint | Enhanced Replacement |
|-----------------|----------------------|
| `getApiEndpoint('products')` | `getApiUrl('products', 'LIST')` |
| `getApiEndpoint('shops')` | `getApiUrl('shops', 'LIST')` |
| `getApiEndpoint('suppliers')` | `getApiUrl('suppliers', 'LIST')` |
| `getApiEndpoint('customers')` | `getApiUrl('customers', 'LIST')` |
| `getApiEndpoint('auth')` | `getApiUrl('auth', 'LIST')` |
| `getApiEndpoint('login')` | `getApiUrl('auth', 'LOGIN')` |

## Adding New Endpoints

To add new endpoints to the registry, use the `registerEndpoints` function in `src/lib/api/endpoint-registry.ts`:

```typescript
import { registerEndpoints } from '@/lib/api/endpoint-registry';

registerEndpoints('module-name', {
  LIST: '/module-name',
  DETAIL: '/module-name/:id',
  CREATE: '/module-name',
  UPDATE: '/module-name/:id',
  DELETE: '/module-name/:id',
  // Add more endpoints as needed
});
```

## Need Help?

If you need help migrating from the legacy API to the enhanced API client, please contact the development team.
