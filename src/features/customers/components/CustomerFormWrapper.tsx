import React from 'react';
import { CustomerHistoryProvider } from '../context/CustomerHistoryContext';

/**
 * CustomerFormWrapper component
 * 
 * This component wraps customer form pages with the CustomerHistoryProvider
 * to share form state and history tracking between add and edit customer pages.
 */
export function CustomerFormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CustomerHistoryProvider>
      {children}
    </CustomerHistoryProvider>
  );
}
