/**
 * useStore Hook
 * 
 * This hook provides state management and operations for store.
 */

import { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Store } from '../types';

export interface UseStoreOptions {
  initialPage?: number;
  initialPageSize?: number;
  autoLoad?: boolean;
}

export function useStore(options: UseStoreOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, autoLoad = true } = options;
  
  const [items, setItems] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await storeService.fetchAll();
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
