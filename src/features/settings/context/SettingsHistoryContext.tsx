// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { POSSettings } from '../types/settings.types';

// Define the types of actions that can be performed
export type SettingsAction = 
  | { type: 'update_appearance'; before: Partial<POSSettings['appearance']>; after: Partial<POSSettings['appearance']> }
  | { type: 'update_notifications'; before: Partial<POSSettings['notifications']>; after: Partial<POSSettings['notifications']> }
  | { type: 'update_backup'; before: Partial<POSSettings['backup']>; after: Partial<POSSettings['backup']> }
  | { type: 'update_receipt'; before: Partial<POSSettings['receipt']>; after: Partial<POSSettings['receipt']> }
  | { type: 'update_tax'; before: Partial<POSSettings['tax']>; after: Partial<POSSettings['tax']> }
  | { type: 'update_security'; before: Partial<POSSettings['security']>; after: Partial<POSSettings['security']> }
  | { type: 'update_system'; before: Partial<POSSettings['system']>; after: Partial<POSSettings['system']> }
  | { type: 'update_hardware'; before: Partial<POSSettings['hardware']>; after: Partial<POSSettings['hardware']> }
  | { type: 'update_woocommerce'; before: Partial<POSSettings['woocommerce']>; after: Partial<POSSettings['woocommerce']> }
  | { type: 'update_company'; before: Partial<POSSettings['company']>; after: Partial<POSSettings['company']> }
  | { type: 'update_payment'; before: Partial<POSSettings['payment']>; after: Partial<POSSettings['payment']> }
  | { type: 'bulk_update'; before: Partial<POSSettings>; after: Partial<POSSettings> };

// Define the history item structure
interface HistoryItem {
  id: string;
  timestamp: number;
  action: SettingsAction;
  description: string;
}

// Define the context interface
interface SettingsHistoryContextType {
  // History state
  history: HistoryItem[];
  currentIndex: number;
  
  // Action tracking methods
  trackAction: (action: SettingsAction, description: string) => void;
  
  // Navigation methods
  canUndo: boolean;
  canRedo: boolean;
  undo: () => SettingsAction | undefined;
  redo: () => SettingsAction | undefined;
  
  // History management
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

// Create the context
const SettingsHistoryContext = createContext<SettingsHistoryContextType | undefined>(undefined);

// Define the provider props
interface SettingsHistoryProviderProps {
  children: ReactNode;
  maxHistoryItems?: number;
}

/**
 * Provider component for settings action history tracking
 * Enables undo/redo functionality for settings changes
 */
export function SettingsHistoryProvider({ 
  children, 
  maxHistoryItems = 50 
}: SettingsHistoryProviderProps) {
  // State for tracking history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Check if we can undo/redo
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Add a new action to history
  const trackAction = useCallback((action: SettingsAction, description: string) => {
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
  const value: SettingsHistoryContextType = {
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
    <SettingsHistoryContext.Provider value={value}>
      {children}
    </SettingsHistoryContext.Provider>
  );
}

/**
 * Hook to access the settings history context
 */
export function useSettingsHistory() {
  const context = useContext(SettingsHistoryContext);
  
  if (context === undefined) {
    throw new Error('useSettingsHistory must be used within a SettingsHistoryProvider');
  }
  
  return context;
} 