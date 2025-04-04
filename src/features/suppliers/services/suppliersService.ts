/**
 * Suppliers Service
 * 
 * This service handles API calls and data operations for the suppliers feature.
 */

import { api } from '@/lib/api';
import { getApiEndpoint } from '@/lib/api/config';
import { Supplier, SUPPLIER_STATUS, SupplierType, Performance, BankingDetails, Commission, TopProduct, OrderHistory, ConnectionConfig, ConnectionStatus, ConnectionType, ValidationResult } from '../types';

// API base URL - use the configured endpoint
const API_BASE_URL = getApiEndpoint('suppliers');
const PRICE_LISTS_URL = getApiEndpoint('suppliers-price-lists');
const ORDERS_URL = getApiEndpoint('suppliers-orders');
const CONTACTS_URL = getApiEndpoint('suppliers-contacts');

// Request trackers for cancellation
const requestControllers: { [key: string]: AbortController } = {};

// Cancel any ongoing request with the same ID
const cancelExistingRequest = (requestId: string) => {
  if (requestControllers[requestId]) {
    requestControllers[requestId].abort();
    delete requestControllers[requestId];
  }
};

// Mock connection config for development
const MOCK_CONNECTION_CONFIG: ConnectionConfig = {
  type: 'api' as ConnectionType,
  name: 'Default Supplier API',
  baseUrl: 'https://api.supplier-example.com',
  apiKey: 'sk_test_abcdefghijklmnopqrstuvwxyz',
  username: 'apiuser',
  password: '',
  hostName: '',
  port: '',
  databaseName: '',
  webhookUrl: '',
  sftpPath: '',
  syncFrequency: 'daily',
  enabled: false,
  lastSynced: null,
  fieldMapping: {
    id: 'supplier_id',
    name: 'company_name',
    email: 'contact_email',
    phone: 'contact_phone',
    address: 'business_address',
    website: 'website_url'
  }
};

// Mock connection status
const MOCK_CONNECTION_STATUS: ConnectionStatus = {
  status: 'disconnected',
  lastChecked: new Date().toISOString(),
  message: 'Not connected yet',
  latency: null,
  health: null
};

// Mock connection history events
const MOCK_CONNECTION_HISTORY = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    type: 'test',
    status: 'success',
    message: 'Connection test successful',
    details: { latency: '120ms', endpoint: '/api/suppliers' }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    type: 'sync',
    status: 'error',
    message: 'Synchronization failed: API timeout',
    details: { error: 'Request timeout after 30s', endpoint: '/api/suppliers/sync' }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'sync',
    status: 'success',
    message: 'Full synchronization completed',
    details: { 
      itemsProcessed: 148, 
      itemsCreated: 3, 
      itemsUpdated: 12, 
      itemsSkipped: 133,
      timeElapsed: '45s'
    }
  }
];

