/**
 * Batch-Enabled Category Service
 * 
 * This service provides methods for interacting with the category API
 * using batch requests during initialization to improve performance.
 */

import { BatchBaseService } from '@/lib/api/services/batch-base-service';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { logger } from '@/lib/logging/logger';
import { Category, CategoryFormData, CategoryFilter } from '../types/category.types';

/**
 * Batch-enabled category service
 */
export class BatchCategoryService extends BatchBaseService<Category> {
  /**
   * Create a new batch-enabled category service
   */
  constructor() {
    super({
      serviceName: 'category',
      endpoint: 'categories',
      defaultPriority: RequestPriority.HIGH,
      trackPerformance: true,
      useBatchManager: true
    });
  }
  
  /**
   * Get all categories
   * 
   * @param filter Optional filter parameters
   * @returns Promise that resolves with an array of categories
   */
  async getAll(filter?: CategoryFilter): Promise<Category[]> {
    try {
      return await this.get<Category[]>('LIST', filter);
    } catch (error) {
      logger.error('Error getting all categories', { error, filter });
      throw error;
    }
  }
  
  /**
   * Get a category by ID
   * 
   * @param id Category ID
   * @returns Promise that resolves with the category
   */
  async getById(id: string): Promise<Category> {
    try {
      return await this.get<Category>(`GET/${id}`);
    } catch (error) {
      logger.error('Error getting category by ID', { error, id });
      throw error;
    }
  }
  
  /**
   * Get categories by parent ID
   * 
   * @param parentId Parent category ID
   * @param filter Optional filter parameters
   * @returns Promise that resolves with an array of categories
   */
  async getByParent(parentId: string | null, filter?: CategoryFilter): Promise<Category[]> {
    try {
      return await this.get<Category[]>('LIST', {
        ...filter,
        parentId: parentId || 'null'
      });
    } catch (error) {
      logger.error('Error getting categories by parent', { error, parentId, filter });
      throw error;
    }
  }
  
  /**
   * Create a new category
   * 
   * @param category Category data
   * @returns Promise that resolves with the created category
   */
  async create(category: CategoryFormData): Promise<Category> {
    try {
      return await this.post<Category>('CREATE', category);
    } catch (error) {
      logger.error('Error creating category', { error, category });
      throw error;
    }
  }
  
  /**
   * Update a category
   * 
   * @param id Category ID
   * @param category Category data
   * @returns Promise that resolves with the updated category
   */
  async update(id: string, category: Partial<CategoryFormData>): Promise<Category> {
    try {
      return await this.post<Category>('UPDATE', {
        id,
        ...category
      });
    } catch (error) {
      logger.error('Error updating category', { error, id, category });
      throw error;
    }
  }
  
  /**
   * Delete categories
   * 
   * @param ids Category IDs
   * @returns Promise that resolves when the categories are deleted
   */
  async delete(ids: string[]): Promise<void> {
    try {
      await this.post('DELETE', { ids });
    } catch (error) {
      logger.error('Error deleting categories', { error, ids });
      throw error;
    }
  }
  
  /**
   * Move a category
   * 
   * @param id Category ID
   * @param parentId New parent category ID
   * @returns Promise that resolves when the category is moved
   */
  async move(id: string, parentId: string | null): Promise<void> {
    try {
      await this.post('MOVE', { id, parentId });
    } catch (error) {
      logger.error('Error moving category', { error, id, parentId });
      throw error;
    }
  }
  
  /**
   * Perform a bulk action on categories
   * 
   * @param action Action to perform
   * @param ids Category IDs
   * @returns Promise that resolves when the action is complete
   */
  async bulkAction(action: string, ids: string[]): Promise<void> {
    try {
      await this.post('BULK_ACTION', { action, ids });
    } catch (error) {
      logger.error('Error performing bulk action on categories', { error, action, ids });
      throw error;
    }
  }
  
  /**
   * Get category hierarchy
   * 
   * @returns Promise that resolves with the category hierarchy
   */
  async getHierarchy(): Promise<Category[]> {
    try {
      return await this.get<Category[]>('HIERARCHY');
    } catch (error) {
      logger.error('Error getting category hierarchy', { error });
      throw error;
    }
  }
  
  /**
   * Get category path
   * 
   * @param id Category ID
   * @returns Promise that resolves with the category path
   */
  async getPath(id: string): Promise<Category[]> {
    try {
      return await this.get<Category[]>('PATH', { id });
    } catch (error) {
      logger.error('Error getting category path', { error, id });
      throw error;
    }
  }
}

// Create a singleton instance
export const batchCategoryService = new BatchCategoryService();

export default batchCategoryService;
