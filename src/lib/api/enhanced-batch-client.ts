/**
 * Enhanced API Batch Client
 * 
 * This module extends the enhanced API client with batch request support.
 */

import { getApiUrl, getApiPath } from './enhanced-config';
import { BatchRequestItem, BatchRequestManager, BatchRequestOptions, createBatchRequestManager } from './batch-request';
import { executeBatchWithMockSupport } from './batch-client';
import { logger } from '../logging/logger';
import { API_CONSTANTS } from './config';

// Global batch request manager instance
let globalBatchManager: BatchRequestManager | null = null;

/**
 * Get the global batch request manager
 * 
 * @param options Batch request options
 * @returns Global batch request manager
 */
export function getBatchManager(options: BatchRequestOptions = {}): BatchRequestManager {
  if (!globalBatchManager) {
    globalBatchManager = createBatchRequestManager(executeBatchWithMockSupport, options);
    
    logger.debug('Created global batch request manager', { 
      batchId: globalBatchManager.id,
      options
    });
  }
  
  return globalBatchManager;
}

/**
 * Create a new batch request manager
 * 
 * @param options Batch request options
 * @returns New batch request manager
 */
export function createNewBatchManager(options: BatchRequestOptions = {}): BatchRequestManager {
  return createBatchRequestManager(executeBatchWithMockSupport, options);
}

/**
 * Reset the global batch manager
 * This is useful for testing or when you want to start fresh
 */
export function resetBatchManager(): void {
  globalBatchManager = null;
}

/**
 * Add a GET request to the batch queue
 * 
 * @param endpoint API endpoint
 * @param params Query parameters
 * @param batchManager Batch manager to use (defaults to global)
 * @returns Promise that resolves with the response
 */
export async function batchGet<T = any>(
  endpoint: string,
  params?: Record<string, any>,
  batchManager?: BatchRequestManager
): Promise<T> {
  const manager = batchManager || getBatchManager();
  const url = getApiUrl(endpoint);
  
  // Add query parameters to URL if provided
  const urlWithParams = params 
    ? `${url}${url.includes('?') ? '&' : '?'}${new URLSearchParams(params).toString()}`
    : url;
  
  return manager.add<T>({
    method: 'GET',
    url: urlWithParams
  });
}

/**
 * Add a POST request to the batch queue
 * 
 * @param endpoint API endpoint
 * @param data Request body
 * @param batchManager Batch manager to use (defaults to global)
 * @returns Promise that resolves with the response
 */
export async function batchPost<T = any>(
  endpoint: string,
  data?: any,
  batchManager?: BatchRequestManager
): Promise<T> {
  const manager = batchManager || getBatchManager();
  
  return manager.add<T>({
    method: 'POST',
    url: getApiUrl(endpoint),
    body: data
  });
}

/**
 * Add a PUT request to the batch queue
 * 
 * @param endpoint API endpoint
 * @param data Request body
 * @param batchManager Batch manager to use (defaults to global)
 * @returns Promise that resolves with the response
 */
export async function batchPut<T = any>(
  endpoint: string,
  data?: any,
  batchManager?: BatchRequestManager
): Promise<T> {
  const manager = batchManager || getBatchManager();
  
  return manager.add<T>({
    method: 'PUT',
    url: getApiUrl(endpoint),
    body: data
  });
}

/**
 * Add a PATCH request to the batch queue
 * 
 * @param endpoint API endpoint
 * @param data Request body
 * @param batchManager Batch manager to use (defaults to global)
 * @returns Promise that resolves with the response
 */
export async function batchPatch<T = any>(
  endpoint: string,
  data?: any,
  batchManager?: BatchRequestManager
): Promise<T> {
  const manager = batchManager || getBatchManager();
  
  return manager.add<T>({
    method: 'PATCH',
    url: getApiUrl(endpoint),
    body: data
  });
}

/**
 * Add a DELETE request to the batch queue
 * 
 * @param endpoint API endpoint
 * @param batchManager Batch manager to use (defaults to global)
 * @returns Promise that resolves with the response
 */
export async function batchDelete<T = any>(
  endpoint: string,
  batchManager?: BatchRequestManager
): Promise<T> {
  const manager = batchManager || getBatchManager();
  
  return manager.add<T>({
    method: 'DELETE',
    url: getApiUrl(endpoint)
  });
}

/**
 * Execute all pending batch requests
 * 
 * @param batchManager Batch manager to use (defaults to global)
 */
export async function executeBatchRequests(batchManager?: BatchRequestManager): Promise<void> {
  const manager = batchManager || getBatchManager();
  
  if (manager.queueSize > 0) {
    await manager.execute();
  }
}

// Export the batch client
export const enhancedBatchClient = {
  get: batchGet,
  post: batchPost,
  put: batchPut,
  patch: batchPatch,
  delete: batchDelete,
  execute: executeBatchRequests,
  getBatchManager,
  createNewBatchManager,
  resetBatchManager
};
