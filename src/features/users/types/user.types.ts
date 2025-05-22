/**
 * User Types
 *
 * This file defines the types used in the user management system.
 * It imports the core User schema from auth schemas to ensure consistency.
 */

import { z } from 'zod';
import { UserSchema as CoreUserSchema, UserRole } from '@/features/auth/schemas/auth.schemas';
import { passwordSchema } from '../utils/validation-utils';

/**
 * Extended User Schema
 * Extends the core user schema with additional fields specific to the user management module
 */
export const UserSchema = CoreUserSchema.extend({
  // Additional fields for user management
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional()
});

// User type
export type User = z.infer<typeof UserSchema>;

// Re-export UserRole from auth schemas
export { UserRole };

// Create user schema with enhanced validation
export const CreateUserSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username can only contain letters, numbers, and ._-"),

  email: z.string()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email cannot exceed 100 characters"),

  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, apostrophes, and hyphens"),

  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, apostrophes, and hyphens"),

  password: passwordSchema,

  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Please select a valid role" })
  }),

  isActive: z.boolean().default(true),

  isPinEnabled: z.boolean().default(false),

  avatar: z.string().nullable().optional()
});

// Create user type
export type CreateUserData = z.infer<typeof CreateUserSchema>;

// Update user schema with enhanced validation
export const UpdateUserSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username can only contain letters, numbers, and ._-")
    .optional(),

  email: z.string()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email cannot exceed 100 characters")
    .optional(),

  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, apostrophes, and hyphens")
    .optional(),

  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, apostrophes, and hyphens")
    .optional(),

  password: passwordSchema.optional(),

  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Please select a valid role" })
  }).optional(),

  isActive: z.boolean().optional(),

  isPinEnabled: z.boolean().optional(),

  avatar: z.string().nullable().optional()
});

// Update user type
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;

// User filter options
export interface UserFilterOptions {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy?: 'username' | 'email' | 'fullName' | 'role' | 'lastLogin' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// User list response
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User events
export const USER_EVENTS = {
  CREATED: 'user:created',
  UPDATED: 'user:updated',
  DELETED: 'user:deleted',
  STATUS_CHANGED: 'user:status-changed',
  ROLE_CHANGED: 'user:role-changed',
  PASSWORD_CHANGED: 'user:password-changed',
  PIN_CHANGED: 'user:pin-changed'
};
