# API Configuration Guide

This document explains how the API configuration system works in the POS application.

## Overview

The API configuration system provides a centralized way to manage API URLs, timeouts, and other settings across the application. It ensures consistency and makes it easier to update configuration in one place.

## Key Files

- `src/lib/api/api-constants.ts`: The single source of truth for API configuration
- `src/lib/api/env-validator.ts`: Validates required environment variables
- `src/lib/api/config.ts`: Legacy configuration file (imports from api-constants.ts)
- `src/lib/api/endpoint-registry.ts`: Registry of all API endpoints

## Environment Variables

The API configuration system uses the following environment variables:

- `VITE_API_URL`: The base URL for the API (e.g., `http://localhost:5000`)
- `VITE_API_VERSION`: The API version (e.g., `v1`)
- `VITE_DISABLE_MOCK`: Whether to disable mock mode (set to `true` to use real API)

These variables are defined in the environment-specific `.env` files:

- `.env.development`: Development environment configuration
- `.env.production`: Production environment configuration
- `.env.test`: Test environment configuration

## Usage

### Importing API Constants

```typescript
// Import specific constants
import { API_URL, API_VERSION, API_PREFIX } from '@/lib/api/api-constants';

// Import all constants
import { API_CONSTANTS } from '@/lib/api/api-constants';
```

### Using API Constants

```typescript
// Using specific constants
const url = `${API_URL}/api/${API_VERSION}/users`;

// Using API_CONSTANTS object
const timeout = API_CONSTANTS.TIMEOUT;
const headers = API_CONSTANTS.HEADERS;
```

### Using the Endpoint Registry

```typescript
import { getApiUrl, getApiPath } from '@/lib/api/enhanced-config';

// Get a full URL for an endpoint
const usersUrl = getApiUrl('users', 'LIST');

// Get a relative path for an endpoint (for use with API client)
const usersPath = getApiPath('users', 'LIST');

// With path parameters
const userUrl = getApiUrl('users', 'DETAIL', { id: '123' });
```

## Environment-Specific Configuration

The API configuration system handles different environments automatically:

- **Development**: Uses relative URLs to work with the Vite dev server proxy
- **Production**: Uses the full API URL from environment variables
- **Test**: Can be configured to use mock data or a test API server

## Validation

The system validates required environment variables at runtime and logs errors if any are missing:

- `VITE_API_VERSION` is required in all environments
- `VITE_API_URL` is required in production

## Migrating from Legacy Configuration

If you're using the legacy API configuration, migrate to the new system:

1. Replace imports from `config.ts` with imports from `api-constants.ts`
2. Use `API_CONSTANTS` instead of `apiConfig`
3. Use `getApiUrl` and `getApiPath` from `enhanced-config.ts` instead of direct URL construction

## Adding New API Endpoints

To add new API endpoints, use the `registerEndpoints` function in `endpoint-registry.ts`:

```typescript
export const MY_ENDPOINTS = registerEndpoints('my-module', {
  LIST: { path: '', requiresAuth: true, description: 'Get all items' },
  DETAIL: { path: ':id', requiresAuth: true, description: 'Get item by ID' },
  CREATE: { path: '', requiresAuth: true, description: 'Create new item' }
});
```

Then use these endpoints with the enhanced API client:

```typescript
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';

const response = await enhancedApiClient.get('my-module', 'LIST');
```
