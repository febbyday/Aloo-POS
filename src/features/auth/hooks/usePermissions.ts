/**
 * usePermissions Hook
 * 
 * This hook provides utilities for checking user permissions and roles.
 */

import { useCallback } from 'react';
import { useAuth } from './useAuth';

export function usePermissions() {
  const { user, permissions, hasPermission, hasRole } = useAuth();

  /**
   * Check if user has all of the specified permissions
   * @param requiredPermissions Array of permissions to check
   * @returns True if user has all permissions
   */
  const hasAllPermissions = useCallback((requiredPermissions: string[]): boolean => {
    // If no permissions required, return true
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    
    // Check if user has all required permissions
    return requiredPermissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  /**
   * Check if user has any of the specified permissions
   * @param requiredPermissions Array of permissions to check
   * @returns True if user has at least one permission
   */
  const hasAnyPermission = useCallback((requiredPermissions: string[]): boolean => {
    // If no permissions required, return true
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    
    // Check if user has any required permission
    return requiredPermissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  /**
   * Check if user has all of the specified roles
   * @param requiredRoles Array of roles to check
   * @returns True if user has all roles
   */
  const hasAllRoles = useCallback((requiredRoles: string[]): boolean => {
    // If no roles required, return true
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    // Check if user has all required roles
    return requiredRoles.every(role => hasRole(role));
  }, [hasRole]);

  /**
   * Check if user has any of the specified roles
   * @param requiredRoles Array of roles to check
   * @returns True if user has at least one role
   */
  const hasAnyRole = useCallback((requiredRoles: string[]): boolean => {
    // If no roles required, return true
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    // Check if user has any required role
    return requiredRoles.some(role => hasRole(role));
  }, [hasRole]);

  /**
   * Check if user is an admin
   * @returns True if user has admin role
   */
  const isAdmin = useCallback((): boolean => {
    return hasRole('ADMIN');
  }, [hasRole]);

  /**
   * Check if user is a manager
   * @returns True if user has manager role
   */
  const isManager = useCallback((): boolean => {
    return hasRole('MANAGER');
  }, [hasRole]);

  /**
   * Get user's highest role
   * @returns Highest role or null if no roles
   */
  const getHighestRole = useCallback((): string | null => {
    if (!user || !user.roles || user.roles.length === 0) {
      return null;
    }
    
    // Define role hierarchy (highest to lowest)
    const roleHierarchy = ['ADMIN', 'MANAGER', 'CASHIER', 'USER'];
    
    // Find the highest role the user has
    for (const role of roleHierarchy) {
      if (user.roles.includes(role)) {
        return role;
      }
    }
    
    // If no matching role in hierarchy, return the first role
    return user.roles[0];
  }, [user]);

  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAllRoles,
    hasAnyRole,
    isAdmin,
    isManager,
    getHighestRole
  };
}
