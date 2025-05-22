/**
 * Hook for batching service initialization requests
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  InitializationBatchManager, 
  getInitializationBatchManager, 
  RequestPriority,
  initBatchClient
} from '../api/initialization-batch-manager';
import { logger } from '../logging/logger';
import { performanceMonitor } from '../performance/performance-monitor';

export interface ServiceBatchInitOptions {
  /**
   * Service name for logging and performance tracking
   */
  serviceName: string;
  
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
   * Callback to run when initialization is complete
   */
  onInitComplete?: () => void;
  
  /**
   * Callback to run when initialization fails
   */
  onInitError?: (error: Error) => void;
}

export interface ServiceBatchInitResult {
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
  
  /**
   * The initialization batch manager instance
   */
  initManager: InitializationBatchManager;
}

/**
 * Hook for batching service initialization requests
 * 
 * @param options Service batch initialization options
 * @returns Hook result with batch request methods and initialization state
 */
export function useServiceBatchInit(
  options: ServiceBatchInitOptions
): ServiceBatchInitResult {
  const {
    serviceName,
    autoInit = true,
    defaultPriority = RequestPriority.MEDIUM,
    trackPerformance = true,
    onInitComplete,
    onInitError
  } = options;
  
  // Get or create the initialization batch manager
  const initManagerRef = useRef<InitializationBatchManager>(
    getInitializationBatchManager({
      autoExecuteCritical: true,
      trackInitPerformance: true
    })
  );
  
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
    const requestFn = () => initBatchClient.get<T>(endpoint, params, priority, initManagerRef.current);
    
    // Add to the requests queue
    requestsRef.current.push(requestFn);
    
    // Return a promise that will be resolved when the request is executed
    return new Promise<T>((resolve, reject) => {
      // Execute the request immediately if we're already initialized
      if (isInitialized) {
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
  }, [defaultPriority, isInitialized]);
  
  // Add a POST request to the batch
  const batchPost = useCallback(<T = any>(
    endpoint: string, 
    data?: any, 
    priority: RequestPriority = defaultPriority
  ): Promise<T> => {
    // Create the request function
    const requestFn = () => initBatchClient.post<T>(endpoint, data, priority, initManagerRef.current);
    
    // Add to the requests queue
    requestsRef.current.push(requestFn);
    
    // Return a promise that will be resolved when the request is executed
    return new Promise<T>((resolve, reject) => {
      // Execute the request immediately if we're already initialized
      if (isInitialized) {
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
  }, [defaultPriority, isInitialized]);
  
  // Execute initialization
  const initialize = useCallback(async (): Promise<void> => {
    if (isInitializing || isInitialized) {
      return;
    }
    
    setIsInitializing(true);
    setError(null);
    
    if (trackPerformance) {
      performanceMonitor.markStart(`service:init:${serviceName}`);
    }
    
    try {
      logger.debug(`Initializing service: ${serviceName}`, { 
        serviceName, 
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
      
      logger.debug(`Service initialized: ${serviceName}`, { 
        serviceName, 
        requestCount: requestsRef.current.length,
        results: results.length
      });
    } catch (err) {
      logger.error(`Error initializing service: ${serviceName}`, { 
        serviceName, 
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
        performanceMonitor.markEnd(`service:init:${serviceName}`);
      }
    }
  }, [isInitializing, isInitialized, trackPerformance, serviceName, onInitComplete, onInitError]);
  
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
  }, [autoInit, isInitialized, isInitializing, initialize]);
  
  return {
    batchGet,
    batchPost,
    initialize,
    isInitializing,
    isInitialized,
    error,
    reset,
    initManager: initManagerRef.current
  };
}

export default useServiceBatchInit;
