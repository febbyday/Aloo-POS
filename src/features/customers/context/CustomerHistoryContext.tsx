import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Customer } from '../types';

// Define the types of actions that can be performed
export type CustomerAction = 
  | { type: 'create'; customer: Customer }
  | { type: 'update'; id: string; before: Partial<Customer>; after: Partial<Customer> }
  | { type: 'delete'; customer: Customer }
  | { type: 'bulk_update'; ids: string[]; before: Record<string, Partial<Customer>>; after: Partial<Customer> }
  | { type: 'assign_group'; ids: string[]; before: Record<string, string>; after: string };

// Define the history item structure
interface HistoryItem {
  id: string;
  timestamp: number;
  action: CustomerAction;
  description: string;
}

// Define the context interface
interface CustomerHistoryContextType {
  // History state
  history: HistoryItem[];
  currentIndex: number;
  
  // Action tracking methods
  trackAction: (action: CustomerAction, description: string) => void;
  
  // Navigation methods
  canUndo: boolean;
  canRedo: boolean;
  undo: () => CustomerAction | undefined;
  redo: () => CustomerAction | undefined;
  
  // History management
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

// Create the context
const CustomerHistoryContext = createContext<CustomerHistoryContextType | undefined>(undefined);

// Define the provider props
interface CustomerHistoryProviderProps {
  children: ReactNode;
  maxHistoryItems?: number;
}

/**
 * Provider component for customer action history tracking
 * Enables undo/redo functionality for customer-related operations
 */
export function CustomerHistoryProvider({ 
  children, 
  maxHistoryItems = 50 
}: CustomerHistoryProviderProps) {
  // State for tracking history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Check if we can undo/redo
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Add a new action to history
  const trackAction = useCallback((action: CustomerAction, description: string) => {
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
  const value: CustomerHistoryContextType = {
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
    <CustomerHistoryContext.Provider value={value}>
      {children}
    </CustomerHistoryContext.Provider>
  );
}

/**
 * Hook to access the customer history context
 */
export function useCustomerHistory() {
  const context = useContext(CustomerHistoryContext);
  
  if (context === undefined) {
    throw new Error('useCustomerHistory must be used within a CustomerHistoryProvider');
  }
  
  return context;
} 