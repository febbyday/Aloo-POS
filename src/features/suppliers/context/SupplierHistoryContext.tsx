import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Define supplier types
interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Define the types of actions that can be performed
export type SupplierAction = 
  | { type: 'create_supplier'; supplier: Supplier }
  | { type: 'update_supplier'; id: string; before: Partial<Supplier>; after: Partial<Supplier> }
  | { type: 'delete_supplier'; supplier: Supplier }
  | { type: 'change_status'; supplierId: string; before: Supplier['status']; after: Supplier['status'] }
  | { type: 'bulk_update'; ids: string[]; before: Record<string, Partial<Supplier>>; after: Partial<Supplier> };

// Define the history item structure
interface HistoryItem {
  id: string;
  timestamp: number;
  action: SupplierAction;
  description: string;
}

// Define the context interface
interface SupplierHistoryContextType {
  // History state
  history: HistoryItem[];
  currentIndex: number;
  
  // Action tracking methods
  trackAction: (action: SupplierAction, description: string) => void;
  
  // Navigation methods
  canUndo: boolean;
  canRedo: boolean;
  undo: () => SupplierAction | undefined;
  redo: () => SupplierAction | undefined;
  
  // History management
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

// Create the context
const SupplierHistoryContext = createContext<SupplierHistoryContextType | undefined>(undefined);

// Define the provider props
interface SupplierHistoryProviderProps {
  children: ReactNode;
  maxHistoryItems?: number;
}

/**
 * Provider component for supplier action history tracking
 * Enables undo/redo functionality for supplier operations
 */
export function SupplierHistoryProvider({ 
  children, 
  maxHistoryItems = 50 
}: SupplierHistoryProviderProps) {
  // State for tracking history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Check if we can undo/redo
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Add a new action to history
  const trackAction = useCallback((action: SupplierAction, description: string) => {
    // Create new history item
    const historyItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      action,
      description
    };
    
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, currentIndex + 1);
    
    // Add new item and update the current index
    const updatedHistory = [...newHistory, historyItem].slice(-maxHistoryItems);
    setHistory(updatedHistory);
    setCurrentIndex(updatedHistory.length - 1);
  }, [history, currentIndex, maxHistoryItems]);
  
  // Undo the last action
  const undo = useCallback(() => {
    if (!canUndo) return undefined;
    
    const action = history[currentIndex].action;
    setCurrentIndex(currentIndex - 1);
    return action;
  }, [canUndo, history, currentIndex]);
  
  // Redo a previously undone action
  const redo = useCallback(() => {
    if (!canRedo) return undefined;
    
    const action = history[currentIndex + 1].action;
    setCurrentIndex(currentIndex + 1);
    return action;
  }, [canRedo, history, currentIndex]);
  
  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);
  
  // Get descriptions for UI
  const getUndoDescription = useCallback(() => {
    if (!canUndo) return null;
    return history[currentIndex].description;
  }, [canUndo, history, currentIndex]);
  
  const getRedoDescription = useCallback(() => {
    if (!canRedo) return null;
    return history[currentIndex + 1].description;
  }, [canRedo, history, currentIndex]);
  
  // Context value
  const value: SupplierHistoryContextType = {
    history,
    currentIndex,
    trackAction,
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory,
    getUndoDescription,
    getRedoDescription
  };
  
  return (
    <SupplierHistoryContext.Provider value={value}>
      {children}
    </SupplierHistoryContext.Provider>
  );
}

/**
 * Hook to access the supplier history context
 */
export function useSupplierHistory() {
  const context = useContext(SupplierHistoryContext);
  
  if (context === undefined) {
    throw new Error('useSupplierHistory must be used within a SupplierHistoryProvider');
  }
  
  return context;
} 