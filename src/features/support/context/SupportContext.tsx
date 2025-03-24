/**
 * Support Context
 * 
 * This context provides state management for the support feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { Support } from '../types';

interface SupportContextValue {
  items: Support[];
  selectedItem: Support | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: Support | null) => void;
  refresh: () => Promise<void>;
}

const SupportContext = createContext<SupportContextValue | undefined>(undefined);

interface SupportProviderProps {
  children: ReactNode;
}

export function SupportProvider({ children }: SupportProviderProps) {
  const [items, setItems] = useState<Support[]>([]);
  const [selectedItem, setSelectedItem] = useState<Support | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <SupportContext.Provider 
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
    </SupportContext.Provider>
  );
}

export function useSupportContext() {
  const context = useContext(SupportContext);
  
  if (context === undefined) {
    throw new Error('useSupportContext must be used within a SupportProvider');
  }
  
  return context;
}
