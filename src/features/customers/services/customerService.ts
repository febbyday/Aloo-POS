/**
 * Customer Service
 * 
 * Provides API operations for customer management including CRUD operations
 * and data transformation between UI and API models.
 */

import { apiClient } from '@/lib/api/api-config';
import { Customer, ApiCustomer, customerMappers } from '../types';
import { CustomerFilter } from '../types';

class CustomerService {
  // API endpoint path for customers (must match server's route definition)
  private readonly endpoint = '/api/v1/customers';

  /**
   * Get customers with optional filtering and pagination
   * @param filters Optional filtering and pagination options
   * @returns Promise with customers data and pagination information
   */
  async getAll(params?: { page?: number; pageSize?: number; search?: string; status?: string; loyaltyTier?: string }) {
    try {
      const response = await apiClient.get(this.endpoint, { params });
      return {
        data: (response.data.data || []).map(customerMappers.toUiModel),
        pagination: response.data.pagination
      };
    } catch (error) {
      this.handleError(error, 'Failed to fetch customers');
      throw error;
    }
  }

  /**
   * Get a customer by ID
   * @param id Customer ID
   * @returns Promise with customer data or null if not found
   */
  async getById(id: string) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}`);
      return customerMappers.toUiModel(response.data);
    } catch (error) {
      this.handleError(error, `Failed to fetch customer ${id}`);
      throw error;
    }
  }

  /**
   * Create a new customer
   * @param customer Customer data to create
   * @returns Promise with created customer data or null on error
   */
  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const apiCustomer = customerMappers.toApiModel({
        ...customer,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const response = await apiClient.post(this.endpoint, apiCustomer);
      return customerMappers.toUiModel(response.data);
    } catch (error) {
      this.handleError(error, 'Failed to create customer');
      throw error;
    }
  }

  /**
   * Update an existing customer
   * @param id Customer ID to update
   * @param customer Partial customer data to update
   * @returns Promise with updated customer data or null on error
   */
  async update(id: string, customer: Partial<Customer>) {
    try {
      const apiCustomer = customerMappers.toApiModel(customer as Customer);
      const response = await apiClient.put(`${this.endpoint}/${id}`, apiCustomer);
      return customerMappers.toUiModel(response.data);
    } catch (error) {
      this.handleError(error, `Failed to update customer ${id}`);
      throw error;
    }
  }

  /**
   * Delete a customer
   * @param id Customer ID to delete
   * @returns Promise indicating success or failure
   */
  async delete(id: string) {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
      return true;
    } catch (error) {
      this.handleError(error, `Failed to delete customer ${id}`);
      throw error;
    }
  }

  /**
   * Handle API errors
   * @param error Error object
   * @param message Error message
   */
  private handleError(error: any, message: string): void {
    console.error(message, error);
    throw error;
  }
}

// Export a singleton instance of the customer service
export const customerService = new CustomerService();

// For backward compatibility, export the delete method
export const deleteCustomer = (id: string) => customerService.delete(id);
