import prisma from '../prisma';
import { Product, Prisma } from '@prisma/client';
import { OptimizedRepository } from './base/OptimizedRepository';
import { logger } from '../utils/logger';

/**
 * Repository for Product entity
 * Handles database operations for products with optimization and caching
 */
export class ProductRepository extends OptimizedRepository<
  Product,
  Prisma.ProductWhereInput,
  Prisma.ProductOrderByWithRelationInput,
  Prisma.ProductInclude
> {
  constructor() {
    super(prisma, 'product');
  }

  /**
   * Find a product by SKU with caching
   */
  async findBySku(
    sku: string,
    include?: Prisma.ProductInclude,
    options: { cacheable?: boolean; cacheTTL?: number } = {}
  ): Promise<Product | null> {
    const { cacheable = true, cacheTTL } = options;

    try {
      return await executeQuery<Product | null>(
        this.modelName,
        'findUnique:sku',
        () => (this.prisma[this.modelName] as any).findUnique({
          where: { sku },
          include,
        }),
        { sku, include },
        { cache: cacheable, ttl: cacheTTL }
      );
    } catch (error) {
      logger.error(`Error finding product by SKU: ${sku}`, error);
      throw handleDatabaseError(error, 'findBySku', this.modelName);
    }
  }

  /**
   * Find a product by barcode with caching
   */
  async findByBarcode(
    barcode: string,
    include?: Prisma.ProductInclude,
    options: { cacheable?: boolean; cacheTTL?: number } = {}
  ): Promise<Product | null> {
    const { cacheable = true, cacheTTL } = options;

    try {
      return await executeQuery<Product | null>(
        this.modelName,
        'findUnique:barcode',
        () => (this.prisma[this.modelName] as any).findUnique({
          where: { barcode },
          include,
        }),
        { barcode, include },
        { cache: cacheable, ttl: cacheTTL }
      );
    } catch (error) {
      logger.error(`Error finding product by barcode: ${barcode}`, error);
      throw handleDatabaseError(error, 'findByBarcode', this.modelName);
    }
  }

  /**
   * Find products by category ID with pagination and caching
   */
  async findByCategory(
    categoryId: string,
    params: {
      skip?: number;
      take?: number;
      include?: Prisma.ProductInclude;
      cacheable?: boolean;
      cacheTTL?: number;
    } = {}
  ): Promise<Product[]> {
    const {
      skip,
      take,
      include,
      cacheable = true,
      cacheTTL
    } = params;

    try {
      return await executeQuery<Product[]>(
        this.modelName,
        'findMany:category',
        () => (this.prisma[this.modelName] as any).findMany({
          where: {
            categoryId,
          },
          skip,
          take,
          include,
        }),
        { categoryId, skip, take, include },
        { cache: cacheable, ttl: cacheTTL }
      );
    } catch (error) {
      logger.error(`Error finding products by category: ${categoryId}`, error);
      throw handleDatabaseError(error, 'findByCategory', this.modelName);
    }
  }

  /**
   * Find products by supplier ID with pagination and caching
   */
  async findBySupplier(
    supplierId: string,
    params: {
      skip?: number;
      take?: number;
      include?: Prisma.ProductInclude;
      cacheable?: boolean;
      cacheTTL?: number;
    } = {}
  ): Promise<Product[]> {
    const {
      skip,
      take,
      include,
      cacheable = true,
      cacheTTL
    } = params;

    try {
      return await executeQuery<Product[]>(
        this.modelName,
        'findMany:supplier',
        () => (this.prisma[this.modelName] as any).findMany({
          where: {
            supplierId,
          },
          skip,
          take,
          include,
        }),
        { supplierId, skip, take, include },
        { cache: cacheable, ttl: cacheTTL }
      );
    } catch (error) {
      logger.error(`Error finding products by supplier: ${supplierId}`, error);
      throw handleDatabaseError(error, 'findBySupplier', this.modelName);
    }
  }

  /**
   * Update stock for a product
   */
  async updateStock(
    id: string,
    quantity: number,
    operation: 'add' | 'subtract' | 'set' = 'set'
  ): Promise<Product> {
    let updateData: Prisma.ProductUpdateInput = {};

    if (operation === 'add') {
      updateData = {
        stock: {
          increment: quantity,
        },
      };
    } else if (operation === 'subtract') {
      updateData = {
        stock: {
          decrement: quantity,
        },
      };
    } else {
      updateData = {
        stock: quantity,
      };
    }

    try {
      const result = await executeQuery<Product>(
        this.modelName,
        'updateStock',
        () => (this.prisma[this.modelName] as any).update({
          where: { id },
          data: updateData,
        }),
        { id, quantity, operation },
        { cache: false }
      );

      // Invalidate cache for this entity
      this.invalidateCache();

      return result;
    } catch (error) {
      logger.error(`Error updating stock for product: ${id}`, error);
      throw handleDatabaseError(error, 'updateStock', this.modelName);
    }
  }

  /**
   * Find products with low stock
   */
  async findLowStock(
    params: {
      skip?: number;
      take?: number;
      include?: Prisma.ProductInclude;
      cacheable?: boolean;
      cacheTTL?: number;
    } = {}
  ): Promise<Product[]> {
    const {
      skip,
      take,
      include,
      cacheable = true,
      cacheTTL = 5 * 60 * 1000 // 5 minutes
    } = params;

    try {
      return await executeQuery<Product[]>(
        this.modelName,
        'findMany:lowStock',
        () => (this.prisma[this.modelName] as any).findMany({
          where: {
            stock: {
              lte: Prisma.raw('`reorderPoint`'),
            },
          },
          skip,
          take,
          include,
          orderBy: {
            stock: 'asc',
          },
        }),
        { skip, take, include },
        { cache: cacheable, ttl: cacheTTL }
      );
    } catch (error) {
      logger.error('Error finding products with low stock', error);
      throw handleDatabaseError(error, 'findLowStock', this.modelName);
    }
  }
}

// Import missing dependencies
import { executeQuery } from '../utils/query-optimizer';
import { handleDatabaseError } from '../utils/databaseErrorHandler';

// Export singleton instance
export const productRepository = new ProductRepository();