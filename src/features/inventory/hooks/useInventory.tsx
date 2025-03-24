/**
 * useInventory Hook
 * 
 * This hook provides state management and operations for inventory.
 */

import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Inventory } from '../types';

export interface UseInventoryOptions {
  initialPage?: number;
  initialPageSize?: number;
  autoLoad?: boolean;
}

export function useInventory(options: UseInventoryOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, autoLoad = true } = options;
  
  const [items, setItems] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await inventoryService.fetchAll();
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
