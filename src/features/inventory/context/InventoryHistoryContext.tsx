import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { InventoryItem, StockAdjustment, StockTransfer } from '../types';

// Define the types of actions that can be performed
export type InventoryAction = 
  | { type: 'add_item'; item: InventoryItem }
  | { type: 'update_item'; id: string; before: Partial<InventoryItem>; after: Partial<InventoryItem> }
  | { type: 'delete_item'; item: InventoryItem }
  | { type: 'adjust_stock'; adjustment: StockAdjustment; before: number; after: number }
  | { type: 'transfer_stock'; transfer: StockTransfer; sourceLocationBefore: number; sourceLocationAfter: number; destinationLocationBefore: number; destinationLocationAfter: number }
  | { type: 'set_reorder_point'; itemId: string; before: number; after: number }
  | { type: 'set_reorder_quantity'; itemId: string; before: number; after: number }
  | { type: 'set_min_stock'; itemId: string; before: number; after: number }
  | { type: 'set_max_stock'; itemId: string; before: number; after: number }
  | { type: 'bulk_update'; ids: string[]; before: Record<string, Partial<InventoryItem>>; after: Partial<InventoryItem> };

// Define the history item structure
interface HistoryItem {
  id: string;
  timestamp: number;
  action: InventoryAction;
  description: string;
}

// Define the context interface
interface InventoryHistoryContextType {
  // History state
  history: HistoryItem[];
  currentIndex: number;
  
  // Action tracking methods
  trackAction: (action: InventoryAction, description: string) => void;
  
  // Navigation methods
  canUndo: boolean;
  canRedo: boolean;
  undo: () => InventoryAction | undefined;
  redo: () => InventoryAction | undefined;
  
  // History management
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

// Create the context
const InventoryHistoryContext = createContext<InventoryHistoryContextType | undefined>(undefined);

// Define the provider props
interface InventoryHistoryProviderProps {
  children: ReactNode;
  maxHistoryItems?: number;
}

/**
 * Provider component for inventory action history tracking
 * Enables undo/redo functionality for inventory-related operations
 */
export function InventoryHistoryProvider({ 
  children, 
  maxHistoryItems = 50 
}: InventoryHistoryProviderProps) {
  // State for tracking history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Check if we can undo/redo
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Add a new action to history
  const trackAction = useCallback((action: InventoryAction, description: string) => {
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
  const value: InventoryHistoryContextType = {
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
    <InventoryHistoryContext.Provider value={value}>
      {children}
    </InventoryHistoryContext.Provider>
  );
}

/**
 * Hook to access the inventory history context
 */
export function useInventoryHistory() {
  const context = useContext(InventoryHistoryContext);
  
  if (context === undefined) {
    throw new Error('useInventoryHistory must be used within an InventoryHistoryProvider');
  }
  
  return context;
} 