// Import types from the shared schema
import {
  Role as SharedRole,
  CreateRoleInput as SharedCreateRoleInput,
  UpdateRoleInput as SharedUpdateRoleInput,
} from '../../../shared/schemas/roleSchema';

// Import standardized permission types
import { Permissions } from '../../../shared/schemas/permissions';
import { AccessLevel } from '../../../shared/schemas/accessLevel';

// Re-export types from the shared schema with standardized permissions
export interface Role extends Omit<SharedRole, 'permissions'> {
  permissions: Permissions;
}

export interface CreateRoleInput extends Omit<SharedCreateRoleInput, 'permissions'> {
  permissions: Permissions;
}

export interface UpdateRoleInput extends Omit<SharedUpdateRoleInput, 'permissions'> {
  permissions?: Permissions;
}

// Interface for Role that aligns with the backend schema
export interface IRole extends Role {}

// Create a type for parameters used to create a new role
export type CreateRoleData = CreateRoleInput;

// Create a type for parameters used to update an existing role
export type UpdateRoleData = UpdateRoleInput;

export type RolePermissions = Role;

// Import utility functions for permissions
import { getDefaultPermissions } from '../../../shared/schemas/permissions';

// List of permission options with icons
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
