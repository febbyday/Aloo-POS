# Role Management API Documentation

This document provides detailed information about the role management API endpoints in the application.

## Base URL

All API endpoints are relative to the base URL: `/api/v1`

## Authentication

All role management endpoints require authentication using a JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Get All Roles

Retrieves a list of all roles in the system.

- **URL**: `/roles`
- **Method**: `GET`
- **Permissions Required**: `roles:view`
- **Query Parameters**:
  - `limit` (optional): Number of roles to return (default: 100)
  - `offset` (optional): Offset for pagination (default: 0)
  - `search` (optional): Search term to filter roles by name
  - `isActive` (optional): Filter by active status (`true` or `false`)

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "data": [
    {
      "id": "role-123",
      "name": "Store Manager",
      "description": "Manages store operations",
      "permissions": {
        "sales": {
          "view": "all",
          "create": "all",
          "edit": "all",
          "delete": "department",
          "export": "all",
          "approve": "all",
          "processRefunds": true
        },
        "inventory": {
          "view": "all",
          "create": "all",
          "edit": "all",
          "delete": "department",
          "export": "all",
          "approve": "all"
        },
        // Other permission modules...
      },
      "isActive": true,
      "staffCount": 5,
      "createdAt": "2023-01-15T12:00:00Z",
      "updatedAt": "2023-06-20T14:30:00Z"
    },
    // More roles...
  ],
  "total": 10,
  "limit": 100,
  "offset": 0
}
```

#### Error Responses

- **Code**: `401 Unauthorized`
  - **Content**: `{ "success": false, "error": "Authentication required" }`

- **Code**: `403 Forbidden`
  - **Content**: `{ "success": false, "error": "Insufficient permissions" }`

### Get Role by ID

Retrieves a specific role by its ID.

- **URL**: `/roles/:id`
- **Method**: `GET`
- **Permissions Required**: `roles:view`
- **URL Parameters**:
  - `id`: Role ID

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "data": {
    "id": "role-123",
    "name": "Store Manager",
    "description": "Manages store operations",
    "permissions": {
      // Permission object as shown above
    },
    "isActive": true,
    "staffCount": 5,
    "createdAt": "2023-01-15T12:00:00Z",
    "updatedAt": "2023-06-20T14:30:00Z"
  }
}
```

#### Error Responses

- **Code**: `401 Unauthorized`
  - **Content**: `{ "success": false, "error": "Authentication required" }`

- **Code**: `403 Forbidden`
  - **Content**: `{ "success": false, "error": "Insufficient permissions" }`

- **Code**: `404 Not Found`
  - **Content**: `{ "success": false, "error": "Role not found" }`

### Create Role

Creates a new role.

- **URL**: `/roles`
- **Method**: `POST`
- **Permissions Required**: `roles:create`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "name": "Assistant Manager",
  "description": "Assists the store manager",
  "permissions": {
    // Permission object
  },
  "isActive": true
}
```

#### Success Response

- **Code**: `201 Created`
- **Content Example**:

```json
{
  "success": true,
  "data": {
    "id": "role-456",
    "name": "Assistant Manager",
    "description": "Assists the store manager",
    "permissions": {
      // Permission object
    },
    "isActive": true,
    "staffCount": 0,
    "createdAt": "2023-07-10T09:15:00Z",
    "updatedAt": "2023-07-10T09:15:00Z"
  }
}
```

#### Error Responses

- **Code**: `400 Bad Request`
  - **Content**: `{ "success": false, "error": "Invalid role data", "details": [...] }`

- **Code**: `401 Unauthorized`
  - **Content**: `{ "success": false, "error": "Authentication required" }`

- **Code**: `403 Forbidden`
  - **Content**: `{ "success": false, "error": "Insufficient permissions" }`

- **Code**: `409 Conflict`
  - **Content**: `{ "success": false, "error": "Role with this name already exists" }`

### Update Role

Updates an existing role.

- **URL**: `/roles/:id`
- **Method**: `PATCH`
- **Permissions Required**: `roles:edit`
- **URL Parameters**:
  - `id`: Role ID
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "name": "Updated Role Name",
  "description": "Updated description",
  "permissions": {
    // Updated permission object
  },
  "isActive": true
}
```

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "data": {
    "id": "role-123",
    "name": "Updated Role Name",
    "description": "Updated description",
    "permissions": {
      // Updated permission object
    },
    "isActive": true,
    "staffCount": 5,
    "createdAt": "2023-01-15T12:00:00Z",
    "updatedAt": "2023-07-15T10:30:00Z"
  }
}
```

#### Error Responses

- **Code**: `400 Bad Request`
  - **Content**: `{ "success": false, "error": "Invalid role data", "details": [...] }`

- **Code**: `401 Unauthorized`
  - **Content**: `{ "success": false, "error": "Authentication required" }`

- **Code**: `403 Forbidden`
  - **Content**: `{ "success": false, "error": "Insufficient permissions" }`

- **Code**: `404 Not Found`
  - **Content**: `{ "success": false, "error": "Role not found" }`

- **Code**: `409 Conflict`
  - **Content**: `{ "success": false, "error": "Role with this name already exists" }`

### Delete Role

Deletes a role.

- **URL**: `/roles/:id`
- **Method**: `DELETE`
- **Permissions Required**: `roles:delete`
- **URL Parameters**:
  - `id`: Role ID

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

#### Error Responses

- **Code**: `401 Unauthorized`
  - **Content**: `{ "success": false, "error": "Authentication required" }`

- **Code**: `403 Forbidden`
  - **Content**: `{ "success": false, "error": "Insufficient permissions" }`

- **Code**: `404 Not Found`
  - **Content**: `{ "success": false, "error": "Role not found" }`

- **Code**: `409 Conflict`
  - **Content**: `{ "success": false, "error": "Cannot delete role with assigned users" }`

### Get Role Templates

Retrieves available role templates.

- **URL**: `/roles/templates`
- **Method**: `GET`
- **Permissions Required**: `roles:view`

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "data": [
    {
      "id": "admin",
      "name": "Administrator",
      "description": "Full system access",
      "permissions": {
        // Permission object
      }
    },
    {
      "id": "manager",
      "name": "Manager",
      "description": "Store management access",
      "permissions": {
        // Permission object
      }
    },
    // More templates...
  ]
}
```

