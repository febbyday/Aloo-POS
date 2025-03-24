// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Sale, SaleItem } from '../types';

// Define the types of actions that can be performed
export type SalesAction = 
  | { type: 'create_sale'; sale: Sale }
  | { type: 'update_sale'; id: string; before: Partial<Sale>; after: Partial<Sale> }
  | { type: 'delete_sale'; sale: Sale }
  | { type: 'add_item'; saleId: string; item: SaleItem }
  | { type: 'remove_item'; saleId: string; itemId: string; item: SaleItem }
  | { type: 'update_item'; saleId: string; itemId: string; before: Partial<SaleItem>; after: Partial<SaleItem> }
  | { type: 'apply_discount'; saleId: string; before: number | null; after: number }
  | { type: 'apply_tax'; saleId: string; before: number | null; after: number }
  | { type: 'change_payment_method'; saleId: string; before: string; after: string }
  | { type: 'void_sale'; sale: Sale }
  | { type: 'complete_sale'; sale: Sale };

// Define the history item structure
interface HistoryItem {
  id: string;
  timestamp: number;
  action: SalesAction;
  description: string;
}

// Define the context interface
interface SalesHistoryContextType {
  // History state
  history: HistoryItem[];
  currentIndex: number;
  
  // Action tracking methods
  trackAction: (action: SalesAction, description: string) => void;
  
  // Navigation methods
  canUndo: boolean;
  canRedo: boolean;
  undo: () => SalesAction | undefined;
  redo: () => SalesAction | undefined;
  
  // History management
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

// Create the context
const SalesHistoryContext = createContext<SalesHistoryContextType | undefined>(undefined);

// Define the provider props
interface SalesHistoryProviderProps {
  children: ReactNode;
  maxHistoryItems?: number;
}

/**
 * Provider component for sales action history tracking
 * Enables undo/redo functionality for sales-related operations
 */
export function SalesHistoryProvider({ 
  children, 
  maxHistoryItems = 50 
}: SalesHistoryProviderProps) {
  // State for tracking history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Check if we can undo/redo
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Add a new action to history
  const trackAction = useCallback((action: SalesAction, description: string) => {
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
  const value: SalesHistoryContextType = {
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
    <SalesHistoryContext.Provider value={value}>
      {children}
    </SalesHistoryContext.Provider>
  );
}

/**
 * Hook to access the sales history context
 */
export function useSalesHistory() {
  const context = useContext(SalesHistoryContext);
  
  if (context === undefined) {
    throw new Error('useSalesHistory must be used within a SalesHistoryProvider');
  }
  
  return context;
} 