/**
 * Enhanced Permission Utilities Tests
 *
 * Tests for the enhanced permission utility functions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  enhancedPermissionsToStringArray,
  enhancedStringArrayToPermissions,
  enhancedConvertLegacyPermissions,
  unifiedPermissionConverter,
  clearPermissionCache
} from '../enhancedPermissionUtils';
import { AccessLevel } from '../../schemas/accessLevel';
import { getDefaultPermissions } from '../../schemas/permissions';
import type { Permissions } from '../../schemas/permissions';

describe('Enhanced Permission Utilities', () => {
  // Clear the cache before each test
  beforeEach(() => {
    clearPermissionCache();
  });
  
  describe('enhancedPermissionsToStringArray', () => {
    it('should convert object permissions to string array', () => {
      // Create a test permissions object
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
        },
        inventory: {
          view: AccessLevel.ALL,
          create: AccessLevel.ALL,
          edit: AccessLevel.NONE,
          delete: AccessLevel.NONE,
          adjustStock: true,
          orderInventory: false,
          manageSuppliers: true,
          viewStockAlerts: false,
          transferStock: true,
          manageCategories: false
        }
      } as Permissions;

      const result = enhancedPermissionsToStringArray(permissions as Permissions);

      // Verify module-level permissions are included
      expect(result).toContain('sales');
      expect(result).toContain('inventory');

      // Verify action-level permissions with access levels
      expect(result).toContain('sales.view.all');
      expect(result).toContain('sales.create.dept');
      expect(result).toContain('sales.edit.self');
      expect(result).not.toContain('sales.delete.none'); // NONE permissions should be excluded

      // Verify boolean permissions
      expect(result).toContain('sales.processRefunds');
      expect(result).not.toContain('sales.applyDiscounts'); // false boolean should be excluded
      expect(result).toContain('sales.voidTransactions');
      expect(result).toContain('sales.managePromotions');
    });

    it('should handle null or undefined permissions', () => {
      expect(enhancedPermissionsToStringArray(null)).toEqual([]);
      expect(enhancedPermissionsToStringArray(undefined)).toEqual([]);
    });
  });

  describe('enhancedStringArrayToPermissions', () => {
    it('should convert string array to object permissions', () => {
      const permArray = [
        'sales',
        'sales.view.all',
        'sales.create.dept',
        'sales.edit.self',
        'sales.processRefunds',
        'inventory',
        'inventory.view.all',
        'inventory.create.all',
        'inventory.adjustStock'
      ];

      const result = enhancedStringArrayToPermissions(permArray);

      // Verify module permissions
      expect(result.sales.view).toBe(AccessLevel.ALL);
      expect(result.sales.create).toBe(AccessLevel.DEPARTMENT);
      expect(result.sales.edit).toBe(AccessLevel.SELF);
      expect(result.sales.delete).toBe(AccessLevel.NONE);
      expect(result.sales.processRefunds).toBe(true);

      expect(result.inventory.view).toBe(AccessLevel.ALL);
      expect(result.inventory.create).toBe(AccessLevel.ALL);
      expect(result.inventory.adjustStock).toBe(true);
    });

    it('should handle null or undefined permissions', () => {
      const defaultPerms = getDefaultPermissions();
      expect(enhancedStringArrayToPermissions(null)).toEqual(defaultPerms);
      expect(enhancedStringArrayToPermissions(undefined)).toEqual(defaultPerms);
    });
  });

  describe('unifiedPermissionConverter', () => {
    it('should convert string array to object permissions', () => {
      const permArray = [
        'sales',
        'sales.view.all',
        'sales.processRefunds'
      ];

      const result = unifiedPermissionConverter(permArray);

      expect(result.sales.view).toBe(AccessLevel.ALL);
      expect(result.sales.processRefunds).toBe(true);
    });

    it('should handle object permissions', () => {
      const permissions: Partial<Permissions> = {
        sales: {
          view: AccessLevel.ALL,
          create: AccessLevel.DEPARTMENT,
          edit: AccessLevel.SELF,
          delete: AccessLevel.NONE,
          processRefunds: true
        }
      } as Permissions;

      const result = unifiedPermissionConverter(permissions);

      expect(result.sales.view).toBe(AccessLevel.ALL);
      expect(result.sales.create).toBe(AccessLevel.DEPARTMENT);
      expect(result.sales.processRefunds).toBe(true);
    });

    it('should handle legacy permissions', () => {
      const legacyPermissions = {
        administrator: {
          users: true,
          products: true
        },
        manager: {
          orders: true
        }
      };

      const result = unifiedPermissionConverter(legacyPermissions);

      // The result should be a standardized permissions object
      expect(result).toHaveProperty('sales');
      expect(result).toHaveProperty('inventory');
    });

    it('should handle null or undefined permissions', () => {
      const defaultPerms = getDefaultPermissions();
      expect(unifiedPermissionConverter(null)).toEqual(defaultPerms);
      expect(unifiedPermissionConverter(undefined)).toEqual(defaultPerms);
    });
  });
});
