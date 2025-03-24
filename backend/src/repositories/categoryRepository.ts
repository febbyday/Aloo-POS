import prisma from '../lib/prisma';
import { Category, Prisma } from '@prisma/client';

/**
 * Repository for Category entity
 * Handles database operations for categories
 */
export class CategoryRepository {
  /**
   * Find all categories with optional filtering and pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
    include?: Prisma.CategoryInclude;
  }): Promise<Category[]> {
    const { skip, take, where, orderBy, include } = params;
    return prisma.category.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
    });
  }

  /**
   * Find a category by ID
   */
  async findById(
    id: string,
    include?: Prisma.CategoryInclude
  ): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Create a new category
   */
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }

  /**
   * Update an existing category
   */
  async update(
    id: string,
    data: Prisma.CategoryUpdateInput
  ): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a category
   */
  async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Count categories with optional filter
   */
  async count(where?: Prisma.CategoryWhereInput): Promise<number> {
    return prisma.category.count({
      where,
    });
  }

  /**
   * Find categories by parent ID
   */
  async findByParentId(
    parentId: string | null,
    params?: {
      skip?: number;
      take?: number;
      include?: Prisma.CategoryInclude;
    }
  ): Promise<Category[]> {
    const { skip, take, include } = params || {};
    return prisma.category.findMany({
      where: {
        parentId,
      },
      skip,
      take,
      include,
    });
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository(); 