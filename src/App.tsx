// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { RootLayout } from '@/layouts/RootLayout';
import { POSLayout } from '@/layouts/POSLayout';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import { StoreProvider } from './features/store/context/StoreContext';
import { CompanyProvider } from './features/store/context/CompanyContext';
import { ProductProvider } from './features/products/context/ProductContext';
import { PricingSettingsProvider } from './features/products/context/PricingSettingsContext';

// Import history providers
import { ProductHistoryProvider } from './features/products/context/ProductHistoryContext';
import { CustomerHistoryProvider } from './features/customers/context/CustomerHistoryContext';
import { SalesHistoryProvider } from './features/sales/context/SalesHistoryContext';
import { InventoryHistoryProvider } from './features/inventory/context/InventoryHistoryContext';
import { StaffHistoryProvider } from './features/staff/context/StaffHistoryContext';
import { SupplierHistoryProvider } from './features/suppliers/context/SupplierHistoryContext';
import { PurchaseOrderHistoryProvider } from './features/purchase-orders/context/PurchaseOrderHistoryContext';
import { RepairHistoryProvider } from './features/repairs/context/RepairHistoryContext';
import { LocationHistoryProvider } from './features/locations/context/LocationHistoryContext';
import { ExpenseHistoryProvider } from './features/expenses/context/ExpenseHistoryContext';
import { SettingsHistoryProvider } from './features/settings/context/SettingsHistoryContext';
import { ReportHistoryProvider } from './features/reports/context/ReportHistoryContext';
import { FinanceProviders } from './features/finance/context/FinanceProviders';

// Import pages
import { POSSalePage } from './features/sales/pages/POSSalePage';
import { AnalyticsDashboardPage } from './features/sales/pages/AnalyticsDashboardPage';
import { ProductsPage } from '@/features/products/pages/ProductsPage';
import { ProductAddPage } from '@/features/products/pages/ProductAddPage';
import { ProductEditPage } from '@/features/products/pages/ProductEditPage';
import { ProductFormWrapper } from '@/features/products/components/ProductFormWrapper';
import { StockTransferPage } from '@/features/products/pages/StockTransferPage';
import { CreateTransferPage } from '@/features/products/pages/CreateTransferPage';
import { EditTransferPage } from '@/features/products/pages/EditTransferPage';
import { LowStockAlertsPage } from '@/features/products/pages/LowStockAlertsPage';
import { StockHistoryPage } from '@/features/products/pages/StockHistoryPage';
import { CategoriesPage } from '@/features/products/pages/CategoriesPage';
import { PrintLabelsPage } from '@/features/products/pages/PrintLabelsPage';
import { AlertsPage } from '@/features/inventory/pages/AlertsPage';
import { HistoryPage } from '@/features/inventory/pages/HistoryPage';
import { PricingPage } from '@/features/products/pages/PricingPage';
import { MarketsPage } from './features/markets/pages/MarketsPage';
import { MarketReportsPage } from './features/markets/pages/MarketReportsPage';
import { SuppliersPage } from './features/suppliers/pages/SuppliersPage';
import { SupplierPage } from './features/suppliers/pages/SupplierPage';
import { SupplierOrders } from './features/suppliers/pages/SupplierOrders';
import { PurchaseOrdersPage } from './features/purchase-orders/pages/PurchaseOrdersPage';
import { PerformancePage } from './features/suppliers/pages/PerformancePage';
import ReportsPage from './features/suppliers/pages/ReportsPage';
import { RepairsPage } from './features/repairs/pages/RepairsPage';
import { PendingRepairsPage } from './features/repairs/pages/PendingRepairsPage';
import { RepairReportsPage } from './features/repairs/pages/RepairReportsPage';
import { RepairDetailsPage } from './features/repairs/pages/RepairDetailsPage';
import { RepairPaymentsPage } from './features/repairs/pages/RepairPaymentsPage';
import { SalesReportsPage } from './features/reports/pages/SalesReportsPage';
import { InventoryReportsPage } from './features/reports/pages/InventoryReportsPage';
import { FinancialReportsPage } from './features/reports/pages/FinancialReportsPage';
import { StaffReportsPage } from './features/reports/pages/StaffReportsPage';
import { CustomReportsPage } from './features/reports/pages/CustomReportsPage';
import { AllStaffPage } from './features/staff/pages/AllStaffPage';
import { StaffDetailsPage } from './features/staff/pages/StaffDetailsPage';
import { RolesPage } from './features/staff/pages/RolesPage';
import { EmploymentTypePage } from './features/staff/pages/EmploymentTypePage';
import { PerformancePage as StaffPerformancePage } from './features/staff/pages/PerformancePage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { ExpensesPage } from './features/expenses/pages/ExpensesPage';
import { ExpenseCategoriesPage } from './features/expenses/pages/ExpenseCategoriesPage';
import { SalesPage } from './features/sales/pages/SalesPage';
import { NewSalePage } from './features/sales/pages/NewSalePage';
import { DiscountsPage } from './features/sales/pages/DiscountsPage';
import { GiftCardsPage } from './features/sales/pages/GiftCardsPage';
import { TransactionBrowserPage } from './features/sales/pages/TransactionBrowserPage';
import { ProcessReturnPage } from './features/sales/pages/ProcessReturnPage';
import { ReturnHistoryPage } from './features/sales/pages/ReturnHistoryPage';
import { RefundManagementPage } from './features/sales/pages/RefundManagementPage';
import { CustomersPage } from '@/features/customers/pages/CustomersPage';
import { LoyaltyProgramPage } from '@/features/customers/pages/LoyaltyProgramPage';
import { CustomerHistoryPage } from '@/features/customers/pages/CustomerHistoryPage';
import { CustomerAnalyticsPage } from '@/features/customers/pages/CustomerAnalyticsPage';
import { CustomerReportsPage } from '@/features/customers/pages/CustomerReportsPage';
import { HelpCenterPage } from "./features/support/pages/HelpCenterPage";
import { ProductDetailsPage } from '@/features/products/pages/ProductDetailsPage';

