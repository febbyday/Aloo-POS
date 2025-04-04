/**
 * User Types
 * 
 * This file defines the types used in the user management system.
 */

import { z } from 'zod';
import { UserRole } from '@/features/auth/types/auth.types';

// User schema for validation
export const UserSchema = z.object({
  id: z.string(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  fullName: z.string().optional(),
  role: z.nativeEnum(UserRole),
  roleId: z.string().optional(),
  roles: z.array(z.string()).optional(),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
  lastLogin: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  avatar: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional()
});

// User type
export type User = z.infer<typeof UserSchema>;

// Re-export UserRole from auth types
export { UserRole };

// Create user schema
export const CreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(6).max(100),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean().default(true),
  avatar: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional()
});

// Create user type
export type CreateUserData = z.infer<typeof CreateUserSchema>;

// Update user schema
export const UpdateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional()
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
  PASSWORD_CHANGED: 'user:password:changed',
  ROLE_CHANGED: 'user:role:changed',
  STATUS_CHANGED: 'user:status:changed'
};
