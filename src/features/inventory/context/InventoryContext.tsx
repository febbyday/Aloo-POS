/**
 * Inventory Context
 * 
 * This context provides state management for the inventory feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { Inventory } from '../types';

interface InventoryContextValue {
  items: Inventory[];
  selectedItem: Inventory | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: Inventory | null) => void;
  refresh: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

interface InventoryProviderProps {
  children: ReactNode;
}

export function InventoryProvider({ children }: InventoryProviderProps) {
  const [items, setItems] = useState<Inventory[]>([]);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <InventoryContext.Provider 
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
    </InventoryContext.Provider>
  );
}

export function useInventoryContext() {
  const context = useContext(InventoryContext);
  
  if (context === undefined) {
    throw new Error('useInventoryContext must be used within a InventoryProvider');
  }
  
  return context;
}
