/**
 * Expenses Context
 * 
 * This context provides state management for the expenses feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { Expenses } from '../types';

interface ExpensesContextValue {
  items: Expenses[];
  selectedItem: Expenses | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: Expenses | null) => void;
  refresh: () => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextValue | undefined>(undefined);

interface ExpensesProviderProps {
  children: ReactNode;
}

export function ExpensesProvider({ children }: ExpensesProviderProps) {
  const [items, setItems] = useState<Expenses[]>([]);
  const [selectedItem, setSelectedItem] = useState<Expenses | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <ExpensesContext.Provider 
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
    </ExpensesContext.Provider>
  );
}

export function useExpensesContext() {
  const context = useContext(ExpensesContext);
  
  if (context === undefined) {
    throw new Error('useExpensesContext must be used within a ExpensesProvider');
  }
  
  return context;
}
