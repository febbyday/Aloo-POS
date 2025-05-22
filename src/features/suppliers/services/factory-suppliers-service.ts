/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Factory-Based Suppliers Service
 *
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of supplier-related operations with minimal duplication.
 */

import { Supplier, SupplierContact, SupplierOrder, SupplierProduct } from '../types/supplier.types';
import { SUPPLIER_STATUS, SupplierType, Performance, BankingDetails, Commission, TopProduct, OrderHistory, ConnectionConfig, ConnectionStatus, ConnectionType, ValidationResult } from '../types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { SUPPLIER_ENDPOINTS, createStandardCrudEndpoints } from '@/lib/api/endpoint-registry';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { registerEndpoints } from '@/lib/api/endpoint-registry';

// Register Supplier Connection endpoints if not already registered
export const SUPPLIER_CONNECTION_ENDPOINTS = registerEndpoints('suppliers/connection', {
  CONFIG: { path: 'config', requiresAuth: true, description: 'Get or update connection configuration' },
  STATUS: { path: 'status', requiresAuth: true, description: 'Get connection status' },
  TEST: { path: 'test', requiresAuth: true, description: 'Test connection with configuration' },
  SYNC: { path: 'sync', requiresAuth: true, description: 'Trigger manual synchronization' },
  VALIDATE: { path: 'validate', requiresAuth: true, description: 'Validate connection configuration' },
  HISTORY: { path: 'history', requiresAuth: true, description: 'Get connection history' }
});

// Register Supplier Price List endpoints if not already registered
export const SUPPLIER_PRICE_LIST_ENDPOINTS = registerEndpoints('suppliers/price-lists', {
  ...createStandardCrudEndpoints(),
  BY_SUPPLIER: { path: 'by-supplier/:supplierId', requiresAuth: true, description: 'Get price lists by supplier ID' }
});

// Create module-specific error handler
const errorHandler = createErrorHandler('suppliers');

// Request trackers for cancellation
const requestControllers: { [key: string]: AbortController } = {};

// Cancel any ongoing request with the same ID
const cancelExistingRequest = (requestId: string) => {
  if (requestControllers[requestId]) {
    requestControllers[requestId].abort();
    delete requestControllers[requestId];
  }
};

/**
 * Suppliers service with standardized endpoint handling
 */
