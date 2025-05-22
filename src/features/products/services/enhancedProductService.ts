/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Enhanced Product Service
 * 
 * This service demonstrates how to use the enhanced error handling and retry system
 * for product-related API operations.
 */

import { Product, ProductFilter } from '../types/product.types';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { createErrorHandler, ApiErrorType } from '@/lib/api/error-handler';
import { PRODUCT_ENDPOINTS } from '@/lib/api/endpoint-registry';

// Create module-specific error handler
const errorHandler = createErrorHandler('products');

/**
 * Enhanced product service with robust error handling and retry functionality
 */
const enhancedProductService = {
  /**
   * Get all products with filtering, sorting, and pagination
   * 
   * @param filters Optional filters for products
   * @returns Promise with products array
   */
  async getAllProducts(filters?: ProductFilter): Promise<Product[]> {
    return errorHandler.withRetry(async () => {
      const response = await enhancedApiClient.get<Product[]>(
        'products/LIST',
        undefined,
        { 
          params: filters,
          retry: {
            maxRetries: 3,
            shouldRetry: (error) => {
              // Retry on network errors and server errors, but not on validation errors
              return error.type !== ApiErrorType.VALIDATION;
            }
          },
          cache: 'default' // Use browser's default caching strategy
        }
      );
      return response;
    });
  },
  
  /**
   * Get a product by ID with automatic retry on network errors
   * 
   * @param id Product ID
   * @returns Promise with product or null if not found
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      return await enhancedApiClient.get<Product>(
        'products/DETAIL',
        { id },
        { 
          retry: true, // Use default retry configuration
          cache: 'force-cache' // Use cached version if available
        }
      );
    } catch (error) {
      const apiError = errorHandler.handleError(error, 'getProductById');
      
      // Return null for NOT_FOUND errors instead of throwing
      if (apiError.type === ApiErrorType.NOT_FOUND) {
        return null;
      }
      
      throw apiError;
    }
  },
  
  /**
   * Create a new product with validation error handling
   * 
   * @param data Product data
   * @returns Promise with created product
   */
  async createProduct(data: Partial<Product>): Promise<Product> {
    // Using the safe pattern that returns [data, error]
    const [product, error] = await errorHandler.safeCall(
      () => enhancedApiClient.post<Product>(
        'products/CREATE',
        data,
        undefined,
        { retry: false } // Don't retry creation requests to avoid duplicates
      ),
      'Failed to create product'
    );
    
    if (error) {
      // Special handling for validation errors
      if (error.type === ApiErrorType.VALIDATION) {
        console.warn('Product validation failed:', error.details);
      }
      throw error;
    }
    
    return product as Product;
  },
  
  /**
   * Update a product with optimistic concurrency control
   * 
   * @param id Product ID
   * @param data Product data
   * @param etag ETag for optimistic concurrency
   * @returns Promise with updated product
   */
  async updateProduct(
    id: string, 
    data: Partial<Product>,
    etag?: string
  ): Promise<Product> {
    return errorHandler.withRetry(
      () => enhancedApiClient.put<Product>(
        'products/UPDATE',
        data,
        { id },
        { 
          headers: etag ? { 'If-Match': etag } : undefined,
          retry: {
            maxRetries: 2,
            shouldRetry: (error) => {
              // Don't retry conflict errors (412 Precondition Failed)
              return error.type !== ApiErrorType.CONFLICT;
            }
          }
        }
      ),
      {
        maxRetries: 2,
        onRetry: (error, attempt) => {
          console.warn(`Retrying product update, attempt ${attempt}: ${error.message}`);
        }
      }
    );
  },
  
  /**
   * Delete a product with confirmation
   * 
   * @param id Product ID
   * @returns Promise with success indicator
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      await enhancedApiClient.delete(
        'products/DELETE',
        { id },
        { retry: false } // Don't retry deletion requests
      );
      return true;
    } catch (error) {
      const apiError = errorHandler.handleError(error, 'deleteProduct');
      
      // Not found is considered a successful deletion
      if (apiError.type === ApiErrorType.NOT_FOUND) {
        return true;
      }
      
      throw apiError;
    }
  },
  
  /**
   * Search products with query parameters and automatic retries
   * 
   * @param query Search query
   * @param category Optional category filter
   * @returns Promise with matching products
   */
  async searchProducts(query: string, category?: string): Promise<Product[]> {
    return errorHandler.withRetry(
      () => enhancedApiClient.get<Product[]>(
        'products/SEARCH',
        undefined,
        {
          params: { q: query, category },
          retry: true
        }
      )
    );
  },
  
  /**
   * Batch update multiple products with transaction support
   * 
   * @param updates Array of product updates
   * @returns Promise with updated products
   */
  async batchUpdateProducts(updates: Array<{ id: string, data: Partial<Product> }>): Promise<Product[]> {
    return errorHandler.withRetry(
      () => enhancedApiClient.patch<Product[]>(
        'products/BATCH_UPDATE',
        { updates },
        undefined,
        {
          retry: {
            maxRetries: 3,
            initialDelay: 1000, // Start with 1 second delay for batch operations
            backoffFactor: 2
          }
        }
      )
    );
  }
};

export default enhancedProductService;
