// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shop } from '../../shops/types/shops.types';
import { Market } from '../../markets/pages/MarketsPage';

// Define the types of actions that can be performed
export type LocationAction = 
  | { type: 'create_shop'; shop: Shop }
  | { type: 'update_shop'; id: string; before: Partial<Shop>; after: Partial<Shop> }
  | { type: 'delete_shop'; shop: Shop }
  | { type: 'change_shop_status'; shopId: string; before: Shop['status']; after: Shop['status'] }
  | { type: 'create_market'; market: Market }
  | { type: 'update_market'; id: string; before: Partial<Market>; after: Partial<Market> }
  | { type: 'delete_market'; market: Market }
  | { type: 'change_market_status'; marketId: string; before: string; after: string }
  | { type: 'bulk_update_shops'; ids: string[]; before: Record<string, Partial<Shop>>; after: Partial<Shop> }
  | { type: 'bulk_update_markets'; ids: string[]; before: Record<string, Partial<Market>>; after: Partial<Market> };

// Define the history item structure
interface HistoryItem {
  id: string;
  timestamp: number;
  action: LocationAction;
  description: string;
}

// Define the context interface
interface LocationHistoryContextType {
  // History state
  history: HistoryItem[];
  currentIndex: number;
  
  // Action tracking methods
  trackAction: (action: LocationAction, description: string) => void;
  
  // Navigation methods
  canUndo: boolean;
  canRedo: boolean;
  undo: () => LocationAction | undefined;
  redo: () => LocationAction | undefined;
  
  // History management
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

// Create the context
const LocationHistoryContext = createContext<LocationHistoryContextType | undefined>(undefined);

// Define the provider props
interface LocationHistoryProviderProps {
  children: ReactNode;
  maxHistoryItems?: number;
}

/**
 * Provider component for location (shops/markets) action history tracking
 * Enables undo/redo functionality for location operations
 */
export function LocationHistoryProvider({ 
  children, 
  maxHistoryItems = 50 
}: LocationHistoryProviderProps) {
  // State for tracking history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Check if we can undo/redo
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Add a new action to history
  const trackAction = useCallback((action: LocationAction, description: string) => {
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
  const value: LocationHistoryContextType = {
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
    <LocationHistoryContext.Provider value={value}>
      {children}
    </LocationHistoryContext.Provider>
  );
}

/**
 * Hook to access the location history context
 */
export function useLocationHistory() {
  const context = useContext(LocationHistoryContext);
  
  if (context === undefined) {
    throw new Error('useLocationHistory must be used within a LocationHistoryProvider');
  }
  
  return context;
} 