/**
 * BatchRequestProvider
 * 
 * This provider manages batched API requests across the application.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { enhancedBatchClient, getBatchManager } from '../api/enhanced-batch-client';
import { BatchRequestManager, BatchRequestOptions } from '../api/batch-request';
import { performanceMonitor } from '../performance/performance-monitor';

// Context type
interface BatchRequestContextType {
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
  executeBatch: () => Promise<void>;
  
  /**
   * Whether the batch is currently executing
   */
  loading: boolean;
  
  /**
   * Number of requests in the batch queue
   */
  queueSize: number;
}

// Create context
const BatchRequestContext = createContext<BatchRequestContextType | null>(null);

// Provider props
interface BatchRequestProviderProps {
  children: React.ReactNode;
  options?: BatchRequestOptions;
  /**
   * Interval in milliseconds to automatically execute the batch
   * Set to 0 to disable auto-execution
   * Default: 100
   */
  autoExecuteInterval?: number;
}

/**
 * BatchRequestProvider Component
 * 
 * Provides batch request functionality to the application
 */
export function BatchRequestProvider({
  children,
  options = {},
  autoExecuteInterval = 100
}: BatchRequestProviderProps) {
  // Get or create the batch manager
  const batchManagerRef = useRef<BatchRequestManager>(getBatchManager(options));
  
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
    }, 50);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Execute the batch
  const executeBatch = useCallback(async () => {
    if (batchManagerRef.current.queueSize === 0 || loading) {
      return;
    }
    
    setLoading(true);
    performanceMonitor.markStart(`api:globalBatch:execute`);
    
    try {
      await batchManagerRef.current.execute();
    } finally {
      setLoading(false);
      performanceMonitor.markEnd(`api:globalBatch:execute`);
    }
  }, [loading]);
  
  // Auto-execute the batch
  useEffect(() => {
    if (autoExecuteInterval <= 0) {
      return;
    }
    
    const interval = setInterval(() => {
      if (batchManagerRef.current.queueSize > 0 && !loading) {
        executeBatch();
      }
    }, autoExecuteInterval);
    
    return () => {
      clearInterval(interval);
    };
  }, [autoExecuteInterval, executeBatch, loading]);
  
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
  
  // Context value
  const contextValue: BatchRequestContextType = {
    batchManager: batchManagerRef.current,
    get,
    post,
    put,
    patch,
    delete: deleteRequest,
    executeBatch,
    loading,
    queueSize
  };
  
  return (
    <BatchRequestContext.Provider value={contextValue}>
      {children}
    </BatchRequestContext.Provider>
  );
}

/**
 * Hook to use the batch request context
 */
export function useBatchRequest(): BatchRequestContextType {
  const context = useContext(BatchRequestContext);
  
  if (!context) {
    throw new Error('useBatchRequest must be used within a BatchRequestProvider');
  }
  
  return context;
}

export default BatchRequestProvider;
