/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * useApiCall Hook
 *
 * A React hook for making API calls with consistent error handling and loading states.
 * Provides robust error handling, loading states, and retry capabilities for API operations.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiError, RetryConfig } from '../api/error-handler';
import { enhancedApiClient, EnhancedRequestOptions } from '../api/enhanced-api-client';

/**
 * API call state
 */
export interface ApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  lastUpdated: Date | null;
}

/**
 * Options for API call hook
 */
export interface UseApiCallOptions<T> extends Omit<EnhancedRequestOptions, 'signal'> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  initialData?: T | null;
  autoExecuteOnMount?: boolean;
  dependencies?: any[];
  autoRetry?: boolean | Partial<RetryConfig>;
  retryOnNetworkChange?: boolean;
  cacheKey?: string;
  invalidationTimeout?: number;
}

/**
 * Result of useApiCall hook
 */
export interface UseApiCallResult<T, P extends any[]> {
  execute: (...args: P) => Promise<T | null>;
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  lastUpdated: Date | null;
  reset: () => void;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Cache storage for API calls
 */
type ApiCache = Map<string, { 
  data: any; 
  timestamp: number; 
  invalidationTimeout: number;
}>;

// In-memory cache for API calls
const apiCache: ApiCache = new Map();

/**
 * React hook for making API calls with consistent error handling
 * 
 * @param apiCallFn Function that executes the API call
 * @param options Options for API call behavior
 * @returns Hook result with execute function, data, loading, and error states
 */
export function useApiCall<T, P extends any[] = any[]>(
  apiCallFn: (...args: P) => Promise<T>,
  options: UseApiCallOptions<T> = {}
): UseApiCallResult<T, P> {
  const {
    onSuccess,
    onError,
    initialData = null,
    autoExecuteOnMount = false,
    dependencies = [],
    autoRetry = false,
    retryOnNetworkChange = true,
    cacheKey,
    invalidationTimeout = 5 * 60 * 1000, // 5 minutes default
    ...requestOptions
  } = options;

  // Refs to avoid dependency issues
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  
  // Update refs when callbacks change
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  // API call state
  const [state, setState] = useState<ApiCallState<T>>(() => {
    // Check if we have cached data
    if (cacheKey) {
      const cached = apiCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < cached.invalidationTimeout) {
        return {
          data: cached.data,
          loading: false,
          error: null,
          lastUpdated: new Date(cached.timestamp)
        };
      }
    }
    
    return {
      data: initialData,
      loading: autoExecuteOnMount,
      error: null,
      lastUpdated: null
    };
  });

  // Cleanup function for canceling requests
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Reset function to clear state
  const reset = useCallback(() => {
    cancelRequest();
    setState({
      data: initialData,
      loading: false,
      error: null,
      lastUpdated: null
    });
  }, [initialData, cancelRequest]);

  // Execute the API call
  const execute = useCallback(async (...args: P): Promise<T | null> => {
    if (!mountedRef.current) return null;
    
    // Cancel any in-progress requests
    cancelRequest();
    
    // Create a new abort controller
    abortControllerRef.current = new AbortController();
    
    // Update state to indicate loading
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    
    try {
      // If retry is enabled, use the retry mechanism
      const retryConfig = autoRetry === true ? {} : (autoRetry || undefined);
      
      // Execute the API call with or without retry
      const result = retryConfig
        ? await enhancedApiClient.safe(() => apiCallFn(...args))
        : await apiCallFn(...args);
      
      // Handle results from the safe API call
      let data: T | null = null;
      let error: ApiError | null = null;
      
      if (Array.isArray(result) && result.length === 2) {
        [data, error] = result;
      } else {
        data = result as T;
      }
      
      if (error) {
        throw error;
      }
      
      if (!mountedRef.current) return null;
      
      // Update state with the result
      const now = new Date();
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: now
      });
      
      // Cache the result if cacheKey is provided
      if (cacheKey && data) {
        apiCache.set(cacheKey, {
          data,
          timestamp: now.getTime(),
          invalidationTimeout
        });
      }
      
      // Call onSuccess callback if provided
      if (onSuccessRef.current) {
        onSuccessRef.current(data as T);
      }
      
      return data;
    } catch (err) {
      if (!mountedRef.current) return null;
      
      // Convert to ApiError if needed
      const error = err instanceof ApiError ? err : new ApiError(
        (err as Error)?.message || 'An error occurred',
        { retryable: true },
        err
      );
      
      // Update state with the error
      setState(prev => ({
        ...prev,
        loading: false,
        error
      }));
      
      // Call onError callback if provided
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
      
      return null;
    } finally {
      abortControllerRef.current = null;
    }
  }, [apiCallFn, cancelRequest, cacheKey, invalidationTimeout, autoRetry]);

  // Auto-execute on mount if enabled
  useEffect(() => {
    if (autoExecuteOnMount) {
      execute();
    }
    
    return () => {
      mountedRef.current = false;
      cancelRequest();
    };
  }, [autoExecuteOnMount, execute, cancelRequest, ...dependencies]);

  // Listen for online/offline events if retry on network change is enabled
  useEffect(() => {
    if (!retryOnNetworkChange || !state.error) return;
    
    const handleOnline = () => {
      if (state.error && ['network', 'timeout', 'server'].includes(state.error.type)) {
        execute();
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [retryOnNetworkChange, state.error, execute]);

  // Direct data setter function
  const setData = useCallback((newData: React.SetStateAction<T | null>) => {
    setState(prev => {
      const updatedData = typeof newData === 'function' 
        ? (newData as Function)(prev.data) 
        : newData;
        
      // Update cache if needed
      if (cacheKey && updatedData) {
        apiCache.set(cacheKey, {
          data: updatedData,
          timestamp: Date.now(),
          invalidationTimeout
        });
      }
      
      return {
        ...prev,
        data: updatedData,
        lastUpdated: new Date()
      };
    });
  }, [cacheKey, invalidationTimeout]);

  return {
    execute,
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    reset,
    setData
  };
}

/**
 * Clear a specific cache entry
 * 
 * @param cacheKey The key to clear
 */
export function clearApiCache(cacheKey: string): void {
  apiCache.delete(cacheKey);
}

/**
 * Clear all API cache
 */
export function clearAllApiCache(): void {
  apiCache.clear();
}

/**
 * Check if a cache entry exists and is valid
 * 
 * @param cacheKey The cache key to check
 * @returns Whether the cache entry exists and is valid
 */
export function isApiCacheValid(cacheKey: string): boolean {
  const cached = apiCache.get(cacheKey);
  if (!cached) return false;
  
  return (Date.now() - cached.timestamp) < cached.invalidationTimeout;
}

/**
 * Hook for auto-retrying API calls based on network status
 * 
 * @param callback Function to execute when network is restored
 * @param dependencies Dependencies array
 */
export function useNetworkRetry(
  callback: () => void,
  dependencies: any[] = []
): void {
  useEffect(() => {
    const handleOnline = () => {
      callback();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [callback, ...dependencies]);
}
