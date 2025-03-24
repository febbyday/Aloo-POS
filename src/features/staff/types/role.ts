import { z } from "zod"
import { Permissions, getDefaultPermissions } from "./permissions"

export interface Role {
  id: string
  name: string
  description: string
  staffCount: number
  permissions: Permissions
  createdAt?: string
  updatedAt?: string
}

// Create a zod schema for permissions
export const permissionItemSchema = z.object({
  view: z.enum(["none", "self", "dept", "all"]),
  create: z.enum(["none", "self", "dept", "all"]),
  edit: z.enum(["none", "self", "dept", "all"]),
  delete: z.enum(["none", "self", "dept", "all"]),
  export: z.enum(["none", "self", "dept", "all"]).optional(),
  approve: z.enum(["none", "self", "dept", "all"]).optional(),
})

// Sales permissions schema
export const salesPermissionsSchema = permissionItemSchema.extend({
  processRefunds: z.boolean().default(false),
  applyDiscounts: z.boolean().default(false),
  voidTransactions: z.boolean().default(false),
  accessReports: z.boolean().default(false),
  managePromotions: z.boolean().default(false),
  viewSalesHistory: z.enum(["none", "self", "dept", "all"]).default("none"),
})

// Inventory permissions schema
export const inventoryPermissionsSchema = permissionItemSchema.extend({
  adjustStock: z.boolean().default(false),
  orderInventory: z.boolean().default(false),
  manageSuppliers: z.boolean().default(false),
  viewStockAlerts: z.boolean().default(false),
  transferStock: z.boolean().default(false),
  manageCategories: z.boolean().default(false),
})

// Staff permissions schema
export const staffPermissionsSchema = permissionItemSchema.extend({
  manageRoles: z.boolean().default(false),
  assignPermissions: z.boolean().default(false),
  viewPerformance: z.enum(["none", "self", "dept", "all"]).default("none"),
  manageSchedules: z.enum(["none", "self", "dept", "all"]).default("none"),
  viewSalaries: z.enum(["none", "self", "dept", "all"]).default("none"),
  manageAttendance: z.enum(["none", "self", "dept", "all"]).default("none"),
})

// Reports permissions schema
export const reportsPermissionsSchema = permissionItemSchema.extend({
  viewSalesReports: z.boolean().default(false),
  viewFinancialReports: z.boolean().default(false),
  viewInventoryReports: z.boolean().default(false),
  viewStaffReports: z.boolean().default(false),
  viewCustomReports: z.boolean().default(false),
  scheduleReports: z.boolean().default(false),
})

// Settings permissions schema
export const settingsPermissionsSchema = permissionItemSchema.extend({
  manageSystemConfig: z.boolean().default(false),
  manageStoreInfo: z.boolean().default(false),
  manageTaxSettings: z.boolean().default(false),
  manageIntegrations: z.boolean().default(false),
  manageBackups: z.boolean().default(false),
  viewAuditLogs: z.boolean().default(false),
})

// Financial permissions schema
export const financialPermissionsSchema = permissionItemSchema.extend({
  processPayments: z.boolean().default(false),
  manageAccounts: z.boolean().default(false),
  reconcileCash: z.boolean().default(false),
  viewFinancialSummary: z.boolean().default(false),
  manageExpenses: z.boolean().default(false),
  approveRefunds: z.boolean().default(false),
})

// Customer permissions schema
export const customerPermissionsSchema = permissionItemSchema.extend({
  manageCustomerGroups: z.boolean().default(false),
  viewPurchaseHistory: z.boolean().default(false),
  manageRewards: z.boolean().default(false),
  manageCredits: z.boolean().default(false),
  exportCustomerData: z.boolean().default(false),
})

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
})

// Schema for the Role type
export const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Role name must be at least 2 characters" }),
  description: z.string(),
  staffCount: z.number().default(0),
  permissions: permissionsSchema.default(getDefaultPermissions()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type RolePermissions = z.infer<typeof roleSchema>
export type Role = z.infer<typeof roleSchema>

export const permissionsList = [
  { id: "sales", label: "Sales Management", icon: "Receipt" },
  { id: "inventory", label: "Inventory Control", icon: "Package" },
  { id: "staff", label: "Staff Management", icon: "Users" },
  { id: "reports", label: "Reports Access", icon: "BarChart" },
  { id: "settings", label: "System Settings", icon: "Settings" },
  { id: "financial", label: "Financial Operations", icon: "DollarSign" },
  { id: "customers", label: "Customer Management", icon: "Users" },
  { id: "shops", label: "Shops Management", icon: "Store" },
  { id: "markets", label: "Markets Management", icon: "ShoppingBag" },
  { id: "expenses", label: "Expenses Management", icon: "CreditCard" },
  { id: "repairs", label: "Repairs Management", icon: "Tool" },
  { id: "suppliers", label: "Suppliers Management", icon: "Truck" },
] as const