#### Error Responses

- **Code**: `401 Unauthorized`
  - **Content**: `{ "success": false, "error": "Authentication required" }`

- **Code**: `403 Forbidden`
  - **Content**: `{ "success": false, "error": "Insufficient permissions" }`

### Get Staff with Role

Retrieves staff members assigned to a specific role.

- **URL**: `/roles/:id/staff`
- **Method**: `GET`
- **Permissions Required**: `roles:view` and `staff:view`
- **URL Parameters**:
  - `id`: Role ID
- **Query Parameters**:
  - `limit` (optional): Number of staff to return (default: 100)
  - `offset` (optional): Offset for pagination (default: 0)

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "data": [
    {
      "id": "user-123",
      "username": "jsmith",
      "email": "john.smith@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "isActive": true,
      "lastLogin": "2023-07-14T08:45:00Z"
    },
    // More staff members...
  ],
  "total": 5,
  "limit": 100,
  "offset": 0
}
```

#### Error Responses

- **Code**: `401 Unauthorized`
  - **Content**: `{ "success": false, "error": "Authentication required" }`

- **Code**: `403 Forbidden`
  - **Content**: `{ "success": false, "error": "Insufficient permissions" }`

- **Code**: `404 Not Found`
  - **Content**: `{ "success": false, "error": "Role not found" }`

### Assign User to Role

Assigns a user to a role.

- **URL**: `/roles/assign-user`
- **Method**: `POST`
- **Permissions Required**: `roles:edit` and `staff:edit`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "userId": "user-123",
  "roleId": "role-456"
}
```

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "message": "User assigned to role successfully"
}
```

#### Error Responses

- **Code**: `400 Bad Request`
  - **Content**: `{ "success": false, "error": "Invalid request data" }`

- **Code**: `401 Unauthorized`
  - **Content**: `{ "success": false, "error": "Authentication required" }`

- **Code**: `403 Forbidden`
  - **Content**: `{ "success": false, "error": "Insufficient permissions" }`

- **Code**: `404 Not Found`
  - **Content**: `{ "success": false, "error": "User or role not found" }`

### Remove User from Role

Removes a user from a role.

- **URL**: `/roles/remove-user`
- **Method**: `POST`
- **Permissions Required**: `roles:edit` and `staff:edit`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "userId": "user-123",
  "roleId": "role-456"
}
```

#### Success Response

- **Code**: `200 OK`
- **Content Example**:

```json
{
  "success": true,
  "message": "User removed from role successfully"
}
```

#### Error Responses

- **Code**: `400 Bad Request`
  - **Content**: `{ "success": false, "error": "Invalid request data" }`

- **Code**: `401 Unauthorized`
  - **Content**: `{ "success": false, "error": "Authentication required" }`

- **Code**: `403 Forbidden`
  - **Content**: `{ "success": false, "error": "Insufficient permissions" }`

- **Code**: `404 Not Found`
  - **Content**: `{ "success": false, "error": "User or role not found" }`

## Deprecated Endpoints

The following endpoints are deprecated and will be removed in version 2.0.0:

### User Roles Endpoints (Deprecated)

All endpoints under `/api/v1/users/roles/*` are deprecated. Use the corresponding endpoints under `/api/v1/roles/*` instead.

### Staff Roles Endpoints (Deprecated)

All endpoints under `/api/v1/staff/roles/*` are deprecated. Use the corresponding endpoints under `/api/v1/roles/*` instead.

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    // Optional array of detailed error information
  ]
}
```

## Rate Limiting

API requests are subject to rate limiting. The following headers are included in responses:

- `X-RateLimit-Limit`: Maximum number of requests allowed per time window
- `X-RateLimit-Remaining`: Number of requests remaining in the current time window
- `X-RateLimit-Reset`: Time (in seconds) until the rate limit resets

If you exceed the rate limit, you will receive a `429 Too Many Requests` response.

## Versioning

The API is versioned using the URL path (e.g., `/api/v1/roles`). When breaking changes are introduced, a new version will be released (e.g., `/api/v2/roles`).

## Questions?

If you have any questions about the role management API, please contact the development team.
