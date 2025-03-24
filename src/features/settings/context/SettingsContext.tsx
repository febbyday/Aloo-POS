/**
 * Settings Context
 * 
 * This context provides state management for the settings feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { Settings } from '../types';

interface SettingsContextValue {
  items: Settings[];
  selectedItem: Settings | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: Settings | null) => void;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [items, setItems] = useState<Settings[]>([]);
  const [selectedItem, setSelectedItem] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <SettingsContext.Provider 
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
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  
  return context;
}
