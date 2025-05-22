/**
 * BatchedDataLoader Component
 * 
 * This component demonstrates how to use batched API requests to load data
 * from multiple endpoints in a single HTTP request.
 */

import React, { useEffect, useState } from 'react';
import { useBatchedRequests } from '@/lib/hooks/useBatchedRequests';
import { performanceMonitor } from '@/lib/performance/performance-monitor';

interface BatchedDataLoaderProps {
  /**
   * Endpoints to load data from
   */
  endpoints: string[];
  
  /**
   * Render function for the loaded data
   */
  children: (data: Record<string, any>, loading: boolean) => React.ReactNode;
  
  /**
   * Whether to automatically execute the batch
   * Default: true
   */
  autoExecute?: boolean;
  
  /**
   * Delay in milliseconds before executing the batch
   * Default: 100
   */
  batchDelay?: number;
}

/**
 * BatchedDataLoader Component
 * 
 * Loads data from multiple endpoints in a single batch request
 */
export function BatchedDataLoader({
  endpoints,
  children,
  autoExecute = true,
  batchDelay = 100
}: BatchedDataLoaderProps) {
  // State
  const [data, setData] = useState<Record<string, any>>({});
  
  // Use batched requests hook
  const { get, execute, loading, queueSize } = useBatchedRequests({
    useDedicatedManager: true,
    batchOptions: {
      maxBatchSize: endpoints.length,
      autoExecute: false
    },
    executeOnUnmount: false
  });
  
  // Load data from endpoints
  useEffect(() => {
    const loadData = async () => {
      performanceMonitor.markStart('batchedDataLoader:loadData');
      
      // Create a map of promises for each endpoint
      const promises: Record<string, Promise<any>> = {};
      
      // Add each endpoint to the batch
      for (const endpoint of endpoints) {
        // Use the endpoint as the key
        const key = endpoint.split('/').pop() || endpoint;
        promises[key] = get(endpoint);
      }
      
      // Wait for all promises to resolve
      const results = await Promise.allSettled(
        Object.entries(promises).map(async ([key, promise]) => {
          try {
            const result = await promise;
            return { key, data: result, success: true };
          } catch (error) {
            return { key, error, success: false };
          }
        })
      );
      
      // Process results
      const newData: Record<string, any> = {};
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { key, data, success } = result.value;
          
          if (success) {
            newData[key] = data;
          } else {
            newData[key] = null;
          }
        }
      }
      
      // Update state
      setData(newData);
      
      performanceMonitor.markEnd('batchedDataLoader:loadData');
    };
    
    // Load data
    loadData();
    
    // Execute batch after a delay
    if (autoExecute) {
      const timeout = setTimeout(() => {
        execute();
      }, batchDelay);
      
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [endpoints, get, execute, autoExecute, batchDelay]);
  
  // Render
  return <>{children(data, loading || queueSize > 0)}</>;
}

export default BatchedDataLoader;
