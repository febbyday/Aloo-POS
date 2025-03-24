/**
 * Products Context
 * 
 * This context provides state management for the products feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { Products } from '../types';

interface ProductsContextValue {
  items: Products[];
  selectedItem: Products | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: Products | null) => void;
  refresh: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

interface ProductsProviderProps {
  children: ReactNode;
}

export function ProductsProvider({ children }: ProductsProviderProps) {
  const [items, setItems] = useState<Products[]>([]);
  const [selectedItem, setSelectedItem] = useState<Products | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <ProductsContext.Provider 
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
    </ProductsContext.Provider>
  );
}

export function useProductsContext() {
  const context = useContext(ProductsContext);
  
  if (context === undefined) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  
  return context;
}
