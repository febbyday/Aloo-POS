import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { SHOP_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';
import {
  Shop,
  SHOP_STATUS,
  ShopInventoryItem,
  StaffAssignment,
  ShopTransfer,
  InventoryLocation
} from '../types';

// Create error handler for this module
const errorHandler = createErrorHandler('shopService');

/**
 * @deprecated CRITICAL: Use the factory-based shopService instead
 * This service has been migrated to use the enhanced API client but will be removed in a future release.
 * Import from 'src/features/shops/services' instead of directly from this file.
 * Example: import { shopService } from '@/features/shops/services';
 */
export const shopService = {
  // Fetch all shops
  async fetchAll(): Promise<Shop[]> {
    try {
      console.warn('DEPRECATED: Using legacy shopService.fetchAll(). Please use the factory-based shopService instead.');
      return await enhancedApiClient.get<Shop[]>('shops/LIST', undefined, {
        retry: true,
        cache: 'default'
      });
    } catch (error) {
      console.error('Error fetching shops:', error);
      return errorHandler.handleError(error, 'fetchAll', []);
    }
  },

  // Fetch shop by ID
  async fetchById(id: string): Promise<Shop> {
    try {
      console.warn('DEPRECATED: Using legacy shopService.fetchById(). Please use the factory-based shopService instead.');
      return await enhancedApiClient.get<Shop>('shops/DETAIL', { id }, {
        retry: true,
        cache: 'default'
      });
    } catch (error) {
      console.error(`Error fetching shop ${id}:`, error);
      return errorHandler.handleError(error, 'fetchById');
    }
  },

  // Create a new shop
  async createShop(shopData: Partial<Shop>): Promise<Shop> {
    try {
      console.warn('DEPRECATED: Using legacy shopService.createShop(). Please use the factory-based shopService instead.');
      return await enhancedApiClient.post<Shop>('shops/CREATE', shopData);
    } catch (error) {
      console.error('Error creating shop:', error);
      return errorHandler.handleError(error, 'createShop');
    }
  },

  // Update an existing shop
  async updateShop(id: string, shopData: Partial<Shop>): Promise<Shop> {
    try {
      console.warn('DEPRECATED: Using legacy shopService.updateShop(). Please use the factory-based shopService instead.');
      return await enhancedApiClient.put<Shop>('shops/UPDATE', shopData, { id });
    } catch (error) {
      console.error(`Error updating shop ${id}:`, error);
      return errorHandler.handleError(error, 'updateShop');
    }
  },

  // Delete a shop
  async deleteShop(id: string): Promise<boolean> {
    try {
      console.warn('DEPRECATED: Using legacy shopService.deleteShop(). Please use the factory-based shopService instead.');
      await enhancedApiClient.delete('shops/DELETE', { id });
      return true;
    } catch (error) {
      console.error(`Error deleting shop ${id}:`, error);
      // Special case for 404 errors - consider it already deleted
      if (error.type === ApiErrorType.NOT_FOUND) {
        return true;
      }
      return errorHandler.handleError(error, 'deleteShop');
    }
  },

  // Fetch shop inventory
  async fetchInventory(shopId: string): Promise<ShopInventoryItem[]> {
    try {
      console.warn('DEPRECATED: Using legacy shopService.fetchInventory(). Please use the factory-based shopService instead.');
      return await enhancedApiClient.get<ShopInventoryItem[]>('shops/INVENTORY', { id: shopId }, {
        retry: true,
        cache: 'default'
      });
    } catch (error) {
      console.error(`Error fetching inventory for shop ${shopId}:`, error);
      return errorHandler.handleError(error, 'fetchInventory', []);
    }
  },

  // Fetch staff assignments for a shop
  async fetchStaffAssignments(shopId: string): Promise<StaffAssignment[]> {
    try {
      console.warn('DEPRECATED: Using legacy shopService.fetchStaffAssignments(). Please use the factory-based shopService instead.');
      return await enhancedApiClient.get<StaffAssignment[]>('shops/STAFF', { id: shopId }, {
        retry: true,
        cache: 'default'
      });
    } catch (error) {
      console.error(`Error fetching staff assignments for shop ${shopId}:`, error);
      return errorHandler.handleError(error, 'fetchStaffAssignments', []);
    }
  },

  // Fetch inventory locations for a shop
  async fetchInventoryLocations(shopId: string): Promise<InventoryLocation[]> {
    try {
      console.warn('DEPRECATED: Using legacy shopService.fetchInventoryLocations(). Please use the factory-based shopService instead.');
      return await enhancedApiClient.get<InventoryLocation[]>('shops/INVENTORY', { id: shopId }, {
        retry: true,
        cache: 'default'
      });
    } catch (error) {
      console.error(`Error fetching inventory locations for shop ${shopId}:`, error);
      return errorHandler.handleError(error, 'fetchInventoryLocations', []);
    }
  },

  // Create inventory transfer between shops
  async createTransfer(transferData: Partial<ShopTransfer>): Promise<ShopTransfer> {
    try {
      console.warn('DEPRECATED: Using legacy shopService.createTransfer(). Please use the factory-based shopService instead.');
      return await enhancedApiClient.post<ShopTransfer>('shops/CREATE', transferData);
    } catch (error) {
      console.error('Error creating transfer:', error);
      return errorHandler.handleError(error, 'createTransfer');
    }
  },

  // Fetch transfers for a shop
  async fetchTransfers(shopId: string): Promise<ShopTransfer[]> {
    try {
      console.warn('DEPRECATED: Using legacy shopService.fetchTransfers(). Please use the factory-based shopService instead.');
      return await enhancedApiClient.get<ShopTransfer[]>('shops/LIST', undefined, {
        params: { shopId },
        retry: true,
        cache: 'default'
      });
    } catch (error) {
      console.error(`Error fetching transfers for shop ${shopId}:`, error);
      return errorHandler.handleError(error, 'fetchTransfers', []);
    }
  }
};