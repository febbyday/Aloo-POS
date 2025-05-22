/**
 * Factory-Based Shop Service
 *
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of shop-related operations with minimal duplication.
 */

import { 
  Shop,
  ShopInventoryItem,
  StaffAssignment,
  ShopTransfer,
  InventoryLocation
} from '../types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { SHOP_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType } from '@/lib/api/error-handler';

// Define retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  shouldRetry: (error: any) => error.type !== ApiErrorType.VALIDATION
};

/**
 * Shop service with standardized endpoint handling
 */
export const shopService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<Shop>('shops', {
    useEnhancedClient: true,
    withRetry: RETRY_CONFIG,
    cacheResponse: true,
    mapResponse: (data: any) => {
      // Transform response data if needed
      return data;
    }
  }),

  /**
   * Fetch shop inventory
   * @param shopId The shop ID
   * @returns Promise with shop inventory items
   */
  fetchInventory: createServiceMethod<ShopInventoryItem[]>(
    'shops',
    'INVENTORY',
    'get',
    { withRetry: RETRY_CONFIG }
  ),

  /**
   * Fetch staff assignments for a shop
   * @param shopId The shop ID
   * @returns Promise with staff assignments
   */
  fetchStaffAssignments: createServiceMethod<StaffAssignment[]>(
    'shops',
    'STAFF',
    'get',
    { withRetry: RETRY_CONFIG }
  ),

  /**
   * Assign staff to a shop
   * @param shopId The shop ID
   * @param staffData The staff assignment data
   * @returns Promise with the updated staff assignment
   */
  assignStaff: createServiceMethod<StaffAssignment>(
    'shops',
    'ASSIGN_STAFF',
    'post',
    { withRetry: false }
  ),

  /**
   * Fetch inventory locations for a shop
   * @param shopId The shop ID
   * @returns Promise with inventory locations
   */
  async fetchInventoryLocations(shopId: string): Promise<InventoryLocation[]> {
    return createServiceMethod<InventoryLocation[]>(
      'shops',
      'INVENTORY',
      'get',
      { withRetry: RETRY_CONFIG }
    )({}, null, { id: shopId });
  },

  /**
   * Create inventory transfer between shops
   * @param transferData The transfer data
   * @returns Promise with the created transfer
   */
  createTransfer: createServiceMethod<ShopTransfer>(
    'shops',
    'CREATE',
    'post',
    { withRetry: false }
  ),

  /**
   * Fetch transfers for a shop
   * @param shopId The shop ID
   * @returns Promise with shop transfers
   */
  async fetchTransfers(shopId: string): Promise<ShopTransfer[]> {
    return createServiceMethod<ShopTransfer[]>(
      'shops',
      'LIST',
      'get',
      { withRetry: RETRY_CONFIG }
    )({ shopId });
  }
};

export default shopService;
