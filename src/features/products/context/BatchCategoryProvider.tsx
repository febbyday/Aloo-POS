/**
 * BatchCategoryProvider
 * 
 * This provider manages product categories with optimized batch requests during initialization.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useProviderBatchInit } from '@/lib/hooks/useProviderBatchInit';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { logger } from '@/lib/logging/logger';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { performanceMonitor } from '@/lib/performance/performance-monitor';
import { Category, CategoryFormData, CategoryFilter, CategorySort } from '../types/category.types';
import { mockCategories } from '../mocks/categories';

// Helper function to build category hierarchy
function buildHierarchy(categories: Category[]): Category[] {
  const rootCategories = categories.filter(cat => !cat.parentId);
  
  const addChildren = (category: Category) => {
    const children = categories.filter(cat => cat.parentId === category.id);
    return {
      ...category,
      children: children.map(addChildren)
    };
  };
  
  return rootCategories.map(addChildren);
}

// Context type
interface BatchCategoryContextType {
  /**
   * List of categories
   */
  categories: Category[];
  
  /**
   * Whether categories are loading
   */
  loading: boolean;
  
  /**
   * Error that occurred during loading
   */
  error: Error | null;
  
  /**
   * Selected category IDs
   */
  selectedCategories: string[];
  
  /**
   * Category filters
   */
  filters: CategoryFilter;
  
  /**
   * Category sort
   */
  sort: CategorySort;
  
  /**
   * Pagination state
   */
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  
  /**
   * Set selected categories
   */
  setSelectedCategories: (ids: string[]) => void;
  
  /**
   * Set filters
   */
  setFilters: (filters: CategoryFilter) => void;
  
  /**
   * Set sort
   */
  setSort: (sort: CategorySort) => void;
  
  /**
   * Set pagination
   */
  setPagination: (pagination: { page: number; pageSize: number; total: number }) => void;
  
  /**
   * Add a new category
   */
  addCategory: (data: CategoryFormData) => Promise<void>;
  
  /**
   * Update a category
   */
  updateCategory: (id: string, data: Partial<CategoryFormData>) => Promise<void>;
  
  /**
   * Delete categories
   */
  deleteCategories: (ids: string[]) => Promise<void>;
  
  /**
   * Perform bulk action on categories
   */
  bulkAction: (action: string, ids: string[]) => Promise<void>;
  
  /**
   * Refresh categories
   */
  refreshCategories: () => Promise<void>;
  
  /**
   * Get category hierarchy
   */
  getCategoryHierarchy: () => Category[];
  
  /**
   * Move a category
   */
  moveCategory: (id: string, parentId: string | null) => Promise<void>;
  
  /**
   * Get child categories
   */
  getChildCategories: (parentId: string) => Category[];
  
  /**
   * Get category path
   */
  getCategoryPath: (id: string) => Category[];
}

// Create context
const BatchCategoryContext = createContext<BatchCategoryContextType | undefined>(undefined);

// Provider props
interface BatchCategoryProviderProps {
  children: ReactNode;
}

/**
 * BatchCategoryProvider Component
 * 
 * Provides category data with optimized batch requests during initialization.
 */
