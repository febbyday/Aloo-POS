/**
 * User Validation Utilities
 * 
 * This file contains utility functions for validating user objects
 * and ensuring they conform to the expected schema.
 */

import { UserSchema, UserRole } from '../schemas/auth.schemas';
import { z } from 'zod';

/**
 * Type guard to check if an object is a valid User
 * 
 * @param obj Any object to check
 * @returns True if the object is a valid User
 */
export function isUser(obj: any): boolean {
  return UserSchema.safeParse(obj).success;
}

/**
 * Validates a user object against the schema and returns validation errors
 * 
 * @param obj User object to validate
 * @returns Object with success flag and errors if any
 */
export function validateUser(obj: any): { 
  success: boolean; 
  errors?: z.ZodError<any>;
  formattedErrors?: Record<string, string>;
} {
  const result = UserSchema.safeParse(obj);
  
  if (result.success) {
    return { success: true };
  }
  
  // Format errors for easier consumption
  const formattedErrors: Record<string, string> = {};
  result.error.errors.forEach(err => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  
  return {
    success: false,
    errors: result.error,
    formattedErrors
  };
}

/**
 * Ensures a user object has the required fields
 * If fields are missing, it adds default values
 * 
 * @param user Partial user object
 * @returns Complete user object with defaults for missing fields
 */
export function ensureUserDefaults(user: Partial<z.infer<typeof UserSchema>>): z.infer<typeof UserSchema> {
  // Create a base user with all required fields and defaults
  const baseUser: z.infer<typeof UserSchema> = {
    id: user.id || '',
    username: user.username || '',
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    role: user.role || UserRole.USER,
    permissions: user.permissions || [],
    isActive: user.isActive !== undefined ? user.isActive : true,
    createdAt: user.createdAt || new Date().toISOString(),
    isPinEnabled: user.isPinEnabled !== undefined ? user.isPinEnabled : false,
    failedPinAttempts: user.failedPinAttempts || 0,
    // Optional fields
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
    avatar: user.avatar,
    lastPinChange: user.lastPinChange,
    pinLockedUntil: user.pinLockedUntil
  };
  
  return baseUser;
}

/**
 * Formats a user object for display
 * Computes derived fields and ensures consistent format
 * 
 * @param user User object to format
 * @returns Formatted user object
 */
export function formatUserForDisplay(user: z.infer<typeof UserSchema>): z.infer<typeof UserSchema> {
  return {
    ...user,
    // Ensure fullName is computed from firstName and lastName
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    // Format dates for display if needed
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
    lastPinChange: user.lastPinChange,
    pinLockedUntil: user.pinLockedUntil
  };
}

/**
 * Converts a backend user model to the frontend User type
 * 
 * @param backendUser User data from the backend API
 * @returns Frontend User object
 */
export function convertBackendUserToFrontend(backendUser: any): z.infer<typeof UserSchema> {
  // Handle date conversions from backend Date objects to ISO strings
  const convertDate = (date: Date | string | null | undefined): string | null | undefined => {
    if (!date) return date;
    if (date instanceof Date) return date.toISOString();
    return date;
  };
  
  return {
    id: backendUser.id,
    username: backendUser.username,
    email: backendUser.email,
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    fullName: `${backendUser.firstName} ${backendUser.lastName}`.trim(),
    role: backendUser.role,
    permissions: backendUser.permissions || [],
    isActive: backendUser.isActive,
    createdAt: convertDate(backendUser.createdAt) || new Date().toISOString(),
    updatedAt: convertDate(backendUser.updatedAt),
    lastLogin: convertDate(backendUser.lastLogin),
    avatar: backendUser.avatar,
    isPinEnabled: backendUser.isPinEnabled || false,
    lastPinChange: convertDate(backendUser.lastPinChange),
    failedPinAttempts: backendUser.failedPinAttempts || 0,
    pinLockedUntil: convertDate(backendUser.pinLockedUntil)
  };
}
