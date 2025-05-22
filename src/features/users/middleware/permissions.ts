/**
 * Permissions Middleware
 *
 * This module provides middleware functions for checking user permissions.
 */

import { Permissions } from '@/shared/schemas/permissions';
import { AccessLevel } from '@/shared/schemas/accessLevel';
import { hasPermission as utilsHasPermission } from '@/shared/utils/permissionUtils';

/**
 * Check if a user has permission for a specific action
 * @param permissions User's permissions object
 * @param module Module to check permission for
 * @param action Action to check permission for
 * @param requiredLevel Required access level (default: ALL)
 * @returns True if user has permission
 */
export function hasPermission(
  permissions: Permissions,
  module: keyof Permissions,
  action: keyof Permissions[typeof module],
  requiredLevel: AccessLevel = AccessLevel.ALL
): boolean {
  // Use the standardized utility function
  return utilsHasPermission(permissions, module, action as string, requiredLevel);
}

/**
 * Check if a user has any permission for a module
 * @param permissions User's permissions object
 * @param module Module to check permissions for
 * @returns True if user has any permission for the module
 */
export function hasAnyModulePermission(
  permissions: Permissions,
  module: keyof Permissions
): boolean {
  // If permissions object is null or undefined, user has no permissions
  if (!permissions) return false;

  // Get the module permissions
  const modulePermissions = permissions[module];
  if (!modulePermissions) return false;

  // Check if any permission in the module is enabled
  for (const [key, value] of Object.entries(modulePermissions)) {
    if (typeof value === 'boolean' && value === true) {
      return true;
    }
    if (typeof value === 'string' && value !== AccessLevel.NONE) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a user has all specified permissions
 * @param permissions User's permissions object
 * @param requiredPermissions Array of required permissions in format [module, action, level]
 * @returns True if user has all specified permissions
 */
export function hasAllPermissions(
  permissions: Permissions,
  requiredPermissions: Array<[keyof Permissions, string, AccessLevel?]>
): boolean {
  // If no permissions required, return true
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // Check if user has all required permissions
  return requiredPermissions.every(([module, action, level]) =>
    hasPermission(permissions, module, action as any, level)
  );
}

/**
 * Check if a user has any of the specified permissions
 * @param permissions User's permissions object
 * @param requiredPermissions Array of required permissions in format [module, action, level]
 * @returns True if user has any of the specified permissions
 */
export function hasAnyPermission(
  permissions: Permissions,
  requiredPermissions: Array<[keyof Permissions, string, AccessLevel?]>
): boolean {
  // If no permissions required, return true
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // Check if user has any required permission
  return requiredPermissions.some(([module, action, level]) =>
    hasPermission(permissions, module, action as any, level)
  );
}

/**
 * Get a list of modules that the user has permissions for
 * @param permissions User's permissions object
 * @returns Array of module names
 */
export function getAccessibleModules(permissions: Permissions): string[] {
  if (!permissions) return [];

  return Object.keys(permissions).filter(module =>
    hasAnyModulePermission(permissions, module as keyof Permissions)
  );
}

/**
 * Check if a user has admin-level permissions
 * @param permissions User's permissions object
 * @returns True if user has admin-level permissions
 */
export function hasAdminPermissions(permissions: Permissions): boolean {
  // Check if user has settings management permissions
  return hasPermission(permissions, 'settings', 'manageSystemConfig');
}

/**
 * Check if a user can manage roles
 * @param permissions User's permissions object
 * @returns True if user can manage roles
 */
export function canManageRoles(permissions: Permissions): boolean {
  return hasPermission(permissions, 'staff', 'manageRoles');
}

/**
 * Check if a user can assign permissions
 * @param permissions User's permissions object
 * @returns True if user can assign permissions
 */
export function canAssignPermissions(permissions: Permissions): boolean {
  return hasPermission(permissions, 'staff', 'assignPermissions');
}
