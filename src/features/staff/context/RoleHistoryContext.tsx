/**
 * Role History Context for Staff Module
 * 
 * This context provides history tracking for role operations in the staff module,
 * enabling undo/redo functionality for role-related actions.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Role } from '../types/role';

// Define the types of actions that can be performed
export type RoleAction =
  | { type: 'create_role'; role: Role }
  | { type: 'update_role'; id: string; before: Partial<Role>; after: Partial<Role> }
  | { type: 'delete_role'; role: Role }
  | { type: 'change_status'; roleId: string; before: boolean; after: boolean }
  | { type: 'update_permissions'; roleId: string; before: any; after: any }
  | { type: 'bulk_update'; ids: string[]; before: Record<string, Partial<Role>>; after: Partial<Role> };

// Define the history item structure
interface HistoryItem {
  id: string;
  timestamp: number;
  action: RoleAction;
  description: string;
}

// Define the context interface
interface RoleHistoryContextType {
  // History state
  history: HistoryItem[];
  currentIndex: number;

  // Action tracking methods
  trackAction: (action: RoleAction, description: string) => void;

  // Navigation methods
  canUndo: boolean;
  canRedo: boolean;
  undo: () => RoleAction | undefined;
  redo: () => RoleAction | undefined;

  // History management
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

// Create the context
const RoleHistoryContext = createContext<RoleHistoryContextType | undefined>(undefined);

// Define the provider props
interface RoleHistoryProviderProps {
  children: ReactNode;
  maxHistoryItems?: number;
}

/**
 * Provider component for role action history tracking
 * Enables undo/redo functionality for role operations
 */
export function RoleHistoryProvider({
  children,
  maxHistoryItems = 50
}: RoleHistoryProviderProps) {
  // State for tracking history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Check if we can undo/redo
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  // Add a new action to history
  const trackAction = useCallback((action: RoleAction, description: string) => {
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

    // Get the action to undo
    const actionToUndo = history[currentIndex].action;

    // Move back in history
    setCurrentIndex(currentIndex - 1);

    return actionToUndo;
  }, [canUndo, history, currentIndex]);

  // Redo the next action
  const redo = useCallback(() => {
    if (!canRedo) return undefined;

    // Move forward in history
    setCurrentIndex(currentIndex + 1);

    // Get the action to redo
    return history[currentIndex + 1].action;
  }, [canRedo, history, currentIndex]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  // Get description for the action that would be undone
  const getUndoDescription = useCallback(() => {
    if (!canUndo) return null;
    return history[currentIndex].description;
  }, [canUndo, history, currentIndex]);

  // Get description for the action that would be redone
  const getRedoDescription = useCallback(() => {
    if (!canRedo) return null;
    return history[currentIndex + 1].description;
  }, [canRedo, history, currentIndex]);

  // Context value
  const value: RoleHistoryContextType = {
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
    <RoleHistoryContext.Provider value={value}>
      {children}
    </RoleHistoryContext.Provider>
  );
}

/**
 * Hook to access the role history context
 * @returns The role history context
 * @throws Error if used outside of RoleHistoryProvider
 */
export function useRoleHistory(): RoleHistoryContextType {
  const context = useContext(RoleHistoryContext);
  
  if (context === undefined) {
    throw new Error('useRoleHistory must be used within a RoleHistoryProvider');
  }
  
  return context;
}

export default RoleHistoryProvider;
