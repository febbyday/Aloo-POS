/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 */
import { useState, useEffect, useCallback } from 'react';
import productService from '../services/factory-product-service';
import { Product } from '../types';
import { useToast } from '@/lib/toast';
import { eventBus, POS_EVENTS } from '@/lib/events/event-bus';
import { useDataOperation } from '@/hooks/useDataOperation';

interface UseProductsOptions {
  initialPageSize?: number;
  initialPage?: number;
  autoLoad?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const {
    initialPageSize = 10,
    initialPage = 1,
    autoLoad = true
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize: initialPageSize,
    totalItems: 0,
    totalPages: 0,
  });

  const { toast } = useToast();

  const {
    execute: executeFetchProducts,
    loading,
    error
  } = useDataOperation({
    operation: async (page = pagination.page, pageSize = pagination.pageSize, search?: string) => {
      const response = await productService.getAll({
        page,
        pageSize,
        search,
      });
      return response;
    },
    onSuccess: (response) => {
      // Handle different response formats from the factory-based service
      let productData = [];
      let paginationData = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems: 0,
        totalPages: 1
      };

      if (Array.isArray(response)) {
        // Handle array response
        productData = response;
        paginationData = {
          ...paginationData,
          totalItems: response.length,
          totalPages: Math.ceil(response.length / paginationData.pageSize)
        };
      } else if (response && typeof response === 'object') {
        // Handle object response with data property
        if ('data' in response) {
          productData = response.data;
        } else if ('products' in response) {
          productData = response.products;
        } else {
          productData = [];
        }

        // Extract pagination data
        if ('pagination' in response) {
          paginationData = {
            page: response.pagination.page || pagination.page,
            pageSize: response.pagination.pageSize || pagination.pageSize,
            totalItems: response.pagination.totalItems || productData.length,
            totalPages: response.pagination.totalPages ||
                        Math.ceil((response.pagination.totalItems || productData.length) /
                                 (response.pagination.pageSize || pagination.pageSize))
          };
        } else {
          // Try to extract pagination data from response root
          paginationData = {
            page: response.page || pagination.page,
            pageSize: response.pageSize || response.limit || pagination.pageSize,
            totalItems: response.totalItems || response.total || productData.length,
            totalPages: response.totalPages ||
                        Math.ceil((response.totalItems || response.total || productData.length) /
                                 (response.pageSize || response.limit || pagination.pageSize))
          };
        }
      }

      setProducts(productData);
      setPagination(paginationData);
    },
    onError: (err) => {
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to load products: ${err.message}`,
        source: 'useProducts.fetchProducts',
      });
    },
    showErrorToast: true,
    errorTitle: "Error loading products",
  });

  const fetchProducts = useCallback(async (page = pagination.page, pageSize = pagination.pageSize, search?: string) => {
    await executeFetchProducts(page, pageSize, search);
  }, [pagination.page, pagination.pageSize, executeFetchProducts]);

  const {
    execute: executeFetchProductById,
  } = useDataOperation({
    operation: productService.getById,
    onError: (err, productId) => {
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to load product ${productId}: ${err.message}`,
        source: 'useProducts.fetchProductById',
      });
    },
    showErrorToast: true,
    errorTitle: "Error loading product",
  });

  const fetchProductById = useCallback(async (id: string) => {
    const result = await executeFetchProductById(id);
    return result?.data || null;
  }, [executeFetchProductById]);

  const {
    execute: executeCreateProduct,
  } = useDataOperation({
    operation: productService.create,
    onSuccess: (response) => {
      setProducts(prev => [...prev, response.data]);

      eventBus.emit(POS_EVENTS.PRODUCT_CREATED, response.data.id);
    },
    onError: (err) => {
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to create product: ${err.message}`,
        source: 'useProducts.createProduct',
      });
    },
    showSuccessToast: true,
    successTitle: "Product Created",
    successMessage: "New product has been created successfully",
  });

  const createProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const result = await executeCreateProduct(product);
    return result?.data || null;
  }, [executeCreateProduct]);

  const {
    execute: executeUpdateProduct,
  } = useDataOperation({
    operation: productService.update,
    onSuccess: (response) => {
      setProducts(prev => prev.map(p =>
        p.id === response.data.id ? response.data : p
      ));

      eventBus.emit(POS_EVENTS.PRODUCT_UPDATED, response.data.id);
    },
    onError: (err, id) => {
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to update product ${id}: ${err.message}`,
        source: 'useProducts.updateProduct',
      });
    },
    showSuccessToast: true,
    successTitle: "Product Updated",
    successMessage: "Product has been updated successfully",
  });

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const result = await executeUpdateProduct(id, updates);
    return result?.data || null;
  }, [executeUpdateProduct]);

  const {
    execute: executeDeleteProduct,
  } = useDataOperation({
    operation: productService.delete,
    onSuccess: (_, id) => {
      setProducts(prev => prev.filter(p => p.id !== id));

      eventBus.emit(POS_EVENTS.PRODUCT_DELETED, id);
    },
    onError: (err, id) => {
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to delete product ${id}: ${err.message}`,
        source: 'useProducts.deleteProduct',
      });
    },
    showSuccessToast: true,
    successTitle: "Product Deleted",
    successMessage: "Product has been deleted successfully",
  });

  const deleteProduct = useCallback(async (id: string) => {
    await executeDeleteProduct(id);
  }, [executeDeleteProduct]);

  const {
    execute: executeUpdateProductImage,
    loading: uploadingImage,
  } = useDataOperation({
    operation: productService.updateImage,
    onSuccess: (response) => {
      setProducts(prev => prev.map(p =>
        p.id === response.data.id ? response.data : p
      ));

      eventBus.emit(POS_EVENTS.PRODUCT_UPDATED, response.data.id);
    },
    onError: (err, id) => {
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to update product image for ${id}: ${err.message}`,
        source: 'useProducts.updateProductImage',
      });
    },
    showSuccessToast: true,
    successTitle: "Image Updated",
    successMessage: "Product image has been updated successfully",
  });

  const updateProductImage = useCallback(async (id: string, imageFile: File) => {
    const result = await executeUpdateProductImage(id, imageFile);
    return result?.data || null;
  }, [executeUpdateProductImage]);

  const {
    execute: executeBulkUpdateProducts,
  } = useDataOperation({
    operation: productService.bulkUpdate,
    onSuccess: (response) => {
      // Refresh the product list after bulk update
      fetchProducts();

      eventBus.emit(POS_EVENTS.PRODUCTS_BULK_UPDATED, response.data.map(p => p.id));
    },
    onError: (err) => {
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to perform bulk update: ${err.message}`,
        source: 'useProducts.bulkUpdateProducts',
      });
    },
    showSuccessToast: true,
    successTitle: "Bulk Update Completed",
    successMessage: "Products have been updated successfully",
  });

  const bulkUpdateProducts = useCallback(async (updates: Array<{ id: string; updates: Partial<Product> }>) => {
    const result = await executeBulkUpdateProducts(updates);
    return result?.data || [];
  }, [executeBulkUpdateProducts]);

  const {
    execute: executeBulkDeleteProducts,
  } = useDataOperation({
    operation: productService.bulkDelete,
    onSuccess: (_, ids: string[]) => {
      setProducts(prev => prev.filter(p => !ids.includes(p.id)));

      eventBus.emit(POS_EVENTS.PRODUCTS_BULK_DELETED, ids);
    },
    onError: (err) => {
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to perform bulk delete: ${err.message}`,
        source: 'useProducts.bulkDeleteProducts',
      });
    },
    showSuccessToast: true,
    successTitle: "Bulk Delete Completed",
    successMessage: "Products have been deleted successfully",
  });

  const bulkDeleteProducts = useCallback(async (ids: string[]) => {
    await executeBulkDeleteProducts(ids);
  }, [executeBulkDeleteProducts]);

  useEffect(() => {
    if (autoLoad) {
      fetchProducts();
    }
  }, [autoLoad, fetchProducts]);

  return {
    products,
    pagination,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductImage,
    uploadingImage,
    bulkUpdateProducts,
    bulkDeleteProducts,
  };
}

export default useProducts;
