/**
 * Inventory Hooks
 * 
 * Custom hooks for inventory-related functionality.
 */
import { useState, useEffect, useCallback } from 'react';
import { 
  inventoryService, 
  StockReceipt, 
  StockTransfer, 
  StockAdjustment, 
  InventoryHistory, 
  StockAlert,
  PaginationParams,
  FilterParams,
  SortParams,
  PaginatedResponse
} from '../services/inventoryService';

// Hook for stock receipts
export function useStockReceipts(productId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<PaginatedResponse<StockReceipt> | null>(null);
  const [params, setParams] = useState<PaginationParams & FilterParams & SortParams>({
    page: 1,
    limit: 5,
    field: 'date',
    direction: 'desc'
  });

  const fetchReceipts = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await inventoryService.getStockReceipts(productId, params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [productId, params]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const updateParams = useCallback((newParams: Partial<PaginationParams & FilterParams & SortParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const createReceipt = useCallback(async (data: Omit<StockReceipt, 'id' | 'date'>) => {
    setLoading(true);
    setError(null);
    
    try {
      await inventoryService.createStockReceipt(data);
      fetchReceipts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [fetchReceipts]);

  return {
    receipts: data?.data || [],
    pagination: data ? {
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages
    } : null,
    loading,
    error,
    updateParams,
    createReceipt,
    refresh: fetchReceipts
  };
}

// Hook for stock transfers
export function useStockTransfers(productId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<PaginatedResponse<StockTransfer> | null>(null);
  const [params, setParams] = useState<PaginationParams & FilterParams & SortParams>({
    page: 1,
    limit: 5,
    field: 'date',
    direction: 'desc'
  });

  const fetchTransfers = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await inventoryService.getStockTransfers(productId, params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [productId, params]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const updateParams = useCallback((newParams: Partial<PaginationParams & FilterParams & SortParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const createTransfer = useCallback(async (data: Omit<StockTransfer, 'id' | 'date' | 'status'>) => {
    setLoading(true);
    setError(null);
    
    try {
      await inventoryService.createStockTransfer(data);
      fetchTransfers();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [fetchTransfers]);

  return {
    transfers: data?.data || [],
    pagination: data ? {
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages
    } : null,
    loading,
    error,
    updateParams,
    createTransfer,
    refresh: fetchTransfers
  };
}

// Hook for stock adjustments
export function useStockAdjustments(productId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<PaginatedResponse<StockAdjustment> | null>(null);
  const [params, setParams] = useState<PaginationParams & FilterParams & SortParams>({
    page: 1,
    limit: 5,
    field: 'date',
    direction: 'desc'
  });

  const fetchAdjustments = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await inventoryService.getStockAdjustments(productId, params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [productId, params]);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  const updateParams = useCallback((newParams: Partial<PaginationParams & FilterParams & SortParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const createAdjustment = useCallback(async (data: Omit<StockAdjustment, 'id' | 'date'>) => {
    setLoading(true);
    setError(null);
    
    try {
      await inventoryService.createStockAdjustment(data);
      fetchAdjustments();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [fetchAdjustments]);

  return {
    adjustments: data?.data || [],
    pagination: data ? {
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages
    } : null,
    loading,
    error,
    updateParams,
    createAdjustment,
    refresh: fetchAdjustments
  };
}

// Hook for inventory history
export function useInventoryHistory(productId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<PaginatedResponse<InventoryHistory> | null>(null);
  const [params, setParams] = useState<PaginationParams & FilterParams & SortParams>({
    page: 1,
    limit: 5,
    field: 'date',
    direction: 'desc'
  });

  const fetchHistory = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await inventoryService.getInventoryHistory(productId, params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [productId, params]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const updateParams = useCallback((newParams: Partial<PaginationParams & FilterParams & SortParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    history: data?.data || [],
    pagination: data ? {
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages
    } : null,
    loading,
    error,
    updateParams,
    refresh: fetchHistory
  };
}

// Hook for stock alerts
export function useStockAlerts(productId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<PaginatedResponse<StockAlert> | null>(null);
  const [params, setParams] = useState<PaginationParams & FilterParams & SortParams>({
    page: 1,
    limit: 5,
    field: 'current',
    direction: 'asc'
  });

  const fetchAlerts = useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await inventoryService.getStockAlerts(productId, params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [productId, params]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const updateParams = useCallback((newParams: Partial<PaginationParams & FilterParams & SortParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const updateAlert = useCallback(async (alertId: string, data: Partial<StockAlert>) => {
    setLoading(true);
    setError(null);
    
    try {
      await inventoryService.updateStockAlert(alertId, data);
      fetchAlerts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [fetchAlerts]);

  return {
    alerts: data?.data || [],
    pagination: data ? {
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages
    } : null,
    loading,
    error,
    updateParams,
    updateAlert,
    refresh: fetchAlerts
  };
}