const suppliersService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<Supplier>('suppliers', {
    useEnhancedClient: true,
    withRetry: {
      maxRetries: 2,
      shouldRetry: (error: any) => {
        // Only retry network or server errors
        return ![
          ApiErrorType.VALIDATION,
          ApiErrorType.CONFLICT,
          ApiErrorType.AUTHORIZATION
        ].includes(error.type);
      }
    },
    cacheResponse: true, // Supplier data can be cached
    // Map response to ensure dates are properly converted
    mapResponse: (data: any) => {
      if (Array.isArray(data)) {
        return data.map(supplier => ({
          ...supplier,
          createdAt: supplier.createdAt ? new Date(supplier.createdAt) : undefined,
          updatedAt: supplier.updatedAt ? new Date(supplier.updatedAt) : undefined,
          lastOrderDate: supplier.lastOrderDate ? new Date(supplier.lastOrderDate) : undefined
        }));
      }

      if (!data) return null;

      return {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        lastOrderDate: data.lastOrderDate ? new Date(data.lastOrderDate) : undefined
      };
    }
  }),

  // Custom methods for supplier-specific operations

  /**
   * Get supplier products
   */
  getSupplierProducts: createServiceMethod<SupplierProduct[]>(
    'suppliers', 'PRODUCTS', 'get'
  ),

  /**
   * Get supplier orders
   */
  getSupplierOrders: createServiceMethod<SupplierOrder[]>(
    'suppliers', 'ORDERS', 'get'
  ),

  /**
   * Create supplier order
   */
  createSupplierOrder: createServiceMethod<SupplierOrder, Partial<SupplierOrder>>(
    'suppliers', 'CREATE_ORDER', 'post',
    { withRetry: false }
  ),

  /**
   * Get supplier contacts
   */
  getSupplierContacts: createServiceMethod<SupplierContact[]>(
    'suppliers', 'CONTACTS', 'get'
  ),

  /**
   * Add supplier contact
   */
  addSupplierContact: createServiceMethod<SupplierContact, Partial<SupplierContact>>(
    'suppliers', 'ADD_CONTACT', 'post',
    { withRetry: false }
  ),

  /**
   * Additional convenience methods
   */

  /**
   * Search suppliers
   */
  searchSuppliers: async (query: string): Promise<Supplier[]> => {
    return suppliersService.search({ query });
  },

  /**
   * Get suppliers by product category
   */
  getSuppliersByCategory: async (categoryId: string): Promise<Supplier[]> => {
    return suppliersService.getAll({ categoryId });
  },

  /**
   * Get suppliers by location
   */
  getSuppliersByLocation: async (location: string): Promise<Supplier[]> => {
    return suppliersService.getAll({ location });
  },

  /**
   * Create a complete supplier with contact
   */
  createSupplierWithContact: async (
    supplierData: Partial<Supplier>,
    contactData: Partial<SupplierContact>
  ): Promise<Supplier> => {
    // Create the supplier first
    const supplier = await suppliersService.create(supplierData);

    // Add contact if provided
    if (contactData && Object.keys(contactData).length > 0) {
      await suppliersService.addSupplierContact(
        undefined,
        {
          ...contactData,
          supplierId: supplier.id,
          isPrimary: true
        },
        { id: supplier.id }
      );
    }

    // Return the complete supplier
    const updatedSupplier = await suppliersService.getById(supplier.id);
    return updatedSupplier as Supplier;
  },

  /**
   * Get active suppliers
   */
  getActiveSuppliers: async (): Promise<Supplier[]> => {
    return suppliersService.getAll({ status: 'active' });
  },

  /**
   * Create a purchase order
   */
  createPurchaseOrder: async (
    supplierId: string,
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>,
    notes?: string
  ): Promise<SupplierOrder> => {
    const orderData: Partial<SupplierOrder> = {
      supplierId,
      items,
      orderDate: new Date().toISOString(),
      status: 'pending',
      notes,
      totalAmount: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    };

    return suppliersService.createSupplierOrder(
      undefined,
      orderData,
      { id: supplierId }
    );
  },

  /**
   * Get total spend with supplier
   */
  getTotalSpendWithSupplier: async (supplierId: string): Promise<number> => {
    const orders = await suppliersService.getSupplierOrders(
      { status: 'completed' },
      undefined,
      { id: supplierId }
    );

    return orders.reduce((total, order) => total + order.totalAmount, 0);
  },

  /**
   * Search suppliers by name, contact person, email or other criteria
   */
  async search(query: string, requestId: string = `search_${query}`): Promise<Supplier[]> {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);

    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;

      const response = await enhancedApiClient.get(
        'suppliers/LIST',
        undefined,
        {
          params: { q: query },
          signal: controller.signal,
          retry: true
        }
      );

      // Request completed successfully, remove the controller
      delete requestControllers[requestId];

      return response;
    } catch (error) {
      console.error(`Error searching suppliers with query "${query}":`, error);
      throw errorHandler.handleError(error, 'search');
    }
  },

  /**
   * Filter suppliers by status
   */
  async filterByStatus(status: SUPPLIER_STATUS, requestId: string = `filterByStatus_${status}`): Promise<Supplier[]> {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);

    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;

      const response = await enhancedApiClient.get(
        'suppliers/LIST',
        undefined,
        {
          params: { status },
          signal: controller.signal,
          retry: true
        }
      );

      // Request completed successfully, remove the controller
      delete requestControllers[requestId];

      return response;
    } catch (error) {
      console.error(`Error filtering suppliers by status "${status}":`, error);
      throw errorHandler.handleError(error, 'filterByStatus');
    }
  },

  /**
   * Filter suppliers by type
   */
  async filterByType(type: SupplierType, requestId: string = `filterByType_${type}`): Promise<Supplier[]> {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);

    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;

      const response = await enhancedApiClient.get(
        'suppliers/LIST',
        undefined,
        {
          params: { type },
          signal: controller.signal,
          retry: true
        }
      );

      // Request completed successfully, remove the controller
      delete requestControllers[requestId];

      return response;
    } catch (error) {
      console.error(`Error filtering suppliers by type "${type}":`, error);
      throw errorHandler.handleError(error, 'filterByType');
    }
  },

  /**
   * Get supplier price list
   */
  async getPriceList(supplierId: string, requestId: string = `priceList_${supplierId}`): Promise<any[]> {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);

    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;

      const response = await enhancedApiClient.get(
        'suppliers/price-lists/BY_SUPPLIER',
        { supplierId },
        {
          signal: controller.signal,
          retry: true
        }
      );

      // Request completed successfully, remove the controller
      delete requestControllers[requestId];

      return response;
    } catch (error) {
      console.error(`Error fetching price list for supplier ${supplierId}:`, error);
      throw errorHandler.handleError(error, 'getPriceList');
    }
  },

  /**
   * Update supplier price list
   */
  async updatePriceList(supplierId: string, priceList: any[]): Promise<any[]> {
    try {
      const response = await enhancedApiClient.put(
        'suppliers/price-lists/UPDATE',
        { priceList },
        { id: supplierId }
      );
      return response;
    } catch (error) {
      console.error(`Error updating price list for supplier ${supplierId}:`, error);
      throw errorHandler.handleError(error, 'updatePriceList');
    }
  },

  /**
   * Get supplier order history
   */
  async getOrderHistory(supplierId: string, requestId: string = `orderHistory_${supplierId}`): Promise<OrderHistory[]> {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);

    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;

      const response = await enhancedApiClient.get(
        'suppliers/ORDERS',
        { id: supplierId },
        {
          signal: controller.signal,
          retry: true
        }
      );

      // Request completed successfully, remove the controller
      delete requestControllers[requestId];

      return response;
    } catch (error) {
      console.error(`Error fetching order history for supplier ${supplierId}:`, error);
      throw errorHandler.handleError(error, 'getOrderHistory');
    }
  },

  /**
   * Update supplier banking details
   */
  async updateBankingDetails(supplierId: string, bankingDetails: BankingDetails): Promise<Supplier> {
    try {
      const response = await enhancedApiClient.patch(
        'suppliers/UPDATE',
        { bankingDetails },
        { id: supplierId }
      );
      return response;
    } catch (error) {
      console.error(`Error updating banking details for supplier ${supplierId}:`, error);
      throw errorHandler.handleError(error, 'updateBankingDetails');
    }
  },

  /**
   * Update supplier commission settings
   */
  async updateCommission(supplierId: string, commission: Commission): Promise<Supplier> {
    try {
      const response = await enhancedApiClient.patch(
        'suppliers/UPDATE',
        { commission },
        { id: supplierId }
      );
      return response;
    } catch (error) {
      console.error(`Error updating commission for supplier ${supplierId}:`, error);
      throw errorHandler.handleError(error, 'updateCommission');
    }
  },

  /**
   * Get supplier top products
   */
  async getTopProducts(supplierId: string, requestId: string = `topProducts_${supplierId}`): Promise<TopProduct[]> {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);

    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;

      const response = await enhancedApiClient.get(
        'suppliers/PRODUCTS',
        { id: supplierId },
        {
          params: { sort: 'sales', limit: 10 },
          signal: controller.signal,
          retry: true
        }
      );

      // Request completed successfully, remove the controller
      delete requestControllers[requestId];

      return response;
    } catch (error) {
      console.error(`Error fetching top products for supplier ${supplierId}:`, error);
      throw errorHandler.handleError(error, 'getTopProducts');
    }
  },

  /**
   * Get supplier performance metrics
   */
  async getPerformance(supplierId: string, requestId: string = `performance_${supplierId}`): Promise<Performance> {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);

    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;

      const response = await enhancedApiClient.get(
        'suppliers/DETAIL',
        { id: supplierId },
        {
          params: { include: 'performance' },
          signal: controller.signal,
          retry: true
        }
      );

      // Request completed successfully, remove the controller
      delete requestControllers[requestId];

      return response.performance;
    } catch (error) {
      console.error(`Error fetching performance metrics for supplier ${supplierId}:`, error);
      throw errorHandler.handleError(error, 'getPerformance');
    }
  },

  /**
   * Fetch connection configuration
   */
  async fetchConnectionConfig(): Promise<ConnectionConfig> {
    try {
      const response = await enhancedApiClient.get(
        'suppliers/connection/CONFIG',
        undefined,
        { retry: true }
      );
      return response;
    } catch (error) {
      console.error('Error fetching connection configuration:', error);
      throw errorHandler.handleError(error, 'fetchConnectionConfig');
    }
  },

  /**
   * Save connection configuration
   */
  async saveConnectionConfig(config: ConnectionConfig): Promise<ConnectionConfig> {
    try {
      const response = await enhancedApiClient.put(
        'suppliers/connection/CONFIG',
        config,
        undefined,
        { retry: false }
      );
      return response;
    } catch (error) {
      console.error('Error saving connection configuration:', error);
      throw errorHandler.handleError(error, 'saveConnectionConfig');
    }
  },

  /**
   * Test connection with current configuration
   */
  async testConnection(config: ConnectionConfig): Promise<ConnectionStatus> {
    try {
      const response = await enhancedApiClient.post(
        'suppliers/connection/TEST',
        config,
        undefined,
        { retry: false }
      );
      return response;
    } catch (error) {
      console.error('Error testing connection:', error);
      throw errorHandler.handleError(error, 'testConnection');
    }
  },

  /**
   * Check current connection status
   */
  async checkConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const response = await enhancedApiClient.get(
        'suppliers/connection/STATUS',
        undefined,
        { retry: true }
      );
      return response;
    } catch (error) {
      console.error('Error checking connection status:', error);
      throw errorHandler.handleError(error, 'checkConnectionStatus');
    }
  },

  /**
   * Trigger manual synchronization
   */
  async triggerSync(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await enhancedApiClient.post(
        'suppliers/connection/SYNC',
        undefined,
        undefined,
        { retry: false }
      );
      return response;
    } catch (error) {
      console.error('Error triggering sync:', error);
      throw errorHandler.handleError(error, 'triggerSync');
    }
  },

  /**
   * Validate connection configuration
   */
  async validateConfig(config: ConnectionConfig): Promise<ValidationResult> {
    try {
      const response = await enhancedApiClient.post(
        'suppliers/connection/VALIDATE',
        config,
        undefined,
        { retry: false }
      );
      return response;
    } catch (error) {
      console.error('Error validating config:', error);
      throw errorHandler.handleError(error, 'validateConfig');
    }
  },

  /**
   * Fetch connection history
   */
  async fetchConnectionHistory(): Promise<any[]> {
    try {
      const response = await enhancedApiClient.get(
        'suppliers/connection/HISTORY',
        undefined,
        { retry: true }
      );
      return response;
    } catch (error) {
      console.error('Error fetching connection history:', error);
      throw errorHandler.handleError(error, 'fetchConnectionHistory');
    }
  }
};

export default suppliersService;
