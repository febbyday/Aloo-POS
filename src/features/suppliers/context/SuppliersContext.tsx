/**
 * Suppliers Context
 * 
 * This context provides state management for the suppliers feature.
 */

import { createContext, useContext, ReactNode } from 'react';
import { Supplier, SUPPLIER_STATUS, SupplierType } from '../types';
import useSuppliers from '../hooks/useSuppliers';

interface SuppliersContextValue {
  // Data
  suppliers: Supplier[];
  allSuppliers: Supplier[];
  loading: boolean;
  error: Error | null;
  filters: {
    status?: SUPPLIER_STATUS;
    type?: SupplierType;
    searchQuery: string;
  };
  
  // Actions
  fetchSuppliers: () => Promise<Supplier[]>;
  fetchSupplierById: (id: string) => Promise<Supplier | null>;
  createSupplier: (supplierData: Omit<Supplier, 'id'>) => Promise<Supplier | null>;
  updateSupplier: (id: string, supplierData: Partial<Supplier>) => Promise<Supplier | null>;
  deleteSupplier: (id: string) => Promise<boolean>;
  searchSuppliers: (query: string) => Promise<Supplier[]>;
  filterByStatus: (status: SUPPLIER_STATUS | undefined) => Promise<Supplier[]>;
  filterByType: (type: SupplierType | undefined) => Promise<Supplier[]>;
  resetFilters: () => void;
}

const SuppliersContext = createContext<SuppliersContextValue | undefined>(undefined);

interface SuppliersProviderProps {
  children: ReactNode;
  initialFilters?: {
    status?: SUPPLIER_STATUS;
    type?: SupplierType;
  };
  autoLoad?: boolean;
}

export function SuppliersProvider({ 
  children, 
  initialFilters,
  autoLoad = true
}: SuppliersProviderProps) {
  const {
    suppliers,
    allSuppliers,
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
    resetFilters
  } = useSuppliers({ initialFilters, autoLoad });

  return (
    <SuppliersContext.Provider 
      value={{ 
        suppliers,
        allSuppliers,
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
        resetFilters
      }}
    >
      {children}
    </SuppliersContext.Provider>
  );
}

export function useSuppliersContext() {
  const context = useContext(SuppliersContext);
  
  if (context === undefined) {
    throw new Error('useSuppliersContext must be used within a SuppliersProvider');
  }
  
  return context;
}
