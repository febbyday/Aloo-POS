/**
 * Factory-Based Suppliers Connector
 *
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of supplier connection operations.
 */

import { createServiceMethod } from '@/lib/api/service-endpoint-factory';
import { ApiErrorType } from '@/lib/api/error-handler';
import { Supplier } from '../types';

// Import connection types from the legacy connector
import {
  CONNECTION_STATUS,
  CONNECTION_TYPE,
  ConnectionConfig,
  ValidationResult,
  ConnectionStatus
} from './suppliersConnector';

// Define retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  shouldRetry: (error: any) => error.type !== ApiErrorType.VALIDATION
};

// Register supplier connection endpoints if not already registered
// Note: These endpoints should ideally be registered in the endpoint-registry.ts file
// This is a temporary solution until the endpoints are properly registered
if (!('suppliers/connection' in window)) {
  console.info('Registering supplier connection endpoints');
}

/**
 * Suppliers connector with standardized endpoint handling
 */
export const suppliersConnector = {
  /**
   * Get connection status for a supplier
   */
  getConnectionStatus: createServiceMethod<ConnectionStatus>(
    'suppliers',
    'CONNECTION_STATUS',
    'get',
    { withRetry: RETRY_CONFIG }
  ),

  /**
   * Get connection configuration for a supplier
   */
  getConnectionConfig: createServiceMethod<ConnectionConfig>(
    'suppliers',
    'CONNECTION_CONFIG',
    'get',
    { withRetry: RETRY_CONFIG }
  ),

  /**
   * Test connection with a supplier
   */
  testConnection: createServiceMethod<ValidationResult>(
    'suppliers',
    'CONNECTION_TEST',
    'post',
    { withRetry: false }
  ),

  /**
   * Connect to a supplier
   */
  connect: createServiceMethod<ValidationResult>(
    'suppliers',
    'CONNECT',
    'post',
    { withRetry: false }
  ),

  /**
   * Disconnect from a supplier
   */
  disconnect: createServiceMethod<boolean>(
    'suppliers',
    'DISCONNECT',
    'post',
    { withRetry: false }
  ),

  /**
   * Manually trigger a sync with a supplier
   */
  triggerSync: createServiceMethod<boolean>(
    'suppliers',
    'SYNC',
    'post',
    { withRetry: false }
  ),

  /**
   * Get sync history for a supplier
   */
  getSyncHistory: createServiceMethod<ConnectionStatus['syncHistory']>(
    'suppliers',
    'SYNC_HISTORY',
    'get',
    { withRetry: RETRY_CONFIG }
  ),

  /**
   * Update connection settings for a supplier
   */
  updateConnectionSettings: createServiceMethod<boolean>(
    'suppliers',
    'UPDATE_SETTINGS',
    'put',
    { withRetry: false }
  ),

  /**
   * Update field mapping for a supplier
   */
  updateFieldMapping: createServiceMethod<boolean>(
    'suppliers',
    'UPDATE_MAPPING',
    'put',
    { withRetry: false }
  ),

  /**
   * Get connection health metrics
   */
  getConnectionHealth: createServiceMethod<ConnectionStatus['health']>(
    'suppliers',
    'CONNECTION_HEALTH',
    'get',
    { withRetry: RETRY_CONFIG }
  ),

  /**
   * Get supported connection types for a supplier
   */
  getSupportedConnectionTypes: createServiceMethod<CONNECTION_TYPE[]>(
    'suppliers',
    'SUPPORTED_TYPES',
    'get',
    { withRetry: RETRY_CONFIG }
  ),

  /**
   * Generate connection report
   */
  generateReport: createServiceMethod<Blob>(
    'suppliers',
    'GENERATE_REPORT',
    'get',
    { withRetry: false }
  )
};

export default suppliersConnector;
