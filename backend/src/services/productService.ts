import { Product, Prisma, ProductStatus } from '@prisma/client';
import { productRepository, ProductRepository } from '../repositories/productRepository';
import prisma from '../lib/prisma';

/**
 * ProductService
 * Handles business logic for products
 */
export class ProductService {
  private repository: ProductRepository;

  constructor(repository: ProductRepository) {
    this.repository = repository;
  }

  /**
   * Get all products with optional filtering and pagination
   */
  async getAllProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    supplierId?: string;
    status?: ProductStatus;
    minPrice?: number;
    maxPrice?: number;
    lowStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      supplierId,
      status,
      minPrice,
      maxPrice,
      lowStock = false,
      sortBy = 'name',
      sortOrder = 'asc',
    } = params;

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    // Search by name, description, SKU, or barcode
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by category
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filter by supplier
    if (supplierId) {
      where.supplierId = supplierId;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.retailPrice = {};
      
      if (minPrice !== undefined) {
        where.retailPrice.gte = minPrice;
      }
      
      if (maxPrice !== undefined) {
        where.retailPrice.lte = maxPrice;
      }
    }

    // Filter by low stock
    if (lowStock) {
      where.stock = {
        lte: Prisma.raw('`Product`.`reorderPoint`'),
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Include related data
    const include: Prisma.ProductInclude = {
      Category: {
        select: { name: true },
      },
      Supplier: {
        select: { name: true },
      },
    };

    // Get products
    const products = await this.repository.findAll({
      skip,
      take: limit,
      where,
      orderBy,
      include,
    });

    // Get total count
    const total = await this.repository.count(where);

    return {
      products,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    return this.repository.findById(id, {
      Category: {
        select: { name: true },
      },
      Supplier: {
        select: { name: true },
      },
      locations: {
        include: {
          store: {
            select: { id: true, name: true, type: true },
          },
        },
      },
    });
  }

  /**
   * Get a product by SKU
   */
  async getProductBySku(sku: string): Promise<Product | null> {
    return this.repository.findBySku(sku, {
      Category: {
        select: { name: true },
      },
      Supplier: {
        select: { name: true },
      },
    });
  }

  /**
   * Get a product by barcode
   */
  async getProductByBarcode(barcode: string): Promise<Product | null> {
    return this.repository.findByBarcode(barcode, {
      Category: {
        select: { name: true },
      },
      Supplier: {
        select: { name: true },
      },
    });
  }

  /**
   * Create a new product
   */
  async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.repository.create(data);
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.repository.update(id, data);
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<Product> {
    return this.repository.delete(id);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    page = 1,
    limit = 20
  ): Promise<{ products: Product[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const products = await this.repository.findByCategory(categoryId, {
      skip,
      take: limit,
      include: {
        Supplier: {
          select: { name: true },
        },
      },
    });

    const total = await this.repository.count({ categoryId });

    return { products, total };
  }

  /**
   * Get products by supplier
   */
  async getProductsBySupplier(
    supplierId: string,
    page = 1,
    limit = 20
  ): Promise<{ products: Product[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const products = await this.repository.findBySupplier(supplierId, {
      skip,
      take: limit,
      include: {
        Category: {
          select: { name: true },
        },
      },
    });

    const total = await this.repository.count({ supplierId });

    return { products, total };
  }

  /**
   * Update stock for a product
   */
  async updateStock(
    id: string, 
    quantity: number, 
    operation: 'add' | 'subtract' | 'set' = 'set'
  ): Promise<Product> {
    return this.repository.updateStock(id, quantity, operation);
  }

  /**
   * Quick search for products by name, SKU, or barcode
   */
  async quickSearch(query: string, limit = 10): Promise<Product[]> {
    return this.repository.findAll({
      take: limit,
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { barcode: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        Category: {
          select: { name: true },
        },
      },
    });
  }

  /**
   * Adjust stock across multiple locations
   */
  async adjustStockAcrossLocations(
    productId: string,
    adjustments: Array<{
      storeId: string;
      quantity: number;
      operation: 'add' | 'subtract' | 'set';
    }>
  ): Promise<{ success: boolean; locations: any[] }> {
    const locations = [];

    // Use a transaction to ensure all adjustments succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      for (const adjustment of adjustments) {
        const { storeId, quantity, operation } = adjustment;

        // Find the product location
        const locationKey = { productId, storeId };
        const productLocation = await tx.productLocation.findUnique({
          where: {
            productId_storeId: locationKey,
          },
        });

        let updatedLocation;
        
        if (productLocation) {
          // Update existing location
          let newStock = productLocation.stock;
          
          if (operation === 'add') {
            newStock += quantity;
          } else if (operation === 'subtract') {
            newStock = Math.max(0, newStock - quantity); // Prevent negative stock
          } else {
            newStock = quantity;
          }
          
          updatedLocation = await tx.productLocation.update({
            where: { id: productLocation.id },
            data: { stock: newStock },
          });
        } else {
          // Create new location if it doesn't exist
          updatedLocation = await tx.productLocation.create({
            data: {
              product: { connect: { id: productId } },
              store: { connect: { id: storeId } },
              stock: operation === 'set' ? quantity : (operation === 'add' ? quantity : 0),
            },
          });
        }
        
        locations.push(updatedLocation);
      }

      // Update the main product stock as a sum of all location stocks
      const totalStock = await tx.productLocation.aggregate({
        _sum: {
          stock: true,
        },
        where: {
          productId,
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: { stock: totalStock._sum.stock || 0 },
      });

      return { success: true, locations };
    });

    return result;
  }
}

// Export singleton instance
export const productService = new ProductService(productRepository); 