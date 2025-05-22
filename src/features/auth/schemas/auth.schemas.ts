/**
 * Auth Schemas
 *
 * This file contains Zod schemas for auth-related data validation.
 */

import { z } from 'zod';

/**
 * User Role Enum
 * Defines the possible roles a user can have in the system
 * Must match the backend UserRole enum
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  USER = 'USER'
}

/**
 * User Schema
 * Defines the structure and validation rules for user data
 * This schema is aligned with the backend User model
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username cannot exceed 50 characters'),
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
  fullName: z.string().optional(), // Computed from firstName + lastName
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  lastLogin: z.string().datetime().nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  // PIN Authentication
  isPinEnabled: z.boolean().default(false),
  lastPinChange: z.string().datetime().nullable().optional(),
  failedPinAttempts: z.number().default(0),
  pinLockedUntil: z.string().datetime().nullable().optional()
});

/**
 * Login Request Schema
 * Defines the structure and validation rules for login requests
 */
export const LoginRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
});

/**
 * Login Response Schema
 * Defines the structure for login response data
 */
export const LoginResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: UserSchema,
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresIn: z.number()
  }).optional(),
  error: z.string().nullable().optional(),
  message: z.string().optional()
});

/**
 * Refresh Token Schema
 * Defines the structure for refresh token requests and responses
 */
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().optional()
});

export const RefreshTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresIn: z.number()
  }).optional(),
  error: z.string().nullable().optional()
});

/**
 * Password Reset Request Schema
 * Defines the structure for password reset requests
 */
export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format')
});

/**
 * Password Reset Confirmation Schema
 * Defines the structure for password reset confirmation
 */
export const PasswordResetConfirmSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation must be at least 8 characters')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

/**
 * Password Change Schema
 * Defines the structure for password change requests
 */
export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation must be at least 8 characters')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

/**
 * Register Request Schema
 * Defines the structure for user registration
 */
export const RegisterRequestSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username cannot exceed 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

/**
 * Register Response Schema
 * Defines the structure for registration response
 */
export const RegisterResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: UserSchema,
    token: z.string().optional(),
    message: z.string().optional()
  }).optional(),
  error: z.string().nullable().optional(),
  message: z.string().optional()
});

/**
 * Verification Response Schema
 * Defines the structure for token verification response
 */
export const VerificationResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    isValid: z.boolean(),
    user: UserSchema.optional()
  }).optional(),
  error: z.string().nullable().optional()
});

// Export types derived from schemas
export type User = z.infer<typeof UserSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof PasswordResetConfirmSchema>;
export type PasswordChange = z.infer<typeof PasswordChangeSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type VerificationResponse = z.infer<typeof VerificationResponseSchema>;
