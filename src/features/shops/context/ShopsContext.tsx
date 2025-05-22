/**
 * Shops Context
 *
 * This context provides state management for the shops feature.
 */

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Shop } from '../types/shops.types';
import { shopsService } from '../services/shopsService';
import { useToast } from '@/lib/toast';

interface ShopsContextValue {
  items: Shop[];
  selectedItem: Shop | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: Shop | null) => void;
  refresh: () => Promise<void>;
}

const ShopsContext = createContext<ShopsContextValue | undefined>(undefined);

interface ShopsProviderProps {
  children: ReactNode;
  autoLoad?: boolean;
}

export function ShopsProvider({ children, autoLoad = true }: ShopsProviderProps) {
  const [items, setItems] = useState<Shop[]>([]);
  const [selectedItem, setSelectedItem] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      // Add a small delay to ensure backend has time to process all new data
      await new Promise(resolve => setTimeout(resolve, 500));

      const data = await shopsService.fetchAll();
      console.log('Fetched shops after refresh:', data.length);
      setItems(data);
    } catch (err) {
      console.error('Error fetching shops:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching shops';
      setError(err instanceof Error ? err : new Error(errorMessage));

      toast({
        title: "Error fetching shops",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad]);

  return (
    <ShopsContext.Provider
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
    </ShopsContext.Provider>
  );
}

export function useShopsContext() {
  const context = useContext(ShopsContext);

  if (context === undefined) {
    throw new Error('useShopsContext must be used within a ShopsProvider');
  }

  return context;
}
