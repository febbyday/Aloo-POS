/**
 * Product Store Selectors
 * 
 * This module provides selectors for extracting and computing data from the product store.
 * Selectors help optimize performance by memoizing derived state and preventing unnecessary re-renders.
 */

import { UnifiedProduct, ProductVariant, StockStatus, ProductStatus } from '../types/unified-product.types';
import { useProductStore } from './productStore';

/**
 * Select all products as an array
 */
export const selectAllProducts = () => {
  return useProductStore(state => 
    state.productIds.map(id => state.products[id])
  );
};

/**
 * Select a product by ID
 */
export const selectProductById = (id: string | null) => {
  return useProductStore(state => 
    id ? state.products[id] : null
  );
};

/**
 * Select the currently selected product
 */
export const selectSelectedProduct = () => {
  return useProductStore(state => {
    const selectedId = state.selectedProductId;
    return selectedId ? state.products[selectedId] : null;
  });
};

/**
 * Select a variant by ID
 */
export const selectVariantById = (id: string | null) => {
  return useProductStore(state => 
    id ? state.variants[id] : null
  );
};

/**
 * Select the currently selected variant
 */
export const selectSelectedVariant = () => {
  return useProductStore(state => {
    const selectedId = state.selectedVariantId;
    return selectedId ? state.variants[selectedId] : null;
  });
};

/**
 * Select variants for a product
 */
export const selectProductVariants = (productId: string) => {
  return useProductStore(state => {
    const product = state.products[productId];
    if (!product || !product.variants) return [];
    
    return product.variants.map(variant => {
      // If the variant is in the normalized state, use that
      if (variant.id && state.variants[variant.id]) {
        return state.variants[variant.id];
      }
      // Otherwise use the variant from the product
      return variant;
    });
  });
};

/**
 * Select products by category
 */
export const selectProductsByCategory = (categoryId: string) => {
  return useProductStore(state => 
    state.productIds
      .map(id => state.products[id])
      .filter(product => product.category === categoryId)
  );
};

/**
 * Select products by status
 */
export const selectProductsByStatus = (status: ProductStatus) => {
  return useProductStore(state => 
    state.productIds
      .map(id => state.products[id])
      .filter(product => product.status === status)
  );
};

/**
 * Select products by stock status
 */
export const selectProductsByStockStatus = (stockStatus: StockStatus) => {
  return useProductStore(state => 
    state.productIds
      .map(id => state.products[id])
      .filter(product => product.stockStatus === stockStatus)
  );
};

/**
 * Select low stock products
 */
export const selectLowStockProducts = () => {
  return useProductStore(state => 
    state.productIds
      .map(id => state.products[id])
      .filter(product => {
        if (!product.stock || !product.minStock) return false;
        return product.stock <= product.minStock;
      })
  );
};

/**
 * Select out of stock products
 */
export const selectOutOfStockProducts = () => {
  return useProductStore(state => 
    state.productIds
      .map(id => state.products[id])
      .filter(product => {
        if (product.stockStatus === StockStatus.OUT_OF_STOCK) return true;
        return product.stock !== undefined && product.stock <= 0;
      })
  );
};

/**
 * Select products by supplier
 */
export const selectProductsBySupplier = (supplierId: string) => {
  return useProductStore(state => 
    state.productIds
      .map(id => state.products[id])
      .filter(product => product.supplier && product.supplier.id === supplierId)
  );
};

/**
 * Select products by tag
 */
export const selectProductsByTag = (tag: string) => {
  return useProductStore(state => 
    state.productIds
      .map(id => state.products[id])
      .filter(product => product.tags && product.tags.includes(tag))
  );
};

/**
 * Select featured products
 */
export const selectFeaturedProducts = () => {
  return useProductStore(state => 
    state.productIds
      .map(id => state.products[id])
      .filter(product => product.featured)
  );
};

/**
 * Select products on sale
 */
export const selectProductsOnSale = () => {
  return useProductStore(state => 
    state.productIds
      .map(id => state.products[id])
      .filter(product => product.onSale || (product.salePrice && product.salePrice < product.retailPrice))
  );
};

/**
 * Select products by price range
 */
export const selectProductsByPriceRange = (minPrice: number, maxPrice: number) => {
  return useProductStore(state => 
    state.productIds
      .map(id => state.products[id])
      .filter(product => {
        const price = product.salePrice || product.retailPrice;
        return price >= minPrice && price <= maxPrice;
      })
  );
};

/**
 * Select loading states
 */
export const selectLoadingStates = () => {
  return useProductStore(state => state.loading);
};

/**
 * Select error states
 */
export const selectErrorStates = () => {
  return useProductStore(state => state.errors);
};

/**
 * Select pagination state
 */
export const selectPagination = () => {
  return useProductStore(state => state.pagination);
};

/**
 * Select filter state
 */
export const selectFilter = () => {
  return useProductStore(state => state.filter);
};

/**
 * Select cache invalidation state
 */
export const selectCacheInvalidation = () => {
  return useProductStore(state => ({
    lastUpdated: state.lastUpdated,
    invalidateCache: state.invalidateCache,
  }));
}; 