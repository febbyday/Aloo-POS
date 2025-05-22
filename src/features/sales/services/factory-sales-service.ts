/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Factory-Based Sales Service
 * 
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of sales-related operations with minimal duplication.
 */

import { Sales, SalesTransaction, SalesReturn, SalesReport } from '../types/sales.types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { SALES_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType } from '@/lib/api/error-handler';

/**
 * Sales service with standardized endpoint handling
 */
const salesService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<Sales>('sales', {
    useEnhancedClient: true,
    withRetry: {
      maxRetries: 2,
      shouldRetry: (error: any) => {
        // Only retry network or server errors
        return ![
          ApiErrorType.VALIDATION, 
          ApiErrorType.CONFLICT,
          ApiErrorType.AUTHORIZATION
        ].includes(error.type);
      }
    },
    cacheResponse: false, // Sales data should always be fresh
    // Map response to ensure dates are properly converted
    mapResponse: (data: any) => {
      if (Array.isArray(data)) {
        return data.map(sale => ({
          ...sale,
          createdAt: sale.createdAt ? new Date(sale.createdAt) : undefined,
          saleDate: sale.saleDate ? new Date(sale.saleDate) : undefined,
          updatedAt: sale.updatedAt ? new Date(sale.updatedAt) : undefined
        }));
      }
      
      if (!data) return null;
      
      return {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        saleDate: data.saleDate ? new Date(data.saleDate) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined
      };
    }
  }),
  
  // Custom methods for sales-specific operations
  
  /**
   * Get sales reports
   */
  getSalesReports: createServiceMethod<SalesReport[]>(
    'sales', 'REPORTS', 'get'
  ),
  
  /**
   * Get daily sales
   */
  getDailySales: createServiceMethod<{
    date: string;
    totalSales: number;
    totalTransactions: number;
    averageTransactionValue: number;
  }[]>('sales', 'DAILY', 'get'),
  
  /**
   * Get weekly sales
   */
  getWeeklySales: createServiceMethod<{
    weekStartDate: string;
    weekEndDate: string;
    totalSales: number;
    totalTransactions: number;
    averageTransactionValue: number;
  }[]>('sales', 'WEEKLY', 'get'),
  
  /**
   * Get monthly sales
   */
  getMonthlySales: createServiceMethod<{
    month: string;
    year: number;
    totalSales: number;
    totalTransactions: number;
    averageTransactionValue: number;
  }[]>('sales', 'MONTHLY', 'get'),
  
  /**
   * Get yearly sales
   */
  getYearlySales: createServiceMethod<{
    year: number;
    totalSales: number;
    totalTransactions: number;
    averageTransactionValue: number;
  }[]>('sales', 'YEARLY', 'get'),
  
  /**
   * Additional convenience methods
   */
  
  /**
   * Get sales by date range
   */
  getSalesByDateRange: async (startDate: Date, endDate: Date): Promise<Sales[]> => {
    return salesService.getAll({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  },
  
  /**
   * Get sales by cashier
   */
  getSalesByCashier: async (cashierId: string): Promise<Sales[]> => {
    return salesService.getAll({ cashierId });
  },
  
  /**
   * Get sales by location
   */
  getSalesByLocation: async (locationId: string): Promise<Sales[]> => {
    return salesService.getAll({ locationId });
  },
  
  /**
   * Get sales by payment method
   */
  getSalesByPaymentMethod: async (paymentMethod: string): Promise<Sales[]> => {
    return salesService.getAll({ paymentMethod });
  },
  
  /**
   * Get total sales
   */
  getTotalSales: async (options: { 
    startDate?: Date; 
    endDate?: Date;
    locationId?: string;
    cashierId?: string;
  } = {}): Promise<number> => {
    const params: Record<string, any> = {};
    
    if (options.startDate) {
      params.startDate = options.startDate.toISOString();
    }
    
    if (options.endDate) {
      params.endDate = options.endDate.toISOString();
    }
    
    if (options.locationId) {
      params.locationId = options.locationId;
    }
    
    if (options.cashierId) {
      params.cashierId = options.cashierId;
    }
    
    // Add a specific parameter to get total only
    params.totalOnly = true;
    
    const result = await createServiceMethod<{ total: number }>(
      'sales', 'REPORTS', 'get'
    )(params);
    
    return result?.total || 0;
  },
  
  /**
   * Process a refund
   */
  processRefund: async (
    saleId: string,
    items: Array<{ 
      lineItemId: string; 
      quantity: number;
      reason: string;
    }>,
    refundPayment: boolean = true
  ): Promise<SalesReturn> => {
    // Create a return record with the refund items
    const returnData = {
      saleId,
      items,
      refundPayment,
      returnDate: new Date().toISOString(),
      processedBy: 'current-user', // In a real app, get this from auth context
      notes: 'Return processed'
    };
    
    // Custom endpoint call that doesn't use the standard pattern
    const result = await createServiceMethod<SalesReturn, typeof returnData>(
      'sales', 'RETURNS', 'post'
    )(undefined, returnData);
    
    return result;
  },
  
  /**
   * Generate sales report
   */
  generateSalesReport: async (
    reportType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    options: {
      startDate?: Date;
      endDate?: Date;
      format?: 'pdf' | 'csv' | 'xlsx';
      includeProducts?: boolean;
      includePaymentMethods?: boolean;
      includeTaxDetails?: boolean;
    } = {}
  ): Promise<Blob> => {
    const params: Record<string, any> = {
      reportType,
      format: options.format || 'pdf',
      includeProducts: options.includeProducts || false,
      includePaymentMethods: options.includePaymentMethods || false,
      includeTaxDetails: options.includeTaxDetails || false
    };
    
    if (options.startDate) {
      params.startDate = options.startDate.toISOString();
    }
    
    if (options.endDate) {
      params.endDate = options.endDate.toISOString();
    }
    
    // Use the exportData method to get the report as a blob
    return salesService.exportData(params.format, params);
  }
};

export default salesService;
