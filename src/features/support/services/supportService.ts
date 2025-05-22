/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Factory-Based Support Service
 *
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of support-related operations with minimal duplication.
 */

import { Support } from '../types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';

// Create a module-specific error handler
const supportErrorHandler = createErrorHandler('support');

// Define retry configuration
const SUPPORT_RETRY_CONFIG = {
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
 * Support service with standardized endpoint handling
 */
export const supportService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<Support>('support', {
    useEnhancedClient: true,
    withRetry: SUPPORT_RETRY_CONFIG,
    cacheResponse: true,
    // Custom response mapping if needed
    mapResponse: (data: any) => {
      if (Array.isArray(data)) {
        return data.map(item => ({
          ...item,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));
      }
      return {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
  }),

  // Custom methods for support-specific operations can be added here

  /**
   * Search support items
   */
  search: createServiceMethod<Support[]>(
    'support', 'SEARCH', 'get',
    {
      withRetry: SUPPORT_RETRY_CONFIG,
      cacheResponse: false
    }
  ),

  /**
   * Get support statistics
   */
  getStatistics: createServiceMethod<{
    totalItems: number;
    resolvedItems: number;
    pendingItems: number;
    averageResolutionTime: number;
  }>('support', 'STATISTICS', 'get', { cacheResponse: true })
};
