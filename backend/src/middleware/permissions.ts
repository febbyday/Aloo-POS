import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
import { AccessLevel } from '../../shared/schemas/accessLevel';
import { Permissions } from '../../shared/schemas/permissions';
import {
  hasPermission as checkPermissionUtil,
  hasAnyPermission as checkAnyPermissionUtil,
  stringArrayToPermissions,
  permissionsToStringArray,
  convertLegacyPermissions
} from '../utils/permissionUtils';

/**
 * Extended Request interface with authenticated user information
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    roles?: string[];
    permissions?: Permissions | string[] | Record<string, any>;
  };
}

/**
 * Middleware to check if user has permission to access a resource
 */
export const checkPermission = (resource: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Skip check if no user is authenticated (should not happen if auth middleware runs first)
      if (!req.user) {
        logger.warn('No authenticated user found in request during permission check');
        return res.status(401).json({ error: 'Authentication required' });
      }

      // For now, assume basic authorization check
      // This should be replaced with actual permission logic based on your system

      // Example implementation:
      // 1. Get user's roles
      const userRoleIds = req.user.roles || [];

      // 2. Check if user has permission through any of their roles
      if (userRoleIds.length > 0) {
        const roles = await prisma.role.findMany({
          where: {
            id: { in: userRoleIds },
            isActive: true
          },
          select: {
            id: true,
            permissions: true
          }
        });

        // Check if any role has the required permission
        const hasPermission = roles.some(role => {
          // Convert permissions to standardized format if needed
          let standardizedPermissions: Permissions;

          if (Array.isArray(role.permissions)) {
            // If permissions are in string array format, convert to object format
            standardizedPermissions = stringArrayToPermissions(role.permissions);
          } else if (typeof role.permissions === 'object' &&
                    (role.permissions.administrator || role.permissions.manager)) {
            // If permissions are in legacy format, convert to standardized format
            standardizedPermissions = convertLegacyPermissions(role.permissions);
          } else {
            // Otherwise, assume it's already in the standardized format
            standardizedPermissions = role.permissions as Permissions;
          }

          return checkPermissionUtil(standardizedPermissions, resource, action, AccessLevel.SELF);
        });

        if (hasPermission) {
          return next();
        }
      }

      logger.warn(`Permission denied: ${req.user.username} attempted to ${action} ${resource}`);
      return res.status(403).json({ error: 'Permission denied' });
    } catch (error) {
      logger.error('Error checking permissions:', error);
      return res.status(500).json({ error: 'Server error during permission check' });
    }
  };
};

/**
 * Check if the user has any of the specified permissions
 */
export const checkAnyPermission = (permissions: Array<{ resource: string, action: string }>) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Skip check if no user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user's roles
      const userRoleIds = req.user.roles || [];

      if (userRoleIds.length > 0) {
        const roles = await prisma.role.findMany({
          where: {
            id: { in: userRoleIds },
            isActive: true
          },
          select: {
            id: true,
            permissions: true
          }
        });

        // Check if any role has any of the required permissions
        for (const role of roles) {
          // Convert permissions to standardized format if needed
          let standardizedPermissions: Permissions;

          if (Array.isArray(role.permissions)) {
            // If permissions are in string array format, convert to object format
            standardizedPermissions = stringArrayToPermissions(role.permissions);
          } else if (typeof role.permissions === 'object' &&
                    (role.permissions.administrator || role.permissions.manager)) {
            // If permissions are in legacy format, convert to standardized format
            standardizedPermissions = convertLegacyPermissions(role.permissions);
          } else {
            // Otherwise, assume it's already in the standardized format
            standardizedPermissions = role.permissions as Permissions;
          }

          // Convert to format expected by checkAnyPermissionUtil
          const requiredPermissions = permissions.map(p => [p.resource, p.action, AccessLevel.SELF] as [string, string, AccessLevel]);

          if (checkAnyPermissionUtil(standardizedPermissions, requiredPermissions)) {
            return next();
          }
        }
      }

      return res.status(403).json({ error: 'Permission denied' });
    } catch (error) {
      logger.error('Error checking permissions:', error);
      return res.status(500).json({ error: 'Server error during permission check' });
    }
  };
};

/**
 * Permission caching middleware
 *
 * This middleware loads a user's permissions and caches them in the request
 * object for faster access in subsequent permission checks.
 */
export const loadUserPermissions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next();
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id: req.user.role },
      select: { permissions: true }
    });

    if (role) {
      // Convert permissions to standardized format if needed
      let standardizedPermissions: Permissions;

      if (Array.isArray(role.permissions)) {
        // If permissions are in string array format, convert to object format
        standardizedPermissions = stringArrayToPermissions(role.permissions);
      } else if (typeof role.permissions === 'object' &&
                (role.permissions.administrator || role.permissions.manager)) {
        // If permissions are in legacy format, convert to standardized format
        standardizedPermissions = convertLegacyPermissions(role.permissions);
      } else {
        // Otherwise, assume it's already in the standardized format
        standardizedPermissions = role.permissions as Permissions;
      }

      // Extend the request object with the standardized permissions
      (req as any).permissions = standardizedPermissions;
    }

    next();
  } catch (error) {
    console.error('Error loading user permissions:', error);
    next();
  }
};

/**
 * Helper function to check if a user has permission (for use in service/controller logic)
 */
export const hasPermission = async (
  userId: string,
  resource: string,
  action: string
): Promise<boolean> => {
  try {
    // Get user's roles
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true }
    });

    if (!user || !user.roles) {
      return false;
    }

    const userRoleIds = user.roles as string[];

    if (userRoleIds.length > 0) {
      const roles = await prisma.role.findMany({
        where: {
          id: { in: userRoleIds },
          isActive: true
        },
        select: {
          id: true,
          permissions: true
        }
      });

      // Check if any role has the required permission
      return roles.some(role => {
        // Convert permissions to standardized format if needed
        let standardizedPermissions: Permissions;

        if (Array.isArray(role.permissions)) {
          // If permissions are in string array format, convert to object format
          standardizedPermissions = stringArrayToPermissions(role.permissions);
        } else if (typeof role.permissions === 'object' &&
                  (role.permissions.administrator || role.permissions.manager)) {
          // If permissions are in legacy format, convert to standardized format
          standardizedPermissions = convertLegacyPermissions(role.permissions);
        } else {
          // Otherwise, assume it's already in the standardized format
          standardizedPermissions = role.permissions as Permissions;
        }

        return checkPermissionUtil(standardizedPermissions, resource, action, AccessLevel.SELF);
      });
    }

    return false;
  } catch (error) {
    logger.error('Error checking permissions:', error);
    return false;
  }
};