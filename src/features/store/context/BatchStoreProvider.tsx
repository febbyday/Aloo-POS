/**
 * BatchStoreProvider
 * 
 * This provider manages store data with optimized batch requests during initialization.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useProviderBatchInit } from '@/lib/hooks/useProviderBatchInit';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { logger } from '@/lib/logging/logger';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Store } from '../components/StoreSelect';

// Context type
interface BatchStoreContextType {
  /**
   * Currently selected store
   */
  currentStore: Store | null;
  
  /**
   * List of available stores
   */
  stores: Store[];
  
  /**
   * Set the current store
   */
  setCurrentStore: (store: Store) => void;
  
  /**
   * Whether stores are loading
   */
  loading: boolean;
  
  /**
   * Error that occurred during loading
   */
  error: Error | null;
  
  /**
   * Refresh stores
   */
  refreshStores: () => Promise<void>;
}

// Create context
const BatchStoreContext = createContext<BatchStoreContextType | undefined>(undefined);

// Provider props
interface BatchStoreProviderProps {
  children: ReactNode;
}

/**
 * BatchStoreProvider Component
 * 
 * Provides store data with optimized batch requests during initialization.
 */
export function BatchStoreProvider({ children }: BatchStoreProviderProps) {
  // State
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  
  // Get auth context
  const { isAuthenticated } = useAuth();
  
  // Use provider batch initialization
  const {
    batchGet,
    isInitializing,
    isInitialized,
    error,
    initialize
  } = useProviderBatchInit({
    providerName: 'store',
    autoInit: true,
    defaultPriority: RequestPriority.CRITICAL,
    dependencies: [isAuthenticated],
    onInitComplete: () => {
      logger.info('Store provider initialized successfully');
    },
    onInitError: (error) => {
      logger.error('Error initializing store provider', { error });
    }
  });
  
  // Fetch stores
  const fetchStores = useCallback(async () => {
    try {
      // Use batch request to fetch stores
      const storesData = await batchGet<Store[]>('stores/LIST', undefined, RequestPriority.CRITICAL);
      
      if (storesData && Array.isArray(storesData)) {
        setStores(storesData);
        
        // Set first store as current if none is selected
        if (!currentStore && storesData.length > 0) {
          setCurrentStore(storesData[0]);
        }
      }
    } catch (err) {
      logger.error('Error fetching stores', { error: err });
    }
  }, [batchGet, currentStore]);
  
  // Fetch active store
  const fetchActiveStore = useCallback(async () => {
    try {
      // Use batch request to fetch active store
      const activeStore = await batchGet<Store>('stores/ACTIVE', undefined, RequestPriority.CRITICAL);
      
      if (activeStore) {
        setCurrentStore(activeStore);
      }
    } catch (err) {
      logger.error('Error fetching active store', { error: err });
    }
  }, [batchGet]);
  
  // Refresh stores
  const refreshStores = useCallback(async () => {
    await fetchStores();
    await fetchActiveStore();
  }, [fetchStores, fetchActiveStore]);
  
  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitialized && !isInitializing) {
      // Add requests to the batch
      fetchStores();
      fetchActiveStore();
      
      // Execute the batch
      initialize();
    }
  }, [isAuthenticated, isInitialized, isInitializing, fetchStores, fetchActiveStore, initialize]);
  
  // Context value
  const contextValue: BatchStoreContextType = {
    currentStore,
    stores,
    setCurrentStore,
    loading: isInitializing,
    error,
    refreshStores
  };
  
  return (
    <BatchStoreContext.Provider value={contextValue}>
      {children}
    </BatchStoreContext.Provider>
  );
}

/**
 * Hook to use the batch store context
 */
export function useBatchStore(): BatchStoreContextType {
  const context = useContext(BatchStoreContext);
  
  if (!context) {
    throw new Error('useBatchStore must be used within a BatchStoreProvider');
  }
  
  return context;
}

export default BatchStoreProvider;
