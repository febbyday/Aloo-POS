/**
 * useShops Hook
 * 
 * This hook provides state management and operations for shops.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { shopsService } from '../services/shopsService';
import { Shop } from '../types/shops.types';
import { useToast } from '@/components/ui/use-toast';

export interface UseShopsOptions {
  initialPage?: number;
  initialPageSize?: number;
  autoLoad?: boolean;
}

export function useShops(options: UseShopsOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, autoLoad = true } = options;
  
  const [items, setItems] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  
  // Request ID reference to maintain consistent request ID across renders
  const requestIdRef = useRef(`fetchShops_${Date.now()}`);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Pass the request ID to fetchAll
      const data = await shopsService.fetchAll(requestIdRef.current);
      setItems(data);
      setTotalItems(data.length);
    } catch (err) {
      // Ignore AbortError as it's expected when a request is canceled
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Fetch operation was aborted');
        return;
      }
      
      console.error('Error fetching shops:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching shops';
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast({
        title: "Error fetching shops",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (autoLoad) {
      fetchItems();
    }
    
    // Clean up the request when the component unmounts
    return () => {
      shopsService.cancelAllRequests();
    };
  }, [fetchItems, autoLoad, page, pageSize]);

  return {
    items,
    loading,
    error,
    page,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    refresh: fetchItems
  };
}
