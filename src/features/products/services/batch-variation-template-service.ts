import { logger } from '@/lib/logging/logger';
import { BatchBaseService } from '@/lib/api/batch-base-service';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { 
  VariationTemplate, 
  VariationTemplateFilter, 
  VariationTemplateFormData 
} from '../types/variation-template';

/**
 * Batch-enabled variation template service
 */
export class BatchVariationTemplateService extends BatchBaseService<VariationTemplate> {
  /**
   * Create a new batch-enabled variation template service
   */
  constructor() {
    super({
      serviceName: 'variationTemplate',
      endpoint: 'variation-templates',
      defaultPriority: RequestPriority.MEDIUM,
      trackPerformance: true,
      useBatchManager: true
    });
  }
  
  /**
   * Get all variation templates
   * 
   * @param filter Optional filter parameters
   * @returns Promise that resolves with an array of variation templates
   */
  async getAll(filter?: VariationTemplateFilter): Promise<VariationTemplate[]> {
    try {
      return await this.get<VariationTemplate[]>('LIST', filter);
    } catch (error) {
      logger.error('Error getting all variation templates', { error, filter });
      throw error;
    }
  }
  
  /**
   * Get a variation template by ID
   * 
   * @param id Variation template ID
   * @returns Promise that resolves with the variation template
   */
  async getById(id: string): Promise<VariationTemplate> {
    try {
      return await this.get<VariationTemplate>('DETAIL', { id });
    } catch (error) {
      logger.error('Error getting variation template by ID', { error, id });
      throw error;
    }
  }
  
  /**
   * Create a new variation template
   * 
   * @param template Variation template data
   * @returns Promise that resolves with the created variation template
   */
  async create(template: VariationTemplateFormData): Promise<VariationTemplate> {
    try {
      return await this.post<VariationTemplate>('CREATE', template);
    } catch (error) {
      logger.error('Error creating variation template', { error, template });
      throw error;
    }
  }
  
  /**
   * Update a variation template
   * 
   * @param id Variation template ID
   * @param template Variation template data
   * @returns Promise that resolves with the updated variation template
   */
  async update(id: string, template: Partial<VariationTemplateFormData>): Promise<VariationTemplate> {
    try {
      return await this.post<VariationTemplate>('UPDATE', {
        id,
        ...template
      });
    } catch (error) {
      logger.error('Error updating variation template', { error, id, template });
      throw error;
    }
  }
  
  /**
   * Delete a variation template
   * 
   * @param id Variation template ID
   * @returns Promise that resolves when the variation template is deleted
   */
  async delete(id: string): Promise<void> {
    try {
      await this.post('DELETE', { id });
    } catch (error) {
      logger.error('Error deleting variation template', { error, id });
      throw error;
    }
  }
  
  /**
   * Delete multiple variation templates
   * 
   * @param ids Variation template IDs
   * @returns Promise that resolves when the variation templates are deleted
   */
  async deleteMany(ids: string[]): Promise<void> {
    try {
      await this.post('DELETE_MANY', { ids });
    } catch (error) {
      logger.error('Error deleting multiple variation templates', { error, ids });
      throw error;
    }
  }
  
  /**
   * Set a variation template as default
   * 
   * @param id Variation template ID
   * @returns Promise that resolves when the variation template is set as default
   */
  async setDefault(id: string): Promise<void> {
    try {
      await this.post('SET_DEFAULT', { id });
    } catch (error) {
      logger.error('Error setting variation template as default', { error, id });
      throw error;
    }
  }
  
  /**
   * Apply a variation template (increment usage count)
   * 
   * @param id Variation template ID
   * @returns Promise that resolves with the updated variation template
   */
  async apply(id: string): Promise<VariationTemplate> {
    try {
      return await this.post<VariationTemplate>('APPLY', { id });
    } catch (error) {
      logger.error('Error applying variation template', { error, id });
      throw error;
    }
  }
}

// Create and export a singleton instance
export const batchVariationTemplateService = new BatchVariationTemplateService();
