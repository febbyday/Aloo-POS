/**
 * Permission Utilities Tests for Backend
 * 
 * Tests for the permission utility functions in the backend.
 */

import { describe, it, expect } from 'vitest';
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission, 
  hasAnyModulePermission,
  stringArrayToPermissions
} from '../permissionUtils';
import { AccessLevel } from '../../../shared/schemas/accessLevel';
import { getDefaultPermissions } from '../../../shared/schemas/permissions';
import type { Permissions } from '../../../shared/schemas/permissions';

describe('Backend Permission Utilities', () => {
  describe('hasPermission', () => {
    it('should correctly check boolean permissions', () => {
      const permissions: Partial<Permissions> = {
        sales: {
          view: AccessLevel.ALL,
          create: AccessLevel.ALL,
          edit: AccessLevel.ALL,
          delete: AccessLevel.ALL,
          processRefunds: true,
          applyDiscounts: false,
          voidTransactions: true,
          accessReports: false,
          managePromotions: true,
          viewSalesHistory: AccessLevel.ALL
        }
      } as Permissions;

      // Check boolean permissions
      expect(hasPermission(permissions as Permissions, 'sales', 'processRefunds')).toBe(true);
      expect(hasPermission(permissions as Permissions, 'sales', 'applyDiscounts')).toBe(false);
    });

    it('should correctly check access level permissions', () => {
      const permissions: Partial<Permissions> = {
        sales: {
          view: AccessLevel.ALL,
          create: AccessLevel.DEPARTMENT,
          edit: AccessLevel.SELF,
          delete: AccessLevel.NONE,
          processRefunds: true,
          applyDiscounts: false,
          voidTransactions: true,
          accessReports: false,
          managePromotions: true,
          viewSalesHistory: AccessLevel.SELF
        }
      } as Permissions;

      // ALL access level should satisfy any required level
      expect(hasPermission(permissions as Permissions, 'sales', 'view', AccessLevel.ALL)).toBe(true);
      expect(hasPermission(permissions as Permissions, 'sales', 'view', AccessLevel.DEPARTMENT)).toBe(true);
      expect(hasPermission(permissions as Permissions, 'sales', 'view', AccessLevel.SELF)).toBe(true);

      // DEPARTMENT access level should satisfy DEPARTMENT and SELF
      expect(hasPermission(permissions as Permissions, 'sales', 'create', AccessLevel.ALL)).toBe(false);
      expect(hasPermission(permissions as Permissions, 'sales', 'create', AccessLevel.DEPARTMENT)).toBe(true);
      expect(hasPermission(permissions as Permissions, 'sales', 'create', AccessLevel.SELF)).toBe(true);

      // SELF access level should only satisfy SELF
      expect(hasPermission(permissions as Permissions, 'sales', 'edit', AccessLevel.ALL)).toBe(false);
      expect(hasPermission(permissions as Permissions, 'sales', 'edit', AccessLevel.DEPARTMENT)).toBe(false);
      expect(hasPermission(permissions as Permissions, 'sales', 'edit', AccessLevel.SELF)).toBe(true);

      // NONE access level should not satisfy any level
      expect(hasPermission(permissions as Permissions, 'sales', 'delete', AccessLevel.ALL)).toBe(false);
      expect(hasPermission(permissions as Permissions, 'sales', 'delete', AccessLevel.DEPARTMENT)).toBe(false);
      expect(hasPermission(permissions as Permissions, 'sales', 'delete', AccessLevel.SELF)).toBe(false);
    });

    it('should handle missing permissions', () => {
      // Null permissions
      expect(hasPermission(null as any, 'sales', 'view')).toBe(false);
      
      // Missing module
      const permissions = { inventory: {} } as Permissions;
      expect(hasPermission(permissions, 'sales', 'view')).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all required permissions', () => {
      const permissions: Partial<Permissions> = {
        sales: {
          view: AccessLevel.ALL,
          create: AccessLevel.ALL,
          edit: AccessLevel.DEPARTMENT,
          delete: AccessLevel.NONE,
          processRefunds: true
        },
        inventory: {
          view: AccessLevel.ALL,
          create: AccessLevel.DEPARTMENT,
          edit: AccessLevel.SELF,
          delete: AccessLevel.NONE,
          adjustStock: true
        }
      } as Permissions;

      const requiredPermissions: Array<[string, string, AccessLevel?]> = [
        ['sales', 'view', AccessLevel.ALL],
        ['sales', 'create', AccessLevel.DEPARTMENT],
        ['inventory', 'view', AccessLevel.DEPARTMENT],
        ['sales', 'processRefunds']
      ];

      expect(hasAllPermissions(permissions as Permissions, requiredPermissions)).toBe(true);
    });

    it('should return false when user is missing any required permission', () => {
      const permissions: Partial<Permissions> = {
        sales: {
          view: AccessLevel.ALL,
          create: AccessLevel.DEPARTMENT,
          edit: AccessLevel.SELF,
          delete: AccessLevel.NONE,
          processRefunds: true
        }
      } as Permissions;

      const requiredPermissions: Array<[string, string, AccessLevel?]> = [
        ['sales', 'view', AccessLevel.ALL],
        ['sales', 'delete', AccessLevel.ALL], // User doesn't have this
        ['sales', 'processRefunds']
      ];

      expect(hasAllPermissions(permissions as Permissions, requiredPermissions)).toBe(false);
    });

    it('should return true for empty required permissions array', () => {
      const permissions = getDefaultPermissions();
      expect(hasAllPermissions(permissions, [])).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one required permission', () => {
      const permissions: Partial<Permissions> = {
        sales: {
          view: AccessLevel.ALL,
          create: AccessLevel.DEPARTMENT,
          edit: AccessLevel.SELF,
          delete: AccessLevel.NONE,
          processRefunds: false
        }
      } as Permissions;

      const requiredPermissions: Array<[string, string, AccessLevel?]> = [
        ['sales', 'delete', AccessLevel.ALL], // User doesn't have this
        ['sales', 'view', AccessLevel.DEPARTMENT], // User has this
        ['sales', 'processRefunds'] // User doesn't have this
      ];

      expect(hasAnyPermission(permissions as Permissions, requiredPermissions)).toBe(true);
    });

    it('should return false when user has none of the required permissions', () => {
      const permissions: Partial<Permissions> = {
        sales: {
          view: AccessLevel.SELF,
          create: AccessLevel.NONE,
          edit: AccessLevel.NONE,
          delete: AccessLevel.NONE,
          processRefunds: false
        }
      } as Permissions;

      const requiredPermissions: Array<[string, string, AccessLevel?]> = [
        ['sales', 'delete', AccessLevel.ALL],
        ['sales', 'view', AccessLevel.ALL], // User only has SELF
        ['sales', 'processRefunds'] // User doesn't have this
      ];

      expect(hasAnyPermission(permissions as Permissions, requiredPermissions)).toBe(false);
    });

    it('should return true for empty required permissions array', () => {
      const permissions = getDefaultPermissions();
      expect(hasAnyPermission(permissions, [])).toBe(true);
    });
  });

  describe('hasAnyModulePermission', () => {
    it('should return true when user has any permission in the module', () => {
      const permissions: Partial<Permissions> = {
        sales: {
          view: AccessLevel.NONE,
          create: AccessLevel.NONE,
          edit: AccessLevel.NONE,
          delete: AccessLevel.NONE,
          processRefunds: true, // Only this permission is enabled
          applyDiscounts: false,
          voidTransactions: false,
          accessReports: false,
          managePromotions: false,
          viewSalesHistory: AccessLevel.NONE
        }
      } as Permissions;

      expect(hasAnyModulePermission(permissions as Permissions, 'sales')).toBe(true);
    });

    it('should return false when user has no permissions in the module', () => {
      const permissions: Partial<Permissions> = {
        sales: {
          view: AccessLevel.NONE,
          create: AccessLevel.NONE,
          edit: AccessLevel.NONE,
          delete: AccessLevel.NONE,
          processRefunds: false,
          applyDiscounts: false,
          voidTransactions: false,
          accessReports: false,
          managePromotions: false,
          viewSalesHistory: AccessLevel.NONE
        }
      } as Permissions;

      expect(hasAnyModulePermission(permissions as Permissions, 'sales')).toBe(false);
    });

    it('should handle missing module', () => {
      const permissions = { sales: {} } as Permissions;
      expect(hasAnyModulePermission(permissions, 'inventory')).toBe(false);
    });

    it('should handle null permissions', () => {
      expect(hasAnyModulePermission(null as any, 'sales')).toBe(false);
    });
  });

  describe('stringArrayToPermissions', () => {
    it('should convert string array to permissions object', () => {
      const permArray = [
        'sales',
        'sales.view.all',
        'sales.create.dept',
        'sales.edit.self',
        'sales.processRefunds',
        'sales.voidTransactions',
        'inventory',
        'inventory.view.all',
        'inventory.adjustStock'
      ];

      const defaultPerms = getDefaultPermissions();
      const result = stringArrayToPermissions(permArray, defaultPerms);

      // Verify access level permissions
      expect(result.sales.view).toBe(AccessLevel.ALL);
      expect(result.sales.create).toBe(AccessLevel.DEPARTMENT);
      expect(result.sales.edit).toBe(AccessLevel.SELF);
      expect(result.sales.delete).toBe(AccessLevel.NONE); // Default value

      // Verify boolean permissions
      expect(result.sales.processRefunds).toBe(true);
      expect(result.sales.applyDiscounts).toBe(false); // Default value
      expect(result.sales.voidTransactions).toBe(true);

      // Verify inventory permissions
      expect(result.inventory.view).toBe(AccessLevel.ALL);
      expect(result.inventory.adjustStock).toBe(true);
    });

    it('should handle empty array', () => {
      const defaultPerms = getDefaultPermissions();
      const result = stringArrayToPermissions([], defaultPerms);
      
      // Should return default permissions
      expect(result).toEqual(defaultPerms);
    });

    it('should handle non-array input', () => {
      const defaultPerms = getDefaultPermissions();
      const result = stringArrayToPermissions(null as any, defaultPerms);
      
      // Should return default permissions
      expect(result).toEqual(defaultPerms);
    });

    it('should handle already object-formatted permissions', () => {
      const permissions = {
        sales: {
          view: AccessLevel.ALL,
          create: AccessLevel.DEPARTMENT
        }
      };
      
      const defaultPerms = getDefaultPermissions();
      const result = stringArrayToPermissions(permissions as any, defaultPerms);
      
      // Should return the same object
      expect(result).toBe(permissions);
    });
  });
});
