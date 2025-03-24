import { Category, Prisma } from '@prisma/client';
import { categoryRepository, CategoryRepository } from '../repositories/categoryRepository';

/**
 * CategoryService
 * Handles business logic for categories
 */
export class CategoryService {
  private repository: CategoryRepository;

  constructor(repository: CategoryRepository) {
    this.repository = repository;
  }

  /**
   * Get all categories with optional filtering and pagination
   */
  async getAllCategories(params: {
    page?: number;
    limit?: number;
    search?: string;
    parentId?: string | null;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ categories: Category[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      parentId,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
    } = params;

    // Build where clause
    const where: Prisma.CategoryWhereInput = {};

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by parent ID
    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    // Filter by active status
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Prisma.CategoryOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Include related data
    const include: Prisma.CategoryInclude = {
      parent: true,
      children: true,
      _count: {
        select: {
          products: true,
        },
      },
    };

    // Get categories
    const categories = await this.repository.findAll({
      skip,
      take: limit,
      where,
      orderBy,
      include,
    });

    // Get total count
    const total = await this.repository.count(where);

    return {
      categories,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    return this.repository.findById(id, {
      parent: true,
      children: true,
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
   * Create a new category
   */
  async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.repository.create(data);
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return this.repository.update(id, data);
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<Category> {
    return this.repository.delete(id);
  }

  /**
   * Get subcategories by parent ID
   */
  async getSubcategories(
    parentId: string | null,
    page = 1,
    limit = 20
  ): Promise<{ categories: Category[]; total: number }> {
    const skip = (page - 1) * limit;
    const categories = await this.repository.findByParentId(parentId, {
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    const total = await this.repository.count({ parentId });

    return { categories, total };
  }

  /**
   * Get category hierarchy (tree structure)
   */
  async getCategoryHierarchy(): Promise<Category[]> {
    // Get all root categories (parentId is null)
    const rootCategories = await this.repository.findByParentId(null, {
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
    });

    return rootCategories;
  }
}

// Export singleton instance
export const categoryService = new CategoryService(categoryRepository); 