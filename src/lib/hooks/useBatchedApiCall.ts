/**
 * React hook for making batched API calls
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { enhancedBatchClient, getBatchManager } from '../api/enhanced-batch-client';
import { BatchRequestManager } from '../api/batch-request';
import { ApiError } from '../api/error-handler';
import { logger } from '../logging/logger';

export interface UseBatchedApiCallOptions<T> {
  /**
   * Whether to execute the API call automatically on mount
   * Default: false
   */
  autoExecuteOnMount?: boolean;
  
  /**
   * Initial data to use before the API call completes
   */
  initialData?: T | null;
  
  /**
   * Callback to execute when the API call succeeds
   */
  onSuccess?: (data: T) => void;
  
  /**
   * Callback to execute when the API call fails
   */
  onError?: (error: ApiError) => void;
  
  /**
   * Dependencies to watch for changes
   * If any of these change, the API call will be re-executed
   */
  dependencies?: any[];
  
  /**
   * Custom batch manager to use
   * If not provided, the global batch manager will be used
   */
  batchManager?: BatchRequestManager;
  
  /**
   * Whether to automatically execute the batch when all dependencies are loaded
   * Default: true
   */
  autoExecuteBatch?: boolean;
  
  /**
   * Delay in milliseconds before executing the batch
   * This can be useful to allow multiple components to add their requests
   * Default: 0
   */
  batchDelay?: number;
}

export interface UseBatchedApiCallResult<T, P extends any[] = any[]> {
  /**
   * Execute the API call
   */
  execute: (...args: P) => Promise<T>;
  
  /**
   * Whether the API call is currently loading
   */
  loading: boolean;
  
  /**
   * Data returned from the API call
   */
  data: T | null;
  
  /**
   * Error from the API call
   */
  error: ApiError | null;
  
  /**
   * Reset the state
   */
  reset: () => void;
  
  /**
   * Execute the batch
   */
  executeBatch: () => Promise<void>;
}

/**
 * React hook for making batched API calls
 * 
 * @param apiCallFn Function that executes the API call
 * @param options Options for the API call
 * @returns Hook result with execute function, data, loading, and error states
 */
export function useBatchedApiCall<T, P extends any[] = any[]>(
  apiCallFn: (...args: P) => Promise<T>,
  options: UseBatchedApiCallOptions<T> = {}
): UseBatchedApiCallResult<T, P> {
  const {
    autoExecuteOnMount = false,
    initialData = null,
    onSuccess,
    onError,
    dependencies = [],
    batchManager,
    autoExecuteBatch = true,
    batchDelay = 0
  } = options;
  
  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<ApiError | null>(null);
  
  // Refs
  const mounted = useRef(true);
  const batchTimeoutRef = useRef<number | null>(null);
  const manager = useRef(batchManager || getBatchManager());
  
  // Reset the state
  const reset = useCallback(() => {
    setLoading(false);
    setData(initialData);
    setError(null);
  }, [initialData]);
  
  // Execute the batch
  const executeBatch = useCallback(async () => {
    try {
      await enhancedBatchClient.execute(manager.current);
    } catch (err) {
      logger.error('Error executing batch', { error: err });
    }
  }, []);
  
  // Schedule batch execution with delay
  const scheduleBatchExecution = useCallback(() => {
    // Clear any existing timeout
    if (batchTimeoutRef.current !== null) {
      window.clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
    
    // Schedule new timeout
    if (batchDelay > 0) {
      batchTimeoutRef.current = window.setTimeout(() => {
        executeBatch();
        batchTimeoutRef.current = null;
      }, batchDelay);
    } else {
      executeBatch();
    }
  }, [batchDelay, executeBatch]);
  
  // Execute the API call
  const execute = useCallback(async (...args: P): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCallFn(...args);
      
      if (mounted.current) {
        setData(result);
        setLoading(false);
        onSuccess?.(result);
      }
      
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(
        err instanceof Error ? err.message : 'Unknown error',
        { type: 'unknown' },
        err
      );
      
      if (mounted.current) {
        setError(apiError);
        setLoading(false);
        onError?.(apiError);
      }
      
      throw apiError;
    }
  }, [apiCallFn, onSuccess, onError]);
  
  // Auto-execute on mount or when dependencies change
  useEffect(() => {
    if (autoExecuteOnMount) {
      execute().catch(() => {
        // Error is already handled in execute
      });
      
      // Auto-execute batch if enabled
      if (autoExecuteBatch) {
        scheduleBatchExecution();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
      
      // Clear any pending batch execution
      if (batchTimeoutRef.current !== null) {
        window.clearTimeout(batchTimeoutRef.current);
        batchTimeoutRef.current = null;
      }
    };
  }, []);
  
  return {
    execute,
    loading,
    data,
    error,
    reset,
    executeBatch
  };
}
