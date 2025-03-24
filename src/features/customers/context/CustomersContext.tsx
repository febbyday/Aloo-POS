/**
 * Customers Context
 * 
 * This context provides state management for the customers feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { Customers } from '../types';

interface CustomersContextValue {
  items: Customers[];
  selectedItem: Customers | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: Customers | null) => void;
  refresh: () => Promise<void>;
}

const CustomersContext = createContext<CustomersContextValue | undefined>(undefined);

interface CustomersProviderProps {
  children: ReactNode;
}

export function CustomersProvider({ children }: CustomersProviderProps) {
  const [items, setItems] = useState<Customers[]>([]);
  const [selectedItem, setSelectedItem] = useState<Customers | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <CustomersContext.Provider 
      value={{ 
        items, 
        selectedItem, 
        loading, 
        error, 
        setSelectedItem, 
        refresh 
      }}
    >
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomersContext() {
  const context = useContext(CustomersContext);
  
  if (context === undefined) {
    throw new Error('useCustomersContext must be used within a CustomersProvider');
  }
  
  return context;
}
