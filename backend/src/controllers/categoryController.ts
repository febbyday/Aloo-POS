import { Request, Response } from 'express';
import { categoryService } from '../services/categoryService';
import { Prisma } from '@prisma/client';

/**
 * CategoryController
 * Handles HTTP requests for categories
 */
export class CategoryController {
  /**
   * Get all categories with filtering and pagination
   */
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const {
        page,
        limit,
        search,
        parentId,
        isActive,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await categoryService.getAllCategories({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        parentId: parentId === 'null' ? null : parentId as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
      });

      res.json(result);
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ error: 'Failed to get categories' });
    }
  }

  /**
   * Get a category by ID
   */
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.json(category);
    } catch (error) {
      console.error('Error getting category:', error);
      res.status(500).json({ error: 'Failed to get category' });
    }
  }

  /**
   * Create a new category
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      
      // Transform data for Prisma
      const createData: Prisma.CategoryCreateInput = {
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
      };

      // Handle parent relation
      if (data.parentId) {
        createData.parent = {
          connect: { id: data.parentId }
        };
      }

      const category = await categoryService.createCategory(createData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      
      // Check for unique constraint violation
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        res.status(409).json({ error: 'A category with this name already exists' });
        return;
      }
      
      res.status(500).json({ error: 'Failed to create category' });
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      // Transform data for Prisma
      const updateData: Prisma.CategoryUpdateInput = {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      };

      // Handle parent relation
      if (data.parentId) {
        // Make sure we're not setting the category as its own parent
        if (data.parentId === id) {
          res.status(400).json({ error: 'A category cannot be its own parent' });
          return;
        }
        
        updateData.parent = {
          connect: { id: data.parentId }
        };
      } else if (data.parentId === null) {
        updateData.parent = {
          disconnect: true
        };
      }

      const category = await categoryService.updateCategory(id, updateData);
      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      
      // Check for unique constraint violation
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        res.status(409).json({ error: 'A category with this name already exists' });
        return;
      }
      
      res.status(500).json({ error: 'Failed to update category' });
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await categoryService.deleteCategory(id);
      res.json(category);
    } catch (error) {
      console.error('Error deleting category:', error);
      
      // Check for foreign key constraint violation
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        res.status(409).json({ 
          error: 'This category cannot be deleted because it has related products or subcategories' 
        });
        return;
      }
      
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }

  /**
   * Get subcategories by parent ID
   */
  async getSubcategories(req: Request, res: Response): Promise<void> {
    try {
      const { parentId } = req.params;
      const { page, limit } = req.query;

      const result = await categoryService.getSubcategories(
        parentId === 'null' ? null : parentId,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );

      res.json(result);
    } catch (error) {
      console.error('Error getting subcategories:', error);
      res.status(500).json({ error: 'Failed to get subcategories' });
    }
  }

  /**
   * Get category hierarchy
   */
  async getCategoryHierarchy(req: Request, res: Response): Promise<void> {
    try {
      const hierarchy = await categoryService.getCategoryHierarchy();
      res.json(hierarchy);
    } catch (error) {
      console.error('Error getting category hierarchy:', error);
      res.status(500).json({ error: 'Failed to get category hierarchy' });
    }
  }
}

// Export singleton instance
export const categoryController = new CategoryController(); 