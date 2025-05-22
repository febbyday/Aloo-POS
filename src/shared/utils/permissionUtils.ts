/**
 * Permission Utilities
 * 
 * Utility functions for working with permissions.
 * These functions handle conversion between different permission formats.
 */

import { Permissions, getDefaultPermissions } from '../schemas/permissions';
import { AccessLevel } from '../schemas/accessLevel';

/**
 * Convert object-based permissions to string array format for API
 * @param permissions Object-based permissions
 * @returns String array of permissions
 */
export function permissionsToStringArray(permissions: Permissions): string[] {
  const result: string[] = [];
  
  for (const [module, modulePerms] of Object.entries(permissions)) {
    // Check if the module has any permissions enabled
    const hasPermissions = Object.entries(modulePerms).some(([key, value]) => {
      if (typeof value === 'boolean') {
        return value === true;
      } else if (typeof value === 'string') {
        return value !== AccessLevel.NONE;
      }
      return false;
    });
    
    // Add module-level permission if any permissions are enabled
    if (hasPermissions) {
      result.push(module);
      
      // Add action-level permissions
      for (const [action, value] of Object.entries(modulePerms)) {
        if (typeof value === 'boolean' && value === true) {
          result.push(`${module}.${action}`);
        } else if (typeof value === 'string' && value !== AccessLevel.NONE) {
          result.push(`${module}.${action}.${value}`);
        }
      }
    }
  }
  
  return result;
}

/**
 * Convert string array permissions to object format
 * @param permArray String array of permissions
 * @param defaultPerms Default permissions object to use as base
 * @returns Object-based permissions
 */
export function stringArrayToPermissions(permArray: string[] | any, defaultPerms: Permissions = getDefaultPermissions()): Permissions {
  // Handle case where permissions is already an object
  if (typeof permArray === 'object' && !Array.isArray(permArray)) {
    return permArray as Permissions;
  }
  
  // If permArray is not an array, return default permissions
  if (!Array.isArray(permArray)) {
    return defaultPerms;
  }
  
  // Start with default permissions
  const result = JSON.parse(JSON.stringify(defaultPerms)) as Permissions;
  
  for (const perm of permArray) {
    const parts = perm.split('.');
    const module = parts[0];
    const action = parts[1];
    const level = parts[2];
    
    // Skip if module doesn't exist in our permissions structure
    if (!result[module as keyof Permissions]) {
      continue;
    }
    
    // Handle module-level permission (e.g., "sales")
    if (!action) {
      continue;
    }
    
    // Get the module permissions
    const modulePerms = result[module as keyof Permissions];
    
    // Skip if action doesn't exist in module permissions
    if (!modulePerms || !(action in modulePerms)) {
      continue;
    }
    
    // Set the permission value
    if (level) {
      // Handle access level permission (e.g., "sales.view.all")
      if (level in AccessLevel) {
        (modulePerms as any)[action] = level;
      }
    } else {
      // Handle boolean permission (e.g., "sales.processRefunds")
      if (typeof (modulePerms as any)[action] === 'boolean') {
        (modulePerms as any)[action] = true;
      } else {
        // Default to ALL access for non-boolean permissions
        (modulePerms as any)[action] = AccessLevel.ALL;
      }
    }
  }
  
  return result;
}

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
  action: string,
  requiredLevel: AccessLevel = AccessLevel.ALL
): boolean {
  // If permissions object is null or undefined, user has no permissions
  if (!permissions) return false;

  // Get the module permissions
  const modulePerms = permissions[module];
  if (!modulePerms) return false;

  // Get the user's access level for this action
  const userLevel = (modulePerms as any)[action];

  // If the user level is not an AccessLevel enum value, it might be a boolean
  if (typeof userLevel === 'boolean') {
    return userLevel === true;
  }

  // Map access levels to numeric values for comparison
  const levels = {
    [AccessLevel.NONE]: 0,
    [AccessLevel.SELF]: 1,
    [AccessLevel.DEPARTMENT]: 2,
    [AccessLevel.ALL]: 3
  };

  // Compare user's level with required level
  return levels[userLevel as AccessLevel] >= levels[requiredLevel];
}

/**
 * Convert legacy permissions to standardized format
 * @param legacyPermissions Legacy permissions object or array
 * @returns Standardized permissions object
 */
export function convertLegacyPermissions(legacyPermissions: any): Permissions {
  // If it's an array, convert from string array format
  if (Array.isArray(legacyPermissions)) {
    return stringArrayToPermissions(legacyPermissions);
  }
  
  // If it's already in the new format, return as is
  if (typeof legacyPermissions === 'object' && 
      legacyPermissions.sales && 
      legacyPermissions.inventory) {
    return legacyPermissions as Permissions;
  }
  
  // Handle legacy format with administrator/manager structure
  if (typeof legacyPermissions === 'object' && 
      (legacyPermissions.administrator || legacyPermissions.manager)) {
    // Convert to string array first, then to standardized format
    const permArray: string[] = [];
    
    // Process administrator permissions
    if (legacyPermissions.administrator) {
      for (const [key, value] of Object.entries(legacyPermissions.administrator)) {
        if (value) {
          permArray.push(`administrator.${key}`);
        }
      }
    }
    
    // Process manager permissions
    if (legacyPermissions.manager) {
      for (const [key, value] of Object.entries(legacyPermissions.manager)) {
        if (value) {
          permArray.push(`manager.${key}`);
        }
      }
    }
    
    return stringArrayToPermissions(permArray);
  }
  
  // Default to empty permissions
  return getDefaultPermissions();
}
