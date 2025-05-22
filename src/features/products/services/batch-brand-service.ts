import { logger } from '@/lib/logging/logger';
import { BatchBaseService } from '@/lib/api/batch-base-service';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { Brand, BrandFilter, BrandFormData } from '../types/brand';

/**
 * Batch-enabled brand service
 */
export class BatchBrandService extends BatchBaseService<Brand> {
  /**
   * Create a new batch-enabled brand service
   */
  constructor() {
    super({
      serviceName: 'brand',
      endpoint: 'brands',
      defaultPriority: RequestPriority.MEDIUM,
      trackPerformance: true,
      useBatchManager: true
    });
  }
  
  /**
   * Get all brands
   * 
   * @param filter Optional filter parameters
   * @returns Promise that resolves with an array of brands
   */
  async getAll(filter?: BrandFilter): Promise<Brand[]> {
    try {
      return await this.get<Brand[]>('LIST', filter);
    } catch (error) {
      logger.error('Error getting all brands', { error, filter });
      throw error;
    }
  }
  
  /**
   * Get a brand by ID
   * 
   * @param id Brand ID
   * @returns Promise that resolves with the brand
   */
  async getById(id: string): Promise<Brand> {
    try {
      return await this.get<Brand>('DETAIL', { id });
    } catch (error) {
      logger.error('Error getting brand by ID', { error, id });
      throw error;
    }
  }
  
  /**
   * Create a new brand
   * 
   * @param brand Brand data
   * @returns Promise that resolves with the created brand
   */
  async create(brand: BrandFormData): Promise<Brand> {
    try {
      return await this.post<Brand>('CREATE', brand);
    } catch (error) {
      logger.error('Error creating brand', { error, brand });
      throw error;
    }
  }
  
  /**
   * Update a brand
   * 
   * @param id Brand ID
   * @param brand Brand data
   * @returns Promise that resolves with the updated brand
   */
  async update(id: string, brand: Partial<BrandFormData>): Promise<Brand> {
    try {
      return await this.post<Brand>('UPDATE', {
        id,
        ...brand
      });
    } catch (error) {
      logger.error('Error updating brand', { error, id, brand });
      throw error;
    }
  }
  
  /**
   * Delete a brand
   * 
   * @param id Brand ID
   * @returns Promise that resolves when the brand is deleted
   */
  async delete(id: string): Promise<void> {
    try {
      await this.post('DELETE', { id });
    } catch (error) {
      logger.error('Error deleting brand', { error, id });
      throw error;
    }
  }
  
  /**
   * Delete multiple brands
   * 
   * @param ids Brand IDs
   * @returns Promise that resolves when the brands are deleted
   */
  async deleteMany(ids: string[]): Promise<void> {
    try {
      await this.post('DELETE_MANY', { ids });
    } catch (error) {
      logger.error('Error deleting multiple brands', { error, ids });
      throw error;
    }
  }
  
  /**
   * Update brand status
   * 
   * @param ids Brand IDs
   * @param status New status
   * @returns Promise that resolves when the brands are updated
   */
  async updateStatus(ids: string[], status: 'active' | 'inactive'): Promise<void> {
    try {
      await this.post('UPDATE_STATUS', { ids, status });
    } catch (error) {
      logger.error('Error updating brand status', { error, ids, status });
      throw error;
    }
  }
}

// Create and export a singleton instance
export const batchBrandService = new BatchBrandService();
