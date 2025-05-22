# API Configuration System

This directory contains the API configuration system for the POS application. It provides a centralized way to manage API endpoints, handle errors, and make HTTP requests.

## Overview

The API configuration system consists of several components:

- **Centralized Configuration**: A single source of truth for API settings
- **Enhanced Endpoint Registry**: A type-safe registry of all API endpoints
- **API Client**: A class for making HTTP requests with error handling and retries
- **Enhanced API Client**: A higher-level client that integrates with the endpoint registry

## Files

- `config.ts`: The centralized configuration file with environment-specific settings
- `api-client.ts`: The base API client for making HTTP requests
- `endpoint-registry.ts`: The registry of all API endpoints
- `endpoint-utils.ts`: Utilities for creating standardized endpoints
- `enhanced-config.ts`: Enhanced configuration with endpoint registry integration
- `enhanced-api-client.ts`: Enhanced API client with better error handling
- `migration-utils.ts`: Utilities to help with migrating from legacy to enhanced API

## Usage

### Basic Usage

```typescript
import { apiClient } from '@/lib/api/api-client';

// Make a GET request
const response = await apiClient.get('products');

// Make a POST request
const response = await apiClient.post('products', { name: 'New Product' });
```

### Enhanced Usage (Recommended)

```typescript
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { getApiPath } from '@/lib/api/enhanced-config';

// Make a GET request using the endpoint registry
const response = await enhancedApiClient.get('products', 'LIST');

// Make a GET request with path parameters
const response = await enhancedApiClient.get('products', 'DETAIL', { id: '123' });

// Make a POST request
const response = await enhancedApiClient.post('products', 'CREATE', {}, { name: 'New Product' });
```

## Adding New Endpoints

To add new endpoints, use the `registerEndpoints` function in `endpoint-registry.ts`:

```typescript
export const MY_MODULE_ENDPOINTS = registerEndpoints('my-module', {
  LIST: { path: '', requiresAuth: true, cacheable: true },
  DETAIL: { path: ':id', requiresAuth: true, cacheable: true },
  CREATE: { path: '', requiresAuth: true, cacheable: false },
  UPDATE: { path: ':id', requiresAuth: true, cacheable: false },
  DELETE: { path: ':id', requiresAuth: true, cacheable: false },
});
```

## Environment Variables

The API configuration system uses the following environment variables:

- `VITE_API_URL`: The base URL for the API (e.g., `http://localhost:5000`)
- `VITE_API_VERSION`: The API version (e.g., `v1`)
- `VITE_DISABLE_MOCK`: Whether to disable mock mode (set to `true` to use real API)

## Migration

If you're migrating from the legacy API configuration to the enhanced system, see the [API Configuration Migration Guide](../docs/api-config-migration.md) for detailed instructions.

### Legacy API Deprecation

**IMPORTANT**: The legacy API functions (`getApiEndpoint` and direct use of `API_CONFIG`) are now deprecated and will be removed in a future release. You should migrate to the enhanced API client and endpoint registry as soon as possible.

To help with migration, we've added:

1. **Enhanced Deprecation Warnings**: Legacy functions now emit more detailed warnings with stack traces to help identify where they're being used.

2. **Legacy Detection Tools**: Use the legacy detection script to identify legacy API usage in your code:

   ```typescript
   // In development mode
   import('./scripts/detect-legacy-api');
   ```

3. **Migration Utilities**: The `migration-utils.ts` file provides utilities to help with migration, including automatic mapping of legacy endpoint keys to the new format.

4. **Comprehensive Migration Guide**: See the [Legacy API Migration Guide](../docs/legacy-api-migration-guide.md) for detailed instructions on migrating from legacy API to enhanced API.

All new code should use the enhanced API client and endpoint registry. Legacy API functions will be completely removed in a future release.
