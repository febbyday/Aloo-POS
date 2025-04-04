import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import DevLoginPage from '@/features/auth/pages/DevLoginPage';
import SpecialRouteWrapper from '@/features/auth/components/SpecialRouteWrapper';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import LoadingScreen from '@/components/common/LoadingScreen';

// Pages
import Dashboard from '@/features/dashboard/pages/Dashboard';
import NotFound from '@/features/misc/pages/NotFound';
import { LoginPage } from '@/features/auth/pages/LoginPage';

// Markets Module
import {
  MarketsList,
  MarketDetails,
  MarketForm,
  MarketConnectionPage,
  MARKETS_ROUTES
} from '@/features/markets';

// User Management
import UserManagementPage from '@/features/auth/pages/UserManagementPage';

// Role Management
import RoleManagementPage from '@/features/staff/pages/RoleManagementPage';
import PermissionsManagementPage from '@/features/staff/pages/PermissionsManagementPage';

// Lazy-loaded routes
const Products = lazy(() => import('@/features/products/pages/Products'));
const Customers = lazy(() => import('@/features/customers/pages/Customers'));
const Reports = lazy(() => import('@/features/reports/pages/Reports'));
const Settings = lazy(() => import('@/features/settings/pages/Settings'));

// Determine which login page to use based on environment
const LoginPageComponent = import.meta.env.DEV ? DevLoginPage : LoginPage;

// Create router
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPageComponent />
  },
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      // Dashboard
      {
        index: true,
        element: <Dashboard />,
      },

      // Markets Module
      {
        path: MARKETS_ROUTES.ROOT,
        children: [
          {
            index: true,
            element: <MarketsList />
          },
          {
            path: MARKETS_ROUTES.LIST,
            element: <MarketsList />
          },
          {
            path: MARKETS_ROUTES.DETAILS,
            element: <MarketDetails />
          },
          {
            path: MARKETS_ROUTES.NEW,
            element: <MarketForm />
          },
          {
            path: MARKETS_ROUTES.EDIT,
            element: <MarketForm />
          },
          {
            path: MARKETS_ROUTES.CONNECTION,
            element: <MarketConnectionPage />
          },
        ],
      },

      // User Management
      {
        path: 'users',
        element: import.meta.env.DEV ? (
          <SpecialRouteWrapper>
            <UserManagementPage />
          </SpecialRouteWrapper>
        ) : (
          <UserManagementPage />
        ),
      },

      // Role Management
      {
        path: 'roles',
        element: import.meta.env.DEV ? (
          <SpecialRouteWrapper>
            <RoleManagementPage />
          </SpecialRouteWrapper>
        ) : (
          <RoleManagementPage />
        ),
      },
      {
        path: 'permissions/:roleId',
        element: import.meta.env.DEV ? (
          <SpecialRouteWrapper>
            <PermissionsManagementPage />
          </SpecialRouteWrapper>
        ) : (
          <PermissionsManagementPage />
        ),
      },

      // Other modules
      {
        path: 'products',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Products />
          </Suspense>
        ),
      },
      {
        path: 'customers',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Customers />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Reports />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
]);

function App() {
  // Just render the router
  return <RouterProvider router={router} />;
}

export default App;