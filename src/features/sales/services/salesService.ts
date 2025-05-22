/**
 * Sales Service
 *
 * This service handles API calls and data operations for the sales feature.
 */

import { apiClient } from '@/lib/api/api-client';
import { API_CONSTANTS } from '@/lib/api/config';

// API endpoints
const SALES_ENDPOINT = '/sales';
const SALES_SUMMARY_ENDPOINT = '/sales/summary';

// Types
export interface Sale {
  id: string;
  invoiceNo: string;
  date: Date;
  customer: string | null;
  total: number;
  items: number;
  status: 'completed' | 'pending' | 'cancelled';
  employee: string;
  location: string;
  addedBy: string;
  note: string | null;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paymentMethod: 'cash' | 'card' | 'multiple';
  totalPaid: number;
}

export interface SalesSummary {
  totalSales: number;
  totalTransactions: number;
  averageSale: number;
  salesChartData: ChartDataPoint[];
  transactionsChartData: ChartDataPoint[];
  averageSaleChartData: ChartDataPoint[];
}

export interface ChartDataPoint {
  day: number;
  amount: number;
  count: number;
  average: number;
}

// Mock data generators
export const generateMockSales = (): Sale[] => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `SALE-${1000 + i}`,
    invoiceNo: `INV-${2000 + i}`,
    date: new Date(2023, 4, 15 - (i % 15)),
    customer: i % 3 === 0 ? null : `Customer ${i + 1}`,
    total: Math.round((100 + Math.random() * 900) * 100) / 100,
    items: Math.floor(Math.random() * 5) + 1,
    status: ['completed', 'pending', 'cancelled'][i % 3] as 'completed' | 'pending' | 'cancelled',
    employee: `Employee ${(i % 5) + 1}`,
    location: `Store ${(i % 3) + 1}`,
    addedBy: `User ${(i % 4) + 1}`,
    note: i % 5 === 0 ? `Note for sale ${i}` : null,
    paymentStatus: ['paid', 'partial', 'unpaid'][i % 3] as 'paid' | 'partial' | 'unpaid',
    paymentMethod: ['cash', 'card', 'multiple'][i % 3] as 'cash' | 'card' | 'multiple',
    totalPaid: i % 3 === 0 ? 0 : i % 3 === 1 ? Math.round((50 + Math.random() * 50) * 100) / 100 : Math.round((100 + Math.random() * 900) * 100) / 100
  }));
};

export const generateMockSummary = (): SalesSummary => {
  const totalSales = Math.round((5000 + Math.random() * 5000) * 100) / 100;
  const totalTransactions = Math.floor(Math.random() * 50) + 100;
  const averageSale = Math.round((totalSales / totalTransactions) * 100) / 100;

  const salesChartData = Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    amount: Math.round((300 + Math.random() * 700) * 100) / 100,
    count: Math.floor(Math.random() * 10) + 5,
    average: Math.round((50 + Math.random() * 100) * 100) / 100
  }));

  return {
    totalSales,
    totalTransactions,
    averageSale,
    salesChartData,
    transactionsChartData: salesChartData.map(item => ({ ...item })),
    averageSaleChartData: salesChartData.map(item => ({ ...item }))
  };
};

export const salesService = {
  /**
   * Fetch all sales items
   */
  fetchAll: async (): Promise<Sale[]> => {
    try {
      const response = await apiClient.get(`${API_CONSTANTS.FULL_URL}${SALES_ENDPOINT}`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching sales:', error);
      // Return mock data in development mode
      if (import.meta.env.DEV) {
        console.warn('Using mock sales data');
        return generateMockSales();
      }
      return [];
    }
  },

  /**
   * Fetch sales summary
   */
  fetchSummary: async (): Promise<SalesSummary> => {
    try {
      const response = await apiClient.get(`${API_CONSTANTS.FULL_URL}${SALES_SUMMARY_ENDPOINT}`);
      return response.data || generateMockSummary();
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      // Return mock data in development mode
      if (import.meta.env.DEV) {
        console.warn('Using mock sales summary data');
        return generateMockSummary();
      }
      throw error;
    }
  },

  /**
   * Fetch a single sales by ID
   */
  fetchById: async (id: string): Promise<Sale | null> => {
    try {
      const response = await apiClient.get(`${API_CONSTANTS.FULL_URL}${SALES_ENDPOINT}/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching sale ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new sales
   */
  create: async (data: Partial<Sale>): Promise<Sale> => {
    try {
      const response = await apiClient.post(`${API_CONSTANTS.FULL_URL}${SALES_ENDPOINT}`, data);
      return response.data || {} as Sale;
    } catch (error) {
      console.error('Error creating sale:', error);
      return {} as Sale;
    }
  },

  /**
   * Update an existing sales
   */
  update: async (id: string, data: Partial<Sale>): Promise<Sale> => {
    try {
      const response = await apiClient.put(`${API_CONSTANTS.FULL_URL}${SALES_ENDPOINT}/${id}`, data);
      return response.data || {} as Sale;
    } catch (error) {
      console.error(`Error updating sale ${id}:`, error);
      return {} as Sale;
    }
  },

  /**
   * Delete a sales
   */
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`${API_CONSTANTS.FULL_URL}${SALES_ENDPOINT}/${id}`);
      return response.success || false;
    } catch (error) {
      console.error(`Error deleting sale ${id}:`, error);
      return false;
    }
  }
};
