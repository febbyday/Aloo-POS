/**
 * useCachedApi Hook
 * 
 * A React hook for making API requests with built-in caching.
 * This hook leverages the API service and cache manager to provide efficient data fetching.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService } from '@/lib/api/createApiService';
import { cacheManager, CacheOptions } from '@/lib/api/cache-manager';
import { QueryParams } from '@/lib/api/createApiService';

interface CachedApiOptions<T> extends CacheOptions {
  /**
   * Callback when request starts
   */
  onStart?: () => void;
  
  /**
   * Callback when request succeeds
   */
  onSuccess?: (data: T) => void;
  
  /**
   * Callback when request fails
   */
  onError?: (error: Error) => void;
  
  /**
   * Whether to skip the request
   */
  skip?: boolean;
  
  /**
   * Initial data to use while loading
   */
  initialData?: T;
  
  /**
   * Whether to suspend the component until data is loaded (React 18+ only)
   */
  suspense?: boolean;
}

interface CachedApiState<T> {
  /**
   * The loaded data
   */
  data: T | null;
  
  /**
   * Whether the request is loading
   */
  loading: boolean;
  
  /**
   * Any error that occurred
   */
  error: Error | null;
  
  /**
   * Function to manually refetch the data
   */
  refetch: () => Promise<T>;
}

/**
 * Hook for using an API service with caching
 */
export function useCachedApi<T>(
  apiService: ApiService,
  endpoint: string,
  params?: QueryParams,
  options: CachedApiOptions<T> = {}
): CachedApiState<T> {
  const {
    ttl,
    key,
    queryParams,
    tag,
    onStart,
    onSuccess,
    onError,
    skip = false,
    initialData = null,
    suspense = false
  } = options;
  
  // State
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // References
  const mounted = useRef<boolean>(true);
  const cacheOptions = { ttl, key, queryParams, tag };
  
  // Create a ref for suspense promises
  const suspensePromiseRef = useRef<Promise<T> | null>(null);
  
  // Function to fetch data
  const fetchData = useCallback(async (): Promise<T> => {
    try {
      // Check cache first
      const cachedData = cacheManager.get<T>(endpoint, params, cacheOptions);
      if (cachedData) {
        // Only update state if we're still mounted
        if (mounted.current) {
          setData(cachedData);
          setLoading(false);
          setError(null);
        }
        
        onSuccess?.(cachedData);
        return cachedData;
      }
      
      // If not in cache or expired, fetch from API
      if (mounted.current) {
        setLoading(true);
        onStart?.();
      }
      
      // Make the API request
      const result = await apiService.get<T>(endpoint, params);
      
      // Cache the result
      cacheManager.set(endpoint, result, params, cacheOptions);
      
      // Update state if still mounted
      if (mounted.current) {
        setData(result);
        setLoading(false);
        setError(null);
      }
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      
      // Update state if still mounted
      if (mounted.current) {
        setError(error);
        setLoading(false);
      }
      
      onError?.(error);
      throw error;
    }
  }, [apiService, endpoint, params, cacheOptions, onStart, onSuccess, onError]);
  
  // Fetch data on mount or when dependencies change
  useEffect(() => {
    mounted.current = true;
    
    // Don't fetch if skip is true
    if (skip) return;
    
    fetchData().catch(() => {
      // Errors are handled in fetchData
    });
    
    // Cleanup function
    return () => {
      mounted.current = false;
    };
  }, [fetchData, skip]);
  
  // Handle suspense (React 18+ feature)
  if (suspense && loading && !data && !error) {
    // Create a promise if we don't have one yet
    if (!suspensePromiseRef.current) {
      suspensePromiseRef.current = fetchData();
    }
    
    // Throw the promise to trigger suspense
    throw suspensePromiseRef.current;
  }
  
  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for useCachedApi with explicit typing
 */
export function createCachedApiHook<T>(apiService: ApiService) {
  return (
    endpoint: string,
    params?: QueryParams,
    options?: CachedApiOptions<T>
  ) => useCachedApi<T>(apiService, endpoint, params, options);
} 