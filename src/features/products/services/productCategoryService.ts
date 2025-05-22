/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Product Category Service
 *
 * This service handles API operations for product categories.
 * It demonstrates the standard pattern for API endpoint definition and usage.
 */

import { apiClient } from '@/lib/api/api-client';
import { createApiService } from '@/lib/api/createApiService';
import { createModuleEndpoints } from '@/lib/api/endpoint-utils';
import { Category } from '../types/category';

// Define all category endpoints in one place using our utility
const CATEGORY_ENDPOINTS = createModuleEndpoints('categories', {
  LIST: { path: '', requiresAuth: false, cacheable: true },
  DETAIL: { path: ':id', requiresAuth: false, cacheable: true },
  CREATE: { path: '', requiresAuth: true },
  UPDATE: { path: ':id', requiresAuth: true },
  DELETE: { path: ':id', requiresAuth: true },
  HIERARCHY: { path: 'hierarchy', requiresAuth: false, cacheable: true },
  SUBCATEGORIES: { path: 'subcategories/:parentId', requiresAuth: false, cacheable: true }
});

// Create API service with base path
const categoryApiService = createApiService('/categories');

/**
 * Product Category Service
 * Provides methods for interacting with product categories
 */
class ProductCategoryService {
  /**
   * Fetch all categories
   * @returns Promise with array of categories
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      // Using apiClient directly with endpoint from our config
      const response = await apiClient.get<Category[]>(CATEGORY_ENDPOINTS.LIST);

      if (!response.success) {
        console.error('Failed to fetch categories');
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Fetch a single category by ID
   * @param id Category ID
   * @returns Category or null if not found
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      // Using our API service with ID parameter
      return await categoryApiService.getById<Category>(id);
    } catch (error) {
      console.error(`Error fetching category (${id}):`, error);
      return null;
    }
  }

  /**
   * Create a new category
   * @param data Category data
   * @returns Created category
   */
  async createCategory(data: Partial<Category>): Promise<Category> {
    // Using our API service's post method
    return await categoryApiService.post<Category, Partial<Category>>('', data);
  }

  /**
   * Update an existing category
   * @param id Category ID
   * @param data Updated category data
   * @returns Updated category
   */
  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    // Using our API service's put method
    return await categoryApiService.put<Category, Partial<Category>>(id, data);
  }

  /**
   * Delete a category
   * @param id Category ID
   * @returns Success status
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      // Using apiClient directly with a computed endpoint path
      await apiClient.delete(CATEGORY_ENDPOINTS.DELETE.replace(':id', id));
      return true;
    } catch (error) {
      console.error(`Error deleting category (${id}):`, error);
      throw new Error(`Failed to delete category: ${error}`);
    }
  }

  /**
   * Get hierarchical category structure
   * @returns Array of categories with hierarchy
   */
  async getCategoryHierarchy(): Promise<Category[]> {
    try {
      // Using apiClient with our predefined hierarchy endpoint
      const response = await apiClient.get<Category[]>(CATEGORY_ENDPOINTS.HIERARCHY);

      if (!response.success) {
        console.error('Failed to fetch category hierarchy');
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching category hierarchy:', error);
      return [];
    }
  }

  /**
   * Get subcategories by parent ID
   * @param parentId Parent category ID
   * @returns Array of subcategories
   */
  async getSubcategories(parentId: string): Promise<Category[]> {
    try {
      // Using apiClient with dynamic replacement of the parentId parameter
      const endpoint = CATEGORY_ENDPOINTS.SUBCATEGORIES.replace(':parentId', parentId);
      const response = await apiClient.get<Category[]>(endpoint);

      if (!response.success) {
        console.error(`Failed to fetch subcategories for parent ${parentId}`);
        return [];
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching subcategories for parent ${parentId}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const productCategoryService = new ProductCategoryService();
