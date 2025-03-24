// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { ProductHistoryAction } from '../types/product.types';

interface HistoryState {
  past: ProductHistoryAction[];
  future: ProductHistoryAction[];
}

interface HistoryContextType {
  canUndo: boolean;
  canRedo: boolean;
  trackAction: (action: ProductHistoryAction, description: string) => void;
  undo: () => ProductHistoryAction | undefined;
  redo: () => ProductHistoryAction | undefined;
}

const ProductHistoryContext = createContext<HistoryContextType | undefined>(undefined);

const historyReducer = (state: HistoryState, action: { type: string; payload?: any }): HistoryState => {
  switch (action.type) {
    case 'TRACK_ACTION':
      return {
        past: [...state.past, action.payload],
        future: [], // Clear future when a new action is tracked
      };
    case 'UNDO':
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        future: [previous, ...state.future],
      };
    case 'REDO':
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, next],
        future: state.future.slice(1),
      };
    default:
      return state;
  }
};

export function ProductHistoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(historyReducer, {
    past: [],
    future: [],
  });

  const trackAction = useCallback((action: ProductHistoryAction, description: string) => {
    dispatch({ type: 'TRACK_ACTION', payload: { ...action, description } });
  }, []);

  const undo = useCallback(() => {
    if (state.past.length === 0) return;
    dispatch({ type: 'UNDO' });
    return state.past[state.past.length - 1];
  }, [state.past]);

  const redo = useCallback(() => {
    if (state.future.length === 0) return;
    dispatch({ type: 'REDO' });
    return state.future[0];
  }, [state.future]);

  const value = {
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    trackAction,
    undo,
    redo,
  };

  return (
    <ProductHistoryContext.Provider value={value}>
      {children}
    </ProductHistoryContext.Provider>
  );
}

export function useProductHistory() {
  const context = useContext(ProductHistoryContext);
  if (context === undefined) {
    throw new Error('useProductHistory must be used within a ProductHistoryProvider');
  }
  return context;
}