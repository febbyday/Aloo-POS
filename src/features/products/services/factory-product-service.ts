/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Factory-Based Product Service
 * 
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of product-related operations with minimal duplication.
 */

import { Product, ProductVariant, ProductFilter } from '../types/product.types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { PRODUCT_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType } from '@/lib/api/error-handler';

/**
 * Product service with standardized endpoint handling
 */
const productService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<Product>('products', {
    useEnhancedClient: true,
    withRetry: {
      maxRetries: 3,
      shouldRetry: (error: any) => {
        // Only retry network or server errors
        return ![
          ApiErrorType.VALIDATION, 
          ApiErrorType.CONFLICT,
          ApiErrorType.AUTHORIZATION
        ].includes(error.type);
      }
    },
    cacheResponse: true,
    // Map response to ensure dates are properly converted
    mapResponse: (data: any) => {
      if (Array.isArray(data)) {
        return data.map(product => ({
          ...product,
          createdAt: product.createdAt ? new Date(product.createdAt) : undefined,
          updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined
        }));
      }
      
      if (!data) return null;
      
      return {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined
      };
    }
  }),
  
  // Custom methods for product-specific operations
  
  /**
   * Get product variants
   */
  getProductVariants: createServiceMethod<ProductVariant[]>(
    'products', 'VARIANTS', 'get',
    { cacheResponse: true }
  ),
  
  /**
   * Get product attributes
   */
  getProductAttributes: createServiceMethod<{
    id: string;
    name: string;
    values: string[];
  }[]>('products', 'ATTRIBUTES', 'get', { cacheResponse: true }),
  
  /**
   * Get related products
   */
  getRelatedProducts: createServiceMethod<Product[]>(
    'products', 'RELATED', 'get',
    { cacheResponse: true }
  ),
  
  /**
   * Get product reviews
   */
  getProductReviews: createServiceMethod<{
    id: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[]>('products', 'REVIEWS', 'get', { cacheResponse: true }),
  
  /**
   * Add product review
   */
  addProductReview: createServiceMethod<void, {
    rating: number;
    comment: string;
  }>('products', 'ADD_REVIEW', 'post', { withRetry: false }),
  
  /**
   * Get product inventory
   */
  getProductInventory: createServiceMethod<{
    productId: string;
    locationId: string;
    quantity: number;
    reservedQuantity: number;
  }[]>('products', 'INVENTORY', 'get', { cacheResponse: false }),
  
  /**
   * Adjust product inventory
   */
  adjustProductInventory: createServiceMethod<void, {
    locationId: string;
    quantity: number;
    reason: string;
    note?: string;
  }>('products', 'ADJUST_INVENTORY', 'post', { withRetry: false }),
  
  /**
   * Search products with various filters
   */
  searchProducts: async (filter: ProductFilter): Promise<Product[]> => {
    return productService.search(filter);
  },
  
  /**
   * Get products by category
   */
  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    return productService.getAll({ category: categoryId });
  },
  
  /**
   * Get products by price range
   */
  getProductsByPriceRange: async (minPrice: number, maxPrice: number): Promise<Product[]> => {
    return productService.getAll({ minPrice, maxPrice });
  },
  
  /**
   * Get featured products
   */
  getFeaturedProducts: async (): Promise<Product[]> => {
    return productService.getAll({ featured: true });
  },
  
  /**
   * Update product stock
   */
  updateProductStock: async (productId: string, quantity: number, locationId?: string): Promise<void> => {
    await productService.adjustProductInventory(
      undefined,
      {
        locationId: locationId || 'default',
        quantity,
        reason: 'manual-adjustment',
        note: 'Stock updated manually'
      },
      { id: productId }
    );
  },
  
  /**
   * Apply bulk price changes
   */
  applyBulkPriceChanges: async (
    productIds: string[],
    changeType: 'percentage' | 'fixed',
    changeValue: number
  ): Promise<void> => {
    // Get existing products
    const products = await Promise.all(
      productIds.map(id => productService.getById(id))
    );
    
    // Calculate new prices and update
    const updates = products
      .filter((product): product is Product => product !== null)
      .map(product => {
        const currentPrice = product.retailPrice;
        let newPrice = currentPrice;
        
        if (changeType === 'percentage') {
          newPrice = currentPrice * (1 + changeValue / 100);
        } else {
          newPrice = currentPrice + changeValue;
        }
        
        newPrice = Math.max(0, newPrice); // Ensure price is not negative
        
        return {
          id: product.id,
          data: { retailPrice: newPrice }
        };
      });
    
    if (updates.length) {
      await productService.batchUpdate(updates);
    }
  }
};

export default productService;