export const suppliersService = {
  /**
   * Fetch all suppliers
   */
  fetchAll: async (requestId: string = 'fetchAll'): Promise<Supplier[]> => {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);
    
    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;
      
      // Check the API client interface to see how to pass the signal
      const response = await api.get(API_BASE_URL);
      
      // Request completed successfully, remove the controller
      delete requestControllers[requestId];
      
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },

  /**
   * Fetch a single supplier by ID
   */
  fetchById: async (id: string, requestId: string = `fetchById_${id}`): Promise<Supplier | null> => {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);
    
    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;
      
      const response = await api.get(`${API_BASE_URL}/${id}`);
      
      // Request completed successfully, remove the controller
      delete requestControllers[requestId];
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new supplier
   */
  create: async (data: Omit<Supplier, 'id'>): Promise<Supplier> => {
    try {
      const response = await api.post(API_BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  },

  /**
   * Update an existing supplier
   */
  update: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    try {
      const response = await api.put(`${API_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating supplier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a supplier
   */
  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`${API_BASE_URL}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting supplier ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search suppliers by name, contact person, email or other criteria
   */
  search: async (query: string, requestId: string = `search_${query}`): Promise<Supplier[]> => {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);
    
    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;
      
      const response = await api.get(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      
      // Request completed successfully, remove the controller
      delete requestControllers[requestId];
      
      return response.data;
    } catch (error) {
      console.error(`Error searching suppliers with query "${query}":`, error);
      throw error;
    }
  },

  /**
   * Filter suppliers by status
   */
  filterByStatus: async (status: SUPPLIER_STATUS, requestId: string = `filterByStatus_${status}`): Promise<Supplier[]> => {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);
    
    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;
      
      const response = await api.get(`${API_BASE_URL}?status=${status}`);
      
      // Request completed successfully, remove the controller
      delete requestControllers[requestId];
      
      return response.data;
    } catch (error) {
      console.error(`Error filtering suppliers by status "${status}":`, error);
      throw error;
    }
  },

  /**
   * Filter suppliers by type
   */
  filterByType: async (type: SupplierType, requestId: string = `filterByType_${type}`): Promise<Supplier[]> => {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);
    
    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;
      
      const response = await api.get(`${API_BASE_URL}?type=${type}`);
      
      // Request completed successfully, remove the controller
      delete requestControllers[requestId];
      
      return response.data;
    } catch (error) {
      console.error(`Error filtering suppliers by type "${type}":`, error);
      throw error;
    }
  },

  /**
   * Get supplier price list
   */
  getPriceList: async (supplierId: string, requestId: string = `priceList_${supplierId}`): Promise<any[]> => {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);
    
    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;
      
      const response = await api.get(`${PRICE_LISTS_URL}?supplierId=${supplierId}`);
      
      // Request completed successfully, remove the controller
      delete requestControllers[requestId];
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching price list for supplier ${supplierId}:`, error);
      throw error;
    }
  },

  /**
   * Update supplier price list
   */
  updatePriceList: async (supplierId: string, priceList: any[]): Promise<any[]> => {
    try {
      const response = await api.put(`${PRICE_LISTS_URL}/${supplierId}`, { priceList });
      return response.data;
    } catch (error) {
      console.error(`Error updating price list for supplier ${supplierId}:`, error);
      throw error;
    }
  },

  /**
   * Get supplier order history
   */
  getOrderHistory: async (supplierId: string, requestId: string = `orderHistory_${supplierId}`): Promise<OrderHistory[]> => {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);
    
    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;
      
      const response = await api.get(`${ORDERS_URL}?supplierId=${supplierId}`);
      
      // Request completed successfully, remove the controller
      delete requestControllers[requestId];
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching order history for supplier ${supplierId}:`, error);
      throw error;
    }
  },

  /**
   * Update supplier banking details
   */
  updateBankingDetails: async (supplierId: string, bankingDetails: BankingDetails): Promise<Supplier> => {
    try {
      const response = await api.put(`${API_BASE_URL}/${supplierId}/banking-details`, bankingDetails);
      return response.data;
    } catch (error) {
      console.error(`Error updating banking details for supplier ${supplierId}:`, error);
      throw error;
    }
  },

  /**
   * Update supplier commission settings
   */
  updateCommission: async (supplierId: string, commission: Commission): Promise<Supplier> => {
    try {
      const response = await api.put(`${API_BASE_URL}/${supplierId}/commission`, commission);
      return response.data;
    } catch (error) {
      console.error(`Error updating commission for supplier ${supplierId}:`, error);
      throw error;
    }
  },

  /**
   * Get supplier top products
   */
  getTopProducts: async (supplierId: string, requestId: string = `topProducts_${supplierId}`): Promise<TopProduct[]> => {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);
    
    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;
      
      const response = await api.get(`${API_BASE_URL}/${supplierId}/top-products`);
      
      // Request completed successfully, remove the controller
      delete requestControllers[requestId];
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching top products for supplier ${supplierId}:`, error);
      throw error;
    }
  },

  /**
   * Get supplier performance metrics
   */
  getPerformance: async (supplierId: string, requestId: string = `performance_${supplierId}`): Promise<Performance> => {
    // Cancel any existing request with the same ID
    cancelExistingRequest(requestId);
    
    try {
      const controller = new AbortController();
      requestControllers[requestId] = controller;
      
      const response = await api.get(`${API_BASE_URL}/${supplierId}/performance`);
      
      // Request completed successfully, remove the controller
      delete requestControllers[requestId];
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching performance metrics for supplier ${supplierId}:`, error);
      throw error;
    }
  },

  // Fetch connection configuration
  async fetchConnectionConfig(): Promise<ConnectionConfig> {
    // In real implementation, this would call the API
    try {
      // Simulating API call
      console.log('Fetching connection configuration from API endpoint:', 
        getApiEndpoint('suppliers'));
      
      // In real implementation, replace with actual API call:
      // const response = await fetch(getApiEndpoint('suppliers-connection'));
      // return await response.json();
      
      // For now, return mock data after artificial delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_CONNECTION_CONFIG;
    } catch (error) {
      console.error('Error fetching connection configuration:', error);
      throw new Error('Failed to fetch supplier connection configuration');
    }
  },

  // Save connection configuration
  async saveConnectionConfig(config: ConnectionConfig): Promise<ConnectionConfig> {
    try {
      // Simulating API call
      console.log('Saving connection configuration to API endpoint:', 
        getApiEndpoint('suppliers'), 'with config:', config);
      
      // In real implementation, replace with actual API call:
      // const response = await fetch(getApiEndpoint('suppliers-connection'), {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // });
      // return await response.json();
      
      // For now, simulate success after artificial delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      return config;
    } catch (error) {
      console.error('Error saving connection configuration:', error);
      throw new Error('Failed to save supplier connection configuration');
    }
  },

  // Test connection with current configuration
  async testConnection(config: ConnectionConfig): Promise<ConnectionStatus> {
    try {
      // Simulating API call
      console.log('Testing connection with configuration:', config);
      
      // In real implementation, replace with actual API call:
      // const response = await fetch(getApiEndpoint('suppliers-connection-test'), {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // });
      // return await response.json();
      
      // For now, simulate random success/failure after artificial delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randomly determine connection success (for demo purposes)
      const isSuccessful = Math.random() > 0.3;
      
      if (isSuccessful) {
        return {
          status: 'connected',
          lastChecked: new Date().toISOString(),
          message: 'Successfully connected to supplier system',
          latency: `${Math.floor(Math.random() * 200)}ms`,
          health: 100
        };
      } else {
        // Random failure modes
        const errorTypes = [
          'Connection timeout after 30 seconds',
          'Authentication failed: Invalid API key',
          'Server returned error 503: Service unavailable',
          'Could not resolve host name'
        ];
        const errorMessage = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        
        return {
          status: 'error',
          lastChecked: new Date().toISOString(),
          message: errorMessage || 'Unknown error occurred',
          latency: null,
          health: 0
        };
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      throw new Error('Failed to test supplier connection');
    }
  },

  // Check current connection status
  async checkConnectionStatus(): Promise<ConnectionStatus> {
    try {
      // Simulating API call
      console.log('Checking connection status from API endpoint:', 
        getApiEndpoint('suppliers'));
      
      // In real implementation, replace with actual API call:
      // const response = await fetch(getApiEndpoint('suppliers-connection-status'));
      // return await response.json();
      
      // For now, return mock data after artificial delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_CONNECTION_STATUS;
    } catch (error) {
      console.error('Error checking connection status:', error);
      throw new Error('Failed to check supplier connection status');
    }
  },

  // Trigger manual synchronization
  async triggerSync(): Promise<{ success: boolean; message: string }> {
    try {
      // Simulating API call
      console.log('Triggering manual sync at API endpoint:', 
        getApiEndpoint('suppliers'));
      
      // In real implementation, replace with actual API call:
      // const response = await fetch(getApiEndpoint('suppliers-sync'), {
      //   method: 'POST'
      // });
      // return await response.json();
      
      // For now, simulate success after artificial delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        success: true,
        message: 'Synchronization started successfully'
      };
    } catch (error) {
      console.error('Error triggering sync:', error);
      throw new Error('Failed to trigger supplier synchronization');
    }
  },

  // Validate connection configuration
  async validateConfig(config: ConnectionConfig): Promise<ValidationResult> {
    try {
      // Simulating API call
      console.log('Validating connection configuration at API endpoint:', 
        getApiEndpoint('suppliers'), 'with config:', config);
      
      // In real implementation, replace with actual API call:
      // const response = await fetch(getApiEndpoint('suppliers-connection-validate'), {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // });
      // return await response.json();
      
      // For now, simulate basic validation after artificial delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const errors: Record<string, string> = {};
      const warnings: Record<string, string> = {};
      
      // Basic validations
      if (!config.name?.trim()) {
        errors['name'] = 'Connection name is required';
      }
      
      if (config.type === 'api') {
        if (!config.baseUrl?.trim()) {
          errors['baseUrl'] = 'Base URL is required for API connections';
        } else if (!config.baseUrl.startsWith('http')) {
          warnings['baseUrl'] = 'Base URL should start with http:// or https://';
        }
        
        if (!config.apiKey?.trim()) {
          warnings['apiKey'] = 'API key is recommended for secure connections';
        }
      } else if (config.type === 'database') {
        if (!config.hostName?.trim()) {
          errors['hostName'] = 'Host name is required for database connections';
        }
        if (!config.port?.trim()) {
          errors['port'] = 'Port is required for database connections';
        }
        if (!config.databaseName?.trim()) {
          errors['databaseName'] = 'Database name is required';
        }
      }
      
      return {
        valid: Object.keys(errors).length === 0,
        errors,
        warnings
      };
    } catch (error) {
      console.error('Error validating config:', error);
      throw new Error('Failed to validate supplier connection configuration');
    }
  },

  // Fetch connection history
  async fetchConnectionHistory(): Promise<any[]> {
    try {
      // Simulating API call
      console.log('Fetching connection history from API endpoint:', 
        getApiEndpoint('suppliers'));
      
      // In real implementation, replace with actual API call:
      // const response = await fetch(getApiEndpoint('suppliers-connection-history'));
      // return await response.json();
      
      // For now, return mock data after artificial delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_CONNECTION_HISTORY;
    } catch (error) {
      console.error('Error fetching connection history:', error);
      throw new Error('Failed to fetch supplier connection history');
    }
  }
};
