/**
 * useSales Hook
 * 
 * This hook provides state management and operations for sales.
 */

import { useState, useEffect } from 'react';
// Import the new factory-based sales service
import salesService from '../services/factory-sales-service';
import { Sales } from '../types';

export interface UseSalesOptions {
  initialPage?: number;
  initialPageSize?: number;
  autoLoad?: boolean;
}

export function useSales(options: UseSalesOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, autoLoad = true } = options;
  
  const [items, setItems] = useState<Sales[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await salesService.fetchAll();
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
