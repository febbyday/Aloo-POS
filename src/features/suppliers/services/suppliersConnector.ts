/**
 * Suppliers Connector
 * 
 * This module handles the connection process with external supplier systems
 * as outlined in the connection guide (docs/connections/suppliers.connection.md)
 */

import { api } from '@/lib/api';
import { getApiEndpoint } from '@/lib/api/config';
import { Supplier, SUPPLIER_STATUS } from '../types';

// API endpoints
const SUPPLIERS_URL = getApiEndpoint('suppliers');
const CONNECTION_URL = `${SUPPLIERS_URL}/connection`;

// Connection status types
export enum CONNECTION_STATUS {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  FAILED = 'failed',
  SYNCING = 'syncing'
}

// Connection types
export enum CONNECTION_TYPE {
  API = 'api',
  SFTP = 'sftp',
  DATABASE = 'database',
  WEBHOOK = 'webhook',
  MANUAL = 'manual'
}

// Connection config interface
export interface ConnectionConfig {
  type: CONNECTION_TYPE;
  credentials: {
    apiKey?: string;
    username?: string;
    password?: string;
    host?: string;
    port?: number;
    database?: string;
    certificatePath?: string;
    webhookUrl?: string;
    secretKey?: string;
  };
  settings: {
    syncInterval: number; // in minutes
    retryAttempts: number;
    timeout: number; // in seconds
    syncFields: string[];
    syncProducts: boolean;
    syncPricing: boolean;
    syncInventory: boolean;
    automaticOrdering: boolean;
    notifyOnChanges: boolean;
  };
  mapping: {
    [key: string]: string;
  };
}

// Connection validation result
export interface ValidationResult {
  success: boolean;
  message: string;
  details?: {
    field: string;
    issue: string;
  }[];
}

// Connection status object
export interface ConnectionStatus {
  supplierId: string;
  status: CONNECTION_STATUS;
  lastSync?: Date;
  nextSync?: Date;
  syncHistory: {
    timestamp: Date;
    status: 'success' | 'failed';
    details?: string;
  }[];
  health: {
    uptime: number; // percentage
    responseTime: number; // ms
    errorRate: number; // percentage
  };
}

/**
 * Supplier Connection Service
 */
export const suppliersConnector = {
  /**
   * Get connection status for a supplier
   */
  getConnectionStatus: async (supplierId: string): Promise<ConnectionStatus | null> => {
    try {
      const response = await api.get(`${CONNECTION_URL}/${supplierId}/status`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching connection status for supplier ${supplierId}:`, error);
      return null;
    }
  },

  /**
   * Get connection configuration for a supplier
   */
  getConnectionConfig: async (supplierId: string): Promise<ConnectionConfig | null> => {
    try {
      const response = await api.get(`${CONNECTION_URL}/${supplierId}/config`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching connection config for supplier ${supplierId}:`, error);
      return null;
    }
  },

  /**
   * Test connection with a supplier
   */
  testConnection: async (supplierId: string, config: ConnectionConfig): Promise<ValidationResult> => {
    try {
      const response = await api.post(`${CONNECTION_URL}/${supplierId}/test`, config);
      return response.data;
    } catch (error) {
      console.error(`Error testing connection for supplier ${supplierId}:`, error);
      return {
        success: false,
        message: 'Connection test failed',
        details: [
          {
            field: 'general',
            issue: 'Could not reach supplier API. Please check your connection settings.'
          }
        ]
      };
    }
  },

  /**
   * Connect to a supplier
   */
  connect: async (supplierId: string, config: ConnectionConfig): Promise<ValidationResult> => {
    try {
      const response = await api.post(`${CONNECTION_URL}/${supplierId}/connect`, config);
      return response.data;
    } catch (error) {
      console.error(`Error connecting to supplier ${supplierId}:`, error);
      return {
        success: false,
        message: 'Failed to establish connection',
        details: [
          {
            field: 'general',
            issue: 'Connection request failed. Please try again later.'
          }
        ]
      };
    }
  },

  /**
   * Disconnect from a supplier
   */
  disconnect: async (supplierId: string): Promise<boolean> => {
    try {
      await api.post(`${CONNECTION_URL}/${supplierId}/disconnect`, {});
      return true;
    } catch (error) {
      console.error(`Error disconnecting from supplier ${supplierId}:`, error);
      return false;
    }
  },

  /**
   * Manually trigger a sync with a supplier
   */
  triggerSync: async (supplierId: string, syncOptions?: { fields?: string[] }): Promise<boolean> => {
    try {
      await api.post(`${CONNECTION_URL}/${supplierId}/sync`, syncOptions || {});
      return true;
    } catch (error) {
      console.error(`Error triggering sync for supplier ${supplierId}:`, error);
      return false;
    }
  },

  /**
   * Get sync history for a supplier
   */
  getSyncHistory: async (supplierId: string): Promise<ConnectionStatus['syncHistory']> => {
    try {
      const response = await api.get(`${CONNECTION_URL}/${supplierId}/sync-history`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sync history for supplier ${supplierId}:`, error);
      return [];
    }
  },

  /**
   * Update connection settings for a supplier
   */
  updateConnectionSettings: async (supplierId: string, settings: ConnectionConfig['settings']): Promise<boolean> => {
    try {
      await api.put(`${CONNECTION_URL}/${supplierId}/settings`, settings);
      return true;
    } catch (error) {
      console.error(`Error updating connection settings for supplier ${supplierId}:`, error);
      return false;
    }
  },

  /**
   * Update field mapping for a supplier
   */
  updateFieldMapping: async (supplierId: string, mapping: ConnectionConfig['mapping']): Promise<boolean> => {
    try {
      await api.put(`${CONNECTION_URL}/${supplierId}/mapping`, mapping);
      return true;
    } catch (error) {
      console.error(`Error updating field mapping for supplier ${supplierId}:`, error);
      return false;
    }
  },

  /**
   * Get connection health metrics
   */
  getConnectionHealth: async (supplierId: string): Promise<ConnectionStatus['health']> => {
    try {
      const response = await api.get(`${CONNECTION_URL}/${supplierId}/health`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching connection health for supplier ${supplierId}:`, error);
      return {
        uptime: 0,
        responseTime: 0,
        errorRate: 100
      };
    }
  },

  /**
   * Get supported connection types for a supplier
   */
  getSupportedConnectionTypes: async (supplierId: string): Promise<CONNECTION_TYPE[]> => {
    try {
      const response = await api.get(`${CONNECTION_URL}/${supplierId}/supported-types`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching supported connection types for supplier ${supplierId}:`, error);
      return [CONNECTION_TYPE.MANUAL]; // Default to manual if error
    }
  },

  /**
   * Generate connection report
   */
  generateReport: async (supplierId: string): Promise<Blob> => {
    try {
      const response = await api.get(`${CONNECTION_URL}/${supplierId}/report`);
      return response.data;
    } catch (error) {
      console.error(`Error generating connection report for supplier ${supplierId}:`, error);
      throw error;
    }
  }
}; 