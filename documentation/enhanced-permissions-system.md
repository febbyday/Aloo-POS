# Enhanced Permissions System Documentation

## Overview

The POS System incorporates a sophisticated permissions management framework that enables granular control over user access across all modules of the application. This comprehensive permission system allows administrators to define exactly what actions each role can perform, with contextual access levels that enhance security while maintaining operational efficiency.

## Key Features

1. **Granular Access Control**: Permissions are defined at the feature level, not just the module level.
2. **Action-Based Permissions**: Each feature supports distinct permissions for viewing, creating, editing, and deleting.
3. **Access Level Hierarchy**: Users can be granted access at four distinct levels:
   - **None**: No access to the feature
   - **Self**: Access only to their own data/records
   - **Department**: Access to data within their department
   - **All**: Complete access across the organization
4. **Module-Specific Controls**: Each module has its own specialized set of permissions.
5. **Role-Based Access**: Permissions are assigned to roles, which are then assigned to users.
6. **Permission Templates**: Predefined permission sets for common roles.

## Core Permission Structure

Each permission object follows a consistent structure:

```typescript
// Base permission structure for CRUD operations
interface PermissionItem {
  view: AccessLevel;     // Permission to view resources
  create: AccessLevel;   // Permission to create resources
  edit: AccessLevel;     // Permission to modify resources
  delete: AccessLevel;   // Permission to delete resources
  export?: AccessLevel;  // Optional permission to export data
  approve?: AccessLevel; // Optional permission to approve actions
}

// Access levels available for each permission
enum AccessLevel {
  NONE = 'none',         // No access
  SELF = 'self',         // Access to own resources only
  DEPARTMENT = 'dept',   // Access to department resources
  ALL = 'all'            // Access to all resources
}
```

## Module Permissions

### Sales Module Permissions

The Sales module permissions control access to sales transactions, refunds, discounts, and related operations.

```typescript
interface SalesPermissions extends PermissionItem {
  processRefunds: boolean;
  applyDiscounts: boolean;
  voidTransactions: boolean;
  accessReports: boolean;
  managePromotions: boolean;
  viewSalesHistory: AccessLevel;
}
```

### Inventory Module Permissions

Inventory permissions manage access to stock management, suppliers, and inventory operations.

```typescript
interface InventoryPermissions extends PermissionItem {
  adjustStock: boolean;
  orderInventory: boolean;
  manageSuppliers: boolean;
  viewStockAlerts: boolean;
  transferStock: boolean;
  manageCategories: boolean;
}
```

### Staff Module Permissions

Staff permissions control access to employee management, performance data, and HR functions.

```typescript
interface StaffPermissions extends PermissionItem {
  manageRoles: boolean;
  assignPermissions: boolean;
  viewPerformance: AccessLevel;
  manageSchedules: AccessLevel;
  viewSalaries: AccessLevel;
  manageAttendance: AccessLevel;
}
```

### Reports, Settings, Financial, and Customer Modules

Similar permission structures exist for all other modules in the application, each with module-specific actions and access controls.

## Implementation Architecture

The permissions system is implemented using the following components:

1. **Type Definitions** (`src/features/staff/types/permissions.ts`): Defines the structure of permissions with TypeScript interfaces.

2. **Role Schema** (`src/features/staff/types/role.ts`): Integrates the permission definitions into the role schema.

3. **Permissions UI** (`src/features/staff/pages/PermissionsPage.tsx`): Provides an intuitive interface for managing permissions for each role.

4. **Backend Support** (`backend/src/routes/roleRoutes.ts`): Implements server-side validation and storage of the permission structures.

5. **Permission Helpers**: Utility functions to check permissions (`hasPermission()` and `hasSpecificPermission()`).

## Permission Management UI

The system includes a dedicated Permissions Management interface that allows administrators to:

1. View and modify permissions for each role
2. Configure access levels for standard operations (view, create, edit, delete)
3. Toggle feature-specific permissions
4. Set contextual access levels for sensitive operations

The UI is organized into tabs for each module, making it easy to configure related permissions together.

## Using Permissions in Code

To check permissions in your components:

```typescript
// Import the permission helpers
import { hasPermission, hasSpecificPermission, AccessLevel } from '../types/permissions';

// Check if a user can view all staff records
const canViewAllStaff = hasPermission(
  userRole.permissions,
  'staff',
  'view',
  AccessLevel.ALL
);

// Check if a user can process refunds
const canProcessRefunds = hasSpecificPermission(
  userRole.permissions,
  'sales',
  'processRefunds'
);

// Conditional rendering based on permissions
{canViewAllStaff && (
  <Button>View All Staff</Button>
)}

// Disable actions based on permissions
<Button 
  disabled={!canProcessRefunds}
  onClick={handleProcessRefund}
>
  Process Refund
</Button>
```

## Permission Templates

The system includes predefined permission templates for common roles:

1. **Store Manager**: Full access to all modules and features
2. **Sales Associate**: Access to sales operations and limited inventory viewing
3. **Inventory Manager**: Full control over inventory with limited access to other modules

These templates serve as starting points and can be customized for your organization's specific needs.

## Best Practices

1. **Principle of Least Privilege**: Grant only the permissions necessary for each role to perform its functions.
2. **Regular Audits**: Periodically review role permissions to ensure they remain appropriate.
3. **Role Consolidation**: Avoid creating too many specialized roles; consolidate where possible.
4. **Permission Inheritance**: Create a hierarchy of roles where possible, with permissions inherited from base roles.
5. **Documentation**: Document the purpose and scope of each role for future reference.

## Security Considerations

1. **Critical Permissions**: Be especially careful with permissions that affect financial data, personal information, or system configuration.
2. **Segregation of Duties**: Ensure that sensitive operations require multiple people with different permissions.
3. **Permission Changes**: Log all changes to permissions for audit purposes.
4. **UI Protection**: Even if UI elements are hidden based on permissions, ensure backend endpoints also validate permissions.

## Conclusion

This enhanced permissions system provides the flexibility and security needed for a modern POS system. By carefully managing permissions, you can ensure that users have exactly the access they need to perform their jobs efficiently while protecting sensitive operations and data. 