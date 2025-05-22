/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * Category Service
 *
 * This service handles API calls and data operations for the product categories feature.
 */

import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { getApiUrl } from '@/lib/api/enhanced-config';
import { Category } from '../types/category';

// Mock data as fallback
const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    status: 'active',
    products: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Clothing',
    slug: 'clothing',
    status: 'active',
    products: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Food & Beverages',
    slug: 'food-beverages',
    status: 'active',
    products: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Home & Garden',
    slug: 'home-garden',
    status: 'active',
    products: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Service for managing product categories
 */
export const categoryService = {
  /**
   * Fetch all categories
   */
  fetchAll: async (): Promise<Category[]> => {
    try {
      const response = await enhancedApiClient.get<Category[]>('categories/LIST');

      if (!response.success) {
        console.error('Failed to fetch categories from API, returning mock data');
        return MOCK_CATEGORIES;
      }

      return response.data || MOCK_CATEGORIES;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return mock data as fallback
      return MOCK_CATEGORIES;
    }
  },

  /**
   * Fetch a single category by ID
   */
  fetchById: async (id: string): Promise<Category | null> => {
    try {
      const response = await enhancedApiClient.get<Category>('categories/DETAIL', { id });

      if (!response.success) {
        console.error('Failed to fetch category from API, searching mock data');
        return MOCK_CATEGORIES.find(cat => cat.id === id) || null;
      }

      return response.data || null;
    } catch (error) {
      console.error(`Error fetching category (${id}):`, error);
      // Try to find in mock data as fallback
      return MOCK_CATEGORIES.find(cat => cat.id === id) || null;
    }
  },

  /**
   * Create a new category
   */
  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await enhancedApiClient.post<Category>('categories/CREATE', data);

    if (!response.success) {
      throw new Error(response.error || 'Failed to create category');
    }

    return response.data;
  },

  /**
   * Update an existing category
   */
  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await enhancedApiClient.put<Category>('categories/UPDATE', data, { id });

    if (!response.success) {
      throw new Error(response.error || 'Failed to update category');
    }

    return response.data;
  },

  /**
   * Delete a category
   */
  delete: async (id: string): Promise<boolean> => {
    const response = await enhancedApiClient.delete('categories/DELETE', { id });

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete category');
    }

    return true;
  },

  /**
   * Get hierarchical category structure
   */
  getHierarchy: async (): Promise<Category[]> => {
    try {
      const response = await enhancedApiClient.get<Category[]>('categories/HIERARCHY');

      if (!response.success) {
        console.error('Failed to fetch category hierarchy from API, returning mock data');
        return MOCK_CATEGORIES;
      }

      return response.data || MOCK_CATEGORIES;
    } catch (error) {
      console.error('Error fetching category hierarchy:', error);
      return MOCK_CATEGORIES;
    }
  }
};
