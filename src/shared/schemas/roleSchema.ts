import { z } from 'zod';

export enum AccessLevel {
  NONE = 0,
  VIEW = 1,
  EDIT = 2,
  MANAGE = 3,
  ALL = 4,       // Access to all resources
  DEPARTMENT = 5, // Access limited to department
  SELF = 6       // Access limited to own resources
}

// Base interface for all permission items
export interface PermissionItem {
  view: AccessLevel;
  create: AccessLevel;
  edit: AccessLevel;
  delete: AccessLevel;
}

// Module-specific permission interfaces
export interface SalesPermissions extends PermissionItem {
  processRefunds: AccessLevel;
  applyDiscounts: AccessLevel;
}

export interface InventoryPermissions extends PermissionItem {
  manageStock: AccessLevel;
  adjustInventory: AccessLevel;
}

export interface StaffPermissions extends PermissionItem {
  manageRoles: AccessLevel;
  viewPerformance: AccessLevel;
}

export interface ReportsPermissions extends PermissionItem {
  viewSales: AccessLevel;
  viewFinancials: AccessLevel;
}

export interface SettingsPermissions extends PermissionItem {
  manageSystem: AccessLevel;
  manageIntegrations: AccessLevel;
}

export interface FinancialPermissions extends PermissionItem {
  manageAccounting: AccessLevel;
  viewTransactions: AccessLevel;
}

export interface CustomerPermissions extends PermissionItem {
  manageAccounts: AccessLevel;
  viewHistory: AccessLevel;
}

// Combined permissions interface
export interface Permissions {
  sales: SalesPermissions;
  inventory: InventoryPermissions;
  staff: StaffPermissions;
  reports: ReportsPermissions;
  settings: SettingsPermissions;
  financial: FinancialPermissions;
  customers: CustomerPermissions;
}

export const getDefaultPermissions = () => ({
  administrator: {
    users: AccessLevel.MANAGE,
    products: AccessLevel.MANAGE,
    orders: AccessLevel.MANAGE
  },
  manager: {
    users: AccessLevel.VIEW,
    products: AccessLevel.EDIT,
    orders: AccessLevel.EDIT
  }
});

// Define the permissions schema based on the AccessLevel enum
const permissionsSchema = z.object({
  users: z.nativeEnum(AccessLevel),
  products: z.nativeEnum(AccessLevel),
  orders: z.nativeEnum(AccessLevel)
});

// Define the base role schema that can be extended by form schemas
export const baseRoleSchema = z.object({
  name: z.string().min(1, { message: "Role name is required" }),
  description: z.string().optional(),
  permissions: z.object({
    administrator: permissionsSchema,
    manager: permissionsSchema
  }).default(getDefaultPermissions())
});

export type RolePermissions = ReturnType<typeof getDefaultPermissions>;