export function BatchCategoryProvider({ children }: BatchCategoryProviderProps) {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<CategoryFilter>({});
  const [sort, setSort] = useState<CategorySort>({ field: 'name', direction: 'asc' });
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
    providerName: 'category',
    autoInit: true,
    defaultPriority: RequestPriority.HIGH,
    dependencies: [isAuthenticated],
    onInitComplete: () => {
      logger.info('Category provider initialized successfully');
    },
    onInitError: (error) => {
      logger.error('Error initializing category provider', { error });
    }
  });
  
  // Fetch categories
  const fetchCategories = useCallback(async () => {
    performanceMonitor.markStart('category:fetchCategories');
    try {
      // Use batch request to fetch categories
      const categoriesData = await batchGet<Category[]>('categories/LIST', undefined, RequestPriority.HIGH);
      
      if (categoriesData && Array.isArray(categoriesData)) {
        setCategories(categoriesData);
        setPagination(prev => ({ ...prev, total: categoriesData.length }));
      } else {
        // Fallback to mock data if API fails
        setCategories(mockCategories);
        setPagination(prev => ({ ...prev, total: mockCategories.length }));
      }
    } catch (err) {
      logger.error('Error fetching categories', { error: err });
      // Fallback to mock data if API fails
      setCategories(mockCategories);
      setPagination(prev => ({ ...prev, total: mockCategories.length }));
    } finally {
      performanceMonitor.markEnd('category:fetchCategories');
    }
  }, [batchGet]);
  
  // Add a new category
  const addCategory = useCallback(async (data: CategoryFormData) => {
    performanceMonitor.markStart('category:addCategory');
    try {
      // Use batch request to add a new category
      const newCategory = await batchPost<Category>('categories/CREATE', data, RequestPriority.MEDIUM);
      
      if (newCategory) {
        setCategories(prev => [...prev, newCategory]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      }
    } catch (err) {
      logger.error('Error adding category', { error: err });
      throw err;
    } finally {
      performanceMonitor.markEnd('category:addCategory');
    }
  }, [batchPost]);
  
  // Update a category
  const updateCategory = useCallback(async (id: string, data: Partial<CategoryFormData>) => {
    performanceMonitor.markStart('category:updateCategory');
    try {
      // Use batch request to update a category
      const updatedCategory = await batchPost<Category>('categories/UPDATE', {
        id,
        ...data
      }, RequestPriority.MEDIUM);
      
      if (updatedCategory) {
        setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      }
    } catch (err) {
      logger.error('Error updating category', { error: err });
      throw err;
    } finally {
      performanceMonitor.markEnd('category:updateCategory');
    }
  }, [batchPost]);
  
  // Delete categories
  const deleteCategories = useCallback(async (ids: string[]) => {
    performanceMonitor.markStart('category:deleteCategories');
    try {
      // Use batch request to delete categories
      await batchPost('categories/DELETE', { ids }, RequestPriority.MEDIUM);
      
      // Update local state
      setCategories(prev => prev.filter(cat => !ids.includes(cat.id)));
      setPagination(prev => ({ ...prev, total: prev.total - ids.length }));
      setSelectedCategories([]);
    } catch (err) {
      logger.error('Error deleting categories', { error: err });
      throw err;
    } finally {
      performanceMonitor.markEnd('category:deleteCategories');
    }
  }, [batchPost]);
  
  // Perform bulk action on categories
  const bulkAction = useCallback(async (action: string, ids: string[]) => {
    performanceMonitor.markStart(`category:bulkAction:${action}`);
    try {
      // Use batch request to perform bulk action
      await batchPost('categories/BULK_ACTION', { action, ids }, RequestPriority.LOW);
      
      // Refresh categories after bulk action
      await fetchCategories();
    } catch (err) {
      logger.error('Error performing bulk action on categories', { error: err, action, ids });
      throw err;
    } finally {
      performanceMonitor.markEnd(`category:bulkAction:${action}`);
    }
  }, [batchPost, fetchCategories]);
  
  // Move a category
  const moveCategory = useCallback(async (id: string, parentId: string | null) => {
    performanceMonitor.markStart('category:moveCategory');
    try {
      // Use batch request to move a category
      await batchPost('categories/MOVE', { id, parentId }, RequestPriority.MEDIUM);
      
      // Update local state
      setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, parentId } : cat));
    } catch (err) {
      logger.error('Error moving category', { error: err });
      throw err;
    } finally {
      performanceMonitor.markEnd('category:moveCategory');
    }
  }, [batchPost]);
  
  // Refresh categories
  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);
  
  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitialized && !isInitializing) {
      logger.info('Initializing category provider');
      
      // Add requests to the batch
      fetchCategories();
      
      // Execute the batch
      initialize();
    }
  }, [isAuthenticated, isInitialized, isInitializing, fetchCategories, initialize]);
  
  // Context value
  const contextValue: BatchCategoryContextType = {
    categories,
    loading: isInitializing,
    error,
    selectedCategories,
    filters,
    sort,
    pagination,
    setSelectedCategories,
    setFilters,
    setSort,
    setPagination,
    addCategory,
    updateCategory,
    deleteCategories,
    bulkAction,
    refreshCategories,
    getCategoryHierarchy: () => buildHierarchy(categories),
    moveCategory,
    getChildCategories: (parentId: string) => categories.filter(cat => cat.parentId === parentId),
    getCategoryPath: (id: string) => {
      const category = categories.find(cat => cat.id === id);
      return category?.path?.map(id => categories.find(cat => cat.id === id)) ?? [];
    }
  };
  
  return (
    <BatchCategoryContext.Provider value={contextValue}>
      {children}
    </BatchCategoryContext.Provider>
  );
}

/**
 * Hook to use the batch category context
 */
export function useBatchCategory(): BatchCategoryContextType {
  const context = useContext(BatchCategoryContext);
  
  if (!context) {
    throw new Error('useBatchCategory must be used within a BatchCategoryProvider');
  }
  
  return context;
}

export default BatchCategoryProvider;
