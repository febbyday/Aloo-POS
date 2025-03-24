/**
 * Product Filters Hook
 * 
 * This hook provides a simplified interface for filtering products.
 * It abstracts the complexity of the product store's filter state.
 */

import { useCallback } from 'react';
import { useProductStore } from '../store';
import { InventoryFilter } from '../types/unified-product.types';

/**
 * Hook for product filtering
 */
export function useProductFilters() {
  // Get store actions and state
  const { 
    filter,
    setFilter,
    resetFilter,
    setPage,
    setLimit,
    fetchProducts,
    refreshProducts
  } = useProductStore();
  
  /**
   * Apply filters and fetch products
   */
  const applyFilters = useCallback(async (newFilters: Partial<InventoryFilter>) => {
    const updatedFilter = {
      ...filter,
      ...newFilters,
      // Reset to page 1 when filters change (unless explicitly setting page)
      page: newFilters.page || 1,
    };
    
    setFilter(updatedFilter);
    return fetchProducts(updatedFilter);
  }, [filter, setFilter, fetchProducts]);
  
  /**
   * Reset filters to defaults and fetch products
   */
  const clearFilters = useCallback(async () => {
    resetFilter();
    return refreshProducts();
  }, [resetFilter, refreshProducts]);
  
  /**
   * Set current page and fetch products
   */
  const changePage = useCallback(async (page: number) => {
    setPage(page);
    return fetchProducts({
      ...filter,
      page,
    });
  }, [filter, setPage, fetchProducts]);
  
  /**
   * Set items per page and fetch products
   */
  const changeLimit = useCallback(async (limit: number) => {
    setLimit(limit);
    return fetchProducts({
      ...filter,
      limit,
      page: 1, // Reset to page 1 when limit changes
    });
  }, [filter, setLimit, fetchProducts]);
  
  /**
   * Set search query and fetch products
   */
  const searchProducts = useCallback(async (query: string) => {
    return applyFilters({
      search: query,
    });
  }, [applyFilters]);
  
  /**
   * Filter by category and fetch products
   */
  const filterByCategory = useCallback(async (categoryId: string | null) => {
    return applyFilters({
      categoryId,
    });
  }, [applyFilters]);
  
  /**
   * Filter by multiple categories and fetch products
   */
  const filterByCategories = useCallback(async (categories: string[]) => {
    return applyFilters({
      categories,
    });
  }, [applyFilters]);
  
  /**
   * Filter by stock status and fetch products
   */
  const filterByStockStatus = useCallback(async (stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'all') => {
    return applyFilters({
      stockStatus,
    });
  }, [applyFilters]);
  
  /**
   * Filter by price range and fetch products
   */
  const filterByPriceRange = useCallback(async (min?: number, max?: number) => {
    return applyFilters({
      priceRange: {
        min,
        max,
      },
    });
  }, [applyFilters]);
  
  /**
   * Filter by brand and fetch products
   */
  const filterByBrand = useCallback(async (brand: string) => {
    return applyFilters({
      brand,
    });
  }, [applyFilters]);
  
  /**
   * Filter by supplier and fetch products
   */
  const filterBySupplier = useCallback(async (supplier: string) => {
    return applyFilters({
      supplier,
    });
  }, [applyFilters]);
  
  /**
   * Filter by featured status and fetch products
   */
  const filterByFeatured = useCallback(async (featured: boolean) => {
    return applyFilters({
      featured,
    });
  }, [applyFilters]);
  
  /**
   * Sort products and fetch
   */
  const sortProducts = useCallback(async (
    sortBy: 'name' | 'price' | 'stock' | 'createdAt',
    sortDirection: 'asc' | 'desc' = 'asc'
  ) => {
    return applyFilters({
      sortBy,
      sortDirection,
    });
  }, [applyFilters]);
  
  /**
   * Filter by multiple locations and fetch products
   */
  const filterByLocations = useCallback(async (locations: string[]) => {
    return applyFilters({
      locations,
    });
  }, [applyFilters]);
  
  return {
    // Current filter state
    currentFilter: filter,
    
    // Filter actions
    applyFilters,
    clearFilters,
    changePage,
    changeLimit,
    searchProducts,
    filterByCategory,
    filterByCategories,
    filterByStockStatus,
    filterByPriceRange,
    filterByBrand,
    filterBySupplier,
    filterByFeatured,
    filterByLocations,
    sortProducts,
  };
}

export default useProductFilters; 