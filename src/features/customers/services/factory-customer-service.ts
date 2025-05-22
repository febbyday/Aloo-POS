/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Factory-Based Customer Service
 *
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of customer-related operations with minimal duplication.
 */

import { Customer, ApiCustomer, customerMappers } from '../types';
import { CustomerFilter } from '../types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { CUSTOMER_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType, createErrorHandler } from '@/lib/api/error-handler';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { getApiUrl } from '@/lib/api/enhanced-config';
import { API_URL, API_PREFIX } from '@/lib/api/api-constants';

// Create module-specific error handler
const errorHandler = createErrorHandler('customers');

// Define retry configuration
const CUSTOMER_RETRY_CONFIG = {
  maxRetries: 2,
  retryDelay: 1000,
  shouldRetry: (error: any) => {
    // Only retry on network errors, not on validation errors
    return error.type === ApiErrorType.NETWORK ||
           error.type === ApiErrorType.TIMEOUT ||
           error.type === ApiErrorType.SERVER;
  }
};

/**
 * Factory-based Customer Service
 *
 * Provides API operations for customer management including CRUD operations
 * and data transformation between UI and API models.
 */
class FactoryCustomerService {
  constructor() {
    // Log initialization
    console.log('FactoryCustomerService initialized with enhanced API client');

    // Check backend connectivity
    this.checkBackendConnectivity();
  }

  /**
   * Check if the backend is reachable
   */
  private async checkBackendConnectivity(): Promise<void> {
    try {
      // First try the registered health endpoint from HEALTH_ENDPOINTS
      const apiUrl = getApiUrl('health', 'CHECK');
      console.log('Checking backend connectivity at:', apiUrl);

      try {
        // Use a simple fetch with minimal headers to avoid CORS issues
        const response = await fetch(apiUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          },
          // Add a timeout to avoid hanging
          signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
          console.log('Backend connectivity check successful');
          return;
        } else {
          console.warn(`Backend connectivity check failed with status: ${response.status}`);
        }
      } catch (firstError) {
        console.warn('First connectivity check failed, trying root API endpoint:', firstError);
      }

      // If the first attempt fails, try the root API endpoint
      try {
        const rootUrl = `${API_URL}${API_PREFIX}`;
        console.log('Trying root API endpoint:', rootUrl);

        const rootResponse = await fetch(rootUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          },
          // Add a timeout to avoid hanging
          signal: AbortSignal.timeout(3000)
        });

