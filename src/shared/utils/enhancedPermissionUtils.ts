/**
 * Enhanced Permission Utilities
 *
 * Advanced utility functions for working with permissions.
 * These functions handle conversion between different permission formats with
 * improved performance, error handling, and type safety.
 */

import { Permissions, getDefaultPermissions } from '../schemas/permissions';
import { AccessLevel } from '../schemas/accessLevel';
import { permissionsToStringArray, stringArrayToPermissions, convertLegacyPermissions } from './permissionUtils';

// Simple in-memory cache for permission conversions
const conversionCache = new Map<string, any>();
const CACHE_SIZE_LIMIT = 100;

/**
 * Clear the permission conversion cache
 */
export function clearPermissionCache(): void {
  conversionCache.clear();
}

/**
 * Generate a cache key for permission conversion
 * @param data The data to generate a key for
 * @param operation The operation being performed
 * @returns A string key for the cache
 */
function generateCacheKey(data: any, operation: string): string {
  if (typeof data === 'object') {
    try {
      return `${operation}:${JSON.stringify(data)}`;
    } catch (e) {
      // If JSON.stringify fails, use a fallback
      return `${operation}:${Object.keys(data).join(',')}`;
    }
  }
  return `${operation}:${String(data)}`;
}

/**
 * Add an item to the cache with LRU eviction policy
 * @param key Cache key
 * @param value Value to cache
 */
function addToCache(key: string, value: any): void {
  // If cache is at capacity, remove the oldest entry
  if (conversionCache.size >= CACHE_SIZE_LIMIT) {
    const oldestKey = conversionCache.keys().next().value;
    conversionCache.delete(oldestKey);
  }

  // Add the new entry
  conversionCache.set(key, value);
}

/**
 * Enhanced version of permissionsToStringArray with caching and error handling
 * @param permissions Object-based permissions
 * @returns String array of permissions
 */
