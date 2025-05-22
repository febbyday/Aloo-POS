# User Model Alignment

This document explains how the User model is aligned between the frontend and backend in the POS application.

## Overview

To ensure consistency between the frontend and backend, we've standardized the User model to match the backend Prisma schema. This alignment ensures that data is properly validated, transformed, and displayed throughout the application.

## Core User Schema

The core User schema is defined in `src/features/auth/schemas/auth.schemas.ts` and includes all the fields from the backend User model:

```typescript
export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  fullName: z.string().optional(), // Computed from firstName + lastName
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  lastLogin: z.string().datetime().nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  // PIN Authentication
  isPinEnabled: z.boolean().default(false),
  lastPinChange: z.string().datetime().nullable().optional(),
  failedPinAttempts: z.number().default(0),
  pinLockedUntil: z.string().datetime().nullable().optional()
});
```

## User Role Enum

The UserRole enum is also standardized to match the backend:

```typescript
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  USER = 'USER'
}
```

## Extended User Schema

The User Management module extends the core User schema with additional fields specific to user management:

```typescript
export const UserSchema = CoreUserSchema.extend({
  // Additional fields for user management
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional()
});
```

## Validation Utilities

We've added validation utilities in `src/features/auth/utils/user-validation.ts` to ensure that User objects conform to the schema:

- `isUser(obj)`: Type guard to check if an object is a valid User
- `validateUser(obj)`: Validates a user object and returns validation errors
- `ensureUserDefaults(user)`: Ensures a user object has all required fields with defaults
- `formatUserForDisplay(user)`: Formats a user object for display
- `convertBackendUserToFrontend(backendUser)`: Converts a backend user model to the frontend User type

## Model Adapters

The `src/features/users/utils/user-model-adapter.ts` file provides utilities to convert between different user model formats:

- `adaptBackendUser(backendUser)`: Converts a backend user model to the frontend User type
- `adaptAuthUserToManagementUser(authUser)`: Converts a user from the auth module format to the user management format
- `adaptManagementUserToAuthUser(managementUser)`: Converts a user from the user management format to the auth module format
- `prepareUserForBackend(user)`: Prepares user data for sending to the backend API

## Usage Guidelines

1. **Import the User type from the appropriate module**:
   - For auth-related components: `import { User } from '@/features/auth/schemas/auth.schemas';`
   - For user management components: `import { User } from '@/features/users/types/user.types';`

2. **Always import UserRole from the auth schemas**:
   - `import { UserRole } from '@/features/auth/schemas/auth.schemas';`

3. **Validate user objects before using them**:
   - `const validation = validateUser(userData);`
   - `if (!validation.success) { /* handle error */ }`

4. **Convert between backend and frontend formats**:
   - When receiving data from the API: `const user = adaptBackendUser(apiResponse.data);`
   - When sending data to the API: `const backendData = prepareUserForBackend(user);`

## Benefits

- **Type Safety**: Consistent types throughout the application
- **Validation**: Zod schemas provide runtime validation
- **Maintainability**: Single source of truth for the User model
- **Compatibility**: Ensures frontend and backend models stay in sync
