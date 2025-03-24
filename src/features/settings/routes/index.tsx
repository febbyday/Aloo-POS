// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Route, Routes } from 'react-router-dom';
import { SettingsPage } from '../pages/SettingsPage';
import { lazy } from 'react';

// Lazy load settings pages
const CustomersSettings = lazy(() => import('../components/CustomersSettings'));
const InventorySettings = lazy(() => import('../components/InventorySettings'));
const SalesSettings = lazy(() => import('../components/SalesSettings'));
const StaffSettings = lazy(() => import('../components/StaffSettings'));
const SuppliersSettings = lazy(() => import('../components/SuppliersSettings'));
const PurchaseOrdersSettings = lazy(() => import('../components/PurchaseOrdersSettings'));

/**
 * Settings feature routing configuration
 * Handles all routes under /settings
 */
export const SettingsRoutes = () => {
  return (
    <Routes>
      <Route index element={<SettingsPage />} />
      <Route path="customers" element={<CustomersSettings />} />
      <Route path="inventory" element={<InventorySettings />} />
      <Route path="sales" element={<SalesSettings />} />
      <Route path="staff" element={<StaffSettings />} />
      <Route path="suppliers" element={<SuppliersSettings />} />
      <Route path="purchase-orders" element={<PurchaseOrdersSettings />} />
    </Routes>
  );
};

export default SettingsRoutes; 