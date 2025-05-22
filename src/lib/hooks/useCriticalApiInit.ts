/**
 * Hook for making critical API requests during initialization
 */

import { useState, useEffect, useCallback } from 'react';
import { useInitialization } from '../providers/InitializationProvider';
import { RequestPriority } from '../api/initialization-batch-manager';
import { logger } from '../logging/logger';
import { performanceMonitor } from '../performance/performance-monitor';

export interface UseCriticalApiInitOptions<T> {
  /**
   * Endpoint to fetch data from
   */
  endpoint: string;
  
  /**
   * Query parameters for the request
   */
  params?: Record<string, any>;
  
  /**
   * Priority level for the request
   * Default: RequestPriority.CRITICAL
   */
  priority?: RequestPriority;
  
  /**
   * Whether to automatically execute the request
   * Default: true
   */
  autoExecute?: boolean;
  
  /**
   * Default data to use if the request fails
   */
  defaultData?: T;
  
  /**
   * Whether to track performance metrics
   * Default: true
   */
  trackPerformance?: boolean;
  
  /**
   * Unique identifier for this initialization request
   * Used for performance tracking
   */
  initId?: string;
  
  /**
   * Dependencies that should trigger a re-fetch when changed
   */
  dependencies?: any[];
  
  /**
   * Callback to run when data is successfully fetched
   */
  onSuccess?: (data: T) => void;
  
  /**
   * Callback to run when an error occurs
   */
  onError?: (error: Error) => void;
}

export interface UseCriticalApiInitResult<T> {
  /**
   * Data returned from the API
   */
  data: T | null;
  
  /**
   * Whether the request is loading
   */
  loading: boolean;
  
  /**
   * Error that occurred during the request
   */
  error: Error | null;
  
  /**
   * Execute the request manually
   */
  execute: () => Promise<T | null>;
  
  /**
   * Reset the state
   */
  reset: () => void;
}

/**
 * Hook for making critical API requests during initialization
 * 
 * @param options Options for the critical API request
 * @returns Hook result with data, loading, and error states
 */
export function useCriticalApiInit<T = any>(
  options: UseCriticalApiInitOptions<T>
): UseCriticalApiInitResult<T> {
  const {
    endpoint,
    params,
    priority = RequestPriority.CRITICAL,
    autoExecute = true,
    defaultData = null,
    trackPerformance = true,
    initId = endpoint.replace(/[^a-zA-Z0-9]/g, '_'),
    dependencies = [],
    onSuccess,
    onError
  } = options;
  
  // Get initialization context
  const { get, isInitialized } = useInitialization();
  
  // State
  const [data, setData] = useState<T | null>(defaultData as T | null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasExecuted, setHasExecuted] = useState(false);
  
  // Execute the request
  const execute = useCallback(async (): Promise<T | null> => {
    if (loading) {
      return data;
    }
    
    setLoading(true);
    setError(null);
    
    if (trackPerformance) {
      performanceMonitor.markStart(`app:init:${initId}`);
    }
    
    try {
      logger.debug(`Executing critical API request: ${endpoint}`, { 
        endpoint, 
        params, 
        priority 
      });
      
      const result = await get<T>(endpoint, params, priority);
      
      setData(result);
      setHasExecuted(true);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      logger.error(`Error executing critical API request: ${endpoint}`, { 
        endpoint, 
        params, 
        error: err 
      });
      
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      
      if (onError) {
        onError(errorObj);
      }
      
      return defaultData as T | null;
    } finally {
      setLoading(false);
      
      if (trackPerformance) {
        performanceMonitor.markEnd(`app:init:${initId}`);
      }
    }
  }, [endpoint, params, priority, loading, data, trackPerformance, initId, get, onSuccess, onError, defaultData]);
  
  // Reset the state
  const reset = useCallback(() => {
    setData(defaultData as T | null);
    setLoading(false);
    setError(null);
    setHasExecuted(false);
  }, [defaultData]);
  
  // Auto-execute the request
  useEffect(() => {
    if (autoExecute && !hasExecuted && !isInitialized) {
      execute();
    }
  }, [autoExecute, hasExecuted, isInitialized, execute, ...dependencies]);
  
  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

export default useCriticalApiInit;
