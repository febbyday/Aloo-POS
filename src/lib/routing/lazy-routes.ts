import { createLazyRoute } from './lazy-route';

// Dashboard
export const LazyAnalyticsDashboardPage = createLazyRoute(
  () => import('@/features/sales/pages/AnalyticsDashboardPage'),
  'analyticsDashboard'
);

// Products
export const LazyProductsPage = createLazyRoute(
  () => import('@/features/products/pages/ProductsPage'),
  'products'
);

export const LazyProductAddPage = createLazyRoute(
  () => import('@/features/products/pages/ProductAddPage'),
  'productAdd'
);

export const LazyProductEditPage = createLazyRoute(
  () => import('@/features/products/pages/ProductEditPage'),
  'productEdit'
);

export const LazyProductDetailsPage = createLazyRoute(
  () => import('@/features/products/pages/ProductDetailsPage'),
  'productDetails'
);

export const LazyCategoriesPage = createLazyRoute(
  () => import('@/features/products/pages/CategoriesPage'),
  'categories'
);

export const LazyBrandsPage = createLazyRoute(
  () => import('@/features/products/pages/BrandsPage'),
  'brands'
);

export const LazyPricingPage = createLazyRoute(
  () => import('@/features/products/pages/PricingPage'),
  'pricing'
);

export const LazyVariationsManagerPage = createLazyRoute(
  () => import('@/features/products/pages/VariationsManagerPage'),
  'variationsManager'
);

// Inventory
export const LazyStockHistoryPage = createLazyRoute(
  () => import('@/features/products/pages/StockHistoryPage'),
  'stockHistory'
);

export const LazyStockTransferPage = createLazyRoute(
  () => import('@/features/products/pages/StockTransferPage'),
  'stockTransfer'
);

export const LazyCreateTransferPage = createLazyRoute(
  () => import('@/features/products/pages/CreateTransferPage'),
  'createTransfer'
);

export const LazyEditTransferPage = createLazyRoute(
  () => import('@/features/products/pages/EditTransferPage'),
  'editTransfer'
);

export const LazyLowStockAlertsPage = createLazyRoute(
  () => import('@/features/products/pages/LowStockAlertsPage'),
  'lowStockAlerts'
);

export const LazyAlertsPage = createLazyRoute(
  () => import('@/features/inventory/pages/AlertsPage'),
  'alerts'
);

export const LazyHistoryPage = createLazyRoute(
  () => import('@/features/inventory/pages/HistoryPage'),
  'history'
);

// Sales
export const LazySalesPage = createLazyRoute(
  () => import('@/features/sales/pages/SalesPage'),
  'sales'
);

export const LazyNewSalePage = createLazyRoute(
  () => import('@/features/sales/pages/NewSalePage'),
  'newSale'
);

export const LazyDiscountsPage = createLazyRoute(
  () => import('@/features/sales/pages/DiscountsPage'),
  'discounts'
);

export const LazyGiftCardsPage = createLazyRoute(
  () => import('@/features/sales/pages/GiftCardsPage'),
  'giftCards'
);

export const LazyGiftCardDetailsPage = createLazyRoute(
  () => import('@/features/sales/pages/GiftCardDetailsPage'),
  'giftCardDetails'
);

export const LazyRefundsPage = createLazyRoute(
  () => import('@/features/sales/pages/RefundsPage'),
  'refunds'
);

export const LazySaleDetailsPage = createLazyRoute(
  () => import('@/features/sales/pages/SaleDetailsPage'),
  'saleDetails'
);

export const LazyReturnsPage = createLazyRoute(
  () => import('@/features/sales/pages/ReturnsPage'),
  'returns'
);

export const LazyTransactionBrowserPage = createLazyRoute(
  () => import('@/features/sales/pages/TransactionBrowserPage'),
  'transactionBrowser'
);

// Settings
export const LazySettingsPage = createLazyRoute(
  () => import('@/features/settings/pages/SettingsPage'),
  'settings'
);
