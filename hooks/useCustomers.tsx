import { useState, useEffect } from 'react';
import { customerService } from '@/features/customers/services';
import type { Customer, CustomerParams, CustomerResponse } from '@/features/customers/types';

interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  error: Error | null;
  pagination: CustomerResponse['pagination'];
  refetch: () => Promise<void>;
  setParams: (params: CustomerParams) => void;
}

export function useCustomers(initialParams: CustomerParams = {}): UseCustomersResult {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<CustomerParams>(initialParams);
  const [pagination, setPagination] = useState<CustomerResponse['pagination']>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getAll(params);
      setCustomers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [params]);

  return {
    customers,
    loading,
    error,
    pagination,
    refetch: fetchCustomers,
    setParams,
  };
}