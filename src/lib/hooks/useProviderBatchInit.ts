/**
 * Hook for batching provider initialization requests
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useInitialization } from '../providers/InitializationProvider';
import { RequestPriority } from '../api/initialization-batch-manager';
import { logger } from '../logging/logger';
import { performanceMonitor } from '../performance/performance-monitor';

export interface ProviderBatchInitOptions {
  /**
   * Provider name for logging and performance tracking
   */
  providerName: string;
  
  /**
   * Whether to automatically execute initialization
   * Default: true
   */
  autoInit?: boolean;
  
  /**
   * Default priority for requests
   * Default: RequestPriority.MEDIUM
   */
  defaultPriority?: RequestPriority;
  
  /**
   * Whether to track performance metrics
   * Default: true
   */
  trackPerformance?: boolean;
  
  /**
   * Dependencies that should trigger re-initialization when changed
   */
  dependencies?: any[];
  
  /**
   * Callback to run when initialization is complete
   */
  onInitComplete?: () => void;
  
  /**
   * Callback to run when initialization fails
   */
  onInitError?: (error: Error) => void;
}

export interface ProviderBatchInitResult {
  /**
   * Add a GET request to the batch
   */
  batchGet: <T = any>(
    endpoint: string, 
    params?: Record<string, any>, 
    priority?: RequestPriority
  ) => Promise<T>;
  
  /**
   * Add a POST request to the batch
   */
  batchPost: <T = any>(
    endpoint: string, 
    data?: any, 
    priority?: RequestPriority
  ) => Promise<T>;
  
  /**
   * Execute initialization
   */
  initialize: () => Promise<void>;
  
  /**
   * Whether initialization is in progress
   */
  isInitializing: boolean;
  
  /**
   * Whether initialization is complete
   */
  isInitialized: boolean;
  
  /**
   * Error that occurred during initialization
   */
  error: Error | null;
  
  /**
   * Reset initialization state
   */
  reset: () => void;
}

/**
 * Hook for batching provider initialization requests
 * 
 * @param options Provider batch initialization options
 * @returns Hook result with batch request methods and initialization state
 */
export function useProviderBatchInit(
  options: ProviderBatchInitOptions
): ProviderBatchInitResult {
  const {
    providerName,
    autoInit = true,
    defaultPriority = RequestPriority.MEDIUM,
    trackPerformance = true,
    dependencies = [],
    onInitComplete,
    onInitError
  } = options;
  
  // Get initialization context
  const { get, post, isInitialized: isAppInitialized } = useInitialization();
  
  // State
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Refs
  const requestsRef = useRef<Array<() => Promise<any>>>([]);
  
  // Add a GET request to the batch
  const batchGet = useCallback(<T = any>(
    endpoint: string, 
    params?: Record<string, any>, 
    priority: RequestPriority = defaultPriority
  ): Promise<T> => {
    // Create the request function
    const requestFn = () => get<T>(endpoint, params, priority);
    
    // Add to the requests queue
    requestsRef.current.push(requestFn);
    
    // Return a promise that will be resolved when the request is executed
    return new Promise<T>((resolve, reject) => {
      // Execute the request immediately if we're already initialized
      if (isInitialized || isAppInitialized) {
        requestFn().then(resolve).catch(reject);
      } else {
        // Otherwise, the promise will be resolved when initialize() is called
        const index = requestsRef.current.length - 1;
        const originalFn = requestsRef.current[index];
        
        // Replace the original function with one that resolves/rejects the promise
        requestsRef.current[index] = async () => {
          try {
            const result = await originalFn();
            resolve(result);
            return result;
          } catch (err) {
            reject(err);
            throw err;
          }
        };
      }
    });
  }, [get, defaultPriority, isInitialized, isAppInitialized]);
  
  // Add a POST request to the batch
  const batchPost = useCallback(<T = any>(
    endpoint: string, 
    data?: any, 
    priority: RequestPriority = defaultPriority
  ): Promise<T> => {
    // Create the request function
    const requestFn = () => post<T>(endpoint, data, priority);
    
    // Add to the requests queue
    requestsRef.current.push(requestFn);
    
    // Return a promise that will be resolved when the request is executed
    return new Promise<T>((resolve, reject) => {
      // Execute the request immediately if we're already initialized
      if (isInitialized || isAppInitialized) {
        requestFn().then(resolve).catch(reject);
      } else {
        // Otherwise, the promise will be resolved when initialize() is called
        const index = requestsRef.current.length - 1;
        const originalFn = requestsRef.current[index];
        
        // Replace the original function with one that resolves/rejects the promise
        requestsRef.current[index] = async () => {
          try {
            const result = await originalFn();
            resolve(result);
            return result;
          } catch (err) {
            reject(err);
            throw err;
          }
        };
      }
    });
  }, [post, defaultPriority, isInitialized, isAppInitialized]);
  
  // Execute initialization
  const initialize = useCallback(async (): Promise<void> => {
    if (isInitializing || isInitialized) {
      return;
    }
    
    setIsInitializing(true);
    setError(null);
    
    if (trackPerformance) {
      performanceMonitor.markStart(`provider:init:${providerName}`);
    }
    
    try {
      logger.debug(`Initializing provider: ${providerName}`, { 
        providerName, 
        requestCount: requestsRef.current.length 
      });
      
      // Execute all requests in the queue
      const results = await Promise.all(
        requestsRef.current.map(requestFn => requestFn())
      );
      
      setIsInitialized(true);
      
      if (onInitComplete) {
        onInitComplete();
      }
      
      logger.debug(`Provider initialized: ${providerName}`, { 
        providerName, 
        requestCount: requestsRef.current.length,
        results: results.length
      });
    } catch (err) {
      logger.error(`Error initializing provider: ${providerName}`, { 
        providerName, 
        error: err 
      });
      
      const errorObj = err instanceof Error ? err : new Error('Unknown error');
      setError(errorObj);
      
      if (onInitError) {
        onInitError(errorObj);
      }
    } finally {
      setIsInitializing(false);
      
      if (trackPerformance) {
        performanceMonitor.markEnd(`provider:init:${providerName}`);
      }
    }
  }, [isInitializing, isInitialized, trackPerformance, providerName, onInitComplete, onInitError]);
  
  // Reset initialization state
  const reset = useCallback(() => {
    setIsInitializing(false);
    setIsInitialized(false);
    setError(null);
    requestsRef.current = [];
  }, []);
  
  // Auto-initialize
  useEffect(() => {
    if (autoInit && !isInitialized && !isInitializing && requestsRef.current.length > 0) {
      initialize();
    }
  }, [autoInit, isInitialized, isInitializing, initialize, ...dependencies]);
  
  return {
    batchGet,
    batchPost,
    initialize,
    isInitializing,
    isInitialized,
    error,
    reset
  };
}

export default useProviderBatchInit;
