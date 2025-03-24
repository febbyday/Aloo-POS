/**
 * useStaff Hook
 * 
 * This hook provides state management and operations for staff.
 * Updated to use the standardized useDataOperation hook for consistent data operations.
 */

import { useState, useEffect } from 'react';
import { staffService } from '../services/staffService';
import { Staff } from '../types';
import { useDataOperation } from '@/hooks/useDataOperation';

export interface UseStaffOptions {
  initialPage?: number;
  initialPageSize?: number;
  autoLoad?: boolean;
}

export function useStaff(options: UseStaffOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, autoLoad = true } = options;
  
  const [items, setItems] = useState<Staff[]>([]);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  // Use the standardized useDataOperation hook for fetching staff data
  const { 
    execute: fetchData, 
    loading, 
    error 
  } = useDataOperation({
    operation: staffService.fetchAll,
    onSuccess: (data) => {
      setItems(data);
      setTotalItems(data.length);
    },
    showErrorToast: true,
    errorTitle: 'Error Loading Staff',
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
