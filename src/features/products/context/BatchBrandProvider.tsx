import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useProviderBatchInit } from '@/lib/hooks/useProviderBatchInit';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { logger } from '@/lib/logging/logger';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { performanceMonitor } from '@/lib/performance/performance-monitor';
import { 
  Brand, 
  BrandFormData, 
  BrandFilter, 
  BrandSort, 
  BrandBulkAction 
} from '../types/brand';
import { batchBrandService } from '../services/batch-brand-service';

// Mock brands data for fallback
import { mockBrands } from '../data/mockBrands';

interface BatchBrandContextType {
  brands: Brand[];
  loading: boolean;
  error: Error | null;
  selectedBrands: string[];
  filters: BrandFilter;
  sort: BrandSort;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  setSelectedBrands: (ids: string[]) => void;
  setFilters: (filters: BrandFilter) => void;
  setSort: (sort: BrandSort) => void;
  setPagination: (pagination: { page: number, pageSize: number }) => void;
  addBrand: (data: BrandFormData) => Promise<void>;
  updateBrand: (id: string, data: BrandFormData) => Promise<void>;
  deleteBrands: (ids: string[]) => Promise<void>;
  bulkAction: (action: BrandBulkAction) => Promise<void>;
  refreshBrands: () => Promise<void>;
}

export const BatchBrandContext = createContext<BatchBrandContextType | undefined>(undefined);

interface BatchBrandProviderProps {
  children: ReactNode;
}

/**
 * BatchBrandProvider Component
 * 
 * Provides brand data with optimized batch requests during initialization.
 */
export function BatchBrandProvider({ children }: BatchBrandProviderProps) {
  // State
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [filters, setFilters] = useState<BrandFilter>({});
  const [sort, setSort] = useState<BrandSort>({ field: 'name', direction: 'asc' });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  
  // Get auth context
  const { isAuthenticated } = useAuth();
  
  // Use provider batch initialization
  const {
    batchGet,
    batchPost,
    isInitializing,
    isInitialized,
    error,
    initialize
  } = useProviderBatchInit({
    providerName: 'brand',
    autoInit: true,
    defaultPriority: RequestPriority.MEDIUM,
    dependencies: [isAuthenticated],
    onInitComplete: () => {
      logger.info('Brand provider initialized successfully');
    },
    onInitError: (error) => {
      logger.error('Error initializing brand provider', { error });
    }
  });
  
  // Fetch brands
  const fetchBrands = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      performanceMonitor.markStart('brand:fetchBrands');
      const fetchedBrands = await batchGet<Brand[]>('brands/LIST', filters, RequestPriority.MEDIUM);
      
      if (fetchedBrands) {
        setBrands(fetchedBrands);
        setPagination(prev => ({ ...prev, total: fetchedBrands.length }));
      } else {
        // Fallback to mock data if API returns nothing
        setBrands(mockBrands);
        setPagination(prev => ({ ...prev, total: mockBrands.length }));
      }
    } catch (err) {
      logger.error('Error fetching brands', { error: err });
      // Fallback to mock data on error
      setBrands(mockBrands);
      setPagination(prev => ({ ...prev, total: mockBrands.length }));
    } finally {
      performanceMonitor.markEnd('brand:fetchBrands');
    }
  }, [batchGet, filters, isAuthenticated]);
  
  // Add a new brand
  const addBrand = useCallback(async (data: BrandFormData) => {
    performanceMonitor.markStart('brand:addBrand');
    try {
      // Use batch request to add a new brand
      const newBrand = await batchPost<Brand>('brands/CREATE', data, RequestPriority.MEDIUM);
      
      if (newBrand) {
        setBrands(prev => [...prev, newBrand]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      }
    } catch (err) {
      logger.error('Error adding brand', { error: err });
      throw err;
    } finally {
      performanceMonitor.markEnd('brand:addBrand');
    }
  }, [batchPost]);
  
  // Update an existing brand
  const updateBrand = useCallback(async (id: string, data: BrandFormData) => {
    performanceMonitor.markStart(`brand:updateBrand:${id}`);
    try {
      // Use batch request to update a brand
      const updatedBrand = await batchPost<Brand>('brands/UPDATE', {
        id,
        ...data
      }, RequestPriority.MEDIUM);
      
      if (updatedBrand) {
        setBrands(prev => prev.map(brand => 
          brand.id === id ? updatedBrand : brand
        ));
      }
    } catch (err) {
      logger.error('Error updating brand', { error: err, brandId: id });
      throw err;
    } finally {
      performanceMonitor.markEnd(`brand:updateBrand:${id}`);
    }
  }, [batchPost]);
  
  // Delete brands
  const deleteBrands = useCallback(async (ids: string[]) => {
    performanceMonitor.markStart('brand:deleteBrands');
    try {
      // Use batch request to delete brands
      await batchPost('brands/DELETE_MANY', { ids }, RequestPriority.MEDIUM);
      
      // Update local state
      setBrands(prev => prev.filter(brand => !ids.includes(brand.id)));
      setSelectedBrands([]);
      setPagination(prev => ({ ...prev, total: prev.total - ids.length }));
    } catch (err) {
      logger.error('Error deleting brands', { error: err, brandIds: ids });
      throw err;
    } finally {
      performanceMonitor.markEnd('brand:deleteBrands');
    }
  }, [batchPost]);
  
  // Bulk actions
  const bulkAction = useCallback(async (action: BrandBulkAction) => {
    performanceMonitor.markStart(`brand:bulkAction:${action.type}`);
    try {
      switch (action.type) {
        case 'delete':
          await deleteBrands(action.ids);
          break;
        case 'status':
          // Use batch request to update brand status
          await batchPost('brands/UPDATE_STATUS', {
            ids: action.ids,
            status: action.value
          }, RequestPriority.MEDIUM);
          
          // Update local state
          setBrands(prev => prev.map(brand => 
            action.ids.includes(brand.id) 
              ? { ...brand, status: action.value, updatedAt: new Date().toISOString() }
              : brand
          ));
          break;
      }
    } catch (err) {
      logger.error('Error performing bulk action', { error: err, action });
      throw err;
    } finally {
      performanceMonitor.markEnd(`brand:bulkAction:${action.type}`);
    }
  }, [batchPost, deleteBrands]);
  
  // Refresh brands
  const refreshBrands = useCallback(async () => {
    await fetchBrands();
  }, [fetchBrands]);
  
  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitialized && !isInitializing) {
      logger.info('Initializing brand provider');
      
      // Add requests to the batch
      fetchBrands();
      
      // Execute the batch
      initialize();
    }
  }, [isAuthenticated, isInitialized, isInitializing, fetchBrands, initialize]);
  
  // Context value
  const contextValue: BatchBrandContextType = {
    brands,
    loading: isInitializing,
    error,
    selectedBrands,
    filters,
    sort,
    pagination,
    setSelectedBrands,
    setFilters,
    setSort,
    setPagination,
    addBrand,
    updateBrand,
    deleteBrands,
    bulkAction,
    refreshBrands
  };
  
  return (
    <BatchBrandContext.Provider value={contextValue}>
      {children}
    </BatchBrandContext.Provider>
  );
}

export function useBatchBrands() {
  const context = useContext(BatchBrandContext);
  if (context === undefined) {
    throw new Error('useBatchBrands must be used within a BatchBrandProvider');
  }
  return context;
}

// For backward compatibility
export const useBrands = useBatchBrands;
