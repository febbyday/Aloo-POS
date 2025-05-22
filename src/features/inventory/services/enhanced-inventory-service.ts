/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Enhanced Inventory Service
 * 
 * This service demonstrates how to use the centralized endpoint definitions and
 * service endpoint factory to create a standardized, DRY service implementation.
 */

import { Inventory, InventoryAdjustment, InventoryTransfer, InventoryCount } from '../types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { INVENTORY_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType } from '@/lib/api/error-handler';

/**
 * Enhanced inventory service using the centralized endpoint definitions
 * This demonstrates how to use the service endpoint factory to reduce boilerplate
 */
const enhancedInventoryService = {
  // Basic CRUD operations using the standard service factory
  ...createStandardService<Inventory>('inventory', {
    useEnhancedClient: true,
    withRetry: {
      maxRetries: 3,
      shouldRetry: (error: any) => {
        // Only retry network or server errors, not validation errors
        return ![ApiErrorType.VALIDATION, ApiErrorType.CONFLICT].includes(error.type);
      }
    },
    cacheResponse: true,
    // Custom response mapping if needed
    mapResponse: (data: any) => {
      if (Array.isArray(data)) {
        return data.map(item => ({
          ...item,
          lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
        }));
      }
      return {
        ...data,
        lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date(),
      };
    }
  }),
  
  // Custom methods for specialized operations
  
  /**
   * Get inventory adjustments with pagination
   */
  getAdjustments: createServiceMethod<InventoryAdjustment[]>(
    'inventory',
    'ADJUSTMENTS',
    'get',
    { cacheResponse: false }
  ),
  
  /**
   * Create a new inventory adjustment
   */
  createAdjustment: createServiceMethod<InventoryAdjustment, Partial<InventoryAdjustment>>(
    'inventory',
    'CREATE_ADJUSTMENT',
    'post',
    { withRetry: false }
  ),
  
  /**
   * Get inventory transfers
   */
  getTransfers: createServiceMethod<InventoryTransfer[]>(
    'inventory',
    'TRANSFERS',
    'get',
    { cacheResponse: false }
  ),
  
  /**
   * Create a new inventory transfer
   */
  createTransfer: createServiceMethod<InventoryTransfer, Partial<InventoryTransfer>>(
    'inventory',
    'CREATE_TRANSFER',
    'post',
    { withRetry: false }
  ),
  
  /**
   * Get inventory locations
   */
  getLocations: createServiceMethod<{ id: string; name: string; type: string }[]>(
    'inventory',
    'LOCATIONS',
    'get',
    { cacheResponse: true }
  ),
  
  /**
   * Get inventory counts
   */
  getCounts: createServiceMethod<InventoryCount[]>(
    'inventory',
    'COUNTS',
    'get',
    { cacheResponse: false }
  ),
  
  /**
   * Create a new inventory count
   */
  createCount: createServiceMethod<InventoryCount, Partial<InventoryCount>>(
    'inventory',
    'CREATE_COUNT',
    'post',
    { withRetry: false }
  ),
  
  /**
   * Custom methods that combine multiple operations or have special logic
   */
  
  /**
   * Transfer inventory between locations
   */
  async transferBetweenLocations(
    productId: string,
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    notes?: string
  ): Promise<InventoryTransfer> {
    if (fromLocationId === toLocationId) {
      throw new Error('Source and destination locations cannot be the same');
    }

    if (quantity <= 0) {
      throw new Error('Transfer quantity must be greater than zero');
    }

    // Create the transfer record
    return this.createTransfer({
      productId,
      sourceLocationId: fromLocationId,
      destinationLocationId: toLocationId,
      quantity,
      notes,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
  },
  
  /**
   * Adjust inventory with reason
   */
  async adjustInventory(
    productId: string,
    locationId: string,
    quantityChange: number,
    reason: 'damaged' | 'lost' | 'found' | 'correction' | 'other',
    notes?: string
  ): Promise<InventoryAdjustment> {
    // Create the adjustment record
    return this.createAdjustment({
      productId,
      locationId,
      quantityChange,
      reason,
      notes,
      timestamp: new Date().toISOString(),
      performedBy: 'current-user' // In a real app, get from auth context
    });
  },
  
  /**
   * Start an inventory count process
   */
  async startInventoryCount(
    locationId: string,
    productIds?: string[]
  ): Promise<InventoryCount> {
    // Create a new count record
    return this.createCount({
      locationId,
      productIds,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      items: []
    });
  },
  
  /**
   * Complete an inventory count
   */
  async completeInventoryCount(
    countId: string,
    items: Array<{ productId: string; countedQuantity: number }>
  ): Promise<InventoryCount> {
    // First get the current count
    const count = await this.getCounts({ id: countId });
    if (!count || !count[0]) {
      throw new Error('Inventory count not found');
    }
    
    // Custom operation that doesn't directly map to an endpoint
    // Instead it uses multiple operations
    return createServiceMethod<InventoryCount>(
      'inventory',
      'COUNTS',
      'put',
      { withRetry: false }
    )(
      undefined, 
      {
        ...count[0],
        items,
        status: 'completed',
        completedAt: new Date().toISOString()
      },
      { id: countId }
    );
  }
};

export default enhancedInventoryService;
