/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Factory-Based Repairs Service
 *
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of repairs-related operations with minimal duplication.
 */

import { Repairs } from '../types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';

// Create a module-specific error handler
const repairsErrorHandler = createErrorHandler('repairs');

// Define retry configuration
const REPAIRS_RETRY_CONFIG = {
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
 * Repairs service with standardized endpoint handling
 */
export const repairsService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<Repairs>('repairs', {
    useEnhancedClient: true,
    withRetry: REPAIRS_RETRY_CONFIG,
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

  // Custom methods for repairs-specific operations

  /**
   * Get repairs by status
   */
  getByStatus: createServiceMethod<Repairs[]>(
    'repairs', 'BY_STATUS', 'get',
    {
      withRetry: REPAIRS_RETRY_CONFIG,
      cacheResponse: true
    }
  ),

  /**
   * Get repairs by technician
   */
  getByTechnician: createServiceMethod<Repairs[]>(
    'repairs', 'BY_TECHNICIAN', 'get',
    {
      withRetry: REPAIRS_RETRY_CONFIG,
      cacheResponse: true
    }
  ),

  /**
   * Add diagnosis to repair
   */
  addDiagnosis: createServiceMethod<{
    id: string;
    repairId: string;
    diagnosis: string;
    technician: string;
    createdAt: string;
  }, {
    repairId: string;
    diagnosis: string;
    technician: string;
  }>(
    'repairs', 'ADD_DIAGNOSIS', 'post',
    { withRetry: false }
  ),

  /**
   * Update repair status
   */
  updateStatus: createServiceMethod<Repairs, {
    status: string;
    notes?: string;
  }>(
    'repairs', 'UPDATE_STATUS', 'put',
    { withRetry: false }
  ),

  /**
   * Generate repair report
   */
  generateReport: createServiceMethod<Blob, {
    repairId: string;
    format: 'pdf' | 'csv';
  }>(
    'repairs', 'GENERATE_REPORT', 'post',
    {
      withRetry: false,
      cacheResponse: false
    }
  )
};
