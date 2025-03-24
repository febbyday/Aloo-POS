/**
 * User-related type definitions
 * 
 * This file contains all types related to users in the system.
 * It follows the standard type definition pattern.
 */

import { z } from "zod";

/**
 * UserRole - Defines the possible roles a user can have in the system
 */
export const UserRoleSchema = z.enum([
  "admin",
  "manager",
  "staff",
  "customer"
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * UserStatus - Defines the possible statuses for a user account
 */
export type UserStatus = "active" | "inactive" | "suspended" | "pending";

/**
 * User schema with validation rules
 * 
 * @property id - Unique identifier
 * @property email - User's email (must be valid email format)
 * @property firstName - User's first name
 * @property lastName - User's last name
 * @property role - User's role in the system
 * @property status - Current account status
 * @property createdAt - When the user was created
 * @property updatedAt - When the user was last updated
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  role: UserRoleSchema,
  status: z.enum(["active", "inactive", "suspended", "pending"]).default("active"),
  profileImageUrl: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  lastLoginAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * User type derived from the schema
 */
export type User = z.infer<typeof UserSchema>;

/**
 * Permissions associated with different user roles
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "users:read",
    "users:write",
    "users:delete",
    "settings:read",
    "settings:write",
    "reports:read",
    "system:all"
  ],
  manager: [
    "users:read",
    "settings:read",
    "reports:read",
    "products:all",
    "orders:all",
    "inventory:all"
  ],
  staff: [
    "products:read",
    "orders:read",
    "orders:write",
    "customers:read"
  ],
  customer: [
    "profile:read",
    "profile:write",
    "orders:self"
  ]
};

/**
 * Input type for creating a new user
 * Omits system-generated fields
 */
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>;

/**
 * Input type for updating a user
 * Makes all fields optional except id
 */
export type UpdateUserInput = 
  Pick<User, 'id'> & 
  Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>>;

/**
 * User list view model - contains only the fields needed for list displays
 */
export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
}

/**
 * Function to convert a User to a UserListItem
 */
export function toUserListItem(user: User): UserListItem {
  return {
    id: user.id,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
  };
}

/**
 * User search parameters
 */
export interface UserSearchParams {
  query?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: keyof User;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Response type for paginated user lists
 */
export interface UserListResponse {
  items: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} 