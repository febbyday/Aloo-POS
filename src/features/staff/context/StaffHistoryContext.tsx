import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Define staff types
interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the types of actions that can be performed
export type StaffAction = 
  | { type: 'create_staff'; staff: Staff }
  | { type: 'update_staff'; id: string; before: Partial<Staff>; after: Partial<Staff> }
  | { type: 'delete_staff'; staff: Staff }
  | { type: 'change_status'; staffId: string; before: Staff['status']; after: Staff['status'] }
  | { type: 'update_permissions'; staffId: string; before: string[]; after: string[] }
  | { type: 'change_role'; staffId: string; before: string; after: string }
  | { type: 'bulk_update'; ids: string[]; before: Record<string, Partial<Staff>>; after: Partial<Staff> };

// Define the history item structure
interface HistoryItem {
  id: string;
  timestamp: number;
  action: StaffAction;
  description: string;
}

// Define the context interface
interface StaffHistoryContextType {
  // History state
  history: HistoryItem[];
  currentIndex: number;
  
  // Action tracking methods
  trackAction: (action: StaffAction, description: string) => void;
  
  // Navigation methods
  canUndo: boolean;
  canRedo: boolean;
  undo: () => StaffAction | undefined;
  redo: () => StaffAction | undefined;
  
  // History management
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

// Create the context
const StaffHistoryContext = createContext<StaffHistoryContextType | undefined>(undefined);

// Define the provider props
interface StaffHistoryProviderProps {
  children: ReactNode;
  maxHistoryItems?: number;
}

/**
 * Provider component for staff action history tracking
 * Enables undo/redo functionality for staff operations
 */
export function StaffHistoryProvider({ 
  children, 
  maxHistoryItems = 50 
}: StaffHistoryProviderProps) {
  // State for tracking history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Check if we can undo/redo
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Add a new action to history
  const trackAction = useCallback((action: StaffAction, description: string) => {
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
  const value: StaffHistoryContextType = {
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
    <StaffHistoryContext.Provider value={value}>
      {children}
    </StaffHistoryContext.Provider>
  );
}

/**
 * Hook to access the staff history context
 */
export function useStaffHistory() {
  const context = useContext(StaffHistoryContext);
  
  if (context === undefined) {
    throw new Error('useStaffHistory must be used within a StaffHistoryProvider');
  }
  
  return context;
} 