import { prisma } from '../database/prisma';
import { Shop, Prisma } from '@prisma/client';
import { ShopAddress } from '../types/models/shopTypes';

/**
 * Repository for Shop entity
 * Handles database operations for shops
 */
export class ShopRepository {
  /**
   * Find all shops with optional filtering and pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ShopWhereInput;
    orderBy?: Prisma.ShopOrderByWithRelationInput;
    include?: Prisma.ShopInclude;
  }): Promise<Shop[]> {
    const { skip, take, where, orderBy, include } = params;
    return prisma.shop.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
    });
  }

  /**
   * Find a shop by ID
   */
  async findById(
    id: string,
    include?: Prisma.ShopInclude
  ): Promise<Shop | null> {
    return prisma.shop.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Create a new shop
   */
  async create(data: Prisma.ShopCreateInput): Promise<Shop> {
    return prisma.shop.create({
      data,
    });
  }

  /**
   * Update an existing shop
   */
  async update(
    id: string,
    data: Prisma.ShopUpdateInput
  ): Promise<Shop> {
    return prisma.shop.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a shop
   */
  async delete(id: string): Promise<Shop> {
    return prisma.shop.delete({
      where: { id },
    });
  }

  /**
   * Count shops with optional filter
   */
  async count(where?: Prisma.ShopWhereInput): Promise<number> {
    return prisma.shop.count({
      where,
    });
  }

  /**
   * Find a shop by code
   */
  async findByCode(code: string): Promise<Shop | null> {
    return prisma.shop.findUnique({
      where: { code },
    });
  }
}

// Export singleton instance
export const shopRepository = new ShopRepository();
