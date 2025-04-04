// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductDetailsPage } from '@/features/products/pages/ProductDetailsPage';
import { ProductAddPage } from '@/features/products/pages/ProductAddPage';
import { ProductEditPage } from '@/features/products/pages/ProductEditPage';
import { ProductEditPageRefactored } from '@/features/products/pages/ProductEditPageRefactored';
import { EnhancedLowStockAlertsPage } from '@/features/products/pages/EnhancedLowStockAlertsPage';
import { EnhancedPricingPage } from '@/features/products/pages/EnhancedPricingPage';
import { EnhancedCategoriesPage } from '@/features/products/pages/EnhancedCategoriesPage';
import { EnhancedVariationsPage } from '@/features/products/pages/EnhancedVariationsPage';
import BrandsPage from '@/features/products/pages/BrandsPage';
import { ProductFormWrapper } from '@/features/products/components/ProductFormWrapper';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/unified-error-boundary';

// Markets module imports
import {
  MarketsList,
  MarketDetails,
  MarketForm,
  MarketConnectionPage,
  MARKETS_ROUTES
} from '@/features/markets';

// Lazy load other pages for better performance
const Dashboard = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const Products = lazy(() => import('@/features/products/pages/ProductsPage').then(module => ({ default: module.ProductsPage || module })));
const Sales = lazy(() => import('@/features/sales/pages/SalesPage').then(module => ({ default: module.SalesPage || module })));
const Inventory = lazy(() => import('@/features/inventory/pages/InventoryPage').then(module => ({ default: module.InventoryPage || module })));
const Settings = lazy(() => import('@/features/settings/pages/SettingsPage').then(module => ({ default: module.SettingsPage || module })));

// Lazy load customer pages
const Customers = lazy(() => import('@/features/customers/pages/CustomersPage').then(module => ({ default: module.CustomersPage || module })));
const CustomerGroups = lazy(() => import('@/features/customers/pages/CustomerGroupsPage').then(module => ({ default: module.CustomerGroupsPage || module })));
const CustomerDetail = lazy(() => import('@/features/customers/pages/CustomerDetailPage'));
const CustomerLoyalty = lazy(() => import('@/features/customers/pages/LoyaltyProgramPage').then(module => ({ default: module.LoyaltyProgramPage || module })));
const CustomerHistory = lazy(() => import('@/features/customers/pages/CustomerHistoryPage').then(module => ({ default: module.CustomerHistoryPage || module })));
const CustomerAnalytics = lazy(() => import('@/features/customers/pages/CustomerAnalyticsPage').then(module => ({ default: module.CustomerAnalyticsPage || module })));
const CustomerReports = lazy(() => import('@/features/customers/pages/CustomerReportsPage').then(module => ({ default: module.CustomerReportsPage || module })));

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

// Create a fallback component for error boundaries
const ErrorFallback = (error: Error, reset: () => void) => (
  <div className="p-8 text-red-500">
    <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
    <p className="mb-4">{error.message}</p>
    <button
      className="px-4 py-2 bg-red-100 text-red-800 rounded"
      onClick={reset}
    >
      Try again
    </button>
  </div>
);

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
      // Markets Module Routes
      {
        path: MARKETS_ROUTES.ROOT,
        children: [
          {
            index: true,
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <MarketsList />
              </ErrorBoundary>
            )
          },
          {
            path: MARKETS_ROUTES.LIST,
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <MarketsList />
              </ErrorBoundary>
            )
          },
          {
            path: MARKETS_ROUTES.DETAILS,
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <MarketDetails />
              </ErrorBoundary>
            )
          },
          {
            path: MARKETS_ROUTES.NEW,
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <MarketForm />
              </ErrorBoundary>
            )
          },
          {
            path: MARKETS_ROUTES.EDIT,
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <MarketForm />
              </ErrorBoundary>
            )
          },
          {
            path: MARKETS_ROUTES.CONNECTION,
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <MarketConnectionPage />
              </ErrorBoundary>
            )
          },
        ],
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <Products />
              </ErrorBoundary>
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
            path: 'stock/alerts',
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <EnhancedLowStockAlertsPage />
              </ErrorBoundary>
            ),
          },
          {
            path: 'categories',
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <EnhancedCategoriesPage />
              </ErrorBoundary>
            ),
          },
          {
            path: 'variations',
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <EnhancedVariationsPage />
              </ErrorBoundary>
            ),
          },
          {
            path: 'brands',
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <BrandsPage />
              </ErrorBoundary>
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
                <ProductEditPageRefactored />
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
          {
            path: ':productId/pricing',
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <EnhancedPricingPage />
              </ErrorBoundary>
            ),
          },
          {
            path: ':productId/variations',
            element: (
              <ErrorBoundary fallback={ErrorFallback}>
                <EnhancedVariationsPage />
              </ErrorBoundary>
            ),
          },
        ],
      },
      // Add customers routes
      {
        path: 'customers',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <Customers />
              </Suspense>
            ),
          },
          {
            path: 'groups',
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerGroups />
              </Suspense>
            ),
          },
          {
            path: 'loyalty',
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerLoyalty />
              </Suspense>
            ),
          },
          {
            path: 'analytics',
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerAnalytics />
              </Suspense>
            ),
          },
          {
            path: 'reports',
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerReports />
              </Suspense>
            ),
          },
          {
            path: ':customerId',
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerDetail />
              </Suspense>
            ),
          },
          {
            path: ':customerId/history',
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerHistory />
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
