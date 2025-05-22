/**
 * User Model Adapter
 * 
 * This utility provides functions to convert between different user model formats,
 * ensuring compatibility between the frontend and backend representations.
 */

import { User as AuthUser } from '@/features/auth/schemas/auth.schemas';
import { User as UserManagementUser } from '../types/user.types';
import { convertBackendUserToFrontend } from '@/features/auth/utils/user-validation';

/**
 * Converts a backend user model to the frontend User type
 * 
 * @param backendUser User data from the backend API
 * @returns Frontend User object
 */
export function adaptBackendUser(backendUser: any): AuthUser {
  return convertBackendUserToFrontend(backendUser);
}

/**
 * Converts a user from the auth module format to the user management format
 * 
 * @param authUser User from auth module
 * @returns User in user management format
 */
export function adaptAuthUserToManagementUser(authUser: AuthUser): UserManagementUser {
  return {
    ...authUser,
    // Add any user management specific fields with defaults
    phoneNumber: null,
    address: null,
    notes: null,
    metadata: null
  };
}

/**
 * Converts a user from the user management format to the auth module format
 * 
 * @param managementUser User from user management module
 * @returns User in auth module format
 */
export function adaptManagementUserToAuthUser(managementUser: UserManagementUser): AuthUser {
  // Extract only the fields that are part of the AuthUser type
  const {
    id,
    username,
    email,
    firstName,
    lastName,
    fullName,
    role,
    permissions,
    isActive,
    createdAt,
    updatedAt,
    lastLogin,
    avatar,
    isPinEnabled,
    lastPinChange,
    failedPinAttempts,
    pinLockedUntil
  } = managementUser;
  
  return {
    id,
    username,
    email,
    firstName,
    lastName,
    fullName,
    role,
    permissions,
    isActive,
    createdAt,
    updatedAt,
    lastLogin,
    avatar,
    isPinEnabled,
    lastPinChange,
    failedPinAttempts,
    pinLockedUntil
  };
}

/**
 * Prepares user data for sending to the backend API
 * 
 * @param user Frontend user object
 * @returns User data formatted for the backend API
 */
export function prepareUserForBackend(user: AuthUser | UserManagementUser): any {
  // Convert ISO date strings to Date objects if needed by the backend
  const convertToDate = (dateStr: string | null | undefined): Date | null | undefined => {
    if (!dateStr) return dateStr;
    return new Date(dateStr);
  };
  
  // Remove frontend-only fields and format dates
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    // Don't send fullName as it's computed on the backend
    role: user.role,
    permissions: user.permissions,
    isActive: user.isActive,
    // Convert dates if needed
    lastLogin: user.lastLogin ? convertToDate(user.lastLogin) : null,
    avatar: user.avatar,
    isPinEnabled: user.isPinEnabled,
    lastPinChange: user.lastPinChange ? convertToDate(user.lastPinChange) : null,
    failedPinAttempts: user.failedPinAttempts,
    pinLockedUntil: user.pinLockedUntil ? convertToDate(user.pinLockedUntil) : null
  };
}
