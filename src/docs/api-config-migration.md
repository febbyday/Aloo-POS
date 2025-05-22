# API Configuration Migration Guide

This guide explains how to migrate from the legacy API configuration to the new enhanced API configuration system.

## Overview

The POS system has transitioned to a centralized API configuration system with an enhanced endpoint registry. This provides several benefits:

- **Type safety**: All endpoints are defined with proper types
- **Centralized configuration**: Single source of truth for API settings
- **Parameter substitution**: Easy handling of path parameters
- **Metadata**: Additional information about endpoints (auth requirements, caching)

## Environment Variables

We've standardized the environment variables used for API configuration:

- `VITE_API_URL`: The base URL for the API (e.g., `http://localhost:5000`)
- `VITE_API_VERSION`: The API version (e.g., `v1`)

These variables are used consistently across all environments (development, test, production).

## Migration Steps

### 1. Update Imports

Replace imports from the old configuration files with imports from the new centralized system:

```typescript
// BEFORE
import { getApiEndpoint } from '@/lib/api/config';
// or
import { API_CONFIG } from '@/lib/api/api-config';

// AFTER
import { getApiPath, getApiUrl } from '@/lib/api/enhanced-config';
import { API_CONSTANTS } from '@/lib/api/config';
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
// or for relative paths (preferred with apiClient)
const path = getApiPath('products', 'LIST');
```

### 3. Handle Path Parameters

Use the parameter substitution feature for endpoints with path parameters:

```typescript
// BEFORE
const url = `${getApiEndpoint('products')}/${productId}`;

// AFTER
const url = getApiUrl('products', 'DETAIL', { id: productId });
```

### 4. Access API Constants

Use the centralized API constants:

```typescript
// BEFORE
const timeout = 30000;

// AFTER
import { API_CONSTANTS } from '@/lib/api/config';
const timeout = API_CONSTANTS.TIMEOUT;
```

## Enhanced API Client

For the best experience, use the enhanced API client which integrates with the endpoint registry:

```typescript
// BEFORE
import { apiClient } from '@/lib/api/api-client';
const response = await apiClient.get(`products/${productId}`);

// AFTER
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
const response = await enhancedApiClient.get('products', 'DETAIL', { id: productId });
```

## Endpoint Registry

The endpoint registry is defined in `src/lib/api/endpoint-registry.ts`. It contains all available API endpoints organized by module.

To add new endpoints, use the `registerEndpoints` function:

```typescript
export const MY_MODULE_ENDPOINTS = registerEndpoints('my-module', {
  LIST: { path: '', requiresAuth: true, cacheable: true },
  DETAIL: { path: ':id', requiresAuth: true, cacheable: true },
  CREATE: { path: '', requiresAuth: true, cacheable: false },
  UPDATE: { path: ':id', requiresAuth: true, cacheable: false },
  DELETE: { path: ':id', requiresAuth: true, cacheable: false },
});
```

## Questions?

If you have any questions about the migration process, please contact the development team.
