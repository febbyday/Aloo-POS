/**
 * User Validation Schema
 * 
 * Extended Zod schemas for comprehensive user data validation
 * Includes password validation, username rules, and email format checks
 */

import { z } from 'zod';
import { UserRole, UserSchema } from '../schemas/auth.schemas';

/**
 * Password validation schema with extended rules
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (password) => /[A-Z]/.test(password),
    { message: 'Password must contain at least one uppercase letter' }
  )
  .refine(
    (password) => /[a-z]/.test(password),
    { message: 'Password must contain at least one lowercase letter' }
  )
  .refine(
    (password) => /[0-9]/.test(password),
    { message: 'Password must contain at least one number' }
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    { message: 'Password must contain at least one special character' }
  );

/**
 * Username validation schema with extended rules
 * - Minimum 3 characters
 * - Maximum 50 characters
 * - Cannot start with a number
 * - Only allows alphanumeric characters, dashes, and underscores
 */
export const UsernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username cannot exceed 50 characters')
  .refine(
    (username) => /^[a-zA-Z_]/.test(username),
    { message: 'Username must start with a letter or underscore' }
  )
  .refine(
    (username) => /^[a-zA-Z0-9_-]+$/.test(username),
    { message: 'Username can only contain letters, numbers, dashes, and underscores' }
  );

/**
 * Email validation schema with extended rules
 * - Standard email format validation
 * - Cannot use disposable email domains
 */
export const EmailSchema = z.string()
  .email('Invalid email format')
  .refine(
    (email) => {
      const domain = email.split('@')[1];
      // List of common disposable email domains - expand as needed
      const disposableDomains = [
        'mailinator.com', 'tempmail.com', 'throwawaymail.com', 
        'temp-mail.org', 'guerrillamail.com', 'yopmail.com'
      ];
      return !disposableDomains.includes(domain);
    },
    { message: 'Please use a non-disposable email address' }
  );

/**
 * Extended user schema with comprehensive validation
 * Builds upon the base UserSchema with additional validation rules
 */
export const ExtendedUserSchema = UserSchema.extend({
  username: UsernameSchema,
  email: EmailSchema,
  // Add additional custom validation like maximum failed login attempts
  failedLoginAttempts: z.number().min(0).max(10).optional(),
});

/**
 * New user creation schema
 * Used for validating data when creating a new user
 */
export const NewUserSchema = z.object({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * User update schema
 * Used for validating data when updating an existing user
 * Makes almost all fields optional except id
 */
export const UserUpdateSchema = z.object({
  id: z.string().uuid(),
  username: UsernameSchema.optional(),
  email: EmailSchema.optional(),
  firstName: z.string().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().min(1, 'Last name is required').max(50).optional(),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Please select a valid role' })
  }).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().url().nullable().optional(),
});

/**
 * User password change schema
 * Used for validating password change requests
 */
export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema,
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * User search criteria schema
 * Used for validating search parameters when looking up users
 */
export const UserSearchSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  createdBefore: z.string().datetime().optional(),
  createdAfter: z.string().datetime().optional(),
  lastLoginBefore: z.string().datetime().optional(),
  lastLoginAfter: z.string().datetime().optional(),
});

/**
 * Export types derived from schemas
 */
export type ExtendedUser = z.infer<typeof ExtendedUserSchema>;
export type NewUser = z.infer<typeof NewUserSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type PasswordChange = z.infer<typeof PasswordChangeSchema>;
export type UserSearch = z.infer<typeof UserSearchSchema>;
