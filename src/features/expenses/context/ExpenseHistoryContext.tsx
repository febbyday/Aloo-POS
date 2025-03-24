// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Define expense and category types based on the mock data structure
interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  paymentMethod: string;
  description: string;
  status: 'Paid' | 'Pending';
  attachments: number;
}

interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  budget: number;
  expenseCount: number;
  totalSpent: number;
}

// Define the types of actions that can be performed
export type ExpenseAction = 
  | { type: 'create_expense'; expense: Expense }
  | { type: 'update_expense'; id: string; before: Partial<Expense>; after: Partial<Expense> }
  | { type: 'delete_expense'; expense: Expense }
  | { type: 'change_expense_status'; expenseId: string; before: Expense['status']; after: Expense['status'] }
  | { type: 'create_category'; category: ExpenseCategory }
  | { type: 'update_category'; id: string; before: Partial<ExpenseCategory>; after: Partial<ExpenseCategory> }
  | { type: 'delete_category'; category: ExpenseCategory }
  | { type: 'bulk_update_expenses'; ids: string[]; before: Record<string, Partial<Expense>>; after: Partial<Expense> }
  | { type: 'bulk_update_categories'; ids: string[]; before: Record<string, Partial<ExpenseCategory>>; after: Partial<ExpenseCategory> };

// Define the history item structure
interface HistoryItem {
  id: string;
  timestamp: number;
  action: ExpenseAction;
  description: string;
}

// Define the context interface
interface ExpenseHistoryContextType {
  // History state
  history: HistoryItem[];
  currentIndex: number;
  
  // Action tracking methods
  trackAction: (action: ExpenseAction, description: string) => void;
  
  // Navigation methods
  canUndo: boolean;
  canRedo: boolean;
  undo: () => ExpenseAction | undefined;
  redo: () => ExpenseAction | undefined;
  
  // History management
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

// Create the context
const ExpenseHistoryContext = createContext<ExpenseHistoryContextType | undefined>(undefined);

// Define the provider props
interface ExpenseHistoryProviderProps {
  children: ReactNode;
  maxHistoryItems?: number;
}

/**
 * Provider component for expense and category action history tracking
 * Enables undo/redo functionality for expense operations
 */
export function ExpenseHistoryProvider({ 
  children, 
  maxHistoryItems = 50 
}: ExpenseHistoryProviderProps) {
  // State for tracking history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Check if we can undo/redo
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Add a new action to history
  const trackAction = useCallback((action: ExpenseAction, description: string) => {
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
  const value: ExpenseHistoryContextType = {
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
    <ExpenseHistoryContext.Provider value={value}>
      {children}
    </ExpenseHistoryContext.Provider>
  );
}

/**
 * Hook to access the expense history context
 */
export function useExpenseHistory() {
  const context = useContext(ExpenseHistoryContext);
  
  if (context === undefined) {
    throw new Error('useExpenseHistory must be used within an ExpenseHistoryProvider');
  }
  
  return context;
} 