// Import shop pages
import { ShopsPage } from './features/shops/pages/ShopsPage';
import { ShopSettingsPage } from './features/shops/pages/ShopSettingsPage';
import { ShopStaffPage } from './features/shops/pages/ShopStaffPage';
import { ShopReportsPage } from './features/shops/pages/ShopReportsPage';
import { ShopDetailsPage } from './features/shops/pages/ShopDetailsPage';

// Import settings components
import CustomersSettings from './features/settings/components/CustomersSettings';
import InventorySettings from './features/settings/components/InventorySettings';
import SalesSettings from './features/settings/components/SalesSettings';
import StaffSettings from './features/settings/components/StaffSettings';
import SuppliersSettings from './features/settings/components/SuppliersSettings';
import PurchaseOrdersSettings from './features/settings/components/PurchaseOrdersSettings';
import RepairsSettings from './features/settings/components/RepairsSettings';
import ShopsSettings from './features/settings/components/ShopsSettings';
import MarketsSettings from './features/settings/components/MarketsSettings';
import ExpensesSettings from './features/settings/components/ExpensesSettings';
import {
  AppearanceSettingsWrapper,
  NotificationSettingsWrapper,
  BackupSettingsWrapper,
  ReceiptSettingsWrapper,
  TaxSettingsWrapper,
  SecuritySettingsWrapper,
  SystemSettingsWrapper,
  HardwareSettingsWrapper,
  WooCommerceSettingsWrapper,
  CompanySettingsWrapper,
  PaymentSettingsWrapper,
  ProductsSettingsWrapper
} from './features/settings/components/SettingsPanelWrappers';

// Import finance pages
import { FinanceDashboardPage } from './features/finance/pages/FinanceDashboardPage';
import { RevenueTrackingPage } from './features/finance/pages/RevenueTrackingPage';
import { ExpenseManagementPage } from './features/finance/pages/ExpenseManagementPage';
import { ProfitLossPage } from './features/finance/pages/ProfitLossPage';
import { TaxesPage } from './features/finance/pages/TaxesPage';
import { ReconciliationPage } from './features/finance/pages/ReconciliationPage';
import { FinanceReportsPage } from './features/finance/pages/FinanceReportsPage';
import { FinanceSettingsPage } from './features/finance/pages/FinanceSettingsPage';

