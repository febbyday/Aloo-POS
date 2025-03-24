/**
 * Product Service
 * 
 * This service provides the interface for interacting with product data.
 * It abstracts the data access layer and business logic for the Products module.
 */

import { createApiService, QueryParams } from '@/lib/api/createApiService';
import { 
  UnifiedProduct, 
  ProductFormData, 
  ProductVariant, 
  ProductVariation,
  InventoryFilter,
  ProductListResponse,
  ProductStatus,
  StockStatus,
  ProductHistoryAction,
  BulkVariantUpdate,
  VariantGenerationConfig,
  VariantMatrix,
  UnifiedProductSchema
} from '../types/unified-product.types';
import { eventBus } from '@/lib/eventBus';
import { z } from 'zod';

/**
 * Product event types for the event bus
 */
export enum ProductEventTypes {
  PRODUCT_CREATED = 'product:created',
  PRODUCT_UPDATED = 'product:updated',
  PRODUCT_DELETED = 'product:deleted',
  PRODUCT_STOCK_CHANGED = 'product:stock_changed',
  PRODUCT_PRICE_CHANGED = 'product:price_changed',
  PRODUCT_STATUS_CHANGED = 'product:status_changed',
  PRODUCT_IMPORTED = 'product:imported',
  PRODUCT_EXPORTED = 'product:exported',
  VARIANT_CREATED = 'product:variant_created',
  VARIANT_UPDATED = 'product:variant_updated',
  VARIANT_DELETED = 'product:variant_deleted',
  BULK_UPDATE_COMPLETED = 'product:bulk_update_completed'
}

/**
 * Interface for the product service
 */
export interface IProductService {
  // Core CRUD operations
  getProducts(filter?: InventoryFilter): Promise<ProductListResponse>;
  getProductById(id: string): Promise<UnifiedProduct | null>;
  createProduct(product: ProductFormData): Promise<UnifiedProduct>;
  updateProduct(id: string, data: Partial<UnifiedProduct>): Promise<UnifiedProduct>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Variant operations
  getProductVariants(productId: string): Promise<ProductVariant[]>;
  createProductVariant(productId: string, variant: Omit<ProductVariant, 'id'>): Promise<ProductVariant>;
  updateProductVariant(productId: string, variantId: string, data: Partial<ProductVariant>): Promise<ProductVariant>;
  deleteProductVariant(productId: string, variantId: string): Promise<boolean>;
  generateVariantMatrix(config: VariantGenerationConfig): Promise<VariantMatrix>;
  bulkUpdateVariants(update: BulkVariantUpdate): Promise<number>;
  
  // Status operations
  updateProductStatus(id: string, status: ProductStatus): Promise<UnifiedProduct>;
  
  // Stock operations
  updateProductStock(id: string, newStock: number, reason?: string): Promise<UnifiedProduct>;
  
  // Category operations
  getProductsByCategory(categoryId: string): Promise<UnifiedProduct[]>;
  
  // Search operations
  searchProducts(query: string): Promise<UnifiedProduct[]>;
  
  // Bulk operations
  bulkUpdateProducts(ids: string[], changes: Partial<UnifiedProduct>): Promise<number>;
  bulkDeleteProducts(ids: string[]): Promise<number>;
  
  // History operations
  getProductHistory(id: string): Promise<ProductHistoryAction[]>;
}

/**
 * Implementation of the product service
 */
class ProductService implements IProductService {
  private api = createApiService('/api/products');
  
