import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Define the types of actions that can be performed
export type PurchaseOrderAction = 
  | { type: 'create_order'; order: PurchaseOrder }
  | { type: 'update_order'; id: string; before: Partial<PurchaseOrder>; after: Partial<PurchaseOrder> }
  | { type: 'delete_order'; order: PurchaseOrder }
  | { type: 'change_status'; orderId: string; before: PurchaseOrder['status']; after: PurchaseOrder['status'] }
  | { type: 'add_items'; orderId: string; items: PurchaseOrderItem[] }
  | { type: 'remove_items'; orderId: string; items: PurchaseOrderItem[] }
  | { type: 'update_items'; orderId: string; before: PurchaseOrderItem[]; after: PurchaseOrderItem[] }
  | { type: 'bulk_update'; ids: string[]; before: Record<string, Partial<PurchaseOrder>>; after: Partial<PurchaseOrder> };

// Define the purchase order types
interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: {
    id: string;
    name: string;
  };
  date: string;
  status: 'Draft' | 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: number;
  expectedDelivery?: string;
  notes?: string;
  terms?: string;
  attachments?: string[];
}

// Define the history item structure
interface HistoryItem {
  id: string;
  timestamp: number;
  action: PurchaseOrderAction;
  description: string;
}

// Define the context interface
interface PurchaseOrderHistoryContextType {
  // History state
  history: HistoryItem[];
  currentIndex: number;
  
  // Action tracking methods
  trackAction: (action: PurchaseOrderAction, description: string) => void;
  
  // Navigation methods
  canUndo: boolean;
  canRedo: boolean;
  undo: () => PurchaseOrderAction | undefined;
  redo: () => PurchaseOrderAction | undefined;
  
  // History management
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

// Create the context
const PurchaseOrderHistoryContext = createContext<PurchaseOrderHistoryContextType | undefined>(undefined);

// Define the provider props
interface PurchaseOrderHistoryProviderProps {
  children: ReactNode;
  maxHistoryItems?: number;
}

/**
 * Provider component for purchase order action history tracking
 * Enables undo/redo functionality for purchase order operations
 */
export function PurchaseOrderHistoryProvider({ 
  children, 
  maxHistoryItems = 50 
}: PurchaseOrderHistoryProviderProps) {
  // State for tracking history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Check if we can undo/redo
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Add a new action to history
  const trackAction = useCallback((action: PurchaseOrderAction, description: string) => {
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
  const value: PurchaseOrderHistoryContextType = {
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
    <PurchaseOrderHistoryContext.Provider value={value}>
      {children}
    </PurchaseOrderHistoryContext.Provider>
  );
}

/**
 * Hook to access the purchase order history context
 */
export function usePurchaseOrderHistory() {
  const context = useContext(PurchaseOrderHistoryContext);
  
  if (context === undefined) {
    throw new Error('usePurchaseOrderHistory must be used within a PurchaseOrderHistoryProvider');
  }
  
  return context;
} 