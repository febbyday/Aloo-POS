/**
 * Staff Performance Service
 * 
 * This service handles API calls and data operations for staff performance metrics.
 */

import { api } from '@/lib/api';

// Performance metrics data structure
export interface StaffMetrics {
  salesTarget: number;
  customerSatisfaction: number;
  attendance: number;
  taskCompletion: number;
  teamManagement: number;
}

// Staff performance data structure
export interface StaffPerformance {
  id: number | string;
  name: string;
  role: string;
  metrics: StaffMetrics;
  recentSales: number;
  transactions: number;
  hoursWorked: number;
  rating: number;
}

// Summary metrics data structure
export interface PerformanceSummary {
  totalSales: number;
  transactions: number;
  averageRating: number;
  hoursWorked: number;
  salesGrowth: number;
  transactionsGrowth: number;
  ratingChange: number;
  hoursGrowth: number;
}

/**
 * Fetch staff performance data based on date range
 * 
 * @param fromDate - Starting date for performance data
 * @param toDate - Ending date for performance data
 * @returns Promise with staff performance data
 */
export const getStaffPerformance = async (
  fromDate?: Date,
  toDate?: Date
): Promise<StaffPerformance[]> => {
  try {
    // Prepare date range parameters
    const params = new URLSearchParams();
    if (fromDate) {
      const fromDateStr = fromDate.toISOString().split('T')[0];
      if (fromDateStr) {
        params.append('from', fromDateStr);
      }
    }
    if (toDate) {
      const toDateStr = toDate.toISOString().split('T')[0];
      if (toDateStr) {
        params.append('to', toDateStr);
      }
    }
    
    // Query params string
    const queryParams = params.toString() ? `?${params.toString()}` : '';
    
    // Make API request
    const { data } = await api.get(`/api/v1/staff/performance${queryParams}`);
    
    // Map API response to our interface
    return data.map((item: any) => ({
      id: item.id || item.staffId || `staff-${Math.floor(Math.random() * 10000)}`,
      name: item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown Staff',
      role: item.role?.name || item.position || 'Staff Member',
      metrics: {
        salesTarget: typeof item.metrics?.salesTarget === 'number' ? item.metrics.salesTarget : 0,
        customerSatisfaction: typeof item.metrics?.customerSatisfaction === 'number' ? item.metrics.customerSatisfaction : 0,
        attendance: typeof item.metrics?.attendance === 'number' ? item.metrics.attendance : 0,
        taskCompletion: typeof item.metrics?.taskCompletion === 'number' ? item.metrics.taskCompletion : 0,
        teamManagement: typeof item.metrics?.teamManagement === 'number' ? item.metrics.teamManagement : 0
      },
      recentSales: typeof item.recentSales === 'number' ? item.recentSales : (typeof item.sales === 'number' ? item.sales : 0),
      transactions: typeof item.transactions === 'number' ? item.transactions : 0,
      hoursWorked: typeof item.hoursWorked === 'number' ? item.hoursWorked : 0,
      rating: typeof item.rating === 'number' ? item.rating : 0
    }));
  } catch (error) {
    console.error('Error fetching staff performance data:', error);
    // Return empty array on failure
    return [];
  }
};

/**
 * Fetch performance summary metrics
 * 
 * @param fromDate - Starting date for summary data
 * @param toDate - Ending date for summary data
 * @returns Promise with performance summary data
 */
export const getPerformanceSummary = async (
  fromDate?: Date,
  toDate?: Date
): Promise<PerformanceSummary> => {
  try {
    // Prepare date range parameters
    const params = new URLSearchParams();
    if (fromDate) {
      const fromDateStr = fromDate.toISOString().split('T')[0];
      if (fromDateStr) {
        params.append('from', fromDateStr);
      }
    }
    if (toDate) {
      const toDateStr = toDate.toISOString().split('T')[0];
      if (toDateStr) {
        params.append('to', toDateStr);
      }
    }
    
    // Query params string
    const queryParams = params.toString() ? `?${params.toString()}` : '';
    
    // Make API request
    const { data } = await api.get(`/api/v1/staff/performance/summary${queryParams}`);
    
    // Return the summary data
    return {
      totalSales: typeof data.totalSales === 'number' ? data.totalSales : 0,
      transactions: typeof data.transactions === 'number' ? data.transactions : 0,
      averageRating: typeof data.averageRating === 'number' ? data.averageRating : 0,
      hoursWorked: typeof data.hoursWorked === 'number' ? data.hoursWorked : 0,
      salesGrowth: typeof data.salesGrowth === 'number' ? data.salesGrowth : 0,
      transactionsGrowth: typeof data.transactionsGrowth === 'number' ? data.transactionsGrowth : 0,
      ratingChange: typeof data.ratingChange === 'number' ? data.ratingChange : 0,
      hoursGrowth: typeof data.hoursGrowth === 'number' ? data.hoursGrowth : 0
    };
  } catch (error) {
    console.error('Error fetching performance summary:', error);
    // Return zeros for all values on failure
    return {
      totalSales: 0,
      transactions: 0,
      averageRating: 0,
      hoursWorked: 0,
      salesGrowth: 0,
      transactionsGrowth: 0,
      ratingChange: 0,
      hoursGrowth: 0
    };
  }
};

/**
 * Export the service functions
 */
export const performanceService = {
  getStaffPerformance,
  getPerformanceSummary
}; 