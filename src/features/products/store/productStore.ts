/**
 * Product Store
 * 
 * This module provides a Zustand-based store for managing product state.
 * It implements a normalized state structure for O(1) lookups and optimistic updates.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from '@/lib/store/immerMiddleware';
import { 
  UnifiedProduct, 
  ProductVariant, 
  InventoryFilter,
  ProductStatus,
  StockStatus,
  ProductListResponse
} from '../types/unified-product.types';
// Import the new factory-based product service instead of the legacy service
import productService from '../services/factory-product-service';

/**
 * Normalized product state interface
 */
interface NormalizedProductState {
  // Normalized entities
  products: Record<string, UnifiedProduct>;
  variants: Record<string, ProductVariant>;
  
  // IDs for quick access
  productIds: string[];
  
  // UI state
  selectedProductId: string | null;
  selectedVariantId: string | null;
  
  // Loading states
  loading: {
    products: boolean;
    product: boolean;
    variants: boolean;
    operations: Record<string, boolean>;
  };
  
  // Error states
  errors: {
    products: string | null;
    product: string | null;
    variants: string | null;
    operations: Record<string, string | null>;
  };
  
  // Pagination and filtering
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filter: InventoryFilter;
  
  // Cache invalidation
  lastUpdated: number;
  invalidateCache: boolean;
}

/**
 * Product store actions interface
 */
interface ProductStoreActions {
  // Fetch actions
  fetchProducts: (filter?: InventoryFilter) => Promise<ProductListResponse>;
  fetchProductById: (id: string) => Promise<UnifiedProduct | null>;
  fetchProductVariants: (productId: string) => Promise<ProductVariant[]>;
  searchProducts: (query: string) => Promise<UnifiedProduct[]>;
  
  // CRUD actions
  createProduct: (product: Omit<UnifiedProduct, 'id'>) => Promise<UnifiedProduct>;
  updateProduct: (id: string, data: Partial<UnifiedProduct>) => Promise<UnifiedProduct>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  // Variant actions
  createVariant: (productId: string, variant: Omit<ProductVariant, 'id'>) => Promise<ProductVariant>;
  updateVariant: (productId: string, variantId: string, data: Partial<ProductVariant>) => Promise<ProductVariant>;
  deleteVariant: (productId: string, variantId: string) => Promise<boolean>;
  
  // Status actions
  updateProductStatus: (id: string, status: ProductStatus) => Promise<UnifiedProduct>;
  updateProductStock: (id: string, newStock: number, reason?: string) => Promise<UnifiedProduct>;
  
  // Bulk actions
  bulkUpdateProducts: (ids: string[], changes: Partial<UnifiedProduct>) => Promise<number>;
  bulkDeleteProducts: (ids: string[]) => Promise<number>;
  
  // Selection actions
  selectProduct: (id: string | null) => void;
  selectVariant: (id: string | null) => void;
  
  // Filter actions
  setFilter: (filter: Partial<InventoryFilter>) => void;
  resetFilter: () => void;
  
  // Pagination actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  
  // Cache actions
  invalidateCache: () => void;
  refreshProducts: () => Promise<ProductListResponse>;
  
  // Reset actions
  reset: () => void;
}

/**
 * Combined product store type
 */
type ProductStore = NormalizedProductState & ProductStoreActions;

/**
 * Default filter values
 */
const DEFAULT_FILTER: InventoryFilter = {
  page: 1,
  limit: 20,
  sortBy: 'name',
  sortDirection: 'asc',
};

/**
 * Initial state for the product store
 */
