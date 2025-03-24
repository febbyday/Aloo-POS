/**
 * Staff Context
 * 
 * This context provides state management for the staff feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { Staff } from '../types';

interface StaffContextValue {
  items: Staff[];
  selectedItem: Staff | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: Staff | null) => void;
  refresh: () => Promise<void>;
}

const StaffContext = createContext<StaffContextValue | undefined>(undefined);

interface StaffProviderProps {
  children: ReactNode;
}

export function StaffProvider({ children }: StaffProviderProps) {
  const [items, setItems] = useState<Staff[]>([]);
  const [selectedItem, setSelectedItem] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <StaffContext.Provider 
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
    </StaffContext.Provider>
  );
}

export function useStaffContext() {
  const context = useContext(StaffContext);
  
  if (context === undefined) {
    throw new Error('useStaffContext must be used within a StaffProvider');
  }
  
  return context;
}
