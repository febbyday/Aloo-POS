/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Factory-Based Reports Service
 *
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of reports-related operations with minimal duplication.
 */

import { Reports } from '../types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';

// Create a module-specific error handler
const reportsErrorHandler = createErrorHandler('reports');

// Define retry configuration
const REPORTS_RETRY_CONFIG = {
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
 * Reports service with standardized endpoint handling
 */
export const reportsService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<Reports>('reports', {
    useEnhancedClient: true,
    withRetry: REPORTS_RETRY_CONFIG,
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

  // Custom methods for reports-specific operations

  /**
   * Generate a report
   */
  generateReport: createServiceMethod<Blob, {
    type: string;
    format: 'pdf' | 'csv' | 'excel';
    dateRange: { startDate: string; endDate: string };
    filters?: Record<string, any>;
  }>(
    'reports', 'GENERATE', 'post',
    {
      withRetry: false,
      cacheResponse: false
    }
  ),

  /**
   * Get scheduled reports
   */
  getScheduledReports: createServiceMethod<{
    id: string;
    name: string;
    type: string;
    schedule: {
      frequency: string;
      nextRun: string;
    };
    format: string;
    createdAt: string;
  }[]>('reports', 'SCHEDULED', 'get', { cacheResponse: true }),

  /**
   * Schedule a report
   */
  scheduleReport: createServiceMethod<{
    id: string;
    name: string;
    schedule: {
      frequency: string;
      nextRun: string;
    };
  }, {
    name: string;
    type: string;
    format: 'pdf' | 'csv' | 'excel';
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      dayOfWeek?: number;
      dayOfMonth?: number;
      time: string;
    };
    recipients?: string[];
    filters?: Record<string, any>;
  }>(
    'reports', 'SCHEDULE', 'post',
    { withRetry: false }
  ),

  /**
   * Get report templates
   */
  getReportTemplates: createServiceMethod<{
    id: string;
    name: string;
    description: string;
    type: string;
    createdAt: string;
  }[]>('reports', 'TEMPLATES', 'get', { cacheResponse: true })
};
