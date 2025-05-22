/**
 * Shop Service - API Integration for Shop Management
 *
 * This service handles all shop-related operations, including:
 * - CRUD operations for shop profiles
 * - Shop inventory management
 * - Staff assignments
 * - Shop analytics and reporting
 *
 * UPDATED: Now uses the enhanced API client and endpoint registry for standardized API access
 */

import { BaseService, QueryParams } from './base-service';
import { Shop, ShopInventoryItem, StaffAssignment } from '@/features/shops/types';
import { enhancedApiClient } from '../enhanced-api-client';
import { SHOP_ENDPOINTS } from '../endpoint-registry';
import { ApiError, ApiErrorType, createErrorHandler } from '../error-handler';
import { SHOP_STATUS } from '../../../../shared/schemas/shopSchema';

// Create a module-specific error handler
const shopErrorHandler = createErrorHandler('shops');

// Define retry configuration for shop endpoints
const SHOP_RETRY_CONFIG = {
  maxRetries: 2,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  shouldRetry: (error: ApiError) => {
    // Only retry network or server errors, not validation or auth errors
    return [ApiErrorType.NETWORK, ApiErrorType.SERVER, ApiErrorType.TIMEOUT].includes(error.type);
  }
};

/**
 * Safe API call with fallback
 *
 * @param apiCall Function that makes the API call
 * @param fallbackFn Function to call if the API call fails
 * @param errorMessage Error message to display
 * @returns The API response or fallback data
 */
async function safeApiCallWithFallback<T>(
  apiCall: () => Promise<T>,
  fallbackFn: () => T,
  errorMessage: string
): Promise<T> {
  const [result, error] = await shopErrorHandler.safeCall(apiCall, errorMessage);

  if (error) {
    console.warn(`Falling back to local data: ${errorMessage}`);
    return fallbackFn();
  }

  return result as T;
}

/**
 * ShopService class for managing shop operations
 */
export class ShopService extends BaseService<Shop> {
  constructor() {
    super({
      endpoint: '/api/v1/shops',
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
    return safeApiCallWithFallback(
      async () => {
        const shop = await shopErrorHandler.withRetry(
          () => enhancedApiClient.get<Shop>(
            'shops/DETAIL',
            { id },
            {
              params: {
                include: [
                  ...(includeInventory ? ['inventory'] : []),
                  ...(includeStaff ? ['staff'] : [])
                ].join(',')
              },
              cache: 'default'
            }
          ),
          SHOP_RETRY_CONFIG
        );

        // If the API doesn't support the include parameter, fetch related data manually
        if (includeInventory && !shop.inventory) {
          const inventoryResponse = await this.getShopInventory(id);
          shop.inventory = inventoryResponse;
        }

        if (includeStaff && !shop.staffAssignments) {
          const staffResponse = await this.getShopStaff(id);
          shop.staffAssignments = staffResponse;
        }

        return shop;
      },
      () => ({
        id,
        name: 'Unknown Shop',
        address: {},
        status: SHOP_STATUS.INACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Shop),
      `Error fetching shop with ID ${id}`
    );
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
    return safeApiCallWithFallback(
      async () => {
        return await shopErrorHandler.withRetry(
          () => enhancedApiClient.get<ShopInventoryItem[]>(
            'shops/INVENTORY',
            { id: shopId },
            {
              params,
              cache: 'default'
            }
          ),
          SHOP_RETRY_CONFIG
        );
      },
      () => [],
      `Error fetching inventory for shop ${shopId}`
    );
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
    return safeApiCallWithFallback(
      async () => {
        return await shopErrorHandler.withRetry(
          () => enhancedApiClient.get<StaffAssignment[]>(
            'shops/STAFF',
            { id: shopId },
            {
              params,
              cache: 'default'
            }
          ),
          SHOP_RETRY_CONFIG
        );
      },
      () => [],
      `Error fetching staff for shop ${shopId}`
    );
  }

  /**
   * Update shop status
   * @param shopId Shop ID
   * @param status New shop status
   */
  async updateShopStatus(shopId: string, status: SHOP_STATUS): Promise<Shop> {
    const [result, error] = await shopErrorHandler.safeCall(
      () => enhancedApiClient.patch<Shop>(
        'shops/DETAIL',
        { status },
        { id: shopId }
      ),
      `Error updating status for shop ${shopId}`
    );

    if (error) {
      throw error;
    }

    return result as Shop;
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
    const [result, error] = await shopErrorHandler.safeCall(
      () => enhancedApiClient.post<ShopInventoryItem>(
        'shops/INVENTORY',
        {
          ...inventoryItem,
          shopId
        },
        { id: shopId }
      ),
      `Error adding inventory item to shop ${shopId}`
    );

    if (error) {
      throw error;
    }

    return result as ShopInventoryItem;
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
    const [result, error] = await shopErrorHandler.safeCall(
      () => enhancedApiClient.patch<ShopInventoryItem>(
        'shops/INVENTORY_ITEM',
        updates,
        { id: shopId, itemId }
      ),
      `Error updating inventory item ${itemId} in shop ${shopId}`
    );

    if (error) {
      throw error;
    }

    return result as ShopInventoryItem;
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
    const [result, error] = await shopErrorHandler.safeCall(
      () => enhancedApiClient.post<StaffAssignment>(
        'shops/ASSIGN_STAFF',
        {
          ...staffAssignment,
          shopId
        },
        { id: shopId }
      ),
      `Error assigning staff to shop ${shopId}`
    );

    if (error) {
      throw error;
    }

    return result as StaffAssignment;
  }

  /**
   * Remove staff assignment from shop
   * @param shopId Shop ID
   * @param assignmentId Staff assignment ID
   */
  async removeStaffAssignment(shopId: string, assignmentId: string): Promise<void> {
    const [_, error] = await shopErrorHandler.safeCall(
      () => enhancedApiClient.delete(
        'shops/STAFF_ASSIGNMENT',
        { id: shopId, assignmentId }
      ),
      `Error removing staff assignment ${assignmentId} from shop ${shopId}`
    );

    if (error) {
      throw error;
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
    return safeApiCallWithFallback(
      async () => {
        return await shopErrorHandler.withRetry(
          () => enhancedApiClient.get(
            'shops/REPORTS',
            { id: shopId },
            {
              params: { period },
              cache: 'default'
            }
          ),
          SHOP_RETRY_CONFIG
        );
      },
      () => ({
        sales: [],
        inventory: [],
        customers: [],
        period
      }),
      `Error fetching reports for shop ${shopId}`
    );
  }


}

// Export singleton instance
export const shopService = new ShopService();
