/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * useApiTransition Hook
 * 
 * A custom hook to help components transition smoothly from mock data to real API endpoints.
 * It provides error handling, loading states, and fallback data during the transition period.
 */

import { useState, useEffect, useCallback } from 'react';
import { safeApiCall } from '@/lib/api/api-error-handler';
import { ApiResponse } from '@/lib/api/api-client';

interface ApiTransitionOptions<T> {
  // The API call to make
  apiCall: () => Promise<ApiResponse<T>>;
  
  // Optional mock data to use as fallback
  fallbackData?: T;
  
  // Whether to automatically retry the API call on error
  autoRetry?: boolean;
  
  // Delay in ms between retries
  retryDelay?: number;
  
  // Maximum number of retry attempts
  maxRetries?: number;
  
  // Whether to suppress error messages
  silent?: boolean;
  
  // Dependencies array for the hook (like useEffect)
  dependencies?: any[];
}

interface ApiTransitionResult<T> {
  // The data returned from the API or fallback
  data: T | null;
  
  // Whether the data came from fallback source
  isFallback: boolean;
  
  // Error if any occurred
  error: Error | null;
  
  // Loading state
  isLoading: boolean;
  
  // Function to manually trigger a retry
  retry: () => void;
  
  // Whether the API call has succeeded
  isSuccess: boolean;
}

/**
 * Hook for handling API transitions from mock to real data
 */
export function useApiTransition<T>({
  apiCall,
  fallbackData = null as unknown as T,
  autoRetry = false,
  retryDelay = 3000,
  maxRetries = 2,
  silent = false,
  dependencies = []
}: ApiTransitionOptions<T>): ApiTransitionResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  // Function to fetch data from the API
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the safe API call utility to make the request
      const response = await safeApiCall(() => apiCall(), silent);
      
      if (response.success) {
        setData(response.data);
        setIsFallback(false);
        setIsSuccess(true);
      } else {
        // If the API call failed but we have fallback data
        if (fallbackData !== null) {
          setData(fallbackData);
          setIsFallback(true);
        }
        
        if (response.error) {
          throw new Error(response.error);
        }
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      
      // Use fallback data on error if available
      if (fallbackData !== null) {
        setData(fallbackData);
        setIsFallback(true);
      }
      
      // Auto-retry if enabled and not exceeded max retries
      if (autoRetry && retryCount < maxRetries) {
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);
        
        setTimeout(() => {
          fetchData();
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, fallbackData, autoRetry, retryDelay, maxRetries, retryCount, silent]);
  
  // Manual retry function
  const retry = useCallback(() => {
    setRetryCount(0);
    fetchData();
  }, [fetchData]);
  
  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [...dependencies, fetchData]);
  
  return {
    data,
    isFallback,
    error,
    isLoading,
    retry,
    isSuccess
  };
}

/**
 * Hook for handling paginated API transitions from mock to real data
 */
export function usePaginatedApiTransition<T>({
  apiCall,
  fallbackData = [] as unknown as T[],
  autoRetry = false,
  retryDelay = 3000,
  maxRetries = 2,
  silent = false,
  dependencies = []
}: ApiTransitionOptions<T[]>) {
  const {
    data,
    isFallback,
    error,
    isLoading,
    retry,
    isSuccess
  } = useApiTransition<T[]>({
    apiCall,
    fallbackData,
    autoRetry,
    retryDelay,
    maxRetries,
    silent,
    dependencies
  });
  
  // Default pagination data if we're using fallback
  const [pagination, setPagination] = useState({
    page: 1,
    limit: fallbackData?.length || 20,
    total: fallbackData?.length || 0,
    totalPages: fallbackData?.length ? 1 : 0
  });
  
  // Update pagination data when the API call succeeds
  useEffect(() => {
    if (!isFallback && data && !isLoading && !error) {
      // Get pagination data from API response
      const apiResponse = apiCall() as Promise<any>;
      apiResponse.then(response => {
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }).catch(() => {
        // Ignore errors here, they're handled by the main hook
      });
    }
  }, [data, isFallback, isLoading, error, apiCall]);
  
  return {
    data,
    isFallback,
    error,
    isLoading,
    retry,
    isSuccess,
    pagination
  };
}

export default useApiTransition;
