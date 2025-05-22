/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Factory-Based Customers Service
 * 
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of customer-related operations with minimal duplication.
 */

import { Customer, CustomerAddress, CustomerNote, CustomerPaymentMethod } from '../types/customer.types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { CUSTOMER_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType } from '@/lib/api/error-handler';

/**
 * Customers service with standardized endpoint handling
 */
const customersService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<Customer>('customers', {
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
    cacheResponse: false,
    // Map response to ensure dates are properly converted
    mapResponse: (data: any) => {
      if (Array.isArray(data)) {
        return data.map(customer => ({
          ...customer,
          createdAt: customer.createdAt ? new Date(customer.createdAt) : undefined,
          updatedAt: customer.updatedAt ? new Date(customer.updatedAt) : undefined,
          lastOrderDate: customer.lastOrderDate ? new Date(customer.lastOrderDate) : undefined,
          dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth) : undefined
        }));
      }
      
      if (!data) return null;
      
      return {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        lastOrderDate: data.lastOrderDate ? new Date(data.lastOrderDate) : undefined,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
      };
    }
  }),
  
  // Custom methods for customer-specific operations
  
  /**
   * Get customer addresses
   */
  getCustomerAddresses: createServiceMethod<CustomerAddress[]>(
    'customers', 'ADDRESSES', 'get'
  ),
  
  /**
   * Add customer address
   */
  addCustomerAddress: createServiceMethod<CustomerAddress, Partial<CustomerAddress>>(
    'customers', 'ADD_ADDRESS', 'post',
    { withRetry: false }
  ),
  
  /**
   * Update customer address
   */
  updateCustomerAddress: createServiceMethod<CustomerAddress, Partial<CustomerAddress>>(
    'customers', 'UPDATE_ADDRESS', 'put',
    { withRetry: false }
  ),
  
  /**
   * Remove customer address
   */
  removeCustomerAddress: createServiceMethod<void>(
    'customers', 'REMOVE_ADDRESS', 'delete',
    { withRetry: false }
  ),
  
  /**
   * Get customer orders
   */
  getCustomerOrders: createServiceMethod<{
    id: string;
    orderNumber: string;
    date: string;
    status: string;
    total: number;
  }[]>('customers', 'ORDERS', 'get'),
  
  /**
   * Get customer payment methods
   */
  getCustomerPaymentMethods: createServiceMethod<CustomerPaymentMethod[]>(
    'customers', 'PAYMENT_METHODS', 'get'
  ),
  
  /**
   * Add customer payment method
   */
  addCustomerPaymentMethod: createServiceMethod<CustomerPaymentMethod, Partial<CustomerPaymentMethod>>(
    'customers', 'ADD_PAYMENT_METHOD', 'post',
    { withRetry: false }
  ),
  
  /**
   * Get customer notes
   */
  getCustomerNotes: createServiceMethod<CustomerNote[]>(
    'customers', 'NOTES', 'get'
  ),
  
  /**
   * Add customer note
   */
  addCustomerNote: createServiceMethod<CustomerNote, Partial<CustomerNote>>(
    'customers', 'ADD_NOTE', 'post',
    { withRetry: false }
  ),
  
  /**
   * Additional convenience methods
   */
  
  /**
   * Search customers
   */
  searchCustomers: async (query: string): Promise<Customer[]> => {
    return customersService.search({ query });
  },
  
  /**
   * Get customers by tag
   */
  getCustomersByTag: async (tag: string): Promise<Customer[]> => {
    return customersService.getAll({ tag });
  },
  
  /**
   * Get top customers by order value
   */
  getTopCustomers: async (limit: number = 10): Promise<Customer[]> => {
    const customers = await customersService.getAll({ 
      sortBy: 'totalSpent',
      sortDirection: 'desc',
      limit
    });
    
    return customers;
  },
  
  /**
   * Add a complete new customer with address
   */
  createCustomerWithAddress: async (
    customerData: Partial<Customer>,
    addressData: Partial<CustomerAddress>
  ): Promise<Customer> => {
    // Create the customer first
    const customer = await customersService.create(customerData);
    
    // Add address if provided
    if (addressData && Object.keys(addressData).length > 0) {
      await customersService.addCustomerAddress(
        undefined,
        {
          ...addressData,
          customerId: customer.id,
          isPrimary: true
        },
        { id: customer.id }
      );
    }
    
    // Return the complete customer
    const updatedCustomer = await customersService.getById(customer.id);
    return updatedCustomer as Customer;
  },
  
  /**
   * Update customer status
   */
  updateCustomerStatus: async (
    customerId: string, 
    status: 'active' | 'inactive' | 'blocked'
  ): Promise<Customer> => {
    return customersService.update(customerId, { status });
  },
  
  /**
   * Get customer lifetime value
   */
  getCustomerLifetimeValue: async (customerId: string): Promise<number> => {
    const customer = await customersService.getById(customerId);
    return customer?.totalSpent || 0;
  }
};

export default customersService;
