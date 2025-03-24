import { prisma } from '../index';
import { Supplier, Prisma } from '@prisma/client';

/**
 * Repository for Supplier entity
 * Handles database operations for suppliers
 */
export class SupplierRepository {
  /**
   * Find all suppliers with optional filtering and pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SupplierWhereInput;
    orderBy?: Prisma.SupplierOrderByWithRelationInput;
    include?: Prisma.SupplierInclude;
  }): Promise<Supplier[]> {
    const { skip, take, where, orderBy, include } = params;
    return prisma.supplier.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
    });
  }

  /**
   * Find a supplier by ID
   */
  async findById(
    id: string,
    include?: Prisma.SupplierInclude
  ): Promise<Supplier | null> {
    return prisma.supplier.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Create a new supplier
   */
  async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return prisma.supplier.create({
      data,
    });
  }

  /**
   * Update an existing supplier
   */
  async update(
    id: string,
    data: Prisma.SupplierUpdateInput
  ): Promise<Supplier> {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a supplier
   */
  async delete(id: string): Promise<Supplier> {
    return prisma.supplier.delete({
      where: { id },
    });
  }

  /**
   * Count suppliers with optional filter
   */
  async count(where?: Prisma.SupplierWhereInput): Promise<number> {
    return prisma.supplier.count({
      where,
    });
  }
}

// Export singleton instance
export const supplierRepository = new SupplierRepository(); 