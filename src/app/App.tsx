import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Suspense } from 'react';
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

// Sales Module
import { SalesPage } from '@/features/sales/pages/SalesPage';
import { ReturnsPage } from '@/features/sales/pages/ReturnsPage';

// User Management
import { UserManagementPage } from '@/features/auth/pages/UserManagementPage';

// Role Management
import RoleManagementPage from '@/features/users/pages/RoleManagementPage';
import PermissionsManagementPage from '@/features/users/pages/PermissionsManagementPage';
import { PermissionsListPage } from '@/features/users/pages/PermissionsListPage';

// Placeholder components for modules that might not exist
const ProductsPlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Products Module</h1>
    <p>This module is not yet implemented or is under development.</p>
  </div>
);

const CustomersPlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Customers Module</h1>
    <p>This module is not yet implemented or is under development.</p>
  </div>
);

const ReportsPlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Reports Module</h1>
    <p>This module is not yet implemented or is under development.</p>
  </div>
);

const SettingsPlaceholder = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Settings Module</h1>
    <p>This module is not yet implemented or is under development.</p>
  </div>
);

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
        element: (
          <SpecialRouteWrapper>
            <UserManagementPage />
          </SpecialRouteWrapper>
        ),
      },

      // Role Management
      {
        path: 'roles',
        element: (
          <SpecialRouteWrapper>
            <RoleManagementPage />
          </SpecialRouteWrapper>
        ),
      },
      {
        path: 'permissions',
        element: (
          <SpecialRouteWrapper>
            <PermissionsListPage />
          </SpecialRouteWrapper>
        ),
      },
      {
        path: 'permissions/:roleId',
        element: (
          <SpecialRouteWrapper>
            <PermissionsManagementPage />
          </SpecialRouteWrapper>
        ),
      },

      // Other modules
      {
        path: 'products',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ProductsPlaceholder />
          </Suspense>
        ),
      },
      {
        path: 'customers',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <CustomersPlaceholder />
          </Suspense>
        ),
      },
      {
        path: 'sales',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: <SalesPage />
          },
          {
            path: 'returns',
            element: <ReturnsPage />
          }
        ]
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ReportsPlaceholder />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <SettingsPlaceholder />
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