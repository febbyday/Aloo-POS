/**
 * Custom hook for managing customer data and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { customerService } from '../services/customerService';
import { Customer, CustomerFilters, CustomerSortOptions, CustomerPagination } from '../types';
import { useToast } from '@/hooks';
import { eventBus, POS_EVENTS } from '@/lib/events/event-bus';

// Extend the Customer type to match what's used in CustomersPage
interface ExtendedCustomer extends Customer {
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  totalOrders: number;
  isActive: boolean;
  lastPurchase?: Date | null;
  status: 'active' | 'inactive' | 'blocked';
}

interface UseCustomersOptions {
  initialPageSize?: number;
  initialPage?: number;
  autoLoad?: boolean;
}

interface UseCustomersReturn {
  customers: ExtendedCustomer[];
  loading: boolean;
  error: Error | null;
  pagination: CustomerPagination;
  filters: CustomerFilters;
  sort: CustomerSortOptions;
  fetchCustomers: () => Promise<void>;
  setFilters: React.Dispatch<React.SetStateAction<CustomerFilters>>;
  setSortOptions: (options: CustomerSortOptions) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  createCustomer: (customerData: Partial<ExtendedCustomer>) => Promise<ExtendedCustomer | null>;
  updateCustomer: (id: string, customerData: Partial<ExtendedCustomer>) => Promise<ExtendedCustomer | null>;
  deleteCustomer: (id: string) => Promise<boolean>;
  getCustomerById: (id: string) => Promise<ExtendedCustomer | null>;
  searchCustomers: (query: string) => Promise<ExtendedCustomer[]>;
}

export function useCustomers({ 
  initialPageSize = 10, 
  initialPage = 1,
  autoLoad = true 
}: UseCustomersOptions = {}): UseCustomersReturn {
  const [customers, setCustomers] = useState<ExtendedCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<CustomerPagination>({
    page: initialPage,
    limit: initialPageSize,
    total: 0
  });
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
  });
  const [sort, setSort] = useState<CustomerSortOptions>({
    field: 'lastName',
    direction: 'asc'
  });
  
  const { toast } = useToast();

  /**
   * Fetch customers based on current pagination, filters, and sort
   */
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching customers with params:', {
        page: pagination.page,
        pageSize: pagination.limit,
        search: filters.search || '',
        status: filters.status?.join(',') || '',
        loyaltyTier: filters.loyaltyTier?.join(',') || ''
      });
      
      const result = await customerService.getAll({
        page: pagination.page,
        pageSize: pagination.limit,
        search: filters.search || '',
        status: filters.status?.join(',') || '',
        loyaltyTier: filters.loyaltyTier?.join(',') || ''
      });
      
      console.log('Customer fetch result:', result);
      
      if (result && result.data) {
        setCustomers(result.data || []);
        setPagination(prev => ({
          ...prev,
          total: result?.pagination?.total || 0
        }));
        return result.data;
      } else {
        console.error('Invalid response format from customer service:', result);
        setError(new Error('Invalid response format'));
        return [];
      }
    } catch (err) {
      console.error('Error in fetchCustomers:', err);
      setError(err as Error);
      toast({
        title: "Error loading customers",
        description: "Failed to load customers. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, toast]);

  /**
   * Delete a customer by ID
   */
  const deleteCustomer = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await customerService.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Customer deleted",
        description: "The customer has been deleted successfully.",
      });
      return true;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error deleting customer",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Create a new customer
   */
  const createCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newCustomer = await customerService.create(customer);
      setCustomers(prev => [newCustomer, ...prev]);
      toast({
        title: "Customer added",
        description: "The customer has been added successfully.",
      });
      return newCustomer;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error adding customer",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Update an existing customer
   */
  const updateCustomer = useCallback(async (id: string, customer: Partial<Customer>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedCustomer = await customerService.update(id, customer);
      setCustomers(prev => 
        prev.map(c => c.id === id ? updatedCustomer : c)
      );
      toast({
        title: "Customer updated",
        description: "The customer has been updated successfully.",
      });
      return updatedCustomer;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error updating customer",
        description: "Failed to update customer. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Update pagination settings
   */
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  /**
   * Update page size
   */
  const setPageSize = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  /**
   * Update search filter
   */
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Load customers on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      fetchCustomers();
    }
  }, [fetchCustomers, autoLoad]);

  return {
    customers,
    loading,
    error,
    pagination,
    filters,
    sort,
    fetchCustomers,
    deleteCustomer,
    createCustomer,
    updateCustomer,
    setPage,
    setPageSize,
    setSearch,
    setFilters,
    setSort
  };
}

export default useCustomers;
