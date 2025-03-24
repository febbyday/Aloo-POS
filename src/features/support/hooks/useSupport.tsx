/**
 * useSupport Hook
 * 
 * This hook provides state management and operations for support.
 * Updated to use the standardized useDataOperation hook for consistent data operations.
 */

import { useState, useEffect } from 'react';
import { supportService } from '../services/supportService';
import { Support } from '../types';
import { useDataOperation } from '@/hooks/useDataOperation';

export interface UseSupportOptions {
  initialPage?: number;
  initialPageSize?: number;
  autoLoad?: boolean;
}

export function useSupport(options: UseSupportOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, autoLoad = true } = options;
  
  const [items, setItems] = useState<Support[]>([]);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  // Use the standardized useDataOperation hook instead of manual loading/error management
  const { 
    execute: fetchData, 
    loading, 
    error 
  } = useDataOperation({
    operation: supportService.fetchAll,
    onSuccess: (data) => {
      setItems(data);
      setTotalItems(data.length);
    },
    showErrorToast: true,
    errorTitle: 'Support Data Error',
    showSuccessToast: false
  });

  const fetchItems = async () => {
    await fetchData();
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
