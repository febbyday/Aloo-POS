/**
 * Finance Module Route Configuration
 * 
 * This file centralizes all routes related to the Finance module to:
 * 1. Prevent naming conflicts with other modules
 * 2. Allow for easy route validation
 * 3. Enable route-based code splitting
 * 4. Provide a single source of truth for route paths
 */

// Base path for all finance-related routes
export const FINANCE_BASE_PATH = '/finance';

// Individual route paths relative to the base path
export const FINANCE_ROUTES = {
  // Main dashboard
  DASHBOARD: '',
  
  // Revenue management
  REVENUE: 'revenue',
  
  // Expense management
  EXPENSES: 'expenses',
  
  // Profit and loss analysis
  PROFIT_LOSS: 'profit-loss',
  
  // Tax management
  TAXES: 'taxes',
  
  // Payment reconciliation
  RECONCILIATION: 'reconciliation',
  
  // Financial reports
  REPORTS: 'reports',
  
  // Module settings
  SETTINGS: 'settings',
} as const;

// Route type definitions for type safety
export type FinanceRouteKey = keyof typeof FINANCE_ROUTES;
export type FinanceRoutePath = typeof FINANCE_ROUTES[FinanceRouteKey];

// Helper function to generate full routes with the base path
export const getFinanceRoute = (route: FinanceRoutePath): string => {
  return `${FINANCE_BASE_PATH}/${route}`;
};

// Full route paths including base path
export const FINANCE_FULL_ROUTES = Object.entries(FINANCE_ROUTES).reduce(
  (acc, [key, path]) => ({
    ...acc,
    [key]: path === '' ? FINANCE_BASE_PATH : `${FINANCE_BASE_PATH}/${path}`,
  }),
  {} as Record<FinanceRouteKey, string>
);

// Route metadata for documentation and validation
export interface RouteConfig {
  path: string;
  fullPath: string;
  title: string;
  description: string;
  icon?: string;
  isIndex?: boolean;
}

// Complete route configuration including metadata
export const FINANCE_ROUTE_CONFIG: Record<FinanceRouteKey, RouteConfig> = {
  DASHBOARD: {
    path: FINANCE_ROUTES.DASHBOARD,
    fullPath: FINANCE_FULL_ROUTES.DASHBOARD,
    title: 'Finance Dashboard',
    description: 'Overview of financial performance',
    icon: 'LayoutDashboard',
    isIndex: true
  },
  REVENUE: {
    path: FINANCE_ROUTES.REVENUE,
    fullPath: FINANCE_FULL_ROUTES.REVENUE,
    title: 'Revenue Tracking',
    description: 'Monitor and manage sales revenue',
    icon: 'TrendingUp'
  },
  EXPENSES: {
    path: FINANCE_ROUTES.EXPENSES,
    fullPath: FINANCE_FULL_ROUTES.EXPENSES,
    title: 'Expense Management',
    description: 'Track and categorize business expenses',
    icon: 'FileText'
  },
  PROFIT_LOSS: {
    path: FINANCE_ROUTES.PROFIT_LOSS,
    fullPath: FINANCE_FULL_ROUTES.PROFIT_LOSS,
    title: 'Profit & Loss',
    description: 'Analyze profitability and financial performance',
    icon: 'BarChart'
  },
  TAXES: {
    path: FINANCE_ROUTES.TAXES,
    fullPath: FINANCE_FULL_ROUTES.TAXES,
    title: 'Tax Management',
    description: 'Configure and track tax rates and collections',
    icon: 'Percent'
  },
  RECONCILIATION: {
    path: FINANCE_ROUTES.RECONCILIATION,
    fullPath: FINANCE_FULL_ROUTES.RECONCILIATION,
    title: 'Payment Reconciliation',
    description: 'Reconcile payments and track discrepancies',
    icon: 'RefreshCw'
  },
  REPORTS: {
    path: FINANCE_ROUTES.REPORTS,
    fullPath: FINANCE_FULL_ROUTES.REPORTS,
    title: 'Financial Reports',
    description: 'Generate and view financial reports',
    icon: 'FileText'
  },
  SETTINGS: {
    path: FINANCE_ROUTES.SETTINGS,
    fullPath: FINANCE_FULL_ROUTES.SETTINGS,
    title: 'Finance Settings',
    description: 'Configure finance module settings',
    icon: 'Settings'
  },
}; 