        if (rootResponse.ok) {
          console.log('Root API endpoint check successful');
        } else {
          console.warn(`Root API endpoint check failed with status: ${rootResponse.status}`);
        }
      } catch (secondError) {
        console.error('All backend connectivity checks failed:', secondError);
      }
    } catch (error) {
      console.error('Backend connectivity check error:', error);
    }
  }

  /**
   * Get customers with optional filtering and pagination
   * @param params Optional filtering and pagination options
   * @returns Promise with customers data and pagination information
   */
  async getAll(params?: { page?: number; pageSize?: number; search?: string; status?: string; loyaltyTier?: string }) {
    try {
      const response = await enhancedApiClient.get(
        'customers/LIST',
        undefined,
        {
          params,
          retry: CUSTOMER_RETRY_CONFIG,
          cache: 'default'
        }
      );

      return {
        data: (response?.data || []).map(customerMappers.toUiModel),
        pagination: response?.pagination || { page: 1, limit: 10, total: 0 }
      };
    } catch (error) {
      throw errorHandler.handleError(error, 'getAll');
    }
  }

  /**
   * Get a customer by ID
   * @param id Customer ID
   * @returns Promise with customer data or null if not found
   */
  async getById(id: string): Promise<Customer | null> {
    try {
      const response = await enhancedApiClient.get(
        'customers/DETAIL',
        { id },
        { retry: CUSTOMER_RETRY_CONFIG }
      );

      return response ? customerMappers.toUiModel(response) : null;
    } catch (error) {
      // For NOT_FOUND errors, return null instead of throwing
      const apiError = errorHandler.handleError(error, 'getById');
      if (apiError.type === ApiErrorType.NOT_FOUND) {
        return null;
      }
      throw apiError;
    }
  }

  /**
   * Create a new customer
   * @param customer Customer data to create
   * @returns Promise with created customer data
   */
  async create(customer: any): Promise<Customer> {
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

      const response = await enhancedApiClient.post(
        'customers/CREATE',
        requiredCustomerData,
        undefined,
        { retry: false } // Don't retry creates to avoid duplicates
      );

      console.log('API success response:', response);

      // Map to UI model
      const uiCustomer = customerMappers.toUiModel(response);
      console.log('Mapped to UI customer:', uiCustomer);

      return uiCustomer;
    } catch (error) {
      throw errorHandler.handleError(error, 'create');
    }
  }

  /**
   * Update an existing customer
   * @param id Customer ID to update
   * @param customer Partial customer data to update
   * @returns Promise with updated customer data
   */
  async update(id: string, customer: any): Promise<Customer> {
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

      const response = await enhancedApiClient.put(
        'customers/UPDATE',
        updateData,
        { id },
        { retry: false } // Don't retry updates to avoid duplicates
      );

      console.log('API update success response:', response);

      // Map to UI model
      const uiCustomer = customerMappers.toUiModel(response);
      console.log('Updated customer mapped to UI:', uiCustomer);

      return uiCustomer;
    } catch (error) {
      throw errorHandler.handleError(error, 'update');
    }
  }

  /**
   * Delete a customer
   * @param id Customer ID to delete
   * @returns Promise indicating success or failure
   */
  async delete(id: string): Promise<boolean> {
    try {
      await enhancedApiClient.delete(
        'customers/DELETE',
        { id },
        { retry: false } // Don't retry deletes
      );
      return true;
    } catch (error) {
      throw errorHandler.handleError(error, 'delete');
    }
  }

  /**
   * Get customer addresses
   */
  getAddresses = createServiceMethod<any[]>(
    'customers',
    'ADDRESSES',
    'get',
    {
      withRetry: true,
      cacheResponse: false
    }
  );

  /**
   * Add customer address
   */
  addAddress = createServiceMethod<any, any>(
    'customers',
    'ADD_ADDRESS',
    'post',
    { withRetry: false }
  );

  /**
   * Update customer address
   */
  updateAddress = createServiceMethod<any, any>(
    'customers',
    'UPDATE_ADDRESS',
    'put',
    { withRetry: false }
  );

  /**
   * Remove customer address
   */
  removeAddress = createServiceMethod<any, { addressId: string }>(
    'customers',
    'REMOVE_ADDRESS',
    'delete',
    { withRetry: false }
  );

  /**
   * Get customer orders
   */
  getOrders = createServiceMethod<any[]>(
    'customers',
    'ORDERS',
    'get',
    {
      withRetry: true,
      cacheResponse: false
    }
  );

  /**
   * Get customer payment methods
   */
  getPaymentMethods = createServiceMethod<any[]>(
    'customers',
    'PAYMENT_METHODS',
    'get',
    {
      withRetry: true,
      cacheResponse: false
    }
  );

  /**
   * Add customer payment method
   */
  addPaymentMethod = createServiceMethod<any, any>(
    'customers',
    'ADD_PAYMENT_METHOD',
    'post',
    { withRetry: false }
  );

  /**
   * Get customer notes
   */
  getNotes = createServiceMethod<any[]>(
    'customers',
    'NOTES',
    'get',
    {
      withRetry: true,
      cacheResponse: false
    }
  );

  /**
   * Add customer note
   */
  addNote = createServiceMethod<any, any>(
    'customers',
    'ADD_NOTE',
    'post',
    { withRetry: false }
  );
}

// Export a singleton instance of the customer service
export const factoryCustomerService = new FactoryCustomerService();

// For backward compatibility, export the delete method
export const deleteCustomer = (id: string) => factoryCustomerService.delete(id);

// Export default for backward compatibility
export default factoryCustomerService;
