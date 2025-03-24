// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Repair, RepairItem, RepairDiagnostics, RepairWorkLog, PaymentRecord, RepairStatus } from '../types';

// Define the types of actions that can be performed
export type RepairAction = 
  | { type: 'create_repair'; repair: Repair }
  | { type: 'update_repair'; id: string; before: Partial<Repair>; after: Partial<Repair> }
  | { type: 'delete_repair'; repair: Repair }
  | { type: 'change_status'; repairId: string; before: RepairStatus; after: RepairStatus }
  | { type: 'add_items'; repairId: string; items: RepairItem[] }
  | { type: 'remove_items'; repairId: string; items: RepairItem[] }
  | { type: 'update_items'; repairId: string; before: RepairItem[]; after: RepairItem[] }
  | { type: 'add_diagnostics'; repairId: string; diagnostics: RepairDiagnostics }
  | { type: 'update_diagnostics'; repairId: string; before: RepairDiagnostics; after: RepairDiagnostics }
  | { type: 'add_work_log'; repairId: string; workLog: RepairWorkLog }
  | { type: 'update_work_log'; repairId: string; before: RepairWorkLog; after: RepairWorkLog }
  | { type: 'add_payment'; repairId: string; payment: PaymentRecord }
  | { type: 'update_payment'; repairId: string; before: PaymentRecord; after: PaymentRecord }
  | { type: 'bulk_update'; ids: string[]; before: Record<string, Partial<Repair>>; after: Partial<Repair> };

// Define the history item structure
interface HistoryItem {
  id: string;
  timestamp: number;
  action: RepairAction;
  description: string;
}

// Define the context interface
interface RepairHistoryContextType {
  // History state
  history: HistoryItem[];
  currentIndex: number;
  
  // Action tracking methods
  trackAction: (action: RepairAction, description: string) => void;
  
  // Navigation methods
  canUndo: boolean;
  canRedo: boolean;
  undo: () => RepairAction | undefined;
  redo: () => RepairAction | undefined;
  
  // History management
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

// Create the context
const RepairHistoryContext = createContext<RepairHistoryContextType | undefined>(undefined);

// Define the provider props
interface RepairHistoryProviderProps {
  children: ReactNode;
  maxHistoryItems?: number;
}

/**
 * Provider component for repair action history tracking
 * Enables undo/redo functionality for repair operations
 */
export function RepairHistoryProvider({ 
  children, 
  maxHistoryItems = 50 
}: RepairHistoryProviderProps) {
  // State for tracking history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Check if we can undo/redo
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Add a new action to history
  const trackAction = useCallback((action: RepairAction, description: string) => {
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
  const value: RepairHistoryContextType = {
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
    <RepairHistoryContext.Provider value={value}>
      {children}
    </RepairHistoryContext.Provider>
  );
}

/**
 * Hook to access the repair history context
 */
export function useRepairHistory() {
  const context = useContext(RepairHistoryContext);
  
  if (context === undefined) {
    throw new Error('useRepairHistory must be used within a RepairHistoryProvider');
  }
  
  return context;
} 