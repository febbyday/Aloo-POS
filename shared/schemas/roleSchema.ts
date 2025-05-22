/**
 * Role Schema
 *
 * This file defines the shared schema for roles to be used across the application.
 * It provides a single source of truth for role-related types and validation.
 */

import { z } from 'zod';

// Permission access levels
export enum AccessLevel {
  NONE = 'none',         // No access
  SELF = 'self',         // Access to own resources only
  DEPARTMENT = 'dept',   // Access to department resources
  ALL = 'all'            // Access to all resources
}

// Base permission structure
export const permissionItemSchema = z.object({
  view: z.enum([AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL]),
  create: z.enum([AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL]),
  edit: z.enum([AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL]),
  delete: z.enum([AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL]),
  export: z.enum([AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL]).optional(),
  approve: z.enum([AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL]).optional(),
});

// Sales permissions schema
export const salesPermissionsSchema = permissionItemSchema.extend({
  processRefunds: z.boolean().default(false),
  applyDiscounts: z.boolean().default(false),
  voidTransactions: z.boolean().default(false),
  accessReports: z.boolean().default(false),
  managePromotions: z.boolean().default(false),
  viewSalesHistory: z.enum([AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL]).default(AccessLevel.NONE),
});

// Inventory permissions schema
export const inventoryPermissionsSchema = permissionItemSchema.extend({
  adjustStock: z.boolean().default(false),
  orderInventory: z.boolean().default(false),
  manageSuppliers: z.boolean().default(false),
  viewStockAlerts: z.boolean().default(false),
  transferStock: z.boolean().default(false),
  manageCategories: z.boolean().default(false),
});

// Staff permissions schema
export const staffPermissionsSchema = permissionItemSchema.extend({
  manageRoles: z.boolean().default(false),
  assignPermissions: z.boolean().default(false),
  viewPerformance: z.enum([AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL]).default(AccessLevel.NONE),
  manageSchedules: z.enum([AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL]).default(AccessLevel.NONE),
  viewSalaries: z.enum([AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL]).default(AccessLevel.NONE),
  manageAttendance: z.enum([AccessLevel.NONE, AccessLevel.SELF, AccessLevel.DEPARTMENT, AccessLevel.ALL]).default(AccessLevel.NONE),
});

// Reports permissions schema
export const reportsPermissionsSchema = permissionItemSchema.extend({
  viewSalesReports: z.boolean().default(false),
  viewInventoryReports: z.boolean().default(false),
  viewStaffReports: z.boolean().default(false),
  viewFinancialReports: z.boolean().default(false),
  viewCustomerReports: z.boolean().default(false),
  scheduleReports: z.boolean().default(false),
});

// Settings permissions schema
export const settingsPermissionsSchema = permissionItemSchema.extend({
  manageSystemSettings: z.boolean().default(false),
  manageIntegrations: z.boolean().default(false),
  manageBackups: z.boolean().default(false),
  viewAuditLogs: z.boolean().default(false),
  manageUsers: z.boolean().default(false),
});

// Financial permissions schema
export const financialPermissionsSchema = permissionItemSchema.extend({
  processPayments: z.boolean().default(false),
  manageAccounts: z.boolean().default(false),
  reconcileCash: z.boolean().default(false),
  viewFinancialSummary: z.boolean().default(false),
  manageExpenses: z.boolean().default(false),
  approveRefunds: z.boolean().default(false),
});

// Customer permissions schema
export const customerPermissionsSchema = permissionItemSchema.extend({
  manageCustomerGroups: z.boolean().default(false),
  viewPurchaseHistory: z.boolean().default(false),
  manageRewards: z.boolean().default(false),
  manageCredits: z.boolean().default(false),
  exportCustomerData: z.boolean().default(false),
});

// Full permissions schema
export const permissionsSchema = z.object({
  sales: salesPermissionsSchema,
  inventory: inventoryPermissionsSchema,
  staff: staffPermissionsSchema,
  reports: reportsPermissionsSchema,
  settings: settingsPermissionsSchema,
  financial: financialPermissionsSchema,
  customers: customerPermissionsSchema,
  shops: permissionItemSchema,
  markets: permissionItemSchema,
  expenses: permissionItemSchema,
  repairs: permissionItemSchema,
  suppliers: permissionItemSchema,
});

