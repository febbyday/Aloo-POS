# Role API Integration

This documentation outlines how the staff roles feature was integrated with real API endpoints.

## Overview

The roles feature allows administrators to create, manage, and assign roles to staff members. Each role has associated permissions that determine what actions staff members can perform within the system. Previously, the roles feature used mock data defined locally in the codebase. Now, it is integrated with backend APIs for a more realistic and production-ready implementation.

## Components Updated

The following components have been updated to use real API data:

1. **StaffModal** - Updated to fetch roles from the API when adding or editing staff members
2. **RolesPage** - Updated to manage roles (create, update, delete) through API endpoints
3. **StaffSettings** - Updated to display real roles in the default role selector

## Backend API Implementation

### Role API Routes

API routes were created at `backend/src/routes/roleRoutes.ts` with the following endpoints:

- `GET /api/v1/roles` - Retrieve all roles
- `GET /api/v1/roles/:id` - Retrieve a specific role by ID
- `POST /api/v1/roles` - Create a new role
- `PATCH /api/v1/roles/:id` - Update an existing role
- `DELETE /api/v1/roles/:id` - Delete a role

Each endpoint includes proper validation and error handling.

### Server Configuration

The `server.ts` file was updated to include the role routes and expose them at the `/api/v1/roles` endpoint.

## Frontend Implementation

### Role Service

The `roleService.ts` was updated to replace mock data with actual API calls:

- `getAllRoles()` - Fetches all roles from the API
- `getRoleById(id)` - Fetches a specific role by ID
- `createRole(roleData)` - Creates a new role through the API
- `updateRole(id, roleData)` - Updates an existing role
- `deleteRole(id)` - Deletes a role

The service includes error handling and request cancellation to prevent race conditions.

### useRoles Hook

A new custom hook `useRoles` was created to provide a consistent interface for components to interact with role data:

```tsx
export function useRoles(): UseRolesReturn {
  // State for roles, loading, and errors
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Methods to fetch, create, update, and delete roles
  // ...

  return {
    roles,
    isLoading,
    error,
    refreshRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
  };
}
```

This hook provides the following functionality:
- Automatic loading of roles on component mount
- Loading, error, and data states for UI feedback
- Methods to create, update, and delete roles
- Data caching to minimize API calls
- Toast notifications for success and error states

## UI Improvements

The following UI improvements were made to enhance the user experience:

1. **Loading States** - Added spinners and loading indicators when fetching roles
2. **Error Handling** - Added error messages and retry buttons when API calls fail
3. **Empty States** - Added helpful messages when no roles are available
4. **Toast Notifications** - Added feedback when creating, updating, or deleting roles

## Testing

To test the roles API integration:

1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Navigate to Staff > Roles
4. Create, edit, and delete roles to ensure all operations work correctly
5. Navigate to Staff > Add Staff to ensure roles appear in the dropdown
6. Navigate to Settings > Staff Settings to ensure roles appear in the default role dropdown

## Benefits

This integration provides several benefits:

1. **Data Persistence** - Roles are now stored on the server and persist between sessions
2. **Scalability** - The implementation allows for future expansion and integration with a real database
3. **Consistency** - Using the same API patterns throughout the application ensures consistency
4. **Better Development Experience** - Developers can now test with realistic data flows

## Conclusion

The roles feature is now fully integrated with the backend API, providing a more realistic and production-ready implementation. This approach will make it easier to transition to a real backend when ready.