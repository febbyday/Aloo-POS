import React from 'react';
import { SupplierHistoryProvider } from '../context/SupplierHistoryContext';

/**
 * SupplierFormWrapper component
 * 
 * This component wraps supplier form pages with the SupplierHistoryProvider
 * to share form state and history tracking between add and edit supplier pages.
 */
export function SupplierFormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SupplierHistoryProvider>
      {children}
    </SupplierHistoryProvider>
  );
}
