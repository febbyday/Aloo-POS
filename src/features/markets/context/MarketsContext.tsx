/**
 * Markets Context
 * 
 * This context provides state management for the markets feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { Markets } from '../types';

interface MarketsContextValue {
  items: Markets[];
  selectedItem: Markets | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: Markets | null) => void;
  refresh: () => Promise<void>;
}

const MarketsContext = createContext<MarketsContextValue | undefined>(undefined);

interface MarketsProviderProps {
  children: ReactNode;
}

export function MarketsProvider({ children }: MarketsProviderProps) {
  const [items, setItems] = useState<Markets[]>([]);
  const [selectedItem, setSelectedItem] = useState<Markets | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <MarketsContext.Provider 
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
    </MarketsContext.Provider>
  );
}

export function useMarketsContext() {
  const context = useContext(MarketsContext);
  
  if (context === undefined) {
    throw new Error('useMarketsContext must be used within a MarketsProvider');
  }
  
  return context;
}