// Generate default permissions with no access
export function getDefaultPermissions() {
  const defaultItem = {
    view: AccessLevel.NONE,
    create: AccessLevel.NONE,
    edit: AccessLevel.NONE,
    delete: AccessLevel.NONE,
  };

  return {
    sales: {
      ...defaultItem,
      processRefunds: false,
      applyDiscounts: false,
      voidTransactions: false,
      accessReports: false,
      managePromotions: false,
      viewSalesHistory: AccessLevel.NONE,
    },
    inventory: {
      ...defaultItem,
      adjustStock: false,
      orderInventory: false,
      manageSuppliers: false,
      viewStockAlerts: false,
      transferStock: false,
      manageCategories: false,
    },
    staff: {
      ...defaultItem,
      manageRoles: false,
      assignPermissions: false,
      viewPerformance: AccessLevel.NONE,
      manageSchedules: AccessLevel.NONE,
      viewSalaries: AccessLevel.NONE,
      manageAttendance: AccessLevel.NONE,
    },
    reports: {
      ...defaultItem,
      viewSalesReports: false,
      viewInventoryReports: false,
      viewStaffReports: false,
      viewFinancialReports: false,
      viewCustomerReports: false,
      scheduleReports: false,
    },
    settings: {
      ...defaultItem,
      manageSystemSettings: false,
      manageIntegrations: false,
      manageBackups: false,
      viewAuditLogs: false,
      manageUsers: false,
    },
    financial: {
      ...defaultItem,
      processPayments: false,
      manageAccounts: false,
      reconcileCash: false,
      viewFinancialSummary: false,
      manageExpenses: false,
      approveRefunds: false,
    },
    customers: {
      ...defaultItem,
      manageCustomerGroups: false,
      viewPurchaseHistory: false,
      manageRewards: false,
      manageCredits: false,
      exportCustomerData: false,
    },
    shops: defaultItem,
    markets: defaultItem,
    expenses: defaultItem,
    repairs: defaultItem,
    suppliers: defaultItem,
  };
}

// Base role schema with common fields
export const baseRoleSchema = z.object({
  name: z.string().min(2, { message: 'Role name must be at least 2 characters' }).max(50, { message: 'Name cannot exceed 50 characters' }),
  description: z.string().max(200, { message: 'Description cannot exceed 200 characters' }).optional(),
  permissions: permissionsSchema.default(getDefaultPermissions()),
  isActive: z.boolean().default(true),
  isSystemRole: z.boolean().default(false),
});

// Schema for creating a new role
export const createRoleSchema = baseRoleSchema;

// Schema for updating an existing role
export const updateRoleSchema = baseRoleSchema.partial();

// Complete role schema with all fields
export const roleSchema = baseRoleSchema.extend({
  id: z.string().optional(),
  staffCount: z.number().default(0),
  createdAt: z.string().or(z.date().transform(d => d.toISOString())).optional(),
  updatedAt: z.string().or(z.date().transform(d => d.toISOString())).optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

// Infer types from schemas
export type PermissionItem = z.infer<typeof permissionItemSchema>;
export type SalesPermissions = z.infer<typeof salesPermissionsSchema>;
export type InventoryPermissions = z.infer<typeof inventoryPermissionsSchema>;
export type StaffPermissions = z.infer<typeof staffPermissionsSchema>;
export type ReportsPermissions = z.infer<typeof reportsPermissionsSchema>;
export type SettingsPermissions = z.infer<typeof settingsPermissionsSchema>;
export type FinancialPermissions = z.infer<typeof financialPermissionsSchema>;
export type CustomerPermissions = z.infer<typeof customerPermissionsSchema>;
export type Permissions = z.infer<typeof permissionsSchema>;
export type Role = z.infer<typeof roleSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

// Form values type for role create/edit
export type RoleFormValues = Omit<CreateRoleInput, 'id' | 'createdAt' | 'updatedAt'>;
