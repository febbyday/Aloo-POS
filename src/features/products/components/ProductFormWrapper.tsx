import React from 'react';
import { ProductFormProvider } from '../context/ProductFormContext';

/**
 * ProductFormWrapper component
 * 
 * This component wraps product form pages with the ProductFormProvider
 * to share form state between add and edit product pages.
 */
export function ProductFormWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProductFormProvider>
      {children}
    </ProductFormProvider>
  );
} 