  /**
   * Get a paginated list of products with filtering
   */
  async getProducts(filter: InventoryFilter = {}): Promise<ProductListResponse> {
    try {
      // Convert filter to query params
      const params: QueryParams = {
        ...filter,
        page: filter.page || 1,
        limit: filter.limit || 20
      };
      
      // If price range is specified, convert to min/max params
      if (filter.priceRange) {
        if (filter.priceRange.min !== undefined) {
          params.minPrice = filter.priceRange.min;
        }
        if (filter.priceRange.max !== undefined) {
          params.maxPrice = filter.priceRange.max;
        }
        delete params.priceRange;
      }
      
      // If categories is an array, convert to comma-separated string
      if (filter.categories && Array.isArray(filter.categories)) {
        params.categories = filter.categories.join(',');
      }
      
      // If locations is an array, convert to comma-separated string
      if (filter.locations && Array.isArray(filter.locations)) {
        params.locations = filter.locations.join(',');
      }
      
      const response = await this.api.getPaginated<UnifiedProduct>('', params);
      
      return {
        products: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      };
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get a product by ID
   */
  async getProductById(id: string): Promise<UnifiedProduct | null> {
    try {
      return await this.api.getById<UnifiedProduct>(id);
    } catch (error) {
      console.error(`Failed to fetch product with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new product
   */
  async createProduct(productData: ProductFormData): Promise<UnifiedProduct> {
    try {
      // Validate data with Zod schema
      const validatedData = UnifiedProductSchema.parse({
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      const product = await this.api.post<UnifiedProduct>('', validatedData);
      
      // Publish event
      eventBus.publish({
        type: ProductEventTypes.PRODUCT_CREATED,
        timestamp: Date.now(),
        product,
      });
      
      return product;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      console.error('Failed to create product:', error);
      throw new Error('Failed to create product');
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, data: Partial<UnifiedProduct>): Promise<UnifiedProduct> {
    try {
      // Get current product for event tracking
      const currentProduct = await this.getProductById(id);
      if (!currentProduct) {
        throw new Error(`Product with ID ${id} not found`);
      }
      
      // Add updated timestamp
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedProduct = await this.api.patch<UnifiedProduct>(id, updateData);
      
      // Publish event
      eventBus.publish({
        type: ProductEventTypes.PRODUCT_UPDATED,
        timestamp: Date.now(),
        productId: id,
        changes: data,
        previousValues: currentProduct,
      });
      
      return updatedProduct;
    } catch (error) {
      console.error(`Failed to update product with ID ${id}:`, error);
      throw new Error(`Failed to update product with ID ${id}`);
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      // Get product before deletion for event
      const product = await this.getProductById(id);
      
      await this.api.delete<boolean>(id);
      
      // Publish event
      if (product) {
        eventBus.publish({
          type: ProductEventTypes.PRODUCT_DELETED,
          timestamp: Date.now(),
          productId: id,
          product,
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to delete product with ID ${id}:`, error);
      throw new Error(`Failed to delete product with ID ${id}`);
    }
  }

  /**
   * Get variants for a product
   */
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    try {
      return await this.api.get<ProductVariant[]>(`${productId}/variants`);
    } catch (error) {
      console.error(`Failed to fetch variants for product ${productId}:`, error);
      return [];
    }
  }

  /**
   * Create a new variant for a product
   */
  async createProductVariant(productId: string, variant: Omit<ProductVariant, 'id'>): Promise<ProductVariant> {
    try {
      const newVariant = await this.api.post<ProductVariant>(`${productId}/variants`, variant);
      
      // Publish event
      eventBus.publish({
        type: ProductEventTypes.VARIANT_CREATED,
        timestamp: Date.now(),
        productId,
        variant: newVariant,
      });
      
      return newVariant;
    } catch (error) {
      console.error(`Failed to create variant for product ${productId}:`, error);
      throw new Error(`Failed to create variant for product ${productId}`);
    }
  }

  /**
   * Update a product variant
   */
  async updateProductVariant(productId: string, variantId: string, data: Partial<ProductVariant>): Promise<ProductVariant> {
    try {
      const updatedVariant = await this.api.patch<ProductVariant>(`${productId}/variants/${variantId}`, data);
      
      // Publish event
      eventBus.publish({
        type: ProductEventTypes.VARIANT_UPDATED,
        timestamp: Date.now(),
        productId,
        variantId,
        changes: data,
      });
      
      return updatedVariant;
    } catch (error) {
      console.error(`Failed to update variant ${variantId} for product ${productId}:`, error);
      throw new Error(`Failed to update variant ${variantId}`);
    }
  }

  /**
   * Delete a product variant
   */
  async deleteProductVariant(productId: string, variantId: string): Promise<boolean> {
    try {
      await this.api.delete<boolean>(`${productId}/variants/${variantId}`);
      
      // Publish event
      eventBus.publish({
        type: ProductEventTypes.VARIANT_DELETED,
        timestamp: Date.now(),
        productId,
        variantId,
      });
      
      return true;
    } catch (error) {
      console.error(`Failed to delete variant ${variantId} for product ${productId}:`, error);
      throw new Error(`Failed to delete variant ${variantId}`);
    }
  }

  /**
   * Generate a variant matrix based on attributes
   */
  async generateVariantMatrix(config: VariantGenerationConfig): Promise<VariantMatrix> {
    try {
      return await this.api.post<VariantMatrix>('variants/matrix', config);
    } catch (error) {
      console.error('Failed to generate variant matrix:', error);
      throw new Error('Failed to generate variant matrix');
    }
  }

  /**
   * Bulk update variants
   */
  async bulkUpdateVariants(update: BulkVariantUpdate): Promise<number> {
    try {
      const result = await this.api.post<{ count: number }>('variants/bulk-update', update);
      
      // Publish event
      eventBus.publish({
        type: ProductEventTypes.BULK_UPDATE_COMPLETED,
        timestamp: Date.now(),
        count: result.count,
        updateType: update.updateType,
      });
      
      return result.count;
    } catch (error) {
      console.error('Failed to bulk update variants:', error);
      throw new Error('Failed to bulk update variants');
    }
  }

  /**
   * Update a product's status
   */
  async updateProductStatus(id: string, status: ProductStatus): Promise<UnifiedProduct> {
    try {
      const currentProduct = await this.getProductById(id);
      if (!currentProduct) {
        throw new Error(`Product with ID ${id} not found`);
      }
      
      const updatedProduct = await this.updateProduct(id, { status });
      
      // Publish specific status change event
      eventBus.publish({
        type: ProductEventTypes.PRODUCT_STATUS_CHANGED,
        timestamp: Date.now(),
        productId: id,
        previousStatus: currentProduct.status,
        newStatus: status,
      });
      
      return updatedProduct;
    } catch (error) {
      console.error(`Failed to update status for product ${id}:`, error);
      throw new Error(`Failed to update status for product ${id}`);
    }
  }

  /**
   * Update a product's stock level
   */
  async updateProductStock(id: string, newStock: number, reason?: string): Promise<UnifiedProduct> {
    try {
      const currentProduct = await this.getProductById(id);
      if (!currentProduct) {
        throw new Error(`Product with ID ${id} not found`);
      }
      
      const previousStock = currentProduct.stock || 0;
      
      // Calculate new stock status
      let stockStatus = currentProduct.stockStatus;
      if (newStock <= 0) {
        stockStatus = StockStatus.OUT_OF_STOCK;
      } else if (currentProduct.minStock && newStock <= currentProduct.minStock) {
        stockStatus = StockStatus.ON_BACKORDER;
      } else {
        stockStatus = StockStatus.IN_STOCK;
      }
      
      const updatedProduct = await this.updateProduct(id, { 
        stock: newStock,
        stockStatus,
      });
      
      // Publish stock change event
      eventBus.publish({
        type: ProductEventTypes.PRODUCT_STOCK_CHANGED,
        timestamp: Date.now(),
        productId: id,
        previousStock,
        newStock,
        reason,
      });
      
      return updatedProduct;
    } catch (error) {
      console.error(`Failed to update stock for product ${id}:`, error);
      throw new Error(`Failed to update stock for product ${id}`);
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string): Promise<UnifiedProduct[]> {
    try {
      return await this.api.get<UnifiedProduct[]>(`category/${categoryId}`);
    } catch (error) {
      console.error(`Failed to fetch products for category ${categoryId}:`, error);
      return [];
    }
  }

  /**
   * Search products by query string
   */
  async searchProducts(query: string): Promise<UnifiedProduct[]> {
    try {
      const response = await this.api.getPaginated<UnifiedProduct>('search', { query });
      return response.data;
    } catch (error) {
      console.error(`Failed to search products with query "${query}":`, error);
      return [];
    }
  }

  /**
   * Bulk update multiple products
   */
  async bulkUpdateProducts(ids: string[], changes: Partial<UnifiedProduct>): Promise<number> {
    try {
      const result = await this.api.post<{ count: number }>('bulk-update', {
        ids,
        changes,
      });
      
      // Publish event
      eventBus.publish({
        type: ProductEventTypes.BULK_UPDATE_COMPLETED,
        timestamp: Date.now(),
        count: result.count,
        changes,
      });
      
      return result.count;
    } catch (error) {
      console.error('Failed to bulk update products:', error);
      throw new Error('Failed to bulk update products');
    }
  }

  /**
   * Bulk delete multiple products
   */
  async bulkDeleteProducts(ids: string[]): Promise<number> {
    try {
      const result = await this.api.post<{ count: number }>('bulk-delete', { ids });
      
      // Publish event
      eventBus.publish({
        type: ProductEventTypes.BULK_UPDATE_COMPLETED,
        timestamp: Date.now(),
        count: result.count,
        operation: 'delete',
      });
      
      return result.count;
    } catch (error) {
      console.error('Failed to bulk delete products:', error);
      throw new Error('Failed to bulk delete products');
    }
  }

  /**
   * Get product history
   */
  async getProductHistory(id: string): Promise<ProductHistoryAction[]> {
    try {
      return await this.api.get<ProductHistoryAction[]>(`${id}/history`);
    } catch (error) {
      console.error(`Failed to fetch history for product ${id}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const productService = new ProductService(); 