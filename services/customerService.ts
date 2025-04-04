import { apiClient } from './api-client';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  membershipLevel: string;
  loyaltyPoints: number;
  totalSpent: number;
  addresses?: Address[];
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  type: string;
}

export interface CustomerResponse {
  data: Customer[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

export interface CustomerParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

class CustomerService {
  private endpoint = '/api/v1/customers';

  async getAll(params: CustomerParams = {}): Promise<CustomerResponse> {
    try {
      // Instead of using URLSearchParams, pass the params directly to axios
      // which will handle the serialization properly
      const response = await apiClient.get<CustomerResponse>(this.endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      throw this.handleError(error);
    }
  }

  async getById(id: string): Promise<Customer> {
    try {
      const response = await apiClient.get<{ data: Customer }>(`${this.endpoint}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch customer ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async create(customer: Partial<Customer>): Promise<Customer> {
    try {
      const response = await apiClient.post<{ data: Customer }>(this.endpoint, customer);
      return response.data.data;
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw this.handleError(error);
    }
  }

  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    try {
      const response = await apiClient.put<{ data: Customer }>(`${this.endpoint}/${id}`, customer);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update customer ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Failed to delete customer ${id}:`, error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      const customError = new Error(message);
      customError.name = 'ApiError';
      return customError;
    } else if (error.request) {
      // The request was made but no response was received
      const customError = new Error('No response received from server');
      customError.name = 'NetworkError';
      return customError;
    } else {
      // Something happened in setting up the request that triggered an Error
      const customError = new Error('Error setting up the request');
      customError.name = 'RequestError';
      return customError;
    }
  }
}

export const customerService = new CustomerService();