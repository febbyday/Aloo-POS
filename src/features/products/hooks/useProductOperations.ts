/**
 * Product Operations Hook
 * 
 * This hook provides a simplified interface for common product operations.
 * It abstracts the complexity of the product store and service layer.
 */

import { useState, useCallback } from 'react';
import { useProductStore } from '../store';
import { 
  UnifiedProduct, 
  ProductFormData, 
  ProductVariant, 
  ProductStatus,
  StockStatus
} from '../types/unified-product.types';

/**
 * Hook for common product operations
 */
export function useProductOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get store actions
  const { 
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    updateProductStock,
    bulkUpdateProducts,
    bulkDeleteProducts,
    createVariant,
    updateVariant,
    deleteVariant,
    selectProduct,
    refreshProducts
  } = useProductStore();
  
  /**
   * Create a new product
   */
  const handleCreateProduct = useCallback(async (data: ProductFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const product = await createProduct(data);
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createProduct]);
  
  /**
   * Update an existing product
   */
  const handleUpdateProduct = useCallback(async (id: string, data: Partial<UnifiedProduct>) => {
    setLoading(true);
    setError(null);
    
    try {
      const product = await updateProduct(id, data);
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update product with ID ${id}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateProduct]);
  
  /**
   * Delete a product
   */
  const handleDeleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteProduct(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete product with ID ${id}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteProduct]);
  
  /**
   * Activate a product
   */
  const handleActivateProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const product = await updateProductStatus(id, ProductStatus.ACTIVE);
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to activate product with ID ${id}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateProductStatus]);
  
  /**
   * Deactivate a product
   */
  const handleDeactivateProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const product = await updateProductStatus(id, ProductStatus.INACTIVE);
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to deactivate product with ID ${id}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateProductStatus]);
  
  /**
   * Update product stock
   */
  const handleUpdateStock = useCallback(async (id: string, newStock: number, reason?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const product = await updateProductStock(id, newStock, reason);
      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update stock for product ${id}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateProductStock]);
  
  /**
   * Create a product variant
   */
  const handleCreateVariant = useCallback(async (productId: string, variantData: Omit<ProductVariant, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const variant = await createVariant(productId, variantData);
      return variant;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to create variant for product ${productId}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createVariant]);
  
  /**
   * Update a product variant
   */
  const handleUpdateVariant = useCallback(async (productId: string, variantId: string, data: Partial<ProductVariant>) => {
    setLoading(true);
    setError(null);
    
    try {
      const variant = await updateVariant(productId, variantId, data);
      return variant;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update variant ${variantId}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateVariant]);
  
  /**
   * Delete a product variant
   */
  const handleDeleteVariant = useCallback(async (productId: string, variantId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteVariant(productId, variantId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete variant ${variantId}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteVariant]);
  
  /**
   * Bulk update products
   */
  const handleBulkUpdateProducts = useCallback(async (ids: string[], changes: Partial<UnifiedProduct>) => {
    setLoading(true);
    setError(null);
    
    try {
      const count = await bulkUpdateProducts(ids, changes);
      await refreshProducts();
      return count;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update products';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bulkUpdateProducts, refreshProducts]);
  
  /**
   * Bulk delete products
   */
  const handleBulkDeleteProducts = useCallback(async (ids: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const count = await bulkDeleteProducts(ids);
      await refreshProducts();
      return count;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk delete products';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bulkDeleteProducts, refreshProducts]);
  
  /**
   * Select a product for editing
   */
  const handleSelectProduct = useCallback((id: string | null) => {
    selectProduct(id);
  }, [selectProduct]);
  
  return {
    // State
    loading,
    error,
    
    // Single product operations
    createProduct: handleCreateProduct,
    updateProduct: handleUpdateProduct,
    deleteProduct: handleDeleteProduct,
    activateProduct: handleActivateProduct,
    deactivateProduct: handleDeactivateProduct,
    updateStock: handleUpdateStock,
    selectProduct: handleSelectProduct,
    
    // Variant operations
    createVariant: handleCreateVariant,
    updateVariant: handleUpdateVariant,
    deleteVariant: handleDeleteVariant,
    
    // Bulk operations
    bulkUpdateProducts: handleBulkUpdateProducts,
    bulkDeleteProducts: handleBulkDeleteProducts,
  };
}

export default useProductOperations; 