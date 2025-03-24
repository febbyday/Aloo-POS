/**
 * Sales Context
 * 
 * This context provides state management for the sales feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { Sales } from '../types';

interface SalesContextValue {
  items: Sales[];
  selectedItem: Sales | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: Sales | null) => void;
  refresh: () => Promise<void>;
}

const SalesContext = createContext<SalesContextValue | undefined>(undefined);

interface SalesProviderProps {
  children: ReactNode;
}

export function SalesProvider({ children }: SalesProviderProps) {
  const [items, setItems] = useState<Sales[]>([]);
  const [selectedItem, setSelectedItem] = useState<Sales | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <SalesContext.Provider 
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
    </SalesContext.Provider>
  );
}

export function useSalesContext() {
  const context = useContext(SalesContext);
  
  if (context === undefined) {
    throw new Error('useSalesContext must be used within a SalesProvider');
  }
  
  return context;
}
