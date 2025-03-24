import prisma from '../lib/prisma';
import { Product, Prisma } from '@prisma/client';

/**
 * Repository for Product entity
 * Handles database operations for products
 */
export class ProductRepository {
  /**
   * Find all products with optional filtering and pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    include?: Prisma.ProductInclude;
  }): Promise<Product[]> {
    const { skip, take, where, orderBy, include } = params;
    return prisma.product.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
    });
  }

  /**
   * Find a product by ID
   */
  async findById(
    id: string,
    include?: Prisma.ProductInclude
  ): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Find a product by SKU
   */
  async findBySku(
    sku: string,
    include?: Prisma.ProductInclude
  ): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { sku },
      include,
    });
  }

  /**
   * Find a product by barcode
   */
  async findByBarcode(
    barcode: string,
    include?: Prisma.ProductInclude
  ): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { barcode },
      include,
    });
  }

  /**
   * Create a new product
   */
  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
    });
  }

  /**
   * Update an existing product
   */
  async update(
    id: string,
    data: Prisma.ProductUpdateInput
  ): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a product
   */
  async delete(id: string): Promise<Product> {
    return prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Count products with optional filter
   */
  async count(where?: Prisma.ProductWhereInput): Promise<number> {
    return prisma.product.count({
      where,
    });
  }

  /**
   * Find products by category ID with pagination
   */
  async findByCategory(
    categoryId: string,
    params: {
      skip?: number;
      take?: number;
      include?: Prisma.ProductInclude;
    }
  ): Promise<Product[]> {
    const { skip, take, include } = params;
    return prisma.product.findMany({
      where: {
        categoryId,
      },
      skip,
      take,
      include,
    });
  }

  /**
   * Find products by supplier ID with pagination
   */
  async findBySupplier(
    supplierId: string,
    params: {
      skip?: number;
      take?: number;
      include?: Prisma.ProductInclude;
    }
  ): Promise<Product[]> {
    const { skip, take, include } = params;
    return prisma.product.findMany({
      where: {
        supplierId,
      },
      skip,
      take,
      include,
    });
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

    return prisma.product.update({
      where: { id },
      data: updateData,
    });
  }
}

// Export singleton instance
export const productRepository = new ProductRepository(); 