/**
 * Suppliers Connector
 *
 * This module handles the connection process with external supplier systems
 * as outlined in the connection guide (docs/connections/suppliers.connection.md)
 *
 * @deprecated CRITICAL: Use the factory-based suppliersConnector instead
 * This service has been migrated to use the enhanced API client but will be removed in a future release.
 * Import from 'src/features/suppliers/services' instead of directly from this file.
 * Example: import { suppliersConnector } from '@/features/suppliers/services';
 */

import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';
import { Supplier, SUPPLIER_STATUS } from '../types';

// Create error handler for this module
const errorHandler = createErrorHandler('suppliersConnector');

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
 *
 * @deprecated CRITICAL: Use the factory-based suppliersConnector instead
 * This service has been migrated to use the enhanced API client but will be removed in a future release.
 * Import from 'src/features/suppliers/services' instead of directly from this file.
 */
export const suppliersConnector = {
  /**
   * Get connection status for a supplier
   */
  getConnectionStatus: async (supplierId: string): Promise<ConnectionStatus | null> => {
    try {
      console.warn('DEPRECATED: Using legacy suppliersConnector.getConnectionStatus(). Please use the factory-based suppliersConnector instead.');
      return await enhancedApiClient.get<ConnectionStatus>(
        'suppliers/connection/STATUS',
        { supplierId },
        { retry: true, cache: 'default' }
      );
    } catch (error) {
      console.error(`Error fetching connection status for supplier ${supplierId}:`, error);
      return errorHandler.handleError(error, 'getConnectionStatus', null);
    }
  },

  /**
   * Get connection configuration for a supplier
   */
  getConnectionConfig: async (supplierId: string): Promise<ConnectionConfig | null> => {
    try {
      console.warn('DEPRECATED: Using legacy suppliersConnector.getConnectionConfig(). Please use the factory-based suppliersConnector instead.');
      return await enhancedApiClient.get<ConnectionConfig>(
        'suppliers/connection/CONFIG',
        { supplierId },
        { retry: true, cache: 'default' }
      );
    } catch (error) {
      console.error(`Error fetching connection config for supplier ${supplierId}:`, error);
      return errorHandler.handleError(error, 'getConnectionConfig', null);
    }
  },

  /**
   * Test connection with a supplier
   */
  testConnection: async (supplierId: string, config: ConnectionConfig): Promise<ValidationResult> => {
    try {
      console.warn('DEPRECATED: Using legacy suppliersConnector.testConnection(). Please use the factory-based suppliersConnector instead.');
      return await enhancedApiClient.post<ValidationResult>(
        'suppliers/connection/TEST',
        config,
        { supplierId },
        { retry: false }
      );
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
      console.warn('DEPRECATED: Using legacy suppliersConnector.connect(). Please use the factory-based suppliersConnector instead.');
      return await enhancedApiClient.post<ValidationResult>(
        'suppliers/connection/CONNECT',
        config,
        { supplierId },
        { retry: false }
      );
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
      console.warn('DEPRECATED: Using legacy suppliersConnector.disconnect(). Please use the factory-based suppliersConnector instead.');
      await enhancedApiClient.post(
        'suppliers/connection/DISCONNECT',
        {},
        { supplierId },
        { retry: false }
      );
      return true;
    } catch (error) {
      console.error(`Error disconnecting from supplier ${supplierId}:`, error);
      return errorHandler.handleError(error, 'disconnect', false);
    }
  },

  /**
   * Manually trigger a sync with a supplier
   */
  triggerSync: async (supplierId: string, syncOptions?: { fields?: string[] }): Promise<boolean> => {
    try {
      console.warn('DEPRECATED: Using legacy suppliersConnector.triggerSync(). Please use the factory-based suppliersConnector instead.');
      await enhancedApiClient.post(
        'suppliers/connection/SYNC',
        syncOptions || {},
        { supplierId },
        { retry: false }
      );
      return true;
    } catch (error) {
      console.error(`Error triggering sync for supplier ${supplierId}:`, error);
      return errorHandler.handleError(error, 'triggerSync', false);
    }
  },

  /**
   * Get sync history for a supplier
   */
  getSyncHistory: async (supplierId: string): Promise<ConnectionStatus['syncHistory']> => {
    try {
      console.warn('DEPRECATED: Using legacy suppliersConnector.getSyncHistory(). Please use the factory-based suppliersConnector instead.');
      return await enhancedApiClient.get<ConnectionStatus['syncHistory']>(
        'suppliers/connection/SYNC_HISTORY',
        { supplierId },
        { retry: true, cache: 'default' }
      );
    } catch (error) {
      console.error(`Error fetching sync history for supplier ${supplierId}:`, error);
      return errorHandler.handleError(error, 'getSyncHistory', []);
    }
  },

  /**
   * Update connection settings for a supplier
   */
  updateConnectionSettings: async (supplierId: string, settings: ConnectionConfig['settings']): Promise<boolean> => {
    try {
      console.warn('DEPRECATED: Using legacy suppliersConnector.updateConnectionSettings(). Please use the factory-based suppliersConnector instead.');
      await enhancedApiClient.put(
        'suppliers/connection/UPDATE_SETTINGS',
        settings,
        { supplierId },
        { retry: false }
      );
      return true;
    } catch (error) {
      console.error(`Error updating connection settings for supplier ${supplierId}:`, error);
      return errorHandler.handleError(error, 'updateConnectionSettings', false);
    }
  },

  /**
   * Update field mapping for a supplier
   */
  updateFieldMapping: async (supplierId: string, mapping: ConnectionConfig['mapping']): Promise<boolean> => {
    try {
      console.warn('DEPRECATED: Using legacy suppliersConnector.updateFieldMapping(). Please use the factory-based suppliersConnector instead.');
      await enhancedApiClient.put(
        'suppliers/connection/UPDATE_MAPPING',
        mapping,
        { supplierId },
        { retry: false }
      );
      return true;
    } catch (error) {
      console.error(`Error updating field mapping for supplier ${supplierId}:`, error);
      return errorHandler.handleError(error, 'updateFieldMapping', false);
    }
  },

  /**
   * Get connection health metrics
   */
  getConnectionHealth: async (supplierId: string): Promise<ConnectionStatus['health']> => {
    try {
      console.warn('DEPRECATED: Using legacy suppliersConnector.getConnectionHealth(). Please use the factory-based suppliersConnector instead.');
      return await enhancedApiClient.get<ConnectionStatus['health']>(
        'suppliers/connection/CONNECTION_HEALTH',
        { supplierId },
        { retry: true, cache: 'default' }
      );
    } catch (error) {
      console.error(`Error fetching connection health for supplier ${supplierId}:`, error);
      return errorHandler.handleError(error, 'getConnectionHealth', {
        uptime: 0,
        responseTime: 0,
        errorRate: 100
      });
    }
  },

  /**
   * Get supported connection types for a supplier
   */
  getSupportedConnectionTypes: async (supplierId: string): Promise<CONNECTION_TYPE[]> => {
    try {
      console.warn('DEPRECATED: Using legacy suppliersConnector.getSupportedConnectionTypes(). Please use the factory-based suppliersConnector instead.');
      return await enhancedApiClient.get<CONNECTION_TYPE[]>(
        'suppliers/connection/SUPPORTED_TYPES',
        { supplierId },
        { retry: true, cache: 'default' }
      );
    } catch (error) {
      console.error(`Error fetching supported connection types for supplier ${supplierId}:`, error);
      return errorHandler.handleError(error, 'getSupportedConnectionTypes', [CONNECTION_TYPE.MANUAL]);
    }
  },

  /**
   * Generate connection report
   */
  generateReport: async (supplierId: string): Promise<Blob> => {
    try {
      console.warn('DEPRECATED: Using legacy suppliersConnector.generateReport(). Please use the factory-based suppliersConnector instead.');
      return await enhancedApiClient.get<Blob>(
        'suppliers/connection/GENERATE_REPORT',
        { supplierId },
        { retry: false }
      );
    } catch (error) {
      console.error(`Error generating connection report for supplier ${supplierId}:`, error);
      return errorHandler.handleError(error, 'generateReport');
    }
  }
};