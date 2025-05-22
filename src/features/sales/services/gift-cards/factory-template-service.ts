/**
 * Factory-Based Template Service for Gift Cards
 * 
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of gift card template operations with minimal duplication.
 */

import { DesignTemplate } from '../../types/gift-cards';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';

// Create a module-specific error handler
const templateErrorHandler = createErrorHandler('sales/gift-cards/templates');

// Define retry configuration
const TEMPLATE_RETRY_CONFIG = {
  maxRetries: 2,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  shouldRetry: (error: any) => {
    return ![
      ApiErrorType.VALIDATION, 
      ApiErrorType.CONFLICT,
      ApiErrorType.AUTHORIZATION
    ].includes(error.type);
  }
};

/**
 * Template service with standardized endpoint handling for the Sales module
 */
export const templateService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<DesignTemplate>('sales/gift-cards/templates', {
    useEnhancedClient: true,
    withRetry: TEMPLATE_RETRY_CONFIG,
    cacheResponse: true,
    // Custom response mapping if needed
    mapResponse: (data: any) => {
      if (Array.isArray(data)) {
        return data.map(item => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString(),
        }));
      }
      return {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : new Date().toISOString(),
      };
    }
  }),
  
  // Custom methods for template-specific operations
  
  /**
   * Get active templates
   */
  getActiveTemplates: createServiceMethod<DesignTemplate[]>(
    'sales/gift-cards/templates', 'ACTIVE', 'get',
    { 
      withRetry: TEMPLATE_RETRY_CONFIG,
      cacheResponse: true 
    }
  ),
  
  /**
   * Get default template
   */
  getDefaultTemplate: createServiceMethod<DesignTemplate>(
    'sales/gift-cards/templates', 'DEFAULT', 'get',
    { 
      withRetry: TEMPLATE_RETRY_CONFIG,
      cacheResponse: true 
    }
  ),
  
  /**
   * Set a template as default
   */
  setDefaultTemplate: createServiceMethod<DesignTemplate, {
    id: string;
  }>(
    'sales/gift-cards/templates', 'SET_DEFAULT', 'post',
    { withRetry: false }
  ),
  
  /**
   * Duplicate a template
   */
  duplicateTemplate: createServiceMethod<DesignTemplate, {
    id: string;
    newName?: string;
  }>(
    'sales/gift-cards/templates', 'DUPLICATE', 'post',
    { withRetry: false }
  )
};

export default templateService;
