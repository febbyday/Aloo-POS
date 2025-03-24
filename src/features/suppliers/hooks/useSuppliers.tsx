import { useState, useEffect, useCallback } from 'react';
import { Supplier, SUPPLIER_STATUS, SupplierType } from '../types';
import { suppliersService } from '../services/suppliersService';
import { useToast } from '@/components/ui/use-toast';

interface UseSuppliersOptions {
  initialFilters?: {
    status?: SUPPLIER_STATUS;
    type?: SupplierType;
  };
  autoLoad?: boolean;
}

export function useSuppliers(options: UseSuppliersOptions = {}) {
  const { 
    initialFilters = {},
    autoLoad = true
  } = options;

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState({
    status: initialFilters.status,
    type: initialFilters.type,
    searchQuery: '',
  });
  
  const { toast } = useToast();

  // Fetch all suppliers
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await suppliersService.fetchAll();
      setSuppliers(data);
      setFilteredSuppliers(data);
      return data;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading suppliers",
        description: (err as Error).message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch a supplier by ID
  const fetchSupplierById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const supplier = await suppliersService.fetchById(id);
      return supplier;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading supplier",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create a new supplier
  const createSupplier = useCallback(async (supplierData: Omit<Supplier, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newSupplier = await suppliersService.create(supplierData);
      setSuppliers(prev => [...prev, newSupplier]);
      
      // Apply filters to the updated list
      applyFilters([...suppliers, newSupplier]);
      
      toast({
        title: "Supplier created",
        description: `${newSupplier.name} has been added successfully.`,
      });
      
      return newSupplier;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error creating supplier",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [suppliers, toast]);

  // Update an existing supplier
  const updateSupplier = useCallback(async (id: string, supplierData: Partial<Supplier>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSupplier = await suppliersService.update(id, supplierData);
      
      setSuppliers(prev => 
        prev.map(supplier => 
          supplier.id === id ? updatedSupplier : supplier
        )
      );
      
      // Apply filters to the updated list
      applyFilters(suppliers.map(supplier => 
        supplier.id === id ? updatedSupplier : supplier
      ));
      
      toast({
        title: "Supplier updated",
        description: `${updatedSupplier.name} has been updated successfully.`,
      });
      
      return updatedSupplier;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error updating supplier",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [suppliers, toast]);

  // Delete a supplier
  const deleteSupplier = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await suppliersService.delete(id);
      
      if (success) {
        const updatedSuppliers = suppliers.filter(supplier => supplier.id !== id);
        setSuppliers(updatedSuppliers);
        
        // Apply filters to the updated list
        applyFilters(updatedSuppliers);
        
        toast({
          title: "Supplier deleted",
          description: "The supplier has been deleted successfully.",
        });
      }
      
      return success;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error deleting supplier",
        description: (err as Error).message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [suppliers, toast]);

  // Search suppliers by query
  const searchSuppliers = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!query.trim()) {
        // If query is empty, reset to all suppliers with current filters
        setFilters(prev => ({ ...prev, searchQuery: '' }));
        return suppliers;
      }
      
      const results = await suppliersService.search(query);
      setFilters(prev => ({ ...prev, searchQuery: query }));
      
      return results;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error searching suppliers",
        description: (err as Error).message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [suppliers, toast]);

  // Filter suppliers by status
  const filterByStatus = useCallback(async (status: SUPPLIER_STATUS | undefined) => {
    setLoading(true);
    setError(null);
    
    try {
      setFilters(prev => ({ ...prev, status }));
      
      if (!status) {
        // If status is undefined, apply other filters
        const updatedFilters = { ...filters, status: undefined };
        applyFiltersWithValues(suppliers, updatedFilters);
        return suppliers;
      }
      
      const results = await suppliersService.filterByStatus(status);
      return results;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error filtering suppliers",
        description: (err as Error).message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [suppliers, filters, toast]);

  // Filter suppliers by type
  const filterByType = useCallback(async (type: SupplierType | undefined) => {
    setLoading(true);
    setError(null);
    
    try {
      setFilters(prev => ({ ...prev, type }));
      
      if (!type) {
        // If type is undefined, apply other filters
        const updatedFilters = { ...filters, type: undefined };
        applyFiltersWithValues(suppliers, updatedFilters);
        return suppliers;
      }
      
      const results = await suppliersService.filterByType(type);
      return results;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error filtering suppliers",
        description: (err as Error).message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [suppliers, filters, toast]);

  // Helper function to apply all filters
  const applyFilters = useCallback((suppliersList: Supplier[]) => {
    applyFiltersWithValues(suppliersList, filters);
  }, [filters]);

  // Helper function to apply filters with specific values
  const applyFiltersWithValues = useCallback((suppliersList: Supplier[], filterValues: typeof filters) => {
    let filtered = [...suppliersList];
    
    // Apply status filter
    if (filterValues.status) {
      filtered = filtered.filter(supplier => supplier.status === filterValues.status);
    }
    
    // Apply type filter
    if (filterValues.type) {
      filtered = filtered.filter(supplier => supplier.type === filterValues.type);
    }
    
    // Apply search query filter
    if (filterValues.searchQuery) {
      const query = filterValues.searchQuery.toLowerCase();
      filtered = filtered.filter(supplier => 
        supplier.name.toLowerCase().includes(query) ||
        supplier.contactPerson.toLowerCase().includes(query) ||
        supplier.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredSuppliers(filtered);
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      status: undefined,
      type: undefined,
      searchQuery: '',
    });
    setFilteredSuppliers(suppliers);
  }, [suppliers]);

  // Load suppliers on initial render if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      fetchSuppliers();
    }
  }, [autoLoad, fetchSuppliers]);

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters(suppliers);
  }, [filters, suppliers, applyFilters]);

  return {
    suppliers: filteredSuppliers, // Return filtered suppliers
    allSuppliers: suppliers, // Return all suppliers (unfiltered)
    loading,
    error,
    filters,
    fetchSuppliers,
    fetchSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    searchSuppliers,
    filterByStatus,
    filterByType,
    resetFilters,
  };
}

export default useSuppliers;
