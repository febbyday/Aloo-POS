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
  private readonly endpoint = 'customers';
  // Backend base URL
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  constructor() {
    // Log environment configuration
    console.log('CustomerService initialized with config:', {
      endpoint: this.endpoint,
      baseUrl: this.baseUrl,
      fullApiUrl: this.getApiUrl()
    });

    // Check backend connectivity
    this.checkBackendConnectivity();
  }

  /**
   * Check if the backend is reachable
   */
  private async checkBackendConnectivity(): Promise<void> {
    try {
      const healthUrl = `${this.baseUrl}/api/v1/health`;
      
      const response = await fetch(healthUrl, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend connectivity check successful:', data);
      } else {
        console.warn('Backend connectivity check failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Backend connectivity check error:', error);
    }
  }

  /**
   * Get full API URL for an endpoint
   * @param path Path to append to the base URL
   * @returns Full API URL
   */
  private getApiUrl(path: string = ''): string {
    // Always include the API prefix
    const apiPath = `/api/v1/${this.endpoint}${path}`;
    
    // Remove any double slashes
    return `${this.baseUrl}${apiPath}`.replace(/\/\//g, '/');
  }

  /**
   * Get customers with optional filtering and pagination
   * @param filters Optional filtering and pagination options
   * @returns Promise with customers data and pagination information
   */
  async getAll(params?: { page?: number; pageSize?: number; search?: string; status?: string; loyaltyTier?: string }) {
    try {
      const response = await apiClient.get(this.getApiUrl(), { params });
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
      const response = await apiClient.get(this.getApiUrl(`/${id}`));
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
  async create(customer: any) {
    try {
      console.log('Creating customer with data:', customer);
      
      // Define required fields for API - match backend expectations exactly
      const requiredCustomerData = {
        firstName: customer.firstName || customer.first_name || '',
        lastName: customer.lastName || customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        status: customer.status || 'active',
        membershipLevel: customer.membershipLevel || customer.tier || 'bronze',
        loyaltyPoints: parseInt(customer.loyaltyPoints || customer.loyalty_points || 0),
        totalSpent: parseFloat(customer.totalSpent || 0),
        isActive: customer.isActive !== undefined ? customer.isActive : true
      };
      
      console.log('Sending API request with data:', requiredCustomerData);
      
      // Make direct fetch request to ensure proper data format
      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requiredCustomerData)
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(`API error: ${errorData.message || 'Unknown error'}`);
      }
      
      const responseData = await response.json();
      console.log('API success response:', responseData);
      
      // Handle the response formats whether it's data.data or just data
      const customerData = responseData.data || responseData;
      
      // Map to UI model
      const uiCustomer = customerMappers.toUiModel(customerData);
      console.log('Mapped to UI customer:', uiCustomer);
      
      return uiCustomer;
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
  async update(id: string, customer: any) {
    try {
      console.log('Updating customer with ID:', id, 'and data:', customer);
      
      // Define update fields for API
      const updateData = {
        firstName: customer.firstName || customer.first_name,
        lastName: customer.lastName || customer.last_name,
        email: customer.email,
        phone: customer.phone || '',
        status: customer.status || 'active',
        membershipLevel: customer.membershipLevel || customer.tier || 'bronze',
        loyaltyPoints: parseInt(customer.loyaltyPoints || customer.loyalty_points || 0),
        totalSpent: parseFloat(customer.totalSpent || 0),
        isActive: customer.isActive !== undefined ? customer.isActive : true
      };
      
      // Remove undefined or null fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
          delete updateData[key];
        }
      });
      
      console.log('Sending API update request with data:', updateData);
      
      // Make direct fetch request to ensure proper data format
      const response = await fetch(this.getApiUrl(`/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(`API error: ${errorData.message || 'Unknown error'}`);
      }
      
      const responseData = await response.json();
      console.log('API update success response:', responseData);
      
      // Handle the response formats whether it's data.data or just data
      const customerData = responseData.data || responseData;
      
      // Map to UI model
      const uiCustomer = customerMappers.toUiModel(customerData);
      console.log('Updated customer mapped to UI:', uiCustomer);
      
      return uiCustomer;
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
      await apiClient.delete(this.getApiUrl(`/${id}`));
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
    // Extract and log more detailed error information
    const errorDetails = {
      message,
      error: error.message || 'Unknown error',
      status: error.status || error.statusCode,
      response: error.response?.data
    };
    
    console.error('Customer API Error:', errorDetails);
    
    // Log the full error object for debugging
    console.error('Full error object:', error);
    
    throw error;
  }
}

// Export a singleton instance of the customer service
export const customerService = new CustomerService();

// For backward compatibility, export the delete method
export const deleteCustomer = (id: string) => customerService.delete(id);
