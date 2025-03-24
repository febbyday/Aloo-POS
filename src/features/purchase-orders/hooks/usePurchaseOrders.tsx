/**
 * usePurchaseOrders Hook
 * 
 * This hook provides state management and operations for purchaseOrders.
 */

import { useState, useEffect } from 'react';
import { purchaseOrdersService } from '../services/purchaseOrdersService';
import { PurchaseOrders } from '../types';

export interface UsePurchaseOrdersOptions {
  initialPage?: number;
  initialPageSize?: number;
  autoLoad?: boolean;
}

export function usePurchaseOrders(options: UsePurchaseOrdersOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, autoLoad = true } = options;
  
  const [items, setItems] = useState<PurchaseOrders[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await purchaseOrdersService.fetchAll();
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
