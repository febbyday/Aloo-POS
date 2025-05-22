/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Factory-Based Suppliers Connector
 * 
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of supplier connection operations with minimal duplication.
 */

import { Supplier, SUPPLIER_STATUS } from '../types';
import { createServiceMethod } from '@/lib/api/service-endpoint-factory';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { registerEndpoints } from '@/lib/api/endpoint-registry';

// Register Supplier Connection endpoints if not already registered
export const SUPPLIER_CONNECTION_ENDPOINTS = registerEndpoints('suppliers/connection', {
  STATUS: { path: ':supplierId/status', requiresAuth: true, description: 'Get connection status for a supplier' },
  CONFIG: { path: ':supplierId/config', requiresAuth: true, description: 'Get connection configuration for a supplier' },
  TEST: { path: ':supplierId/test', requiresAuth: true, description: 'Test connection with a supplier' },
  CONNECT: { path: ':supplierId/connect', requiresAuth: true, description: 'Connect to a supplier' },
  DISCONNECT: { path: ':supplierId/disconnect', requiresAuth: true, description: 'Disconnect from a supplier' },
  SYNC: { path: ':supplierId/sync', requiresAuth: true, description: 'Manually trigger a sync with a supplier' },
  SYNC_HISTORY: { path: ':supplierId/sync-history', requiresAuth: true, description: 'Get sync history for a supplier' },
  SETTINGS: { path: ':supplierId/settings', requiresAuth: true, description: 'Update connection settings for a supplier' },
  MAPPING: { path: ':supplierId/mapping', requiresAuth: true, description: 'Update field mapping for a supplier' },
  HEALTH: { path: ':supplierId/health', requiresAuth: true, description: 'Get connection health metrics' },
  SUPPORTED_TYPES: { path: ':supplierId/supported-types', requiresAuth: true, description: 'Get supported connection types for a supplier' },
  REPORT: { path: ':supplierId/report', requiresAuth: true, description: 'Generate connection report' }
});

// Create module-specific error handler
const errorHandler = createErrorHandler('suppliers/connection');

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
 * Factory-based Supplier Connection Service
 */
export const factorySuppliersConnector = {
  /**
   * Get connection status for a supplier
   */
  async getConnectionStatus(supplierId: string): Promise<ConnectionStatus | null> {
    try {
      const response = await enhancedApiClient.get(
        'suppliers/connection/STATUS',
        { supplierId },
        { retry: true }
      );
      return response;
    } catch (error) {
      console.error(`Error fetching connection status for supplier ${supplierId}:`, error);
      return null;
    }
  },

  /**
   * Get connection configuration for a supplier
   */
  async getConnectionConfig(supplierId: string): Promise<ConnectionConfig | null> {
    try {
      const response = await enhancedApiClient.get(
        'suppliers/connection/CONFIG',
        { supplierId },
        { retry: true }
      );
      return response;
    } catch (error) {
      console.error(`Error fetching connection config for supplier ${supplierId}:`, error);
      return null;
    }
  },

  /**
   * Test connection with a supplier
   */
  async testConnection(supplierId: string, config: ConnectionConfig): Promise<ValidationResult> {
    try {
      const response = await enhancedApiClient.post(
        'suppliers/connection/TEST',
        config,
        { supplierId },
        { retry: false } // Don't retry test connections
      );
      return response;
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
  async connect(supplierId: string, config: ConnectionConfig): Promise<ValidationResult> {
    try {
      const response = await enhancedApiClient.post(
        'suppliers/connection/CONNECT',
        config,
        { supplierId },
        { retry: false } // Don't retry connect operations
      );
      return response;
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
  async disconnect(supplierId: string): Promise<boolean> {
    try {
      await enhancedApiClient.post(
        'suppliers/connection/DISCONNECT',
        {},
        { supplierId },
        { retry: false } // Don't retry disconnect operations
      );
      return true;
    } catch (error) {
      console.error(`Error disconnecting from supplier ${supplierId}:`, error);
      return false;
    }
  },

  /**
   * Manually trigger a sync with a supplier
   */
  async triggerSync(supplierId: string, syncOptions?: { fields?: string[] }): Promise<boolean> {
    try {
      await enhancedApiClient.post(
        'suppliers/connection/SYNC',
        syncOptions || {},
        { supplierId },
        { retry: false } // Don't retry sync operations
      );
      return true;
    } catch (error) {
      console.error(`Error triggering sync for supplier ${supplierId}:`, error);
      return false;
    }
  },

  /**
   * Get sync history for a supplier
   */
  async getSyncHistory(supplierId: string): Promise<ConnectionStatus['syncHistory']> {
    try {
      const response = await enhancedApiClient.get(
        'suppliers/connection/SYNC_HISTORY',
        { supplierId },
        { retry: true }
      );
      return response;
    } catch (error) {
      console.error(`Error fetching sync history for supplier ${supplierId}:`, error);
      return [];
    }
  },

  /**
   * Update connection settings for a supplier
   */
  async updateConnectionSettings(supplierId: string, settings: ConnectionConfig['settings']): Promise<boolean> {
    try {
      await enhancedApiClient.put(
        'suppliers/connection/SETTINGS',
        settings,
        { supplierId },
        { retry: false } // Don't retry settings updates
      );
      return true;
    } catch (error) {
      console.error(`Error updating connection settings for supplier ${supplierId}:`, error);
      return false;
    }
  },

  /**
   * Update field mapping for a supplier
   */
  async updateFieldMapping(supplierId: string, mapping: ConnectionConfig['mapping']): Promise<boolean> {
    try {
      await enhancedApiClient.put(
        'suppliers/connection/MAPPING',
        mapping,
        { supplierId },
        { retry: false } // Don't retry mapping updates
      );
      return true;
    } catch (error) {
      console.error(`Error updating field mapping for supplier ${supplierId}:`, error);
      return false;
    }
  },

  /**
   * Get connection health metrics
   */
  async getConnectionHealth(supplierId: string): Promise<ConnectionStatus['health']> {
    try {
      const response = await enhancedApiClient.get(
        'suppliers/connection/HEALTH',
        { supplierId },
        { retry: true }
      );
      return response;
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
  async getSupportedConnectionTypes(supplierId: string): Promise<CONNECTION_TYPE[]> {
    try {
      const response = await enhancedApiClient.get(
        'suppliers/connection/SUPPORTED_TYPES',
        { supplierId },
        { retry: true }
      );
      return response;
    } catch (error) {
      console.error(`Error fetching supported connection types for supplier ${supplierId}:`, error);
      return [CONNECTION_TYPE.MANUAL]; // Default to manual if error
    }
  },

  /**
   * Generate connection report
   */
  async generateReport(supplierId: string): Promise<Blob> {
    try {
      const response = await enhancedApiClient.get(
        'suppliers/connection/REPORT',
        { supplierId },
        { retry: true }
      );
      return response;
    } catch (error) {
      console.error(`Error generating connection report for supplier ${supplierId}:`, error);
      throw errorHandler.handleError(error, 'generateReport');
    }
  }
};

// Export default for backward compatibility
export default factorySuppliersConnector;
