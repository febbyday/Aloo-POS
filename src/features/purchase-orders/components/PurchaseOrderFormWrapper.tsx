import React from 'react';
import { PurchaseOrderHistoryProvider } from '../context/PurchaseOrderHistoryContext';

/**
 * PurchaseOrderFormWrapper component
 * 
 * This component wraps purchase order form pages with the PurchaseOrderHistoryProvider
 * to share form state and history tracking between add and edit purchase order pages.
 */
export function PurchaseOrderFormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PurchaseOrderHistoryProvider>
      {children}
    </PurchaseOrderHistoryProvider>
  );
}
