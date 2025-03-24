import { apiClient } from '@/lib/api/api-config';

/**
 * Service for handling customer analytics and reports
 */
export class CustomerReportsService {
  private readonly baseEndpoint = 'customer-analytics';
  private readonly reportsEndpoint = 'customer-reports';

  /**
   * Get customer metrics data for a specific customer
   * @param customerId Customer ID to get metrics for
   * @returns Promise with customer metrics data
   */
  async getCustomerMetrics(customerId: string) {
    try {
      const response = await apiClient.get(`${this.baseEndpoint}/metrics/${customerId}`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch customer metrics:', error);
      throw new Error('Unable to load customer metrics');
    }
  }

  /**
   * Get customer lifetime value analytics
   * @param customerId Customer ID to analyze
   * @returns Promise with lifetime value data
   */
  async getCustomerLifetimeValue(customerId: string) {
    try {
      const response = await apiClient.get(`${this.baseEndpoint}/lifetime-value/${customerId}`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch customer lifetime value:', error);
      throw new Error('Unable to load customer lifetime value');
    }
  }

  /**
   * Get customer loyalty activity
   * @param customerId Customer ID to get loyalty data for
   * @returns Promise with loyalty activity data
   */
  async getLoyaltyActivity(customerId: string) {
    try {
      const response = await apiClient.get(`${this.baseEndpoint}/loyalty-activity/${customerId}`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch loyalty activity:', error);
      throw new Error('Unable to load loyalty activity');
    }
  }

  /**
   * Get customer segment distribution data
   * @returns Promise with segment distribution data
   */
  async getSegmentDistribution() {
    try {
      const response = await apiClient.get(`${this.baseEndpoint}/segment-distribution`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch segment distribution:', error);
      throw new Error('Unable to load segment distribution');
    }
  }

  /**
   * Get customer segments report
   * @returns Promise with customer segments report data
   */
  async getCustomerSegmentsReport() {
    try {
      const response = await apiClient.get(`${this.reportsEndpoint}/customer-segments`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch customer segments report:', error);
      throw new Error('Unable to load customer segments report');
    }
  }

  /**
   * Get customer retention report
   * @returns Promise with customer retention report data
   */
  async getRetentionReport() {
    try {
      const response = await apiClient.get(`${this.reportsEndpoint}/retention`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch retention report:', error);
      throw new Error('Unable to load retention report');
    }
  }

  /**
   * Get customer acquisition report
   * @returns Promise with customer acquisition report data
   */
  async getAcquisitionReport() {
    try {
      const response = await apiClient.get(`${this.reportsEndpoint}/acquisition`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch acquisition report:', error);
      throw new Error('Unable to load acquisition report');
    }
  }

  /**
   * Get loyalty program report
   * @returns Promise with loyalty program report data
   */
  async getLoyaltyProgramReport() {
    try {
      const response = await apiClient.get(`${this.reportsEndpoint}/loyalty-program`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch loyalty program report:', error);
      throw new Error('Unable to load loyalty program report');
    }
  }
}

export const customerReportsService = new CustomerReportsService(); 