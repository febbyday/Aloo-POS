/**
 * PurchaseOrders Context
 * 
 * This context provides state management for the purchaseOrders feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { PurchaseOrders } from '../types';

interface PurchaseOrdersContextValue {
  items: PurchaseOrders[];
  selectedItem: PurchaseOrders | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: PurchaseOrders | null) => void;
  refresh: () => Promise<void>;
}

const PurchaseOrdersContext = createContext<PurchaseOrdersContextValue | undefined>(undefined);

interface PurchaseOrdersProviderProps {
  children: ReactNode;
}

export function PurchaseOrdersProvider({ children }: PurchaseOrdersProviderProps) {
  const [items, setItems] = useState<PurchaseOrders[]>([]);
  const [selectedItem, setSelectedItem] = useState<PurchaseOrders | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <PurchaseOrdersContext.Provider 
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
    </PurchaseOrdersContext.Provider>
  );
}

export function usePurchaseOrdersContext() {
  const context = useContext(PurchaseOrdersContext);
  
  if (context === undefined) {
    throw new Error('usePurchaseOrdersContext must be used within a PurchaseOrdersProvider');
  }
  
  return context;
}
