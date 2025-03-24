/**
 * Reports Context
 * 
 * This context provides state management for the reports feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { Reports } from '../types';

interface ReportsContextValue {
  items: Reports[];
  selectedItem: Reports | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: Reports | null) => void;
  refresh: () => Promise<void>;
}

const ReportsContext = createContext<ReportsContextValue | undefined>(undefined);

interface ReportsProviderProps {
  children: ReactNode;
}

export function ReportsProvider({ children }: ReportsProviderProps) {
  const [items, setItems] = useState<Reports[]>([]);
  const [selectedItem, setSelectedItem] = useState<Reports | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <ReportsContext.Provider 
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
    </ReportsContext.Provider>
  );
}

export function useReportsContext() {
  const context = useContext(ReportsContext);
  
  if (context === undefined) {
    throw new Error('useReportsContext must be used within a ReportsProvider');
  }
  
  return context;
}
