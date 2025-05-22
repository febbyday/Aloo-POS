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
import { createResourceErrorHandlers } from '@/lib/error/operation-error-handler';
import { ResourceType, OperationType } from '@/lib/error/error-messages';
import { handleValidationError } from '@/lib/validation/validation-error-handler';

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
  private api = createApiService('/products');
  private errorHandlers = createResourceErrorHandlers(ResourceType.PRODUCT);

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
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleFetchError(error, {
        suggestion: 'Please check your filters and try again.',
        retry: true
      });

      // Return empty result set instead of throwing
      return {
        products: [],
        total: 0,
        page: filter.page || 1,
        limit: filter.limit || 20,
        totalPages: 0
      };
    }
  }

  /**
   * Get a product by ID
   */
  async getProductById(id: string): Promise<UnifiedProduct | null> {
    try {
      return await this.api.getById<UnifiedProduct>(id);
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleFetchError(error, {
        resourceId: id,
        suggestion: 'The product may have been deleted or moved.'
      });
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

      // Emit event
      eventBus.emit(ProductEventTypes.PRODUCT_CREATED, {
        timestamp: Date.now(),
        product,
      });

      return product;
    } catch (error) {
      // Handle validation errors with improved messages
      if (error instanceof z.ZodError) {
        // Format validation errors and show toasts
        handleValidationError(error, {
          resource: ResourceType.PRODUCT,
          operation: OperationType.CREATE,
          showToasts: true,
          toastTitle: 'Product Validation Error'
        });

        // Throw a more specific error with the product name
        throw new Error(`Failed to create product "${productData.name || 'unknown'}": Validation failed`);
      }

      // Handle other errors with the resource-specific error handler
      this.errorHandlers.handleCreateError(error, {
        resourceName: productData.name,
        suggestion: 'Please check your input and try again.'
      });

      // Throw a generic error if the error handler doesn't throw
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
        // Use a more specific error message
        this.errorHandlers.handleUpdateError(new Error(`Product with ID ${id} not found`), {
          resourceId: id,
          suggestion: 'The product may have been deleted or moved.'
        });
        throw new Error(`Product with ID ${id} not found`);
      }

      // Add updated timestamp
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const updatedProduct = await this.api.patch<UnifiedProduct>(id, updateData);

      // Emit event
      eventBus.emit(ProductEventTypes.PRODUCT_UPDATED, {
        timestamp: Date.now(),
        productId: id,
        changes: data,
        previousValues: currentProduct,
      });

      return updatedProduct;
    } catch (error) {
      // Check if it's a validation error
      if (error instanceof z.ZodError) {
        handleValidationError(error, {
          resource: ResourceType.PRODUCT,
          operation: OperationType.UPDATE,
          showToasts: true,
          toastTitle: 'Product Update Error'
        });
      } else {
        // Use the resource-specific error handler with detailed context
        this.errorHandlers.handleUpdateError(error, {
          resourceId: id,
          resourceName: data.name || '',
          suggestion: 'Please check your input and try again.'
        });
      }

      // Rethrow with improved message
      throw new Error(`Failed to update product ${data.name || `ID: ${id}`}`);
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<boolean> {
    // Get product before deletion for event
    let product: UnifiedProduct | null = null;

    try {
      product = await this.getProductById(id);

      // If product doesn't exist, handle gracefully
      if (!product) {
        this.errorHandlers.handleDeleteError(new Error(`Product with ID ${id} not found`), {
          resourceId: id,
          suggestion: 'The product may have already been deleted.'
        });
        return false;
      }

      await this.api.delete<boolean>(id);

      // Emit event
      eventBus.emit(ProductEventTypes.PRODUCT_DELETED, {
        timestamp: Date.now(),
        productId: id,
        product,
      });

      return true;
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleDeleteError(error, {
        resourceId: id,
        resourceName: product?.name || '',
        suggestion: 'Please check if you have permission to delete this product.'
      });

      return false;
    }
  }

  /**
   * Get variants for a product
   */
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    try {
      return await this.api.get<ProductVariant[]>(`${productId}/variants`);
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleFetchError(error, {
        resourceId: productId,
        suggestion: 'Please check if the product exists and has variants.'
      });
      return [];
    }
  }

  /**
   * Create a new variant for a product
   */
  async createProductVariant(productId: string, variant: Omit<ProductVariant, 'id'>): Promise<ProductVariant> {
    try {
      const newVariant = await this.api.post<ProductVariant>(`${productId}/variants`, variant);

      // Emit event
      eventBus.emit(ProductEventTypes.VARIANT_CREATED, {
        timestamp: Date.now(),
        productId,
        variant: newVariant,
      });

      return newVariant;
    } catch (error) {
      // Check if it's a validation error
      if (error instanceof z.ZodError) {
        handleValidationError(error, {
          resource: ResourceType.PRODUCT,
          operation: OperationType.CREATE,
          showToasts: true,
          toastTitle: 'Variant Creation Error'
        });
      } else {
        // Use the resource-specific error handler with detailed context
        this.errorHandlers.handleCreateError(error, {
          resourceId: productId,
          resourceName: `variant for product ${productId}`,
          suggestion: 'Please check your input and try again.'
        });
      }

      // Rethrow with improved message
      throw new Error(`Failed to create variant for product ${productId}`);
    }
  }

  /**
   * Update a product variant
   */
  async updateProductVariant(productId: string, variantId: string, data: Partial<ProductVariant>): Promise<ProductVariant> {
    try {
      const updatedVariant = await this.api.patch<ProductVariant>(`${productId}/variants/${variantId}`, data);

      // Emit event
      eventBus.emit(ProductEventTypes.VARIANT_UPDATED, {
        timestamp: Date.now(),
        productId,
        variantId,
        changes: data,
      });

      return updatedVariant;
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleUpdateError(error, {
        resourceId: `${productId}/variants/${variantId}`,
        resourceName: 'variant',
        suggestion: 'Please check your input and try again.'
      });

      // Rethrow with improved message
      throw new Error(`Failed to update variant ${variantId} for product ${productId}`);
    }
  }

  /**
   * Delete a product variant
   */
  async deleteProductVariant(productId: string, variantId: string): Promise<boolean> {
    try {
      await this.api.delete<boolean>(`${productId}/variants/${variantId}`);

      // Emit event
      eventBus.emit(ProductEventTypes.VARIANT_DELETED, {
        timestamp: Date.now(),
        productId,
        variantId,
      });

      return true;
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleDeleteError(error, {
        resourceId: `${productId}/variants/${variantId}`,
        resourceName: 'variant',
        suggestion: 'Please check if you have permission to delete this variant.'
      });

      // Return false instead of throwing
      return false;
    }
  }

  /**
   * Generate a variant matrix based on attributes
   */
  async generateVariantMatrix(config: VariantGenerationConfig): Promise<VariantMatrix> {
    try {
      return await this.api.post<VariantMatrix>('variants/matrix', config);
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleProcessError(error, {
        resourceName: 'variant matrix',
        suggestion: 'Please check your attribute configuration and try again.'
      });

      // Rethrow with improved message
      throw new Error('Failed to generate variant matrix. Please check your attribute configuration.');
    }
  }

  /**
   * Bulk update variants
   */
  async bulkUpdateVariants(update: BulkVariantUpdate): Promise<number> {
    try {
      const result = await this.api.post<{ count: number }>('variants/bulk-update', update);

      // Emit event
      eventBus.emit(ProductEventTypes.BULK_UPDATE_COMPLETED, {
        timestamp: Date.now(),
        count: result.count,
        updateType: update.updateType,
      });

      return result.count;
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleUpdateError(error, {
        resourceName: 'variants',
        suggestion: 'Please check your update configuration and try again.'
      });

      // Return 0 to indicate no variants were updated
      return 0;
    }
  }

  /**
   * Update a product's status
   */
  async updateProductStatus(id: string, status: ProductStatus): Promise<UnifiedProduct> {
    // Get product before update for event tracking
    let currentProduct: UnifiedProduct | null = null;

    try {
      currentProduct = await this.getProductById(id);
      if (!currentProduct) {
        this.errorHandlers.handleUpdateError(new Error(`Product with ID ${id} not found`), {
          resourceId: id,
          suggestion: 'The product may have been deleted or moved.'
        });
        throw new Error(`Product with ID ${id} not found`);
      }

      const updatedProduct = await this.updateProduct(id, { status });

      // Emit specific status change event
      eventBus.emit(ProductEventTypes.PRODUCT_STATUS_CHANGED, {
        timestamp: Date.now(),
        productId: id,
        previousStatus: currentProduct.status,
        newStatus: status,
      });

      return updatedProduct;
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleUpdateError(error, {
        resourceId: id,
        resourceName: currentProduct?.name || '',
        suggestion: 'Please check if the product exists and you have permission to update it.'
      });

      // Rethrow with improved message
      throw new Error(`Failed to update status for product ${currentProduct?.name || id} to ${status}`);
    }
  }

  /**
   * Update a product's stock level
   */
  async updateProductStock(id: string, newStock: number, reason?: string): Promise<UnifiedProduct> {
    // Get product before update for event tracking
    let currentProduct: UnifiedProduct | null = null;

    try {
      currentProduct = await this.getProductById(id);
      if (!currentProduct) {
        this.errorHandlers.handleUpdateError(new Error(`Product with ID ${id} not found`), {
          resourceId: id,
          suggestion: 'The product may have been deleted or moved.'
        });
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

      // Emit stock change event
      eventBus.emit(ProductEventTypes.PRODUCT_STOCK_CHANGED, {
        timestamp: Date.now(),
        productId: id,
        previousStock,
        newStock,
        reason,
      });

      return updatedProduct;
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleUpdateError(error, {
        resourceId: id,
        resourceName: currentProduct?.name || '',
        suggestion: 'Please check if the product exists and you have permission to update it.'
      });

      // Rethrow with improved message
      throw new Error(`Failed to update stock for product ${currentProduct?.name || id} to ${newStock}`);
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string): Promise<UnifiedProduct[]> {
    try {
      return await this.api.get<UnifiedProduct[]>(`category/${categoryId}`);
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleFetchError(error, {
        resourceId: categoryId,
        resourceName: 'category products',
        suggestion: 'Please check if the category exists.'
      });
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
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleSearchError(error, {
        resourceName: `products matching "${query}"`,
        suggestion: 'Please try a different search term or check your connection.'
      });
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

      // Emit event
      eventBus.emit(ProductEventTypes.BULK_UPDATE_COMPLETED, {
        timestamp: Date.now(),
        count: result.count,
        changes,
      });

      return result.count;
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleUpdateError(error, {
        resourceName: `${ids.length} products`,
        suggestion: 'Please check your update data and try again.'
      });

      // Return 0 to indicate no products were updated
      return 0;
    }
  }

  /**
   * Bulk delete multiple products
   */
  async bulkDeleteProducts(ids: string[]): Promise<number> {
    try {
      const result = await this.api.post<{ count: number }>('bulk-delete', { ids });

      // Emit event
      eventBus.emit(ProductEventTypes.BULK_UPDATE_COMPLETED, {
        timestamp: Date.now(),
        count: result.count,
        operation: 'delete',
      });

      return result.count;
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleDeleteError(error, {
        resourceName: `${ids.length} products`,
        suggestion: 'Please check if you have permission to delete these products.'
      });

      // Return 0 to indicate no products were deleted
      return 0;
    }
  }

  /**
   * Get product history
   */
  async getProductHistory(id: string): Promise<ProductHistoryAction[]> {
    try {
      return await this.api.get<ProductHistoryAction[]>(`${id}/history`);
    } catch (error) {
      // Use the resource-specific error handler with detailed context
      this.errorHandlers.handleFetchError(error, {
        resourceId: id,
        resourceName: 'product history',
        suggestion: 'Please check if the product exists and you have permission to view its history.'
      });
      return [];
    }
  }
}

// Export singleton instance
export const productService = new ProductService();