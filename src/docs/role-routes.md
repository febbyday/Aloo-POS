# Role Routes Documentation

This document provides information about the role management API endpoints in the application.

## Overview

Role management in the application has been unified to use a single set of endpoints. All role-related operations should use the main role routes at `/api/v1/roles`.

## Main Role Endpoints

The following endpoints are available for role management:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/roles` | Get all roles |
| GET    | `/api/v1/roles/:id` | Get role by ID |
| POST   | `/api/v1/roles` | Create a new role |
| PATCH  | `/api/v1/roles/:id` | Update a role |
| DELETE | `/api/v1/roles/:id` | Delete a role |
| GET    | `/api/v1/roles/templates` | Get role templates |
| GET    | `/api/v1/roles/:id/staff` | Get staff members assigned to a role |

## Deprecated Endpoints

The following endpoints are deprecated and will be removed in a future release:

- `/api/v1/users/roles/*` - Use `/api/v1/roles/*` instead
- `/api/v1/staff/roles/*` - Use `/api/v1/roles/*` instead

These deprecated endpoints currently redirect to the main role routes for backward compatibility, but they will be removed in a future release.

## Frontend Usage

In the frontend code, use the `ROLE_ENDPOINTS` from the endpoint registry for all role-related API calls:

```typescript
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { ROLE_ENDPOINTS } from '@/lib/api/endpoint-registry';

// Example: Get all roles
const response = await enhancedApiClient.get('roles/LIST');

// Example: Get role by ID
const response = await enhancedApiClient.get('roles/DETAIL', { id: roleId });

// Example: Create a new role
const response = await enhancedApiClient.post('roles/CREATE', roleData);

// Example: Update a role
const response = await enhancedApiClient.patch('roles/UPDATE', { id: roleId }, roleData);

// Example: Delete a role
const response = await enhancedApiClient.delete('roles/DELETE', { id: roleId });
```

## Migration Timeline

The deprecated endpoints will be removed in version 2.0.0 of the application. All code should be updated to use the main role routes before this version is released.

## Questions?

If you have any questions about the role routes, please contact the development team.
