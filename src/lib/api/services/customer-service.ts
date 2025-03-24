/**
 * Customer Service - API Integration for Customer Management
 *
 * This service handles all customer-related operations, including:
 * - CRUD operations for customer profiles
 * - Loyalty program management
 * - Customer analytics and reporting
 */

import { BaseService, QueryParams } from './base-service';
import { Customer } from '@/features/customers/types/customers.types';
import { apiClient } from '../api-config';
import { handleApiError } from '../api-client';

/**
 * CustomerService class for managing customer operations
 */
export class CustomerService extends BaseService<Customer> {
  constructor() {
    super({
      endpoint: '/api/v1/customers',
      entityName: 'customers',
      usePersistence: true,
    });
  }

  /**
   * Get customers filtered by membership level
   * 
   * @param level - Membership level to filter by (e.g., "Gold", "Silver")
   * @param params - Additional query parameters
   * @returns Promise with matching customers
   */
  public async getByMembershipLevel(level: string, params?: QueryParams): Promise<Customer[]> {
    try {  
      // Use real API
      const response = await apiClient.get<Customer[]>(
        `${this.endpoint}/membership/${encodeURIComponent(level)}`,
        params
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching customers by membership level ${level}:`, error);
      throw error;
    }
  }

  /**
   * Get top customers by total spent
   * 
   * @param limit - Maximum number of customers to return
   * @returns Promise with top spending customers
   */
  public async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    try {
      // Use real API
      const response = await apiClient.get<Customer[]>(
        `${this.endpoint}/top`,
        { limit }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching top ${limit} customers:`, error);
      throw error;
    }
  }

  /**
   * Get customers with recent activity
   * 
   * @param days - Number of days to look back for activity
   * @param limit - Maximum number of customers to return
   * @returns Promise with recently active customers
   */
  public async getRecentCustomers(days: number = 30, limit: number = 10): Promise<Customer[]> {
    try {
      // Use real API
      const response = await apiClient.get<Customer[]>(
        `${this.endpoint}/recent`,
        { days, limit }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching customers with activity in last ${days} days:`, error);
      throw error;
    }
  }

  /**
   * Update customer loyalty points
   * 
   * @param customerId - ID of the customer to update
   * @param points - Number of points to add or set
   * @param isIncrement - If true, add points. If false, set points to the given value
   * @returns Promise with updated customer
   */
  public async updateLoyaltyPoints(customerId: string, points: number, isIncrement = true): Promise<Customer> {
    try {
      // Use real API
      const response = await apiClient.put<Customer, { points: number, isIncrement: boolean }>(
        `${this.endpoint}/${customerId}/loyalty-points`,
        { points, isIncrement }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error updating loyalty points for customer ${customerId}:`, error);
      return handleApiError(Promise.reject(error));
    }
  }

  /**
   * Update customer membership level
   * 
   * @param customerId - ID of the customer to update
   * @param level - New membership level
   * @returns Promise with updated customer
   */
  public async updateMembershipLevel(customerId: string, level: string): Promise<Customer> {
    try {
      // Use real API
      const response = await apiClient.put<Customer, { membershipLevel: string }>(
        `${this.endpoint}/${customerId}/membership`,
        { membershipLevel: level }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error updating membership level for customer ${customerId}:`, error);
      return handleApiError(Promise.reject(error));
    }
  }

  /**
   * Update customer purchase statistics
   * 
   * @param customerId - ID of the customer to update
   * @param amount - Amount spent in the transaction
   * @returns Promise with updated customer
   */
  public async updateCustomerStats(customerId: string, amount: number): Promise<Customer> {
    try {
      // Use real API
      const response = await apiClient.put<Customer, { amount: number }>(
        `${this.endpoint}/${customerId}/stats`,
        { amount }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error updating purchase stats for customer ${customerId}:`, error);
      return handleApiError(Promise.reject(error));
    }
  }

  /**
   * Search for customers
   * 
   * @param query - Search query string
   * @param params - Additional query parameters
   * @returns Promise with matching customers
   */
  public async searchCustomers(query: string, params?: QueryParams): Promise<Customer[]> {
    try {
      // Use real API
      const response = await apiClient.get<Customer[]>(
        `${this.endpoint}/search`,
        { ...params, query }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error searching customers with query "${query}":`, error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const customerService = new CustomerService();

export default customerService;
