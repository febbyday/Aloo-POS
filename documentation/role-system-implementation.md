# Role System Implementation

This document provides an overview of the comprehensive role and permission system implementation in the POS application. The system provides predefined role templates with granular permissions and intuitive UI for managing roles and their permissions.

## System Architecture

The role system is composed of the following components:

### Backend Components

1. **Role Routes** (`backend/src/routes/roleRoutes.ts`):
   - REST API endpoints for CRUD operations on roles
   - Predefined role templates with detailed permissions
   - Logic for creating, updating, and deleting roles

2. **Permission Templates**:
   - Predefined permission configurations for common roles:
     - Administrator
     - Store Manager
     - Cashier
     - Inventory Manager
     - Finance Manager
     - Staff Manager
     - Reports Analyst
     - Sales Associate

### Frontend Components

1. **Permission Types** (`src/features/staff/types/permissions.ts`):
   - TypeScript interfaces defining permission structure
   - Access level enums (None, Self, Department, All)
   - Module-specific permission interfaces
   - Default permission generation function
   - Permission template definitions
   - Helper functions for checking permissions

2. **Role Types** (`src/features/staff/types/role.ts`):
   - TypeScript interfaces and Zod schemas for roles
   - Integration with permission types
   - Validation rules for role data

3. **Role Template Service** (`src/features/staff/services/roleTemplateService.ts`):
   - Utility functions for working with role templates
   - Methods to apply templates to roles
   - Module-specific template application

4. **Role Service** (`src/features/staff/services/roleService.ts`):
   - API client for role operations
   - CRUD operations for roles
   - Request cancellation and error handling

5. **Roles Hook** (`src/features/staff/hooks/useRoles.tsx`):
   - React hook for managing roles state
   - Methods for fetching and manipulating roles
   - Loading and error states

6. **UI Components**:
   - **RolesPage** (`src/features/staff/pages/RolesPage.tsx`): List and manage roles with template selection
   - **PermissionsPage** (`src/features/staff/pages/PermissionsPage.tsx`): Detailed permission editing UI

## Role Template System

The template system allows for quickly applying predefined permission sets to roles:

### Backend Templates

The backend defines role templates using the `createRoleTemplate` function, which sets appropriate permissions for each role type:

```typescript
const createRoleTemplate = (roleName: string) => {
  const permissions = createDefaultPermissions();
  
  switch (roleName) {
    case 'Administrator': {
      // Set full permissions for administrator
    }
    case 'Store Manager': {
      // Set store management permissions
    }
    // ... other role cases
  }
  
  return permissions;
};
```

### Frontend Templates

The frontend mirrors these templates in the `permissionTemplates` object:

```typescript
export const permissionTemplates = {
  administrator: {
    sales: {
      view: AccessLevel.ALL,
      // ... other permissions
    },
    // ... other modules
  },
  // ... other role templates
};
```

### Role Template Service

The `roleTemplateService` provides utility functions:

- `getAvailableTemplates()`: Lists all template options
- `getTemplateById(templateId)`: Retrieves a specific template
- `applyTemplateToRole(role, templateId)`: Applies a template to a role
- `createRoleFromTemplate(name, description, templateId)`: Creates a new role from a template
- `mergeModuleFromTemplate(role, templateId, moduleKey)`: Applies template to specific module

## Permission Structure

Permissions are organized by module and action:

1. **Module-specific permissions** (Sales, Inventory, Staff, etc.)
2. **Action-based permissions** (View, Create, Edit, Delete)
3. **Access levels** (None, Self, Department, All)
4. **Feature-specific toggles** (processRefunds, adjustStock, etc.)

Example structure:
```typescript
{
  sales: {
    view: AccessLevel.ALL,
    create: AccessLevel.ALL,
    edit: AccessLevel.SELF,
    delete: AccessLevel.NONE,
    processRefunds: true,
    // ... other permissions
  },
  // ... other modules
}
```

## UI Integration

### Role Creation with Templates

The RolesPage offers template selection when creating a new role:

1. Navigate to Staff > Roles
2. Click "Add Role"
3. Enter role name and description
4. Select a template from the dropdown (optional)
5. The form updates with permissions from the selected template
6. Click "Create Role" to save

### Detailed Permission Editing

The PermissionsPage provides a comprehensive UI for editing permissions:

1. Tabbed interface by module
2. Template selection for each module tab
3. Permission matrix for standard operations
4. Toggles for feature-specific permissions
5. Visual indicators for permission levels

## Permission Checking

The system provides helper functions for checking permissions in components:

```typescript
// Check if user can view all staff records
const canViewAllStaff = hasPermission(
  userRole.permissions,
  'staff',
  'view',
  AccessLevel.ALL
);

// Check if user can process refunds
const canProcessRefunds = hasSpecificPermission(
  userRole.permissions,
  'sales',
  'processRefunds'
);
```

## Best Practices

1. **Use Predefined Templates**: Start with templates and customize as needed
2. **Module-Specific Permissions**: Use the module tabs to focus on relevant permissions
3. **Least Privilege**: Grant only the permissions necessary for each role
4. **Regular Audits**: Periodically review role permissions to ensure they remain appropriate
5. **Clear Documentation**: Document role purposes and permission requirements

## How to Use the System

### Creating a New Role

1. Navigate to Staff > Roles
2. Click "Add Role"
3. Enter name and description
4. (Optional) Select a template from the dropdown
5. Adjust basic permissions if needed
6. Click "Create Role"
7. Click "Edit Permissions" on the new role to fine-tune

### Editing Role Permissions

1. Navigate to Staff > Roles
2. Find the role to edit
3. Click "Edit Permissions"
4. Use the tabbed interface to navigate between modules
5. (Optional) Apply module-specific templates
6. Set access levels for standard operations
7. Toggle feature-specific permissions
8. Click "Save Changes"

### Applying Templates to Existing Roles

1. Navigate to Staff > Roles
2. Find the role to edit
3. Click "Edit Role" or "Edit Permissions"
4. Select a template from the dropdown
5. The form updates with permissions from the template
6. Adjust as needed
7. Save changes

## Conclusion

This comprehensive role system provides the flexibility and security needed for a modern POS system. The predefined role templates offer a quick starting point, while the detailed permissions UI allows for fine-grained customization to meet specific business needs. 