/**
 * Repairs Context
 * 
 * This context provides state management for the repairs feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { Repairs } from '../types';

interface RepairsContextValue {
  items: Repairs[];
  selectedItem: Repairs | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: Repairs | null) => void;
  refresh: () => Promise<void>;
}

const RepairsContext = createContext<RepairsContextValue | undefined>(undefined);

interface RepairsProviderProps {
  children: ReactNode;
}

export function RepairsProvider({ children }: RepairsProviderProps) {
  const [items, setItems] = useState<Repairs[]>([]);
  const [selectedItem, setSelectedItem] = useState<Repairs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <RepairsContext.Provider 
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
    </RepairsContext.Provider>
  );
}

export function useRepairsContext() {
  const context = useContext(RepairsContext);
  
  if (context === undefined) {
    throw new Error('useRepairsContext must be used within a RepairsProvider');
  }
  
  return context;
}
