/**
 * useMarkets Hook
 * 
 * This hook provides state management and operations for markets.
 */

import { useState, useEffect } from 'react';
import { marketsService } from '../services/marketsService';
import { Markets } from '../types';

export interface UseMarketsOptions {
  initialPage?: number;
  initialPageSize?: number;
  autoLoad?: boolean;
}

export function useMarkets(options: UseMarketsOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, autoLoad = true } = options;
  
  const [items, setItems] = useState<Markets[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await marketsService.fetchAll();
      setItems(data);
      setTotalItems(data.length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      fetchItems();
    }
  }, [page, pageSize]);

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
