/**
 * Shop Service - API Integration for Shop Management
 *
 * This service handles all shop-related operations, including:
 * - CRUD operations for shop profiles
 * - Shop inventory management
 * - Staff assignments
 * - Shop analytics and reporting
 */

import { BaseService, QueryParams } from './base-service';
import { Shop, ShopInventoryItem, StaffAssignment } from '@/features/shops/types';
import { apiClient } from '../api-client';
import { handleApiError } from '../api-client';
import { SHOP_STATUS } from '../../../../shared/schemas/shopSchema';

// API endpoints
const ENDPOINTS = {
  SHOPS: '/api/v1/shops',
  SHOP_BY_ID: (id: string) => `/api/v1/shops/${id}`,
  SHOP_INVENTORY: (id: string) => `/api/v1/shops/${id}/inventory`,
  SHOP_STAFF: (id: string) => `/api/v1/shops/${id}/staff`,
  SHOP_REPORTS: (id: string) => `/api/v1/shops/${id}/reports`,
  SHOP_ACTIVITY: (id: string) => `/api/v1/shops/${id}/activity`,
};

/**
 * ShopService class for managing shop operations
 */
export class ShopService extends BaseService<Shop> {
  constructor() {
    super({
      endpoint: ENDPOINTS.SHOPS,
      entityName: 'shops',
      usePersistence: true,
    });
  }

  /**
   * Get a shop by ID with optional related data
   * @param id Shop ID
   * @param includeInventory Whether to include inventory data
   * @param includeStaff Whether to include staff assignments
   */
  async getShopById(
    id: string, 
    includeInventory: boolean = false, 
    includeStaff: boolean = false
  ): Promise<Shop> {
    try {
      const response = await apiClient.get(ENDPOINTS.SHOP_BY_ID(id));
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch shop details');
      }
      
      const shop = response.data;
      
      // Fetch related data if requested
      if (includeInventory) {
        const inventoryResponse = await this.getShopInventory(id);
        shop.inventory = inventoryResponse;
      }
      
      if (includeStaff) {
        const staffResponse = await this.getShopStaff(id);
        shop.staffAssignments = staffResponse;
      }
      
      return shop;
    } catch (error) {
      console.error(`Error fetching shop with ID ${id}:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Get inventory for a specific shop
   * @param shopId Shop ID
   * @param params Query parameters for filtering and pagination
   */
  async getShopInventory(
    shopId: string, 
    params?: QueryParams
  ): Promise<ShopInventoryItem[]> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get(`${ENDPOINTS.SHOP_INVENTORY(shopId)}${queryString}`);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch shop inventory');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching inventory for shop ${shopId}:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Get staff assignments for a specific shop
   * @param shopId Shop ID
   * @param params Query parameters for filtering and pagination
   */
  async getShopStaff(
    shopId: string, 
    params?: QueryParams
  ): Promise<StaffAssignment[]> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await apiClient.get(`${ENDPOINTS.SHOP_STAFF(shopId)}${queryString}`);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch shop staff');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching staff for shop ${shopId}:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Update shop status
   * @param shopId Shop ID
   * @param status New shop status
   */
  async updateShopStatus(shopId: string, status: SHOP_STATUS): Promise<Shop> {
    try {
      const response = await apiClient.patch(ENDPOINTS.SHOP_BY_ID(shopId), {
        status
      });
      
      if (!response.success || !response.data) {
        throw new Error('Failed to update shop status');
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error updating status for shop ${shopId}:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Add inventory item to shop
   * @param shopId Shop ID
   * @param inventoryItem Inventory item to add
   */
  async addInventoryItem(
    shopId: string, 
    inventoryItem: Omit<ShopInventoryItem, 'id' | 'shopId'>
  ): Promise<ShopInventoryItem> {
    try {
      const response = await apiClient.post(ENDPOINTS.SHOP_INVENTORY(shopId), {
        ...inventoryItem,
        shopId
      });
      
      if (!response.success || !response.data) {
        throw new Error('Failed to add inventory item');
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error adding inventory item to shop ${shopId}:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Update inventory item in shop
   * @param shopId Shop ID
   * @param itemId Inventory item ID
   * @param updates Updates to apply to the inventory item
   */
  async updateInventoryItem(
    shopId: string,
    itemId: string,
    updates: Partial<ShopInventoryItem>
  ): Promise<ShopInventoryItem> {
    try {
      const response = await apiClient.patch(
        `${ENDPOINTS.SHOP_INVENTORY(shopId)}/${itemId}`, 
        updates
      );
      
      if (!response.success || !response.data) {
        throw new Error('Failed to update inventory item');
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error updating inventory item ${itemId} in shop ${shopId}:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Assign staff to shop
   * @param shopId Shop ID
   * @param staffAssignment Staff assignment data
   */
  async assignStaffToShop(
    shopId: string,
    staffAssignment: Omit<StaffAssignment, 'id' | 'shopId'>
  ): Promise<StaffAssignment> {
    try {
      const response = await apiClient.post(
        ENDPOINTS.SHOP_STAFF(shopId),
        {
          ...staffAssignment,
          shopId
        }
      );
      
      if (!response.success || !response.data) {
        throw new Error('Failed to assign staff to shop');
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error assigning staff to shop ${shopId}:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Remove staff assignment from shop
   * @param shopId Shop ID
   * @param assignmentId Staff assignment ID
   */
  async removeStaffAssignment(shopId: string, assignmentId: string): Promise<void> {
    try {
      const response = await apiClient.delete(
        `${ENDPOINTS.SHOP_STAFF(shopId)}/${assignmentId}`
      );
      
      if (!response.success) {
        throw new Error('Failed to remove staff assignment');
      }
    } catch (error) {
      console.error(`Error removing staff assignment ${assignmentId} from shop ${shopId}:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Get shop analytics and reports
   * @param shopId Shop ID
   * @param period Report period ('day', 'week', 'month', 'year')
   */
  async getShopReports(
    shopId: string, 
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<any> {
    try {
      const response = await apiClient.get(`${ENDPOINTS.SHOP_REPORTS(shopId)}?period=${period}`);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch shop reports');
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching reports for shop ${shopId}:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Build query string from parameters
   * @param params Query parameters
   * @returns Formatted query string
   */
  private buildQueryString(params?: QueryParams): string {
    if (!params) return '';
    
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('limit', params.pageSize.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    // Add any additional filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}

// Export singleton instance
export const shopService = new ShopService();