// Import new permissions page
import { PermissionsPage } from "@/features/staff/pages/PermissionsPage"
import { PermissionsListPage } from "@/features/staff/pages/PermissionsListPage"

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <StoreProvider>
          <CompanyProvider>
            <ProductProvider>
              <ProductHistoryProvider>
                <CustomerHistoryProvider>
                  <SalesHistoryProvider>
                    <InventoryHistoryProvider>
                      <StaffHistoryProvider>
                        <SupplierHistoryProvider>
                          <PurchaseOrderHistoryProvider>
                            <RepairHistoryProvider>
                              <LocationHistoryProvider>
                                <ExpenseHistoryProvider>
                                  <SettingsHistoryProvider>
                                    <ReportHistoryProvider>
                                      <PricingSettingsProvider>
                                        <Routes>
                                          {/* Set dashboard as root route */}
                                          <Route path="/" element={<RootLayout />}>
                                            <Route index element={<AnalyticsDashboardPage />} />
                                            
                                            {/* Products Routes */}
                                            <Route path="/products">
                                              <Route index element={<ProductsPage />} />
                                              <Route path="new" element={
                                                <ProductFormWrapper>
                                                  <ProductAddPage />
                                                </ProductFormWrapper>
                                              } />
                                              <Route path=":productId/edit" element={
                                                <ProductFormWrapper>
                                                  <ProductEditPage />
                                                </ProductFormWrapper>
                                              } />
                                              <Route path="categories" element={<CategoriesPage />} />
                                              <Route path="pricing" element={<PricingPage />} />
                                              <Route path="history" element={<StockHistoryPage />} />
                                              <Route path="transfers" element={<StockTransferPage />} />
                                              <Route path="transfers/create" element={<CreateTransferPage />} />
                                              <Route path="transfers/edit/:transferId" element={<EditTransferPage />} />
                                              <Route path="labels" element={<PrintLabelsPage />} />
                                              <Route path="low-stock" element={<LowStockAlertsPage />} />
                                              <Route path=":productId" element={<ProductDetailsPage />} />
                                            </Route>
                                            
                                            {/* Inventory Routes */}
                                            <Route path="/inventory">
                                              <Route path="alerts" element={<AlertsPage />} />
                                              <Route path="history" element={<HistoryPage />} />
                                            </Route>
                                            
                                            {/* Sales Routes */}
                                            <Route path="/sales">
                                              <Route index element={<SalesPage />} />
                                              <Route path="new" element={<NewSalePage />} />
                                              <Route path="discounts" element={<DiscountsPage />} />
                                              <Route path="gift-cards" element={<GiftCardsPage />} />
                                              <Route path="transactions" element={<TransactionBrowserPage />} />
                                              <Route path="returns">
                                                <Route path="process" element={<ProcessReturnPage />} />
                                                <Route path="history" element={<ReturnHistoryPage />} />
                                                <Route path="refunds" element={<RefundManagementPage />} />
                                              </Route>
                                            </Route>
                                            
                                            {/* Customers Routes */}
                                            <Route path="/customers">
                                              <Route index element={<CustomersPage />} />
                                              <Route path="loyalty" element={<LoyaltyProgramPage />} />
                                              <Route path="history" element={<CustomerHistoryPage />} />
                                              <Route path="analytics" element={<CustomerAnalyticsPage />} />
                                              <Route path="reports" element={<CustomerReportsPage />} />
                                            </Route>
                                            
                                            {/* Staff Routes */}
                                            <Route path="/staff">
                                              <Route index element={<AllStaffPage />} />
                                              <Route path=":staffId" element={<StaffDetailsPage />} />
                                              <Route path="roles" element={<RolesPage />} />
                                              <Route path="permissions" element={<PermissionsListPage />} />
                                              <Route path="roles/:roleId/permissions" element={<PermissionsPage />} />
                                              <Route path="employment-types" element={<EmploymentTypePage />} />
                                              <Route path="performance" element={<StaffPerformancePage />} />
                                            </Route>
                                            
                                            {/* Suppliers Routes */}
                                            <Route path="/suppliers">
                                              <Route index element={<SuppliersPage />} />
                                              <Route path=":supplierId" element={<SupplierPage />} />
                                              <Route path="orders" element={<SupplierOrders />} />
                                              <Route path="performance" element={<PerformancePage />} />
                                              <Route path="reports" element={<ReportsPage />} />
                                            </Route>
                                            
                                            {/* Purchase Orders Routes */}
                                            <Route path="/purchase-orders">
                                              <Route index element={<PurchaseOrdersPage />} />
                                            </Route>
                                            
                                            {/* Repairs Routes */}
                                            <Route path="/repairs">
                                              <Route index element={<RepairsPage />} />
                                              <Route path="pending" element={<PendingRepairsPage />} />
                                              <Route path="reports" element={<RepairReportsPage />} />
                                              <Route path=":repairId" element={<RepairDetailsPage />} />
                                              <Route path="payments" element={<RepairPaymentsPage />} />
                                            </Route>
                                            
                                            {/* Shops Routes */}
                                            <Route path="/shops">
                                              <Route index element={<ShopsPage />} />
                                              <Route path=":shopId" element={<ShopDetailsPage />} />
                                              <Route path="settings" element={<ShopSettingsPage />} />
                                              <Route path="staff" element={<ShopStaffPage />} />
                                              <Route path="reports" element={<ShopReportsPage />} />
                                            </Route>
                                            
                                            {/* Markets Routes */}
                                            <Route path="/markets">
                                              <Route index element={<MarketsPage />} />
                                              <Route path="reports" element={<MarketReportsPage />} />
                                            </Route>
                                            
                                            {/* Expenses Routes */}
                                            <Route path="/expenses">
                                              <Route index element={<ExpensesPage />} />
                                              <Route path="categories" element={<ExpenseCategoriesPage />} />
                                            </Route>
                                            
                                            {/* Finance Routes */}
                                            <Route path="/finance">
                                              <Route element={<FinanceProviders>
                                                <Outlet />
                                              </FinanceProviders>}>
                                                <Route index element={<FinanceDashboardPage />} />
                                                <Route path="revenue" element={<RevenueTrackingPage />} />
                                                <Route path="expenses" element={<ExpenseManagementPage />} />
                                                <Route path="profit-loss" element={<ProfitLossPage />} />
                                                <Route path="taxes" element={<TaxesPage />} />
                                                <Route path="reconciliation" element={<ReconciliationPage />} />
                                                <Route path="reports" element={<FinanceReportsPage />} />
                                                <Route path="settings" element={<FinanceSettingsPage />} />
                                              </Route>
                                            </Route>
                                            
                                            {/* Reports Routes */}
                                            <Route path="/reports">
                                              <Route path="sales" element={<SalesReportsPage />} />
                                              <Route path="inventory" element={<InventoryReportsPage />} />
                                              <Route path="financial" element={<FinancialReportsPage />} />
                                              <Route path="staff" element={<StaffReportsPage />} />
                                              <Route path="custom" element={<CustomReportsPage />} />
                                            </Route>
                                            
                                            {/* Settings Routes */}
                                            <Route path="/settings" element={<SettingsPage />}>
                                              <Route index element={<Navigate to="/settings/appearance" replace />} />
                                              <Route path="appearance" element={<AppearanceSettingsWrapper />} />
                                              <Route path="notifications" element={<NotificationSettingsWrapper />} />
                                              <Route path="backup" element={<BackupSettingsWrapper />} />
                                              <Route path="receipt" element={<ReceiptSettingsWrapper />} />
                                              <Route path="tax" element={<TaxSettingsWrapper />} />
                                              <Route path="security" element={<SecuritySettingsWrapper />} />
                                              <Route path="system" element={<SystemSettingsWrapper />} />
                                              <Route path="hardware" element={<HardwareSettingsWrapper />} />
                                              <Route path="woocommerce" element={<WooCommerceSettingsWrapper />} />
                                              <Route path="company" element={<CompanySettingsWrapper />} />
                                              <Route path="payment" element={<PaymentSettingsWrapper />} />
                                              <Route path="products" element={<ProductsSettingsWrapper />} />
                                              <Route path="customers" element={<CustomersSettings />} />
                                              <Route path="inventory" element={<InventorySettings />} />
                                              <Route path="sales" element={<SalesSettings />} />
                                              <Route path="staff" element={<StaffSettings />} />
                                              <Route path="suppliers" element={<SuppliersSettings />} />
                                              <Route path="purchase-orders" element={<PurchaseOrdersSettings />} />
                                              <Route path="repairs" element={<RepairsSettings />} />
                                              <Route path="shops" element={<ShopsSettings />} />
                                              <Route path="markets" element={<MarketsSettings />} />
                                              <Route path="expenses" element={<ExpensesSettings />} />
                                            </Route>
                                            
                                            {/* Help Center */}
                                            <Route path="/help" element={<HelpCenterPage />} />
                                          </Route>
                                          
                                          {/* POS Sale Route */}
                                          <Route path="/pos" element={<POSLayout />}>
                                            <Route index element={<POSSalePage />} />
                                          </Route>
                                        </Routes>
                                      </PricingSettingsProvider>
                                    </ReportHistoryProvider>
                                  </SettingsHistoryProvider>
                                </ExpenseHistoryProvider>
                              </LocationHistoryProvider>
                            </RepairHistoryProvider>
                          </PurchaseOrderHistoryProvider>
                        </SupplierHistoryProvider>
                      </StaffHistoryProvider>
                    </InventoryHistoryProvider>
                  </SalesHistoryProvider>
                </CustomerHistoryProvider>
              </ProductHistoryProvider>
            </ProductProvider>
          </CompanyProvider>
        </StoreProvider>
        <Toaster />
      </ThemeProvider>
    </Router>
  );
}

export default App;