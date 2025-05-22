/**
 * Offline Service
 * 
 * This service handles offline mode functionality for the POS system,
 * including detecting network status, storing transactions locally,
 * and synchronizing with the server when connection is restored.
 */

// Types for offline operations
export interface OfflineTransaction {
  id: string;
  type: 'sale' | 'refund' | 'return' | 'void';
  data: any;
  createdAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  syncAttempts: number;
  lastSyncAttempt?: string;
  error?: string;
}

export interface OfflineState {
  isOnline: boolean;
  lastOnlineAt?: string;
  lastOfflineAt?: string;
  pendingTransactions: OfflineTransaction[];
  syncInProgress: boolean;
}

// Local storage keys
const STORAGE_KEYS = {
  OFFLINE_STATE: 'pos_offline_state',
  PENDING_TRANSACTIONS: 'pos_pending_transactions',
}

// Default retry intervals in milliseconds
const RETRY_INTERVALS = [5000, 15000, 30000, 60000, 300000]; // 5s, 15s, 30s, 1m, 5m

/**
 * Initialize the offline state
 */
const initializeOfflineState = (): OfflineState => {
  const storedState = localStorage.getItem(STORAGE_KEYS.OFFLINE_STATE);
  
  if (storedState) {
    try {
      return JSON.parse(storedState);
    } catch (error) {
      console.error('Failed to parse offline state from localStorage', error);
    }
  }
  
  // Default state
  return {
    isOnline: navigator.onLine,
    pendingTransactions: [],
    syncInProgress: false,
  };
};

/**
 * Save the offline state to localStorage
 */
const saveOfflineState = (state: OfflineState): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save offline state to localStorage', error);
  }
};

/**
 * Get pending transactions from localStorage
 */
const getPendingTransactions = (): OfflineTransaction[] => {
  const storedTransactions = localStorage.getItem(STORAGE_KEYS.PENDING_TRANSACTIONS);
  
  if (storedTransactions) {
    try {
      return JSON.parse(storedTransactions);
    } catch (error) {
      console.error('Failed to parse pending transactions from localStorage', error);
    }
  }
  
  return [];
};

/**
 * Save pending transactions to localStorage
 */
const savePendingTransactions = (transactions: OfflineTransaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to save pending transactions to localStorage', error);
  }
};

/**
 * Offline service for handling offline mode functionality
 */
export const offlineService = {
  /**
   * Get the current offline state
   */
  getState: (): OfflineState => {
    return initializeOfflineState();
  },
  
  /**
   * Check if the device is currently online
   */
  isOnline: (): boolean => {
    return navigator.onLine;
  },
  
  /**
   * Add a transaction to be processed when back online
   */
  addPendingTransaction: (transaction: Omit<OfflineTransaction, 'syncStatus' | 'syncAttempts' | 'createdAt'>): OfflineTransaction => {
    const pendingTransactions = getPendingTransactions();
    
    const newTransaction: OfflineTransaction = {
      ...transaction,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
      syncAttempts: 0,
    };
    
    pendingTransactions.push(newTransaction);
    savePendingTransactions(pendingTransactions);
    
    // Update the offline state
    const state = initializeOfflineState();
    state.pendingTransactions = pendingTransactions;
    saveOfflineState(state);
    
    return newTransaction;
  },
  
  /**
   * Get all pending transactions
   */
  getPendingTransactions: (): OfflineTransaction[] => {
    return getPendingTransactions();
  },
  
  /**
   * Update the status of a pending transaction
   */
  updateTransactionStatus: (
    id: string, 
    status: OfflineTransaction['syncStatus'], 
    error?: string
  ): void => {
    const pendingTransactions = getPendingTransactions();
    const transactionIndex = pendingTransactions.findIndex(t => t.id === id);
    
    if (transactionIndex >= 0) {
      pendingTransactions[transactionIndex] = {
        ...pendingTransactions[transactionIndex],
        syncStatus: status,
        lastSyncAttempt: new Date().toISOString(),
        error: error,
        syncAttempts: pendingTransactions[transactionIndex].syncAttempts + 1,
      };
      
      savePendingTransactions(pendingTransactions);
      
      // Update the offline state
      const state = initializeOfflineState();
      state.pendingTransactions = pendingTransactions;
      saveOfflineState(state);
    }
  },
  
  /**
   * Remove a transaction from the pending list (after successful sync)
   */
  removeTransaction: (id: string): void => {
    const pendingTransactions = getPendingTransactions();
    const filteredTransactions = pendingTransactions.filter(t => t.id !== id);
    
    savePendingTransactions(filteredTransactions);
    
    // Update the offline state
    const state = initializeOfflineState();
    state.pendingTransactions = filteredTransactions;
    saveOfflineState(state);
  },
  
  /**
   * Sync all pending transactions with the server
   */
  syncPendingTransactions: async (
    syncFunction: (transaction: OfflineTransaction) => Promise<boolean>
  ): Promise<{ success: number; failed: number }> => {
    // Only sync if online
    if (!navigator.onLine) {
      return { success: 0, failed: 0 };
    }
    
    const pendingTransactions = getPendingTransactions();
    let successCount = 0;
    let failedCount = 0;
    
    // Update sync state
    const state = initializeOfflineState();
    state.syncInProgress = true;
    saveOfflineState(state);
    
    try {
      for (const transaction of pendingTransactions.filter(t => t.syncStatus !== 'synced')) {
        try {
          // Update status to syncing
          offlineService.updateTransactionStatus(transaction.id, 'syncing');
          
          // Attempt to sync
          const success = await syncFunction(transaction);
          
          if (success) {
            // If successful, remove from pending
            offlineService.removeTransaction(transaction.id);
            successCount++;
          } else {
            // If failed, update status
            offlineService.updateTransactionStatus(transaction.id, 'failed', 'Sync failed');
            failedCount++;
          }
        } catch (error) {
          offlineService.updateTransactionStatus(
            transaction.id, 
            'failed', 
            error instanceof Error ? error.message : 'Unknown error'
          );
          failedCount++;
        }
      }
    } finally {
      // Update sync state
      const updatedState = initializeOfflineState();
      updatedState.syncInProgress = false;
      saveOfflineState(updatedState);
    }
    
    return { success: successCount, failed: failedCount };
  },
  
  /**
   * Set up event listeners for online/offline events
   */
  setupNetworkListeners: (
    onOnline?: () => void,
    onOffline?: () => void
  ): () => void => {
    const handleOnline = () => {
      const state = initializeOfflineState();
      state.isOnline = true;
      state.lastOnlineAt = new Date().toISOString();
      saveOfflineState(state);
      
      if (onOnline) {
        onOnline();
      }
    };
    
    const handleOffline = () => {
      const state = initializeOfflineState();
      state.isOnline = false;
      state.lastOfflineAt = new Date().toISOString();
      saveOfflineState(state);
      
      if (onOffline) {
        onOffline();
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },
  
  /**
   * Clear all pending transactions (use with caution)
   */
  clearPendingTransactions: (): void => {
    savePendingTransactions([]);
    
    // Update the offline state
    const state = initializeOfflineState();
    state.pendingTransactions = [];
    saveOfflineState(state);
  },
  
  /**
   * Get the appropriate retry interval based on the number of attempts
   */
  getRetryInterval: (attempts: number): number => {
    if (attempts < RETRY_INTERVALS.length) {
      return RETRY_INTERVALS[attempts];
    }
    return RETRY_INTERVALS[RETRY_INTERVALS.length - 1];
  }
};

export default offlineService;
