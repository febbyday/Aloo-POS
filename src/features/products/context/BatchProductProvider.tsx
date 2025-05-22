/**
 * BatchProductProvider
 * 
 * This provider manages product data with optimized batch requests during initialization.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useProviderBatchInit } from '@/lib/hooks/useProviderBatchInit';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { logger } from '@/lib/logging/logger';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { performanceMonitor } from '@/lib/performance/performance-monitor';
import { useBatchCategory } from './BatchCategoryProvider';
import { 
  Product, 
  Category, 
  PriceHistory, 
  SpecialPrice, 
  CustomerGroup, 
  ProductAttribute,
  BulkPriceUpdate
} from '../types/product.types';

// Context type
interface BatchProductContextType {
  /**
   * List of products
   */
  products: Product[];
  
  /**
   * List of categories
   */
  categories: Category[];
  
  /**
   * Price history
   */
  priceHistory: PriceHistory[];
  
  /**
   * Special prices
   */
  specialPrices: SpecialPrice[];
  
  /**
   * Customer groups
   */
  customerGroups: CustomerGroup[];
  
  /**
   * Product attributes
   */
  attributes: ProductAttribute[];
  
  /**
   * Whether products are loading
   */
  loading: boolean;
  
  /**
   * Error that occurred during loading
   */
  error: Error | null;
  
  /**
   * Get a product by ID
   */
  getProduct: (id: string) => Promise<Product | null>;
  
  /**
   * Add a new product
   */
  addProduct: (product: Product) => Promise<void>;
  
  /**
   * Update a product
   */
  updateProduct: (id: string, product: Product) => Promise<void>;
  
  /**
   * Delete a product
   */
  deleteProduct: (id: string) => Promise<void>;
  
  /**
   * Bulk update product prices
   */
  bulkUpdatePrices: (update: BulkPriceUpdate) => Promise<void>;
  
  /**
   * Add a special price
   */
  addSpecialPrice: (specialPrice: Omit<SpecialPrice, 'id'>) => Promise<void>;
  
  /**
   * Update a special price
   */
  updateSpecialPrice: (id: string, specialPrice: Partial<SpecialPrice>) => Promise<void>;
  
  /**
   * Delete a special price
   */
  deleteSpecialPrice: (id: string) => Promise<void>;
  
  /**
   * Add a customer group
   */
  addCustomerGroup: (group: Omit<CustomerGroup, 'id'>) => Promise<void>;
  
  /**
   * Update a customer group
   */
  updateCustomerGroup: (id: string, group: Partial<CustomerGroup>) => Promise<void>;
  
  /**
   * Delete a customer group
   */
  deleteCustomerGroup: (id: string) => Promise<void>;
  
  /**
   * Save product attributes
   */
  saveAttributes: (attributes: ProductAttribute[]) => Promise<void>;
  
  /**
   * Refresh products
   */
  refreshProducts: () => Promise<void>;
}

// Create context
const BatchProductContext = createContext<BatchProductContextType | undefined>(undefined);

// Provider props
interface BatchProductProviderProps {
  children: ReactNode;
}

/**
 * BatchProductProvider Component
 * 
 * Provides product data with optimized batch requests during initialization.
 */
