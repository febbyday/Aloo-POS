import { Store, Prisma, ProductLocation } from '@prisma/client';
import { storeRepository, StoreRepository } from '../repositories/storeRepository';
import { prisma } from '../index';

/**
 * StoreService
 * Handles business logic for stores
 */
export class StoreService {
  private repository: StoreRepository;

  constructor(repository: StoreRepository) {
    this.repository = repository;
  }

  /**
   * Get all stores with optional filtering and pagination
   */
  async getAllStores(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ stores: Store[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
    } = params;

    // Build where clause
    const where: Prisma.StoreWhereInput = {};

    // Search by name, address, city, etc.
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by store type
    if (type) {
      where.type = type as any;
    }

    // Filter by active status
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Prisma.StoreOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Include related data
    const include: Prisma.StoreInclude = {
      _count: {
        select: {
          productLocations: true,
          orders: true,
        },
      },
    };

    // Get stores
    const stores = await this.repository.findAll({
      skip,
      take: limit,
      where,
      orderBy,
      include,
    });

    // Get total count
    const total = await this.repository.count(where);

    return {
      stores,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a store by ID
   */
  async getStoreById(id: string): Promise<Store | null> {
    return this.repository.findById(id, {
      productLocations: {
        take: 10,
        include: {
          product: true,
        },
        orderBy: {
          stock: 'asc',
        },
      },
      orders: {
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          productLocations: true,
          orders: true,
        },
      },
    });
  }

  /**
   * Create a new store
   */
  async createStore(data: Prisma.StoreCreateInput): Promise<Store> {
    return this.repository.create(data);
  }

  /**
   * Update an existing store
   */
  async updateStore(id: string, data: Prisma.StoreUpdateInput): Promise<Store> {
    return this.repository.update(id, data);
  }

  /**
   * Delete a store
   */
  async deleteStore(id: string): Promise<Store> {
    return this.repository.delete(id);
  }

  /**
   * Get inventory for a specific store with pagination
   */
  async getStoreInventory(
    storeId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      lowStock?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{
    storeId: string;
    storeName: string;
    products: (ProductLocation & {
      product: {
        id: string;
        name: string;
        sku: string;
      };
    })[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      lowStock = false,
      sortBy = 'stock',
      sortOrder = 'asc',
    } = params;

    // Verify store exists
    const store = await this.repository.findById(storeId);
    if (!store) {
      throw new Error('Store not found');
    }

    // Build the where clause
    const where: Prisma.ProductLocationWhereInput = {
      storeId,
    };

    // Filter by low stock status if requested
    if (lowStock) {
      where.stock = {
        lte: Prisma.raw('`ProductLocation`.`minStock`'),
      };
    }

    // Add search filter if provided
    if (search) {
      where.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy
    let orderBy: any = {};
    if (sortBy.startsWith('product.')) {
      // Ordering by product field
      const productField = sortBy.replace('product.', '');
      orderBy = {
        product: {
          [productField]: sortOrder,
        },
      };
    } else {
      // Ordering by direct location field
      orderBy = {
        [sortBy]: sortOrder,
      };
    }

    // Fetch product locations with products
    const productLocations = await prisma.productLocation.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });

    // Get total count
    const total = await prisma.productLocation.count({ where });

    return {
      storeId,
      storeName: store.name,
      products: productLocations,
      total,
      page,
      limit,
    };
  }

  /**
   * Update inventory for a specific product in a store
   */
  async updateInventory(
    storeId: string,
    productId: string,
    data: {
      stock: number;
      minStock?: number;
      maxStock?: number;
    }
  ): Promise<ProductLocation> {
    // Check if product location exists
    const existingLocation = await prisma.productLocation.findUnique({
      where: {
        productId_storeId: {
          productId,
          storeId,
        },
      },
    });

    if (existingLocation) {
      // Update existing location
      return prisma.productLocation.update({
        where: {
          id: existingLocation.id,
        },
        data,
      });
    } else {
      // Create new location
      return prisma.productLocation.create({
        data: {
          product: {
            connect: { id: productId },
          },
          store: {
            connect: { id: storeId },
          },
          stock: data.stock,
          minStock: data.minStock || 0,
          maxStock: data.maxStock || 100,
        },
      });
    }
  }
}

// Export singleton instance
export const storeService = new StoreService(storeRepository); 