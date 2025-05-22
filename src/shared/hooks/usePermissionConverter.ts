/**
 * Permission Converter Hook
 * 
 * React hook for converting permissions between different formats.
 * Provides memoized conversion functions to prevent unnecessary re-renders.
 */

import { useMemo, useCallback } from 'react';
import { Permissions, getDefaultPermissions } from '../schemas/permissions';
import { 
  enhancedPermissionsToStringArray, 
  enhancedStringArrayToPermissions,
  enhancedConvertLegacyPermissions,
  unifiedPermissionConverter
} from '../utils/enhancedPermissionUtils';

/**
 * Hook for converting permissions between different formats
 * @returns Object containing memoized conversion functions
 */
export function usePermissionConverter() {
  // Memoize the conversion functions to prevent unnecessary re-renders
  const toStringArray = useCallback((permissions: Permissions | null | undefined): string[] => {
    return enhancedPermissionsToStringArray(permissions);
  }, []);
  
  const toObjectPermissions = useCallback((permArray: string[] | any, defaultPerms?: Permissions): Permissions => {
    return enhancedStringArrayToPermissions(permArray, defaultPerms);
  }, []);
  
  const convertLegacy = useCallback((legacyPermissions: any): Permissions => {
    return enhancedConvertLegacyPermissions(legacyPermissions);
  }, []);
  
  const convertAny = useCallback((permissions: any): Permissions => {
    return unifiedPermissionConverter(permissions);
  }, []);
  
  // Return the memoized functions
  return useMemo(() => ({
    toStringArray,
    toObjectPermissions,
    convertLegacy,
    convertAny
  }), [toStringArray, toObjectPermissions, convertLegacy, convertAny]);
}

/**
 * Hook for working with a specific set of permissions
 * @param initialPermissions Initial permissions in any format
 * @returns Object containing the converted permissions and conversion functions
 */
export function usePermissions(initialPermissions: any) {
  const converter = usePermissionConverter();
  
  // Convert the initial permissions to standardized format
  const permissions = useMemo(() => {
    return converter.convertAny(initialPermissions);
  }, [initialPermissions, converter]);
  
  // Convert the permissions to string array format
  const permissionsArray = useMemo(() => {
    return converter.toStringArray(permissions);
  }, [permissions, converter]);
  
  // Return the converted permissions and conversion functions
  return useMemo(() => ({
    permissions,
    permissionsArray,
    ...converter
  }), [permissions, permissionsArray, converter]);
}
