/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Factory-Based Expenses Service
 *
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of expenses-related operations with minimal duplication.
 */

import { Expenses } from '../types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';

// Create a module-specific error handler
const expensesErrorHandler = createErrorHandler('expenses');

// Define retry configuration
const EXPENSES_RETRY_CONFIG = {
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
 * Expenses service with standardized endpoint handling
 */
export const expensesService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<Expenses>('expenses', {
    useEnhancedClient: true,
    withRetry: EXPENSES_RETRY_CONFIG,
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

  // Custom methods for expenses-specific operations

  /**
   * Get expenses by category
   */
  getByCategory: createServiceMethod<Expenses[]>(
    'expenses', 'BY_CATEGORY', 'get',
    {
      withRetry: EXPENSES_RETRY_CONFIG,
      cacheResponse: true
    }
  ),

  /**
   * Get expense categories
   */
  getCategories: createServiceMethod<{
    id: string;
    name: string;
    description?: string;
  }[]>('expenses', 'CATEGORIES', 'get', { cacheResponse: true }),

  /**
   * Get expense statistics
   */
  getStatistics: createServiceMethod<{
    totalExpenses: number;
    expensesByCategory: Record<string, number>;
    monthlyExpenses: { date: string; amount: number }[];
  }>('expenses', 'STATISTICS', 'get', { cacheResponse: true }),

  /**
   * Upload expense receipt
   */
  uploadReceipt: createServiceMethod<{
    id: string;
    url: string;
  }, FormData>(
    'expenses', 'UPLOAD_RECEIPT', 'post',
    { withRetry: false }
  )
};
