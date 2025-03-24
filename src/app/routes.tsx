// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductDetailsPage } from '@/features/products/pages/ProductDetailsPage';
import { ProductAddPage } from '@/features/products/pages/ProductAddPage';
import { ProductEditPage } from '@/features/products/pages/ProductEditPage';
import { ProductFormWrapper } from '@/features/products/components/ProductFormWrapper';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { UnifiedErrorBoundary } from "@/components/unified-error-boundary";

// Lazy load other pages for better performance
const Dashboard = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const Products = lazy(() => import('@/features/products/pages/ProductsPage').then(module => ({ default: module.ProductsPage || module })));
const Sales = lazy(() => import('@/features/sales/pages/SalesPage').then(module => ({ default: module.SalesPage || module })));
const Inventory = lazy(() => import('@/features/inventory/pages/InventoryPage').then(module => ({ default: module.InventoryPage || module })));
const Settings = lazy(() => import('@/features/settings/pages/SettingsPage').then(module => ({ default: module.SettingsPage || module })));

// Lazy load settings components
const CustomersSettings = lazy(() => import('@/features/settings/components/CustomersSettings'));
const InventorySettings = lazy(() => import('@/features/settings/components/InventorySettings'));
const SalesSettings = lazy(() => import('@/features/settings/components/SalesSettings'));
const StaffSettings = lazy(() => import('@/features/settings/components/StaffSettings'));
const SuppliersSettings = lazy(() => import('@/features/settings/components/SuppliersSettings'));
const PurchaseOrdersSettings = lazy(() => import('@/features/settings/components/PurchaseOrdersSettings'));
const RepairsSettings = lazy(() => import('@/features/settings/components/RepairsSettings'));
const ShopsSettings = lazy(() => import('@/features/settings/components/ShopsSettings'));
const MarketsSettings = lazy(() => import('@/features/settings/components/MarketsSettings'));
const ExpensesSettings = lazy(() => import('@/features/settings/components/ExpensesSettings'));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center h-full">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: (
              <UnifiedErrorBoundary>
                <Products />
              </UnifiedErrorBoundary>
            ),
          },
          {
            path: 'new',
            element: (
              <ProductFormWrapper>
                <ProductAddPage />
              </ProductFormWrapper>
            ),
          },
          {
            path: ':productId',
            element: <ProductDetailsPage />,
          },
          {
            path: ':productId/edit',
            element: (
              <ProductFormWrapper>
                <ProductEditPage />
              </ProductFormWrapper>
            ),
          },
          {
            path: ':productId/reorder',
            element: (
              <Suspense fallback={<PageLoader />}>
                <Inventory />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'sales',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Sales />
          </Suspense>
        ),
      },
      {
        path: 'inventory',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Inventory />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        children: [
          { 
            index: true, 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'appearance', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'notifications', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'backup', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'receipt', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'tax', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'security', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'system', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'hardware', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'woocommerce', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'company', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'payment', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'products', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ) 
          },
          { 
            path: 'customers', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomersSettings />
              </Suspense>
            ) 
          },
          { 
            path: 'sales', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <SalesSettings />
              </Suspense>
            ) 
          },
          { 
            path: 'inventory', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <InventorySettings />
              </Suspense>
            ) 
          },
          { 
            path: 'staff', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <StaffSettings />
              </Suspense>
            ) 
          },
          { 
            path: 'suppliers', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <SuppliersSettings />
              </Suspense>
            ) 
          },
          { 
            path: 'purchase-orders', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <PurchaseOrdersSettings />
              </Suspense>
            ) 
          },
          { 
            path: 'repairs', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <RepairsSettings />
              </Suspense>
            ) 
          },
          { 
            path: 'shops', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <ShopsSettings />
              </Suspense>
            ) 
          },
          { 
            path: 'markets', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <MarketsSettings />
              </Suspense>
            ) 
          },
          { 
            path: 'expenses', 
            element: (
              <Suspense fallback={<PageLoader />}>
                <ExpensesSettings />
              </Suspense>
            ) 
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
