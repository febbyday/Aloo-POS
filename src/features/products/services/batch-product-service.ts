/**
 * Batch-Enabled Product Service
 * 
 * This service provides methods for interacting with the product API
 * using batch requests during initialization to improve performance.
 */

import { BatchBaseService } from '@/lib/api/services/batch-base-service';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { logger } from '@/lib/logging/logger';
import { Product, ProductFilter } from '../types/product.types';

/**
 * Batch-enabled product service
 */
export class BatchProductService extends BatchBaseService<Product> {
  /**
   * Create a new batch-enabled product service
   */
  constructor() {
    super({
      serviceName: 'product',
      endpoint: 'products',
      defaultPriority: RequestPriority.MEDIUM,
      trackPerformance: true,
      useBatchManager: true
    });
  }
  
  /**
   * Get all products
   * 
   * @param filter Optional filter parameters
   * @returns Promise that resolves with an array of products
   */
  async getAll(filter?: ProductFilter): Promise<Product[]> {
    try {
      return await this.get<Product[]>('LIST', filter);
    } catch (error) {
      logger.error('Error getting all products', { error, filter });
      throw error;
    }
  }
  
  /**
   * Get a product by ID
   * 
   * @param id Product ID
   * @returns Promise that resolves with the product
   */
  async getById(id: string): Promise<Product> {
    try {
      return await this.get<Product>(`GET/${id}`);
    } catch (error) {
      logger.error('Error getting product by ID', { error, id });
      throw error;
    }
  }
  
  /**
   * Get products by category
   * 
   * @param categoryId Category ID
   * @param filter Optional filter parameters
   * @returns Promise that resolves with an array of products
   */
  async getByCategory(categoryId: string, filter?: ProductFilter): Promise<Product[]> {
    try {
      return await this.get<Product[]>('LIST', {
        ...filter,
        categoryId
      });
    } catch (error) {
      logger.error('Error getting products by category', { error, categoryId, filter });
      throw error;
    }
  }
  
  /**
   * Create a new product
   * 
   * @param product Product data
   * @returns Promise that resolves with the created product
   */
  async create(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      return await this.post<Product>('CREATE', product);
    } catch (error) {
      logger.error('Error creating product', { error, product });
      throw error;
    }
  }
  
  /**
   * Update a product
   * 
   * @param id Product ID
   * @param product Product data
   * @returns Promise that resolves with the updated product
   */
  async update(id: string, product: Partial<Product>): Promise<Product> {
    try {
      return await this.post<Product>('UPDATE', {
        id,
        ...product
      });
    } catch (error) {
      logger.error('Error updating product', { error, id, product });
      throw error;
    }
  }
  
  /**
   * Delete a product
   * 
   * @param id Product ID
   * @returns Promise that resolves when the product is deleted
   */
  async delete(id: string): Promise<void> {
    try {
      await this.post('DELETE', { id });
    } catch (error) {
      logger.error('Error deleting product', { error, id });
      throw error;
    }
  }
  
  /**
   * Bulk update product prices
   * 
   * @param productIds Product IDs
   * @param priceChange Price change data
   * @returns Promise that resolves when the prices are updated
   */
  async bulkUpdatePrices(
    productIds: string[],
    priceChange: {
      type: 'percentage' | 'fixed';
      value: number;
      field: 'retailPrice' | 'salePrice' | 'costPrice';
    }
  ): Promise<void> {
    try {
      await this.post('BULK_UPDATE_PRICES', {
        productIds,
        priceChange
      });
    } catch (error) {
      logger.error('Error bulk updating product prices', { error, productIds, priceChange });
      throw error;
    }
  }
  
  /**
   * Get featured products
   * 
   * @param limit Maximum number of products to return
   * @returns Promise that resolves with an array of featured products
   */
  async getFeatured(limit: number = 10): Promise<Product[]> {
    try {
      return await this.get<Product[]>('FEATURED', { limit });
    } catch (error) {
      logger.error('Error getting featured products', { error, limit });
      throw error;
    }
  }
  
  /**
   * Search products
   * 
   * @param query Search query
   * @param filter Optional filter parameters
   * @returns Promise that resolves with an array of products
   */
  async search(query: string, filter?: ProductFilter): Promise<Product[]> {
    try {
      return await this.get<Product[]>('SEARCH', {
        ...filter,
        query
      });
    } catch (error) {
      logger.error('Error searching products', { error, query, filter });
      throw error;
    }
  }
  
  /**
   * Get low stock products
   * 
   * @param threshold Stock threshold
   * @param filter Optional filter parameters
   * @returns Promise that resolves with an array of low stock products
   */
  async getLowStock(threshold?: number, filter?: ProductFilter): Promise<Product[]> {
    try {
      return await this.get<Product[]>('LOW_STOCK', {
        ...filter,
        threshold
      });
    } catch (error) {
      logger.error('Error getting low stock products', { error, threshold, filter });
      throw error;
    }
  }
  
  /**
   * Get product attributes
   * 
   * @returns Promise that resolves with an array of product attributes
   */
  async getAttributes(): Promise<any[]> {
    try {
      return await this.get<any[]>('ATTRIBUTES');
    } catch (error) {
      logger.error('Error getting product attributes', { error });
      throw error;
    }
  }
  
  /**
   * Save product attributes
   * 
   * @param attributes Product attributes
   * @returns Promise that resolves when the attributes are saved
   */
  async saveAttributes(attributes: any[]): Promise<void> {
    try {
      await this.post('SAVE_ATTRIBUTES', { attributes });
    } catch (error) {
      logger.error('Error saving product attributes', { error, attributes });
      throw error;
    }
  }
}

// Create a singleton instance
export const batchProductService = new BatchProductService();

export default batchProductService;
