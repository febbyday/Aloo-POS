import { prisma } from '../index';
import { Store, Prisma } from '@prisma/client';

/**
 * Repository for Store entity
 * Handles database operations for stores
 */
export class StoreRepository {
  /**
   * Find all stores with optional filtering and pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.StoreWhereInput;
    orderBy?: Prisma.StoreOrderByWithRelationInput;
    include?: Prisma.StoreInclude;
  }): Promise<Store[]> {
    const { skip, take, where, orderBy, include } = params;
    return prisma.store.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
    });
  }

  /**
   * Find a store by ID
   */
  async findById(
    id: string,
    include?: Prisma.StoreInclude
  ): Promise<Store | null> {
    return prisma.store.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Create a new store
   */
  async create(data: Prisma.StoreCreateInput): Promise<Store> {
    return prisma.store.create({
      data,
    });
  }

  /**
   * Update an existing store
   */
  async update(
    id: string,
    data: Prisma.StoreUpdateInput
  ): Promise<Store> {
    return prisma.store.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a store
   */
  async delete(id: string): Promise<Store> {
    return prisma.store.delete({
      where: { id },
    });
  }

  /**
   * Count stores with optional filter
   */
  async count(where?: Prisma.StoreWhereInput): Promise<number> {
    return prisma.store.count({
      where,
    });
  }
}

// Export singleton instance
export const storeRepository = new StoreRepository(); 