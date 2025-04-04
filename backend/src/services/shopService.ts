import { Shop, Prisma, StaffAssignment } from '@prisma/client';
import { shopRepository, ShopRepository } from '../repositories/shopRepository';
import { prisma } from '../database/prisma';
import { validateShopAddress, validateOperatingHours, validateShopSettings } from '../validators/shopValidators';
import { ZodError } from 'zod';

/**
 * ShopService
 * Handles business logic for shops
 */
export class ShopService {
  private repository: ShopRepository;

  constructor(repository: ShopRepository) {
    this.repository = repository;
  }

  /**
   * Get all shops with optional filtering and pagination
   */
  async getAllShops(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ shops: Shop[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      status,
      sortBy = 'name',
      sortOrder = 'asc',
    } = params;

    // Build where clause
    const where: Prisma.ShopWhereInput = {};

    // Search by name, email, phone, etc.
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];

      // Note: We can't directly search in JSON fields with contains
      // For a production app, consider using a database-specific JSON search
      // or implementing a full-text search solution
    }

    // Filter by shop type
    if (type) {
      where.type = type as any;
    }

    // Filter by shop status
    if (status) {
      where.status = status as any;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Prisma.ShopOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Include related data
    const include: Prisma.ShopInclude = {
      assignments: {
        include: {
          staff: {
            include: {
              role: true
            }
          }
        }
      },
      _count: {
        select: {
          assignments: true,
          staff: true,
        },
      },
    };

    // Get shops
    const shops = await this.repository.findAll({
      skip,
      take: limit,
      where,
      orderBy,
      include,
    });

    // Get total count
    const total = await this.repository.count(where);

    return {
      shops,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a shop by ID
   */
  async getShopById(id: string): Promise<Shop | null> {
    return this.repository.findById(id, {
      assignments: {
        include: {
          staff: {
            include: {
              role: true
            }
          }
        }
      },
      staff: {
        include: {
          role: true
        }
      },
      _count: {
        select: {
          assignments: true,
          staff: true,
        },
      },
    });
  }

  /**
   * Create a new shop with validation
   */
  async createShop(data: Prisma.ShopCreateInput): Promise<Shop> {
    try {
      // Validate JSON fields
      if (data.address) {
        validateShopAddress(data.address);
      }

      if (data.operatingHours) {
        validateOperatingHours(data.operatingHours);
      }

      if (data.settings) {
        validateShopSettings(data.settings);
      }

      // Create the shop
      return this.repository.create(data);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Validation error creating shop:', error.errors);
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Update an existing shop with validation
   */
  async updateShop(id: string, data: Prisma.ShopUpdateInput): Promise<Shop> {
    try {
      // Validate JSON fields
      if (data.address) {
        validateShopAddress(data.address);
      }

      if (data.operatingHours) {
        validateOperatingHours(data.operatingHours);
      }

      if (data.settings) {
        validateShopSettings(data.settings);
      }

      // Update the shop
      return this.repository.update(id, data);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Validation error updating shop:', error.errors);
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Delete a shop
   */
  async deleteShop(id: string): Promise<Shop> {
    return this.repository.delete(id);
  }

  /**
   * Get staff assignments for a shop
   */
  async getShopStaff(
    shopId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{
    shopId: string;
    shopName: string;
    staffAssignments: (StaffAssignment & {
      staff: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: {
          id: string;
          name: string;
        } | null;
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
      sortBy = 'startDate',
      sortOrder = 'desc',
    } = params;

    // Verify shop exists
    const shop = await this.repository.findById(shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    // Build the where clause
    const where: Prisma.StaffAssignmentWhereInput = {
      shopId,
    };

    // Add search filter if provided
    if (search) {
      where.staff = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy
    let orderBy: any = {};
    if (sortBy.startsWith('staff.')) {
      // Ordering by staff field
      const staffField = sortBy.replace('staff.', '');
      orderBy = {
        staff: {
          [staffField]: sortOrder,
        },
      };
    } else {
      // Ordering by direct assignment field
      orderBy = {
        [sortBy]: sortOrder,
      };
    }

    // Fetch staff assignments with staff
    const staffAssignments = await prisma.staffAssignment.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        staff: {
          include: {
            role: true,
          },
        },
      },
    });

    // Get total count
    const total = await prisma.staffAssignment.count({ where });

    return {
      shopId,
      shopName: shop.name,
      staffAssignments,
      total,
      page,
      limit,
    };
  }

  /**
   * Assign staff to a shop
   */
  async assignStaffToShop(
    shopId: string,
    staffId: string,
    data: {
      role?: string;
      isPrimary?: boolean;
      startDate: Date;
      endDate?: Date;
      schedule?: any;
    }
  ): Promise<StaffAssignment> {
    // Check if shop and staff exist
    const shop = await this.repository.findById(shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!staff) {
      throw new Error('Staff not found');
    }

    // Create the assignment
    return prisma.staffAssignment.create({
      data: {
        shop: { connect: { id: shopId } },
        staff: { connect: { id: staffId } },
        role: data.role,
        isPrimary: data.isPrimary || false,
        startDate: data.startDate,
        endDate: data.endDate,
        schedule: data.schedule,
      },
    });
  }

  /**
   * Remove staff from a shop
   */
  async removeStaffFromShop(assignmentId: string): Promise<StaffAssignment> {
    // Check if assignment exists
    const assignment = await prisma.staffAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error('Staff assignment not found');
    }

    // Delete the assignment
    return prisma.staffAssignment.delete({
      where: { id: assignmentId },
    });
  }
}

// Export singleton instance
export const shopService = new ShopService(shopRepository);
