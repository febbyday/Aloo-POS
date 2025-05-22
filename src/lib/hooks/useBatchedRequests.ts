/**
 * React hook for batching multiple API requests
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { enhancedBatchClient, getBatchManager, createNewBatchManager } from '../api/enhanced-batch-client';
import { BatchRequestManager, BatchRequestOptions } from '../api/batch-request';
import { logger } from '../logging/logger';
import { performanceMonitor } from '../performance/performance-monitor';

export interface UseBatchedRequestsOptions {
  /**
   * Whether to use a dedicated batch manager for this hook
   * Default: false (uses global batch manager)
   */
  useDedicatedManager?: boolean;
  
  /**
   * Options for the batch manager
   */
  batchOptions?: BatchRequestOptions;
  
  /**
   * Whether to automatically execute the batch when unmounting
   * Default: true
   */
  executeOnUnmount?: boolean;
  
  /**
   * Whether to track performance metrics
   * Default: true
   */
  trackPerformance?: boolean;
}

export interface UseBatchedRequestsResult {
  /**
   * The batch manager instance
   */
  batchManager: BatchRequestManager;
  
  /**
   * Execute a GET request
   */
  get: <T = any>(endpoint: string, params?: Record<string, any>) => Promise<T>;
  
  /**
   * Execute a POST request
   */
  post: <T = any>(endpoint: string, data?: any) => Promise<T>;
  
  /**
   * Execute a PUT request
   */
  put: <T = any>(endpoint: string, data?: any) => Promise<T>;
  
  /**
   * Execute a PATCH request
   */
  patch: <T = any>(endpoint: string, data?: any) => Promise<T>;
  
  /**
   * Execute a DELETE request
   */
  delete: <T = any>(endpoint: string) => Promise<T>;
  
  /**
   * Execute all pending batch requests
   */
  execute: () => Promise<void>;
  
  /**
   * Whether the batch is currently executing
   */
  loading: boolean;
  
  /**
   * Number of requests in the batch queue
   */
  queueSize: number;
}

/**
 * React hook for batching multiple API requests
 * 
 * @param options Options for the batched requests
 * @returns Hook result with batch manager and request methods
 */
export function useBatchedRequests(
  options: UseBatchedRequestsOptions = {}
): UseBatchedRequestsResult {
  const {
    useDedicatedManager = false,
    batchOptions = {},
    executeOnUnmount = true,
    trackPerformance = true
  } = options;
  
  // Create or get the batch manager
  const batchManagerRef = useRef<BatchRequestManager>(
    useDedicatedManager 
      ? createNewBatchManager(batchOptions)
      : getBatchManager(batchOptions)
  );
  
  // State
  const [loading, setLoading] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  
  // Update queue size
  useEffect(() => {
    // Update queue size initially
    setQueueSize(batchManagerRef.current.queueSize);
    
    // Set up an interval to update the queue size
    const interval = setInterval(() => {
      setQueueSize(batchManagerRef.current.queueSize);
    }, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Execute the batch
  const execute = useCallback(async () => {
    if (batchManagerRef.current.queueSize === 0) {
      return;
    }
    
    setLoading(true);
    
    if (trackPerformance) {
      performanceMonitor.markStart(`api:batchExecute:${batchManagerRef.current.id}`);
    }
    
    try {
      await batchManagerRef.current.execute();
    } catch (error) {
      logger.error('Error executing batch', { 
        error,
        batchId: batchManagerRef.current.id
      });
    } finally {
      setLoading(false);
      
      if (trackPerformance) {
        performanceMonitor.markEnd(`api:batchExecute:${batchManagerRef.current.id}`);
      }
    }
  }, [trackPerformance]);
  
  // Execute batch on unmount if enabled
  useEffect(() => {
    return () => {
      if (executeOnUnmount && batchManagerRef.current.queueSize > 0) {
        execute();
      }
    };
  }, [execute, executeOnUnmount]);
  
  // Create request methods
  const get = useCallback(<T = any>(endpoint: string, params?: Record<string, any>) => {
    return enhancedBatchClient.get<T>(endpoint, params, batchManagerRef.current);
  }, []);
  
  const post = useCallback(<T = any>(endpoint: string, data?: any) => {
    return enhancedBatchClient.post<T>(endpoint, data, batchManagerRef.current);
  }, []);
  
  const put = useCallback(<T = any>(endpoint: string, data?: any) => {
    return enhancedBatchClient.put<T>(endpoint, data, batchManagerRef.current);
  }, []);
  
  const patch = useCallback(<T = any>(endpoint: string, data?: any) => {
    return enhancedBatchClient.patch<T>(endpoint, data, batchManagerRef.current);
  }, []);
  
  const deleteRequest = useCallback(<T = any>(endpoint: string) => {
    return enhancedBatchClient.delete<T>(endpoint, batchManagerRef.current);
  }, []);
  
  return {
    batchManager: batchManagerRef.current,
    get,
    post,
    put,
    patch,
    delete: deleteRequest,
    execute,
    loading,
    queueSize
  };
}
