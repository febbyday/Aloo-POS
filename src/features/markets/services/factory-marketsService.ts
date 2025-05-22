/**
 * Factory-Based Markets Service
 *
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of market-related operations with minimal duplication.
 */

import { 
  Market,
  CreateMarketInput,
  UpdateMarketInput,
  StockAllocation,
  CreateStockAllocationInput,
  StaffAssignment,
  CreateStaffAssignmentInput,
  MarketSettings,
  MarketPerformance,
  MarketFilter
} from '../types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { MARKET_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType } from '@/lib/api/error-handler';

// Define retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  shouldRetry: (error: any) => error.type !== ApiErrorType.VALIDATION
};

/**
 * Markets Service
 * 
 * This service handles all operations related to markets, including CRUD operations,
 * stock allocations, and staff assignments.
 */
export const marketsService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<Market>('markets', {
    useEnhancedClient: true,
    withRetry: RETRY_CONFIG,
    cacheResponse: true,
    mapResponse: (data: any) => {
      // Transform response data if needed
      return data;
    }
  }),

  /**
   * Get all markets with optional filtering
   * @param filters Optional filters for the market list
   * @returns Promise with array of markets
   */
  async getAllMarkets(filters?: MarketFilter): Promise<Market[]> {
    return createServiceMethod<Market[]>(
      'markets',
      'LIST',
      'get',
      { withRetry: RETRY_CONFIG }
    )(filters || {});
  },

  /**
   * Get a market by ID
   * @param id Market ID
   * @returns Promise with market or null if not found
   */
  async getMarketById(id: string): Promise<Market | null> {
    return createServiceMethod<Market>(
      'markets',
      'DETAIL',
      'get',
      { withRetry: RETRY_CONFIG }
    )({}, null, { id });
  },

  /**
   * Create a new market
   * @param data Market data to create
   * @returns Promise with created market
   */
  async createMarket(data: CreateMarketInput): Promise<Market> {
    return createServiceMethod<Market>(
      'markets',
      'CREATE',
      'post',
      { withRetry: false }
    )(data);
  },

  /**
   * Update an existing market
   * @param id Market ID
   * @param data Updated market data
   * @returns Promise with updated market or null if not found
   */
  async updateMarket(id: string, data: UpdateMarketInput): Promise<Market | null> {
    return createServiceMethod<Market>(
      'markets',
      'UPDATE',
      'put',
      { withRetry: false }
    )(data, null, { id });
  },

  /**
   * Delete a market
   * @param id Market ID
   * @returns Promise with success status
   */
  async deleteMarket(id: string): Promise<boolean> {
    try {
      await createServiceMethod<void>(
        'markets',
        'DELETE',
        'delete',
        { withRetry: false }
      )({}, null, { id });
      return true;
    } catch (error) {
      console.error(`Error deleting market ${id}:`, error);
      return false;
    }
  },

  /**
   * Get stock allocations for a market
   * @param marketId Market ID
   * @returns Promise with stock allocations
   */
  async getStockAllocations(marketId: string): Promise<StockAllocation[]> {
    return createServiceMethod<StockAllocation[]>(
      'markets',
      'INVENTORY',
      'get',
      { withRetry: RETRY_CONFIG }
    )({}, null, { id: marketId });
  },

  /**
   * Create a new stock allocation
   * @param data Stock allocation data
   * @returns Promise with created stock allocation
   */
  async createStockAllocation(data: CreateStockAllocationInput): Promise<StockAllocation> {
    return createServiceMethod<StockAllocation>(
      'markets',
      'INVENTORY',
      'post',
      { withRetry: false }
    )(data);
  },

  /**
   * Get staff assignments for a market
   * @param marketId Market ID
   * @returns Promise with staff assignments
   */
  async getStaffAssignments(marketId: string): Promise<StaffAssignment[]> {
    return createServiceMethod<StaffAssignment[]>(
      'markets',
      'STAFF',
      'get',
      { withRetry: RETRY_CONFIG }
    )({}, null, { id: marketId });
  },

  /**
   * Create a new staff assignment
   * @param data Staff assignment data
   * @returns Promise with created staff assignment
   */
  async createStaffAssignment(data: CreateStaffAssignmentInput): Promise<StaffAssignment> {
    return createServiceMethod<StaffAssignment>(
      'markets',
      'ASSIGN_STAFF',
      'post',
      { withRetry: false }
    )(data);
  },

  /**
   * Get market performance data
   * @param marketId Market ID
   * @returns Promise with market performance or null if not found
   */
  async getMarketPerformance(marketId: string): Promise<MarketPerformance | null> {
    try {
      const market = await this.getMarketById(marketId);
      return market?.performance || null;
    } catch (error) {
      console.error(`Error getting performance for market ${marketId}:`, error);
      return null;
    }
  },

  /**
   * Update market settings
   * @param marketId Market ID
   * @param settings Updated market settings
   * @returns Promise with updated market or null if not found
   */
  async updateMarketSettings(marketId: string, settings: MarketSettings): Promise<Market | null> {
    return createServiceMethod<Market>(
      'markets',
      'UPDATE_SETTINGS',
      'put',
      { withRetry: false }
    )(settings, null, { id: marketId });
  }
};

export default marketsService;