export function enhancedPermissionsToStringArray(permissions: Permissions | null | undefined): string[] {
  // Handle null or undefined permissions
  if (!permissions) {
    return [];
  }

  // Check cache first
  const cacheKey = generateCacheKey(permissions, 'toStringArray');
  if (conversionCache.has(cacheKey)) {
    return conversionCache.get(cacheKey);
  }

  try {
    // Use the original function for conversion
    const result = permissionsToStringArray(permissions);

    // Cache the result
    addToCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error converting permissions to string array:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Enhanced version of stringArrayToPermissions with caching and error handling
 * @param permArray String array of permissions
 * @param defaultPerms Default permissions object to use as base
 * @returns Object-based permissions
 */
export function enhancedStringArrayToPermissions(
  permArray: string[] | any,
  defaultPerms: Permissions = getDefaultPermissions()
): Permissions {
  // Handle null or undefined permissions
  if (!permArray) {
    return defaultPerms;
  }

  // Check cache first
  const cacheKey = generateCacheKey(permArray, 'toObjectPerms');
  if (conversionCache.has(cacheKey)) {
    return conversionCache.get(cacheKey);
  }

  try {
    // Use the original function for conversion
    const result = stringArrayToPermissions(permArray, defaultPerms);

    // Cache the result
    addToCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error converting string array to permissions:', error);
    // Return default permissions on error
    return defaultPerms;
  }
}

/**
 * Enhanced version of convertLegacyPermissions with caching and error handling
 * @param legacyPermissions Legacy permissions object or array
 * @returns Standardized permissions object
 */
export function enhancedConvertLegacyPermissions(legacyPermissions: any): Permissions {
  // Handle null or undefined permissions
  if (!legacyPermissions) {
    return getDefaultPermissions();
  }

  // Check cache first
  const cacheKey = generateCacheKey(legacyPermissions, 'convertLegacy');
  if (conversionCache.has(cacheKey)) {
    return conversionCache.get(cacheKey);
  }

  try {
    // Use the original function for conversion
    const result = convertLegacyPermissions(legacyPermissions);

    // Cache the result
    addToCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error converting legacy permissions:', error);
    // Return default permissions on error
    return getDefaultPermissions();
  }
}

/**
 * Unified permission conversion function that handles any input format
 * @param permissions Permissions in any format (object, array, or legacy)
 * @returns Standardized permissions object
 */
export function unifiedPermissionConverter(permissions: any): Permissions {
  // Handle null or undefined permissions
  if (!permissions) {
    return getDefaultPermissions();
  }

  // Check cache first
  const cacheKey = generateCacheKey(permissions, 'unified');
  if (conversionCache.has(cacheKey)) {
    return conversionCache.get(cacheKey);
  }

  try {
    let result: Permissions;

    // Handle different input formats
    if (Array.isArray(permissions)) {
      // Convert from string array format
      result = enhancedStringArrayToPermissions(permissions);
    } else if (typeof permissions === 'object') {
      // Check for API response format with view/create/update/delete properties
      if (permissions.sales && typeof permissions.sales === 'object' &&
          (permissions.sales.view !== undefined || permissions.sales.create !== undefined)) {

        // API format with view/create/update/delete - convert to our standard format
        const standardizedPermissions = getDefaultPermissions();

        // Map each module's permissions
        Object.keys(permissions).forEach(moduleKey => {
          if (standardizedPermissions[moduleKey as keyof Permissions]) {
            const modulePerms = permissions[moduleKey];

            // Map standard CRUD operations
            if (modulePerms.view !== undefined)
              standardizedPermissions[moduleKey as keyof Permissions].view = mapAccessLevel(modulePerms.view);
            if (modulePerms.create !== undefined)
              standardizedPermissions[moduleKey as keyof Permissions].create = mapAccessLevel(modulePerms.create);
            if (modulePerms.update !== undefined)
              standardizedPermissions[moduleKey as keyof Permissions].edit = mapAccessLevel(modulePerms.update);
            if (modulePerms.delete !== undefined)
              standardizedPermissions[moduleKey as keyof Permissions].delete = mapAccessLevel(modulePerms.delete);

            // Map other boolean properties if they exist
            Object.keys(modulePerms).forEach(permKey => {
              if (permKey !== 'view' && permKey !== 'create' && permKey !== 'update' && permKey !== 'delete') {
                if (standardizedPermissions[moduleKey as keyof Permissions][permKey as any] !== undefined) {
                  standardizedPermissions[moduleKey as keyof Permissions][permKey as any] = modulePerms[permKey];
                }
              }
            });
          }
        });

        result = standardizedPermissions;
      } else if (permissions.sales && permissions.inventory) {
        // Already in standardized format
        result = permissions as Permissions;
      } else if (permissions.administrator || permissions.manager) {
        // Legacy format
        result = enhancedConvertLegacyPermissions(permissions);
      } else {
        // Unknown object format, use default
        result = getDefaultPermissions();
      }
    } else {
      // Unknown format, use default
      result = getDefaultPermissions();
    }

    // Cache the result
    addToCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error in unified permission conversion:', error);
    // Return default permissions on error
    return getDefaultPermissions();
  }
}

/**
 * Maps string or numeric access level to AccessLevel enum
 * @param level Access level as string or number
 * @returns AccessLevel enum value
 */
function mapAccessLevel(level: string | number): AccessLevel {
  if (typeof level === 'string') {
    switch (level.toUpperCase()) {
      case 'ALL': return AccessLevel.ALL;
      case 'DEPARTMENT': return AccessLevel.DEPARTMENT;
      case 'SELF': return AccessLevel.SELF;
      case 'NONE': return AccessLevel.NONE;
      default: return AccessLevel.NONE;
    }
  } else if (typeof level === 'number') {
    // Ensure the number is within valid AccessLevel range
    if (level >= 0 && level <= 6) {
      return level as AccessLevel;
    }
    return AccessLevel.NONE;
  }

  return AccessLevel.NONE;
}
