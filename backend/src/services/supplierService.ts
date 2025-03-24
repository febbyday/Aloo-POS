import { Supplier, Prisma } from '@prisma/client';
import { supplierRepository, SupplierRepository } from '../repositories/supplierRepository';

/**
 * SupplierService
 * Handles business logic for suppliers
 */
export class SupplierService {
  private repository: SupplierRepository;

  constructor(repository: SupplierRepository) {
    this.repository = repository;
  }

  /**
   * Get all suppliers with optional filtering and pagination
   */
  async getAllSuppliers(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ suppliers: Supplier[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
    } = params;

    // Build where clause
    const where: Prisma.SupplierWhereInput = {};

    // Search by name, email, or phone
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by active status
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Prisma.SupplierOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Include related data
    const include: Prisma.SupplierInclude = {
      _count: {
        select: {
          products: true,
        },
      },
    };

    // Get suppliers
    const suppliers = await this.repository.findAll({
      skip,
      take: limit,
      where,
      orderBy,
      include,
    });

    // Get total count
    const total = await this.repository.count(where);

    return {
      suppliers,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a supplier by ID
   */
  async getSupplierById(id: string): Promise<Supplier | null> {
    return this.repository.findById(id, {
      products: {
        take: 10, // Limit to 10 products
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    });
  }

  /**
   * Create a new supplier
   */
  async createSupplier(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return this.repository.create(data);
  }

  /**
   * Update an existing supplier
   */
  async updateSupplier(id: string, data: Prisma.SupplierUpdateInput): Promise<Supplier> {
    return this.repository.update(id, data);
  }

  /**
   * Delete a supplier
   */
  async deleteSupplier(id: string): Promise<Supplier> {
    return this.repository.delete(id);
  }
}

// Export singleton instance
export const supplierService = new SupplierService(supplierRepository); 