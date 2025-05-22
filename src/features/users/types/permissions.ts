/**
 * Permissions system for POS application
 *
 * This file re-exports the standardized permission types from the shared schemas
 */

// Import standardized types from the shared schemas
import {
  PermissionItem,
  SalesPermissions,
  InventoryPermissions,
  StaffPermissions,
  ReportsPermissions,
  SettingsPermissions,
  FinancialPermissions,
  CustomerPermissions,
  ShopsPermissions,
  MarketsPermissions,
  ExpensesPermissions,
  RepairsPermissions,
  SuppliersPermissions,
  Permissions,
  getDefaultPermissions as getSharedDefaultPermissions
} from '../../../shared/schemas/permissions';

import { AccessLevel } from '../../../shared/schemas/accessLevel';
import { permissionTemplates as sharedPermissionTemplates } from '../../../shared/schemas/permissionTemplates';

// Re-export the AccessLevel enum for use in components
export { AccessLevel };

// Permission actions available for resources
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

// Re-export the permission templates from the shared schema
export const permissionTemplates = sharedPermissionTemplates;

// Re-export the getDefaultPermissions function from the shared schema
export const getDefaultPermissions = getSharedDefaultPermissions;

// Re-export other shared types for convenience
export type {
  PermissionItem,
  SalesPermissions,
  InventoryPermissions,
  StaffPermissions,
  ReportsPermissions,
  SettingsPermissions,
  FinancialPermissions,
  CustomerPermissions,
  ShopsPermissions,
  MarketsPermissions,
  ExpensesPermissions,
  RepairsPermissions,
  SuppliersPermissions,
  Permissions
};