export function BatchProductProvider({ children }: BatchProductProviderProps) {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [specialPrices, setSpecialPrices] = useState<SpecialPrice[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  
  // Get auth context
  const { isAuthenticated } = useAuth();
  
  // Get category context
  const { categories } = useBatchCategory();
  
  // Use provider batch initialization
  const {
    batchGet,
    batchPost,
    isInitializing,
    isInitialized,
    error,
    initialize
  } = useProviderBatchInit({
    providerName: 'product',
    autoInit: true,
    defaultPriority: RequestPriority.MEDIUM,
    dependencies: [isAuthenticated],
    onInitComplete: () => {
      logger.info('Product provider initialized successfully');
    },
    onInitError: (error) => {
      logger.error('Error initializing product provider', { error });
    }
  });
  
  // Fetch products
  const fetchProducts = useCallback(async () => {
    performanceMonitor.markStart('product:fetchProducts');
    try {
      // Use batch request to fetch products
      const productsData = await batchGet<Product[]>('products/LIST', undefined, RequestPriority.MEDIUM);
      
      if (productsData && Array.isArray(productsData)) {
        setProducts(productsData);
      }
    } catch (err) {
      logger.error('Error fetching products', { error: err });
    } finally {
      performanceMonitor.markEnd('product:fetchProducts');
    }
  }, [batchGet]);
  
  // Fetch special prices
  const fetchSpecialPrices = useCallback(async () => {
    performanceMonitor.markStart('product:fetchSpecialPrices');
    try {
      // Use batch request to fetch special prices
      const specialPricesData = await batchGet<SpecialPrice[]>('products/SPECIAL_PRICES', undefined, RequestPriority.LOW);
      
      if (specialPricesData && Array.isArray(specialPricesData)) {
        setSpecialPrices(specialPricesData);
      }
    } catch (err) {
      logger.error('Error fetching special prices', { error: err });
    } finally {
      performanceMonitor.markEnd('product:fetchSpecialPrices');
    }
  }, [batchGet]);
  
  // Fetch customer groups
  const fetchCustomerGroups = useCallback(async () => {
    performanceMonitor.markStart('product:fetchCustomerGroups');
    try {
      // Use batch request to fetch customer groups
      const customerGroupsData = await batchGet<CustomerGroup[]>('customers/GROUPS', undefined, RequestPriority.LOW);
      
      if (customerGroupsData && Array.isArray(customerGroupsData)) {
        setCustomerGroups(customerGroupsData);
      }
    } catch (err) {
      logger.error('Error fetching customer groups', { error: err });
    } finally {
      performanceMonitor.markEnd('product:fetchCustomerGroups');
    }
  }, [batchGet]);
  
  // Fetch product attributes
  const fetchAttributes = useCallback(async () => {
    performanceMonitor.markStart('product:fetchAttributes');
    try {
      // Use batch request to fetch product attributes
      const attributesData = await batchGet<ProductAttribute[]>('products/ATTRIBUTES', undefined, RequestPriority.LOW);
      
      if (attributesData && Array.isArray(attributesData)) {
        setAttributes(attributesData);
      }
    } catch (err) {
      logger.error('Error fetching product attributes', { error: err });
    } finally {
      performanceMonitor.markEnd('product:fetchAttributes');
    }
  }, [batchGet]);
  
  // Get a product by ID
  const getProduct = useCallback(async (id: string): Promise<Product | null> => {
    performanceMonitor.markStart(`product:getProduct:${id}`);
    try {
      // First check if the product is already in the state
      const existingProduct = products.find(p => p.id === id);
      if (existingProduct) {
        return existingProduct;
      }
      
      // If not, fetch it from the API
      const product = await batchGet<Product>(`products/GET/${id}`, undefined, RequestPriority.HIGH);
      return product || null;
    } catch (err) {
      logger.error('Error getting product', { error: err, productId: id });
      return null;
    } finally {
      performanceMonitor.markEnd(`product:getProduct:${id}`);
    }
  }, [batchGet, products]);
  
  // Add a new product
  const addProduct = useCallback(async (product: Product) => {
    performanceMonitor.markStart('product:addProduct');
    try {
      // Use batch request to add a new product
      const newProduct = await batchPost<Product>('products/CREATE', product, RequestPriority.MEDIUM);
      
      if (newProduct) {
        setProducts(prev => [...prev, newProduct]);
      }
    } catch (err) {
      logger.error('Error adding product', { error: err });
      throw err;
    } finally {
      performanceMonitor.markEnd('product:addProduct');
    }
  }, [batchPost]);
  
  // Update a product
  const updateProduct = useCallback(async (id: string, product: Product) => {
    performanceMonitor.markStart(`product:updateProduct:${id}`);
    try {
      // Use batch request to update a product
      const updatedProduct = await batchPost<Product>('products/UPDATE', {
        id,
        ...product
      }, RequestPriority.MEDIUM);
      
      if (updatedProduct) {
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      }
    } catch (err) {
      logger.error('Error updating product', { error: err, productId: id });
      throw err;
    } finally {
      performanceMonitor.markEnd(`product:updateProduct:${id}`);
    }
  }, [batchPost]);
  
  // Delete a product
  const deleteProduct = useCallback(async (id: string) => {
    performanceMonitor.markStart(`product:deleteProduct:${id}`);
    try {
      // Use batch request to delete a product
      await batchPost('products/DELETE', { id }, RequestPriority.MEDIUM);
      
      // Update local state
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      logger.error('Error deleting product', { error: err, productId: id });
      throw err;
    } finally {
      performanceMonitor.markEnd(`product:deleteProduct:${id}`);
    }
  }, [batchPost]);
  
  // Bulk update product prices
  const bulkUpdatePrices = useCallback(async (update: BulkPriceUpdate) => {
    performanceMonitor.markStart('product:bulkUpdatePrices');
    try {
      // Use batch request to bulk update prices
      await batchPost('products/BULK_UPDATE_PRICES', update, RequestPriority.MEDIUM);
      
      // Refresh products after bulk update
      await fetchProducts();
    } catch (err) {
      logger.error('Error bulk updating prices', { error: err });
      throw err;
    } finally {
      performanceMonitor.markEnd('product:bulkUpdatePrices');
    }
  }, [batchPost, fetchProducts]);
  
  // Add a special price
  const addSpecialPrice = useCallback(async (specialPrice: Omit<SpecialPrice, 'id'>) => {
    performanceMonitor.markStart('product:addSpecialPrice');
    try {
      // Use batch request to add a special price
      const newSpecialPrice = await batchPost<SpecialPrice>('products/ADD_SPECIAL_PRICE', specialPrice, RequestPriority.MEDIUM);
      
      if (newSpecialPrice) {
        setSpecialPrices(prev => [...prev, newSpecialPrice]);
      }
    } catch (err) {
      logger.error('Error adding special price', { error: err });
      throw err;
    } finally {
      performanceMonitor.markEnd('product:addSpecialPrice');
    }
  }, [batchPost]);
  
  // Update a special price
  const updateSpecialPrice = useCallback(async (id: string, specialPrice: Partial<SpecialPrice>) => {
    performanceMonitor.markStart(`product:updateSpecialPrice:${id}`);
    try {
      // Use batch request to update a special price
      const updatedSpecialPrice = await batchPost<SpecialPrice>('products/UPDATE_SPECIAL_PRICE', {
        id,
        ...specialPrice
      }, RequestPriority.MEDIUM);
      
      if (updatedSpecialPrice) {
        setSpecialPrices(prev => prev.map(sp => sp.id === id ? updatedSpecialPrice : sp));
      }
    } catch (err) {
      logger.error('Error updating special price', { error: err, specialPriceId: id });
      throw err;
    } finally {
      performanceMonitor.markEnd(`product:updateSpecialPrice:${id}`);
    }
  }, [batchPost]);
  
  // Delete a special price
  const deleteSpecialPrice = useCallback(async (id: string) => {
    performanceMonitor.markStart(`product:deleteSpecialPrice:${id}`);
    try {
      // Use batch request to delete a special price
      await batchPost('products/DELETE_SPECIAL_PRICE', { id }, RequestPriority.MEDIUM);
      
      // Update local state
      setSpecialPrices(prev => prev.filter(sp => sp.id !== id));
    } catch (err) {
      logger.error('Error deleting special price', { error: err, specialPriceId: id });
      throw err;
    } finally {
      performanceMonitor.markEnd(`product:deleteSpecialPrice:${id}`);
    }
  }, [batchPost]);
  
  // Add a customer group
  const addCustomerGroup = useCallback(async (group: Omit<CustomerGroup, 'id'>) => {
    performanceMonitor.markStart('product:addCustomerGroup');
    try {
      // Use batch request to add a customer group
      const newGroup = await batchPost<CustomerGroup>('customers/ADD_GROUP', group, RequestPriority.MEDIUM);
      
      if (newGroup) {
        setCustomerGroups(prev => [...prev, newGroup]);
      }
    } catch (err) {
      logger.error('Error adding customer group', { error: err });
      throw err;
    } finally {
      performanceMonitor.markEnd('product:addCustomerGroup');
    }
  }, [batchPost]);
  
  // Update a customer group
  const updateCustomerGroup = useCallback(async (id: string, group: Partial<CustomerGroup>) => {
    performanceMonitor.markStart(`product:updateCustomerGroup:${id}`);
    try {
      // Use batch request to update a customer group
      const updatedGroup = await batchPost<CustomerGroup>('customers/UPDATE_GROUP', {
        id,
        ...group
      }, RequestPriority.MEDIUM);
      
      if (updatedGroup) {
        setCustomerGroups(prev => prev.map(g => g.id === id ? updatedGroup : g));
      }
    } catch (err) {
      logger.error('Error updating customer group', { error: err, groupId: id });
      throw err;
    } finally {
      performanceMonitor.markEnd(`product:updateCustomerGroup:${id}`);
    }
  }, [batchPost]);
  
  // Delete a customer group
  const deleteCustomerGroup = useCallback(async (id: string) => {
    performanceMonitor.markStart(`product:deleteCustomerGroup:${id}`);
    try {
      // Use batch request to delete a customer group
      await batchPost('customers/DELETE_GROUP', { id }, RequestPriority.MEDIUM);
      
      // Update local state
      setCustomerGroups(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      logger.error('Error deleting customer group', { error: err, groupId: id });
      throw err;
    } finally {
      performanceMonitor.markEnd(`product:deleteCustomerGroup:${id}`);
    }
  }, [batchPost]);
  
  // Save product attributes
  const saveAttributes = useCallback(async (attrs: ProductAttribute[]) => {
    performanceMonitor.markStart('product:saveAttributes');
    try {
      // Use batch request to save product attributes
      await batchPost('products/SAVE_ATTRIBUTES', { attributes: attrs }, RequestPriority.MEDIUM);
      
      // Update local state
      setAttributes(attrs);
    } catch (err) {
      logger.error('Error saving product attributes', { error: err });
      throw err;
    } finally {
      performanceMonitor.markEnd('product:saveAttributes');
    }
  }, [batchPost]);
  
  // Refresh products
  const refreshProducts = useCallback(async () => {
    await fetchProducts();
    await fetchSpecialPrices();
    await fetchCustomerGroups();
    await fetchAttributes();
  }, [fetchProducts, fetchSpecialPrices, fetchCustomerGroups, fetchAttributes]);
  
  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitialized && !isInitializing) {
      logger.info('Initializing product provider');
      
      // Add requests to the batch
      fetchProducts();
      fetchSpecialPrices();
      fetchCustomerGroups();
      fetchAttributes();
      
      // Execute the batch
      initialize();
    }
  }, [isAuthenticated, isInitialized, isInitializing, fetchProducts, fetchSpecialPrices, fetchCustomerGroups, fetchAttributes, initialize]);
  
  // Context value
  const contextValue: BatchProductContextType = {
    products,
    categories,
    priceHistory,
    specialPrices,
    customerGroups,
    attributes,
    loading: isInitializing,
    error,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkUpdatePrices,
    addSpecialPrice,
    updateSpecialPrice,
    deleteSpecialPrice,
    addCustomerGroup,
    updateCustomerGroup,
    deleteCustomerGroup,
    saveAttributes,
    refreshProducts
  };
  
  return (
    <BatchProductContext.Provider value={contextValue}>
      {children}
    </BatchProductContext.Provider>
  );
}

/**
 * Hook to use the batch product context
 */
export function useBatchProduct(): BatchProductContextType {
  const context = useContext(BatchProductContext);
  
  if (!context) {
    throw new Error('useBatchProduct must be used within a BatchProductProvider');
  }
  
  return context;
}

export default BatchProductProvider;