const initialState: NormalizedProductState = {
  products: {},
  variants: {},
  productIds: [],
  selectedProductId: null,
  selectedVariantId: null,
  loading: {
    products: false,
    product: false,
    variants: false,
    operations: {},
  },
  errors: {
    products: null,
    product: null,
    variants: null,
    operations: {},
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filter: DEFAULT_FILTER,
  lastUpdated: Date.now(),
  invalidateCache: false,
};

/**
 * Create the product store with persistence and immer middleware
 */
export const useProductStore = create<ProductStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      
      /**
       * Fetch products with optional filtering
       */
      fetchProducts: async (filter?: InventoryFilter) => {
        // Don't fetch again if already loading
        if (get().loading.products) {
          console.log('[ProductStore] Skipping fetch, already loading');
          return get().metadata;
        }

        const mergedFilter = { ...get().filter, ...filter };

        try {
          set(state => {
            state.loading.products = true;
            state.errors.products = null;
          });

          console.log('[ProductStore] Fetching products with filter:', mergedFilter);
          
          // Factory-based service uses getAll instead of fetchProducts
          const response = await productService.getAll(mergedFilter);
          
          // Handle the response based on its structure
          let productsArray: UnifiedProduct[] = [];
          
          if (Array.isArray(response)) {
            productsArray = response;
          } else if (response && typeof response === 'object' && 'products' in response) {
            productsArray = response.products;
          }

          const normalized = normalizeProducts(productsArray);

          set(state => {
            // Update the normalized state
            state.products = {
              ...state.products,
              ...normalized.entities
            };
            state.productIds = normalized.ids;
            
            // Update metadata
            state.metadata = {
              total: ('total' in response && typeof response.total === 'number') 
                ? response.total 
                : productsArray.length,
              page: mergedFilter.page || 1,
              limit: mergedFilter.limit || 20,
              pages: Math.ceil(
                (('total' in response && typeof response.total === 'number') 
                  ? response.total 
                  : productsArray.length) / 
                (mergedFilter.limit || 20)
              )
            };
            
            // Clear loading state and set timestamp
            state.loading.products = false;
            state.lastFetched = new Date().getTime();
          });

          return get().metadata;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
          
          set(state => {
            state.loading.products = false;
            state.errors.products = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Fetch a product by ID
       */
      fetchProductById: async (id: string) => {
        // Skip if already loading
        if (get().loading.product) {
          console.log(`[ProductStore] Already fetching a product, skipping fetch for ${id}`);
          return null;
        }
        
        // Check if we have it in the cache and it's fresh enough
        const cachedProduct = get().products[id];
        const lastFetched = get().lastFetched;
        const cacheInvalidated = get().cacheInvalidated;
        
        if (cachedProduct && !cacheInvalidated && lastFetched && (Date.now() - lastFetched < 300000)) {
          console.log(`[ProductStore] Using cached product for ${id}`);
          return cachedProduct;
        }
        
        try {
          set(state => {
            state.loading.product = true;
            state.error.product = null;
          });
          
          console.log(`[ProductStore] Fetching product details for ${id}`);
          
          // Factory-based service uses getById instead of getProductById
          const product = await productService.getById(id);
          
          if (!product) {
            throw new Error(`Product with ID ${id} not found`);
          }
          
          set(state => {
            // Add or update the product in the store
            state.products[id] = product;
            
            // If not in the ID list, add it
            if (!state.productIds.includes(id)) {
              state.productIds.push(id);
            }
            
            state.loading.product = false;
            state.selectedProductId = id;
          });
          
          return product;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to fetch product with ID ${id}`;
          
          set(state => {
            state.loading.product = false;
            state.errors.product = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Fetch variants for a product
       */
      fetchProductVariants: async (productId: string) => {
        set(state => {
          state.loading.variants = true;
          state.errors.variants = null;
        });
        
        try {
          const variants = await productService.getProductVariants(productId);
          
          set(state => {
            // Normalize variants
            const variantsMap: Record<string, ProductVariant> = {};
            
            variants.forEach(variant => {
              if (variant.id) {
                variantsMap[variant.id] = variant;
              }
            });
            
            // Update state
            state.variants = {
              ...state.variants,
              ...variantsMap,
            };
            state.loading.variants = false;
          });
          
          return variants;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to fetch variants for product ${productId}`;
          
          set(state => {
            state.loading.variants = false;
            state.errors.variants = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Search products by query
       */
      searchProducts: async (query: string) => {
        const operationId = `search_${query}`;
        
        set(state => {
          state.loading.operations[operationId] = true;
          state.errors.operations[operationId] = null;
        });
        
        try {
          const products = await productService.searchProducts(query);
          
          set(state => {
            // Normalize products
            products.forEach(product => {
              if (product.id) {
                state.products[product.id] = product;
              }
            });
            
            state.loading.operations[operationId] = false;
          });
          
          return products;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to search products with query "${query}"`;
          
          set(state => {
            state.loading.operations[operationId] = false;
            state.errors.operations[operationId] = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Create a new product
       */
      createProduct: async (productData: Omit<UnifiedProduct, 'id'>) => {
        try {
          set(state => {
            state.loading.operations['create'] = true;
            state.error.operations['create'] = null;
          });
          
          console.log('[ProductStore] Creating new product:', productData);
          
          // Factory-based service uses create instead of createProduct
          const newProduct = await productService.create(productData);
          
          set(state => {
            // Add the new product to the store
            state.products[newProduct.id] = newProduct;
            state.productIds.unshift(newProduct.id);
            state.loading.operations['create'] = false;
            
            // Set as selected product
            state.selectedProductId = newProduct.id;
            
            // Increment total count in metadata
            if (state.metadata) {
              state.metadata.total += 1;
            }
          });
          
          return newProduct;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
          
          set(state => {
            state.loading.operations['create'] = false;
            state.errors.operations['create'] = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Update an existing product
       */
      updateProduct: async (id: string, data: Partial<UnifiedProduct>) => {
        try {
          set(state => {
            state.loading.operations[`update-${id}`] = true;
            state.error.operations[`update-${id}`] = null;
          });
          
          // Apply optimistic update locally for better UI feedback
          const currentProduct = get().products[id];
          
          if (currentProduct) {
            set(state => {
              state.products[id] = {
                ...currentProduct,
                ...data,
                // Keep the original ID no matter what
                id: currentProduct.id
              };
            });
          }
          
          console.log(`[ProductStore] Updating product ${id}:`, data);
          
          // Factory-based service uses update instead of updateProduct
          const updatedProduct = await productService.update(id, data);
          
          set(state => {
            // Update with the real server response
            state.products[id] = updatedProduct;
            state.loading.operations[`update-${id}`] = false;
          });
          
          return updatedProduct;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to update product with ID ${id}`;
          
          // Revert optimistic update on error
          set(state => {
            state.products[id] = currentProduct;
            state.loading.operations[`update-${id}`] = false;
            state.errors.operations[`update-${id}`] = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Delete a product
       */
      deleteProduct: async (id: string) => {
        try {
          set(state => {
            state.loading.operations[`delete-${id}`] = true;
            state.error.operations[`delete-${id}`] = null;
          });
          
          console.log(`[ProductStore] Deleting product ${id}`);
          
          // Factory-based service uses delete instead of deleteProduct
          await productService.delete(id);
          
          set(state => {
            // Remove the product from the store
            const { [id]: deletedProduct, ...remainingProducts } = state.products;
            state.products = remainingProducts;
            
            // Remove the ID from the list
            state.productIds = state.productIds.filter(pid => pid !== id);
            
            // Clear selection if it was the selected product
            if (state.selectedProductId === id) {
              state.selectedProductId = null;
              state.selectedVariantId = null;
            }
            
            state.loading.operations[`delete-${id}`] = false;
            
            // Decrement total count in metadata
            if (state.metadata) {
              state.metadata.total = Math.max(0, state.metadata.total - 1);
            }
          });
          
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to delete product with ID ${id}`;
          
          // Restore product on error
          set(state => {
            state.products[id] = currentProduct;
            state.productIds.push(id);
            state.loading.operations[`delete-${id}`] = false;
            state.errors.operations[`delete-${id}`] = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Create a new variant for a product
       */
      createVariant: async (productId: string, variantData: Omit<ProductVariant, 'id'>) => {
        const operationId = `create_variant_${productId}`;
        
        set(state => {
          state.loading.operations[operationId] = true;
          state.errors.operations[operationId] = null;
        });
        
        try {
          const variant = await productService.createProductVariant(productId, variantData);
          
          set(state => {
            if (variant.id) {
              // Add to normalized state
              state.variants[variant.id] = variant;
              
              // Update product's variants array if it exists
              const product = state.products[productId];
              if (product && product.variants) {
                product.variants.push(variant);
              }
            }
            
            state.loading.operations[operationId] = false;
            state.invalidateCache = true;
          });
          
          return variant;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to create variant for product ${productId}`;
          
          set(state => {
            state.loading.operations[operationId] = false;
            state.errors.operations[operationId] = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Update a product variant
       */
      updateVariant: async (productId: string, variantId: string, data: Partial<ProductVariant>) => {
        const operationId = `update_variant_${productId}_${variantId}`;
        
        // Get the current variant for optimistic update
        const currentVariant = get().variants[variantId];
        
        if (!currentVariant) {
          throw new Error(`Variant with ID ${variantId} not found in store`);
        }
        
        // Apply optimistic update
        set(state => {
          state.loading.operations[operationId] = true;
          state.errors.operations[operationId] = null;
          
          // Optimistically update the variant
          state.variants[variantId] = {
            ...currentVariant,
            ...data,
            updatedAt: new Date().toISOString(),
          };
          
          // Update variant in product's variants array if it exists
          const product = state.products[productId];
          if (product && product.variants) {
            const variantIndex = product.variants.findIndex(v => v.id === variantId);
            if (variantIndex !== -1) {
              product.variants[variantIndex] = {
                ...product.variants[variantIndex],
                ...data,
              };
            }
          }
        });
        
        try {
          const updatedVariant = await productService.updateProductVariant(productId, variantId, data);
          
          set(state => {
            // Update with actual server response
            state.variants[variantId] = updatedVariant;
            
            // Update variant in product's variants array if it exists
            const product = state.products[productId];
            if (product && product.variants) {
              const variantIndex = product.variants.findIndex(v => v.id === variantId);
              if (variantIndex !== -1) {
                product.variants[variantIndex] = updatedVariant;
              }
            }
            
            state.loading.operations[operationId] = false;
            state.invalidateCache = true;
          });
          
          return updatedVariant;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to update variant ${variantId}`;
          
          // Revert optimistic update on error
          set(state => {
            state.variants[variantId] = currentVariant;
            
            // Revert variant in product's variants array if it exists
            const product = state.products[productId];
            if (product && product.variants) {
              const variantIndex = product.variants.findIndex(v => v.id === variantId);
              if (variantIndex !== -1) {
                product.variants[variantIndex] = currentVariant;
              }
            }
            
            state.loading.operations[operationId] = false;
            state.errors.operations[operationId] = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Delete a product variant
       */
      deleteVariant: async (productId: string, variantId: string) => {
        const operationId = `delete_variant_${productId}_${variantId}`;
        
        // Get the current variant for potential restoration
        const currentVariant = get().variants[variantId];
        
        if (!currentVariant) {
          throw new Error(`Variant with ID ${variantId} not found in store`);
        }
        
        // Apply optimistic update
        set(state => {
          state.loading.operations[operationId] = true;
          state.errors.operations[operationId] = null;
          
          // Optimistically remove the variant
          delete state.variants[variantId];
          
          // Remove variant from product's variants array if it exists
          const product = state.products[productId];
          if (product && product.variants) {
            product.variants = product.variants.filter(v => v.id !== variantId);
          }
          
          // Clear selection if this variant was selected
          if (state.selectedVariantId === variantId) {
            state.selectedVariantId = null;
          }
        });
        
        try {
          const result = await productService.deleteProductVariant(productId, variantId);
          
          set(state => {
            state.loading.operations[operationId] = false;
            state.invalidateCache = true;
          });
          
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to delete variant ${variantId}`;
          
          // Restore variant on error
          set(state => {
            state.variants[variantId] = currentVariant;
            
            // Restore variant in product's variants array if it exists
            const product = state.products[productId];
            if (product && product.variants) {
              product.variants.push(currentVariant);
            }
            
            state.loading.operations[operationId] = false;
            state.errors.operations[operationId] = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Update a product's status
       */
      updateProductStatus: async (id: string, status: ProductStatus) => {
        const operationId = `update_status_${id}`;
        
        // Get the current product for optimistic update
        const currentProduct = get().products[id];
        
        if (!currentProduct) {
          throw new Error(`Product with ID ${id} not found in store`);
        }
        
        // Apply optimistic update
        set(state => {
          state.loading.operations[operationId] = true;
          state.errors.operations[operationId] = null;
          
          // Optimistically update the status
          state.products[id] = {
            ...currentProduct,
            status,
            updatedAt: new Date().toISOString(),
          };
        });
        
        try {
          const updatedProduct = await productService.updateProductStatus(id, status);
          
          set(state => {
            // Update with actual server response
            state.products[id] = updatedProduct;
            state.loading.operations[operationId] = false;
            state.invalidateCache = true;
          });
          
          return updatedProduct;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to update status for product ${id}`;
          
          // Revert optimistic update on error
          set(state => {
            state.products[id] = currentProduct;
            state.loading.operations[operationId] = false;
            state.errors.operations[operationId] = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Update a product's stock level
       */
      updateProductStock: async (id: string, newStock: number, reason?: string) => {
        const operationId = `update_stock_${id}`;
        
        // Get the current product for optimistic update
        const currentProduct = get().products[id];
        
        if (!currentProduct) {
          throw new Error(`Product with ID ${id} not found in store`);
        }
        
        // Calculate new stock status
        let stockStatus = currentProduct.stockStatus;
        if (newStock <= 0) {
          stockStatus = StockStatus.OUT_OF_STOCK;
        } else if (currentProduct.minStock && newStock <= currentProduct.minStock) {
          stockStatus = StockStatus.ON_BACKORDER;
        } else {
          stockStatus = StockStatus.IN_STOCK;
        }
        
        // Apply optimistic update
        set(state => {
          state.loading.operations[operationId] = true;
          state.errors.operations[operationId] = null;
          
          // Optimistically update the stock
          state.products[id] = {
            ...currentProduct,
            stock: newStock,
            stockStatus,
            updatedAt: new Date().toISOString(),
          };
        });
        
        try {
          const updatedProduct = await productService.updateProductStock(id, newStock, reason);
          
          set(state => {
            // Update with actual server response
            state.products[id] = updatedProduct;
            state.loading.operations[operationId] = false;
            state.invalidateCache = true;
          });
          
          return updatedProduct;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to update stock for product ${id}`;
          
          // Revert optimistic update on error
          set(state => {
            state.products[id] = currentProduct;
            state.loading.operations[operationId] = false;
            state.errors.operations[operationId] = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Bulk update multiple products
       */
      bulkUpdateProducts: async (ids: string[], changes: Partial<UnifiedProduct>) => {
        const operationId = `bulk_update_products`;
        
        // Get the current products for optimistic update
        const currentProducts: Record<string, UnifiedProduct> = {};
        ids.forEach(id => {
          const product = get().products[id];
          if (product) {
            currentProducts[id] = product;
          }
        });
        
        // Apply optimistic update
        set(state => {
          state.loading.operations[operationId] = true;
          state.errors.operations[operationId] = null;
          
          // Optimistically update the products
          ids.forEach(id => {
            if (state.products[id]) {
              state.products[id] = {
                ...state.products[id],
                ...changes,
                updatedAt: new Date().toISOString(),
              };
            }
          });
        });
        
        try {
          const count = await productService.bulkUpdateProducts(ids, changes);
          
          set(state => {
            state.loading.operations[operationId] = false;
            state.invalidateCache = true;
          });
          
          return count;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to bulk update products';
          
          // Revert optimistic update on error
          set(state => {
            // Restore original products
            Object.entries(currentProducts).forEach(([id, product]) => {
              state.products[id] = product;
            });
            
            state.loading.operations[operationId] = false;
            state.errors.operations[operationId] = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Bulk delete multiple products
       */
      bulkDeleteProducts: async (ids: string[]) => {
        const operationId = `bulk_delete_products`;
        
        // Get the current products for potential restoration
        const currentProducts: Record<string, UnifiedProduct> = {};
        const currentProductIds = [...get().productIds];
        
        ids.forEach(id => {
          const product = get().products[id];
          if (product) {
            currentProducts[id] = product;
          }
        });
        
        // Apply optimistic update
        set(state => {
          state.loading.operations[operationId] = true;
          state.errors.operations[operationId] = null;
          
          // Optimistically remove the products
          ids.forEach(id => {
            delete state.products[id];
          });
          
          // Update productIds
          state.productIds = state.productIds.filter(id => !ids.includes(id));
          
          // Clear selection if selected product was deleted
          if (state.selectedProductId && ids.includes(state.selectedProductId)) {
            state.selectedProductId = null;
            state.selectedVariantId = null;
          }
        });
        
        try {
          const count = await productService.bulkDeleteProducts(ids);
          
          set(state => {
            state.loading.operations[operationId] = false;
            state.invalidateCache = true;
          });
          
          return count;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to bulk delete products';
          
          // Restore products on error
          set(state => {
            // Restore original products
            Object.entries(currentProducts).forEach(([id, product]) => {
              state.products[id] = product;
            });
            
            // Restore productIds
            state.productIds = currentProductIds;
            
            state.loading.operations[operationId] = false;
            state.errors.operations[operationId] = errorMessage;
          });
          
          throw error;
        }
      },
      
      /**
       * Select a product
       */
      selectProduct: (id: string | null) => {
        set(state => {
          state.selectedProductId = id;
          
          // Clear variant selection when product changes
          if (id === null) {
            state.selectedVariantId = null;
          }
        });
      },
      
      /**
       * Select a variant
       */
      selectVariant: (id: string | null) => {
        set(state => {
          state.selectedVariantId = id;
        });
      },
      
      /**
       * Set filter
       */
      setFilter: (filter: Partial<InventoryFilter>) => {
        set(state => {
          state.filter = {
            ...state.filter,
            ...filter,
            // Reset to page 1 when filter changes
            page: filter.page || 1,
          };
        });
      },
      
      /**
       * Reset filter to defaults
       */
      resetFilter: () => {
        set(state => {
          state.filter = DEFAULT_FILTER;
        });
      },
      
      /**
       * Set current page
       */
      setPage: (page: number) => {
        set(state => {
          state.filter.page = page;
        });
      },
      
      /**
       * Set items per page
       */
      setLimit: (limit: number) => {
        set(state => {
          state.filter.limit = limit;
          // Reset to page 1 when limit changes
          state.filter.page = 1;
        });
      },
      
      /**
       * Invalidate cache to force refresh
       */
      invalidateCache: () => {
        set(state => {
          state.invalidateCache = true;
        });
      },
      
      /**
       * Refresh products with current filter
       */
      refreshProducts: async () => {
        return get().fetchProducts(get().filter);
      },
      
      /**
       * Reset store to initial state
       */
      reset: () => {
        set(initialState);
      },
    })),
    {
      name: 'product-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        filter: state.filter,
        pagination: state.pagination,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

export default useProductStore; 