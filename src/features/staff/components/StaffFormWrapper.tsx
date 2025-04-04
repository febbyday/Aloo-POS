import React from 'react';
import { StaffHistoryProvider } from '../context/StaffHistoryContext';

/**
 * StaffFormWrapper component
 * 
 * This component wraps staff form pages with the StaffHistoryProvider
 * to share form state and history tracking between add and edit staff pages.
 */
export function StaffFormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <StaffHistoryProvider>
      {children}
    </StaffHistoryProvider>
  );
}
