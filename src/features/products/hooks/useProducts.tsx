import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/lib/api/services/product-service';
import { Product } from '@/lib/api/mock-data/products';
import { useToast } from '@/components/ui/use-toast';
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
      setProducts(response.data);
      setPagination({
        page: response.pagination.page,
        pageSize: response.pagination.pageSize,
        totalItems: response.pagination.totalItems,
        totalPages: response.pagination.totalPages,
      });
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
    successTitle: "Product created",
    successMessage: (response) => `${response.data.name} has been created successfully.`,
    showErrorToast: true,
    errorTitle: "Error creating product",
  });

  const createProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const result = await executeCreateProduct(product);
    return result?.data || null;
  }, [executeCreateProduct]);

  const {
    execute: executeUpdateProduct,
  } = useDataOperation({
    operation: async (id: string, product: Partial<Product>) => {
      const oldProduct = await productService.getById(id);
      const response = await productService.update(id, product);
      return { response, oldProduct };
    },
    onSuccess: (result) => {
      const { response, oldProduct } = result;
      
      setProducts(prev => prev.map(p => p.id === response.data.id ? response.data : p));
      
      eventBus.emit(POS_EVENTS.PRODUCT_UPDATED, {
        productId: response.data.id,
        changes: {
          ...Object.keys(result.response.data).reduce((acc, key) => {
            if (oldProduct.data?.[key as keyof Product] !== response.data[key as keyof Product]) {
              acc[key] = {
                from: oldProduct.data?.[key as keyof Product],
                to: response.data[key as keyof Product]
              };
            }
            return acc;
          }, {} as Record<string, { from: any; to: any }>)
        }
      });
      
      if (oldProduct.data?.price !== response.data.price) {
        eventBus.emit(POS_EVENTS.PRODUCT_PRICE_CHANGED, {
          productId: response.data.id,
          oldPrice: oldProduct.data?.price,
          newPrice: response.data.price,
        });
      }
    },
    onError: (err, id) => {
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to update product ${id}: ${err.message}`,
        source: 'useProducts.updateProduct',
      });
    },
    showSuccessToast: true,
    successTitle: "Product updated",
    successMessage: (result) => `${result.response.data.name} has been updated successfully.`,
    showErrorToast: true,
    errorTitle: "Error updating product",
  });

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    const result = await executeUpdateProduct(id, product);
    return result?.response.data || null;
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
    successTitle: "Product deleted",
    successMessage: "The product has been deleted successfully.",
    showErrorToast: true,
    errorTitle: "Error deleting product",
  });

  const deleteProduct = useCallback(async (id: string) => {
    const result = await executeDeleteProduct(id);
    return !!result;
  }, [executeDeleteProduct]);

  const {
    execute: executeLowInventoryProducts,
  } = useDataOperation({
    operation: productService.getLowInventory,
    onError: (err) => {
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to load low inventory products: ${err.message}`,
        source: 'useProducts.getLowInventoryProducts',
      });
    },
    showErrorToast: true,
    errorTitle: "Error loading low inventory products",
  });

  const getLowInventoryProducts = useCallback(async (threshold?: number) => {
    const result = await executeLowInventoryProducts(threshold);
    return result || [];
  }, [executeLowInventoryProducts]);

  useEffect(() => {
    if (autoLoad) {
      fetchProducts();
    }
  }, [fetchProducts, autoLoad]);

  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      page: 1,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      page,
    }));
  }, []);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowInventoryProducts,
    setPageSize,
    setPage,
  };
}

export default useProducts;
