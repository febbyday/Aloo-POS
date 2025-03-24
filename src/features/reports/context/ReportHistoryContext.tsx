// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Define report types based on the mock data structure
interface ReportConfig {
  type: 'daily' | 'by-store' | 'by-product' | 'trends' | 'transactions' | 'customer';
  dateRange?: { from?: Date; to?: Date };
  chartType: 'table' | 'bar' | 'line' | 'pie';
  filters?: Record<string, any>;
  groupBy?: string[];
  metrics?: string[];
}

interface ReportResult {
  id: string;
  config: ReportConfig;
  generatedAt: Date;
  data: any;
}

// Define the types of actions that can be performed
export type ReportAction = 
  | { type: 'generate_report'; config: ReportConfig; result: ReportResult }
  | { type: 'update_report_config'; reportId: string; before: Partial<ReportConfig>; after: Partial<ReportConfig> }
  | { type: 'delete_report'; report: ReportResult }
  | { type: 'save_report_template'; config: ReportConfig; name: string }
  | { type: 'update_template'; templateId: string; before: ReportConfig; after: ReportConfig }
  | { type: 'schedule_report'; config: ReportConfig; schedule: any }
  | { type: 'cancel_schedule'; scheduleId: string }
  | { type: 'export_report'; report: ReportResult; format: 'pdf' | 'csv' | 'excel' }
  | { type: 'share_report'; report: ReportResult; recipients: string[] }
  | { type: 'bulk_generate'; configs: ReportConfig[] };

// Define the history item structure
interface HistoryItem {
  id: string;
  timestamp: number;
  action: ReportAction;
  description: string;
}

// Define the context interface
interface ReportHistoryContextType {
  // History state
  history: HistoryItem[];
  currentIndex: number;
  
  // Action tracking methods
  trackAction: (action: ReportAction, description: string) => void;
  
  // Navigation methods
  canUndo: boolean;
  canRedo: boolean;
  undo: () => ReportAction | undefined;
  redo: () => ReportAction | undefined;
  
  // History management
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

// Create the context
const ReportHistoryContext = createContext<ReportHistoryContextType | undefined>(undefined);

// Define the provider props
interface ReportHistoryProviderProps {
  children: ReactNode;
  maxHistoryItems?: number;
}

/**
 * Provider component for report generation and customization history tracking
 * Enables undo/redo functionality for report operations
 */
export function ReportHistoryProvider({ 
  children, 
  maxHistoryItems = 50 
}: ReportHistoryProviderProps) {
  // State for tracking history
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Check if we can undo/redo
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  
  // Add a new action to history
  const trackAction = useCallback((action: ReportAction, description: string) => {
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
  const value: ReportHistoryContextType = {
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
    <ReportHistoryContext.Provider value={value}>
      {children}
    </ReportHistoryContext.Provider>
  );
}

/**
 * Hook to access the report history context
 */
export function useReportHistory() {
  const context = useContext(ReportHistoryContext);
  
  if (context === undefined) {
    throw new Error('useReportHistory must be used within a ReportHistoryProvider');
  }
  
  return context;
} 