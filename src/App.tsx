// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { RootLayout } from '@/layouts/RootLayout';
import { POSLayout } from '@/layouts/POSLayout';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import UnifiedErrorBoundary from './components/unified-error-boundary';
import { ThemeProvider } from '@/components/theme-provider';
import { ScrollbarProvider } from '@/components/scrollbar-provider';
import { Toaster } from "@/components/ui/toaster";
import { StoreProvider } from './features/store/context/StoreContext';
import { CompanyProvider } from './features/store/context/CompanyContext';
import { ProductProvider } from './features/products/context/ProductContext';
import { PricingSettingsProvider } from './features/products/context/PricingSettingsContext';
import { CategoryProvider } from './features/products/context/CategoryContext';
import { BrandProvider } from './features/products/context/BrandContext';
import { VariationTemplateProvider } from './features/products/context/VariationTemplateContext';
import { AuthProvider } from './features/auth/context/AuthContext';
// Import shop pages
import { ShopsPage } from './features/shops/pages/ShopsPage';
import { ShopDetailsPage } from './features/shops/pages/ShopDetailsPage';
import { ShopStaffPage } from './features/shops/pages/ShopStaffPage';
import { ShopReportsPage } from './features/shops/pages/ShopReportsPage';
import { ShopAddPage } from './features/shops/pages/ShopAddPage';
// Import the bypass version of ProtectedRoute instead of the original
import { ProtectedRoute } from './features/auth/components/BypassProtectedRoute';
import { LoginBypass } from './features/auth/components/LoginBypass';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationsPage from './pages/NotificationsPage';

// Import history providers
import { ProductHistoryProvider } from './features/products/context/ProductHistoryContext';
import { CustomerHistoryProvider } from './features/customers/context/CustomerHistoryContext';
import { SalesHistoryProvider } from './features/sales/context/SalesHistoryContext';
import { InventoryHistoryProvider } from './features/inventory/context/InventoryHistoryContext';
import { StaffHistoryProvider } from './features/staff/context/StaffHistoryContext';
import { RoleHistoryProvider } from './features/staff/context/RoleHistoryContext';
import { SupplierHistoryProvider } from './features/suppliers/context/SupplierHistoryContext';
import { PurchaseOrderHistoryProvider } from './features/purchase-orders/context/PurchaseOrderHistoryContext';
import { RepairHistoryProvider } from './features/repairs/context/RepairHistoryContext';
import { LocationHistoryProvider } from './features/locations/context/LocationHistoryContext';
import { ExpenseHistoryProvider } from './features/expenses/context/ExpenseHistoryContext';
import { SettingsHistoryProvider } from './features/settings/context/SettingsHistoryContext';
import { ReportHistoryProvider } from './features/reports/context/ReportHistoryContext';

// Import pages
import { AnalyticsDashboardPage } from './features/sales/pages/AnalyticsDashboardPage';
import { ProductsPage } from './features/products/pages/ProductsPage';
import { ProductAddPage } from './features/products/pages/ProductAddPage';
import { ProductEditPage } from './features/products/pages/ProductEditPage';
import { ProductDetailsPage } from './features/products/pages/ProductDetailsPage';
import { CategoriesPage } from './features/products/pages/CategoriesPage';
import { PricingPage } from './features/products/pages/PricingPage';
import { StockHistoryPage } from './features/products/pages/StockHistoryPage';
import { StockTransferPage } from './features/products/pages/StockTransferPage';
import { CreateTransferPage } from './features/products/pages/CreateTransferPage';
import { EditTransferPage } from './features/products/pages/EditTransferPage';
import { PrintLabelsPage } from './features/products/pages/PrintLabelsPage';
import { LowStockAlertsPage } from './features/products/pages/LowStockAlertsPage';
import { VariationsManagerPage } from './features/products/pages/VariationsManagerPage';
import { ProductFormWrapper } from './features/products/components/ProductFormWrapper';

// Import inventory pages
import { AlertsPage } from './features/inventory/pages/AlertsPage';
import { HistoryPage } from './features/inventory/pages/HistoryPage';

// Import sales pages
import { SalesPage } from './features/sales/pages/SalesPage';
import { NewSalePage } from './features/sales/pages/NewSalePage';
import { DiscountsPage } from './features/sales/pages/DiscountsPage';
import { GiftCardsPage } from './features/sales/pages/GiftCardsPage';
import { GiftCardDetailsPage } from './features/sales/pages/GiftCardDetailsPage';
import { RefundsPage } from './features/sales/pages/RefundsPage';
import { SaleDetailsPage } from './features/sales/pages/SaleDetailsPage';

// Import customer pages
import { CustomersPage } from './features/customers/pages/CustomersPage';
import { CustomerAddPage } from './features/customers/pages/CustomerAddPage';
import { CustomerEditPage } from './features/customers/pages/CustomerEditPage';
import { CustomerDetailsPage } from './features/customers/pages/CustomerDetailsPage';
import { CustomerGroupsPage } from './features/customers/pages/CustomerGroupsPage';
import { CustomerFormWrapper } from './features/customers/components/CustomerFormWrapper';

// Import supplier pages
import { SuppliersPage } from './features/suppliers/pages/SuppliersPage';
import { SupplierAddPage } from './features/suppliers/pages/SupplierAddPage';
import { SupplierEditPage } from './features/suppliers/pages/SupplierEditPage';
import { SupplierDetailsPage } from './features/suppliers/pages/SupplierDetailsPage';
import { SupplierFormWrapper } from './features/suppliers/components/SupplierFormWrapper';

// Import purchase order pages
import { PurchaseOrdersPage } from './features/purchase-orders/pages/PurchaseOrdersPage';
import { PurchaseOrderAddPage } from './features/purchase-orders/pages/PurchaseOrderAddPage';
import { PurchaseOrderEditPage } from './features/purchase-orders/pages/PurchaseOrderEditPage';
import { PurchaseOrderDetailsPage } from './features/purchase-orders/pages/PurchaseOrderDetailsPage';
import { PurchaseOrderFormWrapper } from './features/purchase-orders/components/PurchaseOrderFormWrapper';

// Import staff pages
import { StaffPage } from './features/staff/pages/StaffPage';
import { StaffAddPage } from './features/staff/pages/StaffAddPage';
import { StaffEditPage } from './features/staff/pages/StaffEditPage';
import { StaffDetailsPage } from './features/staff/pages/StaffDetailsPage';
import { StaffFormWrapper } from './features/staff/components/StaffFormWrapper';
import { RolesPage } from './features/staff/pages/RolesPage';
import { RoleAddPage } from './features/staff/pages/RoleAddPage';
import { RoleEditPage } from './features/staff/pages/RoleEditPage';
import { RoleDetailsPage } from './features/staff/pages/RoleDetailsPage';
import { RoleFormWrapper } from './features/staff/components/RoleFormWrapper';
import { SchedulePage } from './features/staff/pages/SchedulePage';
import { PerformancePage } from './features/staff/pages/PerformancePage';
import { TrainingPage } from './features/staff/pages/TrainingPage';
import { EmploymentTypePage } from './features/staff/pages/EmploymentTypePage';
import { EmploymentStatusPage } from './features/staff/pages/EmploymentStatusPage';

// Import repair pages
import { RepairsPage } from './features/repairs/pages/RepairsPage';
import { RepairDetailsPage } from './features/repairs/pages/RepairDetailsPage';

// Import expense pages
import { ExpensesPage } from './features/expenses/pages/ExpensesPage';
import { ExpenseCategoriesPage } from './features/expenses/pages/ExpenseCategoriesPage';

// Import markets pages
import { MarketsPage } from './features/markets/pages/MarketsPage';
import { SalesReportsPage } from './features/reports/pages/SalesReportsPage';
import { InventoryReportsPage } from './features/reports/pages/InventoryReportsPage';
import { CustomerReportsPage } from './features/customers/pages/CustomerReportsPage';
import { StaffReportsPage } from './features/reports/pages/StaffReportsPage';
import { FinancialReportsPage } from './features/reports/pages/FinancialReportsPage';
import { CustomReportsPage } from './features/reports/pages/CustomReportsPage';

// Import settings pages
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { SettingsLayout } from './features/settings/components/SettingsLayout';

// Import settings wrappers
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
  ProductsSettingsWrapper,
  EmailSettingsWrapper
} from './features/settings/components/SettingsPanelWrappers';
import ExpensesSettings from './features/settings/components/ExpensesSettings';
import ShopsSettings from './features/settings/components/ShopsSettings';
import CustomersSettings from './features/settings/components/CustomersSettings';
import SalesSettings from './features/settings/components/SalesSettings';
import InventorySettings from './features/settings/components/InventorySettings';
import StaffSettings from './features/settings/components/StaffSettings';
import SuppliersSettings from './features/settings/components/SuppliersSettings';
import PurchaseOrdersSettings from './features/settings/components/PurchaseOrdersSettings';
import RepairsSettings from './features/settings/components/RepairsSettings';
import MarketsSettings from './features/settings/components/MarketsSettings';

// Import POS pages
import { POSSalePage } from './features/sales/pages/POSSalePage';

// Import help center pages
import { HelpCenterPage } from './features/support/pages/HelpCenterPage';

// Import finance pages
import { RevenueTrackingPage } from './features/finance/pages/RevenueTrackingPage';
import { ExpenseManagementPage } from './features/finance/pages/ExpenseManagementPage';
import { ProfitLossPage } from './features/finance/pages/ProfitLossPage';
import { TaxesPage } from './features/finance/pages/TaxesPage';
import { ReconciliationPage } from './features/finance/pages/ReconciliationPage';
import { FinanceReportsPage } from './features/finance/pages/FinanceReportsPage';
import { FinanceSettingsPage } from './features/finance/pages/FinanceSettingsPage';
import { FinanceProviders } from './features/finance/context/FinanceProviders';

// Import permissions pages
import { PermissionsPage } from "@/features/staff/pages/PermissionsPage"
import { PermissionsListPage } from "@/features/staff/pages/PermissionsListPage"


import { RealShopProvider } from './features/shops/context/RealShopContext';

function App() {
  return (
    <UnifiedErrorBoundary
      title="Application Error"
      showToast={true}
      fallback={(error, reset) => (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
          <div className="w-full max-w-md p-6 space-y-4 bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center">Something went wrong</h2>
            <p className="text-muted-foreground text-center">
              The application encountered an unexpected error. Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="p-2 bg-muted rounded text-sm overflow-auto max-h-[200px]">
                <pre>{error.message}</pre>
                <pre>{error.stack}</pre>
              </div>
            )}
            <div className="flex justify-center pt-4">
              <button
                onClick={reset}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    >
      <Router>
        <ThemeProvider defaultTheme="light" storageKey="pos-theme">
          <Helmet>
            <title>Aloo POS | Point of Sale System</title>
            <meta name="description" content="Aloo POS - Modern Point of Sale System" />
          </Helmet>
          <ScrollbarProvider>
            <AuthProvider>
              <NotificationProvider>
                <StoreProvider>
                  <CompanyProvider>
                    <CategoryProvider>
                      <BrandProvider>
                        <VariationTemplateProvider>
                          <ProductProvider>
                            <ProductHistoryProvider>
                              <CustomerHistoryProvider>
                                <SalesHistoryProvider>
                                  <InventoryHistoryProvider>
                                    <StaffHistoryProvider>
                                      <RoleHistoryProvider>
                                        <SupplierHistoryProvider>
                                          <PurchaseOrderHistoryProvider>
                                            <RepairHistoryProvider>
                                              <LocationHistoryProvider>
                                                <ExpenseHistoryProvider>
                                                  <SettingsHistoryProvider>
                                                    <ReportHistoryProvider>
                                                      <PricingSettingsProvider>
                                                        <RealShopProvider>
                                                          <Routes>
                                                            {/* Authentication Routes - Bypassed */}
                                                            <Route path="/login" element={<LoginBypass />} />

                                                            {/* Protected Routes */}
                                                            <Route path="/" element={
                                                              <ProtectedRoute>
                                                                <RootLayout />
                                                              </ProtectedRoute>
                                                            }>
                                                              <Route index element={<AnalyticsDashboardPage />} />

                                                              {/* Notifications Route */}
                                                              <Route path="/notifications" element={<NotificationsPage />} />

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
                                                                <Route path="variations" element={<VariationsManagerPage />} />
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
                                                                 <Route index element={<ProductsPage />} />
                                                                 <Route path="alerts" element={<AlertsPage />} />
                                                                 <Route path="history" element={<HistoryPage />} />
                                                               </Route>

                                                              {/* Sales Routes */}
                                                              <Route path="/sales">
                                                                <Route index element={<SalesPage />} />
                                                                <Route path="new" element={<NewSalePage />} />
                                                                <Route path="discounts" element={<DiscountsPage />} />
                                                                <Route path="gift-cards">
                                                                  <Route index element={<GiftCardsPage />} />
                                                                  <Route path=":giftCardId" element={<GiftCardDetailsPage />} />
                                                                </Route>
                                                                <Route path="refunds" element={<RefundsPage />} />
                                                                <Route path=":saleId" element={<SaleDetailsPage />} />
                                                              </Route>

                                                              {/* Customer Routes */}
                                                              <Route path="/customers">
                                                                <Route index element={<CustomersPage />} />
                                                                <Route path="new" element={
                                                                  <CustomerFormWrapper>
                                                                    <CustomerAddPage />
                                                                  </CustomerFormWrapper>
                                                                } />
                                                                <Route path=":customerId/edit" element={
                                                                  <CustomerFormWrapper>
                                                                    <CustomerEditPage />
                                                                  </CustomerFormWrapper>
                                                                } />
                                                                <Route path="groups" element={<CustomerGroupsPage />} />
                                                                <Route path=":customerId" element={<CustomerDetailsPage />} />
                                                              </Route>

                                                              {/* Supplier Routes */}
                                                              <Route path="/suppliers">
                                                                <Route index element={<SuppliersPage />} />
                                                                <Route path="new" element={
                                                                  <SupplierFormWrapper>
                                                                    <SupplierAddPage />
                                                                  </SupplierFormWrapper>
                                                                } />
                                                                <Route path=":supplierId/edit" element={
                                                                  <SupplierFormWrapper>
                                                                    <SupplierEditPage />
                                                                  </SupplierFormWrapper>
                                                                } />
                                                                <Route path=":supplierId" element={<SupplierDetailsPage />} />
                                                              </Route>

                                                              {/* Purchase Order Routes */}
                                                              <Route path="/purchase-orders">
                                                                <Route index element={<PurchaseOrdersPage />} />
                                                                <Route path="new" element={
                                                                  <PurchaseOrderFormWrapper>
                                                                    <PurchaseOrderAddPage />
                                                                  </PurchaseOrderFormWrapper>
                                                                } />
                                                                <Route path=":purchaseOrderId/edit" element={
                                                                  <PurchaseOrderFormWrapper>
                                                                    <PurchaseOrderEditPage />
                                                                  </PurchaseOrderFormWrapper>
                                                                } />
                                                                <Route path=":purchaseOrderId" element={<PurchaseOrderDetailsPage />} />
                                                              </Route>

                                                              {/* Staff Routes */}
                                                              <Route path="/staff">
                                                                <Route index element={<StaffPage />} />
                                                                <Route path="new" element={
                                                                  <StaffFormWrapper>
                                                                    <StaffAddPage />
                                                                  </StaffFormWrapper>
                                                                } />
                                                                <Route path=":staffId/edit" element={
                                                                  <StaffFormWrapper>
                                                                    <StaffEditPage />
                                                                  </StaffFormWrapper>
                                                                } />
                                                                <Route path="roles" element={<RolesPage />} />
                                                                <Route path="roles/new" element={
                                                                  <RoleFormWrapper>
                                                                    <RoleAddPage />
                                                                  </RoleFormWrapper>
                                                                } />
                                                                <Route path="roles/:roleId/edit" element={
                                                                  <RoleFormWrapper>
                                                                    <RoleEditPage />
                                                                  </RoleFormWrapper>
                                                                } />
                                                                <Route path="roles/:roleId" element={
                                                                  <RoleFormWrapper>
                                                                    <RoleDetailsPage />
                                                                  </RoleFormWrapper>
                                                                } />
                                                                <Route path="schedule" element={<SchedulePage />} />
                                                                <Route path="performance" element={<PerformancePage />} />
                                                                <Route path="training" element={<TrainingPage />} />
                                                                <Route path="employment-types" element={<EmploymentTypePage />} />
                                                                <Route path="employment-statuses" element={<EmploymentStatusPage />} />
                                                                <Route path="permissions" element={<PermissionsPage />} />
                                                                <Route path="permissions/list" element={<PermissionsListPage />} />
                                                                <Route path=":staffId" element={<StaffDetailsPage />} />
                                                              </Route>

                                                              {/* Repair Routes */}
                                                               <Route path="/repairs">
                                                                 <Route index element={<RepairsPage />} />
                                                                 {/* These routes use components that don't exist in the codebase */}
                                                                 {/*
                                                                 <Route path="new" element={
                                                                   <RepairFormWrapper>
                                                                     <RepairAddPage />
                                                                   </RepairFormWrapper>
                                                                 } />
                                                                 <Route path=":repairId/edit" element={
                                                                   <RepairFormWrapper>
                                                                     <RepairEditPage />
                                                                   </RepairFormWrapper>
                                                                 } />
                                                                 */}
                                                                 <Route path=":repairId" element={<RepairDetailsPage />} />
                                                               </Route>

                                                               {/* Markets Routes */}
                                                               <Route path="/markets">
                                                                 <Route index element={<MarketsPage />} />
                                                               </Route>

                                                              {/* Location Routes */}
                                                              {/* These routes use components that don't exist in the codebase
                                                              <Route path="/locations">
                                                                <Route index element={<LocationsPage />} />
                                                                <Route path="new" element={
                                                                  <LocationFormWrapper>
                                                                    <LocationAddPage />
                                                                  </LocationFormWrapper>
                                                                } />
                                                                <Route path=":locationId/edit" element={
                                                                  <LocationFormWrapper>
                                                                    <LocationEditPage />
                                                                  </LocationFormWrapper>
                                                                } />
                                                                <Route path=":locationId" element={<LocationDetailsPage />} />
                                                              </Route>
                                                              */}

                                                              {/* Expense Routes */}
                                                              <Route path="/expenses">
                                                                <Route index element={<ExpensesPage />} />
                                                                <Route path="categories" element={<ExpenseCategoriesPage />} />
                                                                {/* These routes use components that don't exist in the codebase
                                                                <Route path="new" element={
                                                                  <ExpenseFormWrapper>
                                                                    <ExpenseAddPage />
                                                                  </ExpenseFormWrapper>
                                                                } />
                                                                <Route path=":expenseId/edit" element={
                                                                  <ExpenseFormWrapper>
                                                                    <ExpenseEditPage />
                                                                  </ExpenseFormWrapper>
                                                                } />
                                                                <Route path=":expenseId" element={<ExpenseDetailsPage />} />
                                                                */}
                                                              </Route>

                                                              {/* Report Routes */}
                                                              <Route path="/reports">
                                                                <Route index element={<CustomReportsPage />} />
                                                                <Route path="sales" element={<SalesReportsPage />} />
                                                                <Route path="inventory" element={<InventoryReportsPage />} />
                                                                <Route path="customers" element={<CustomerReportsPage />} />
                                                                <Route path="staff" element={<StaffReportsPage />} />
                                                                <Route path="financial" element={<FinancialReportsPage />} />
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
                                                                <Route path="email" element={<EmailSettingsWrapper />} />
                                                                <Route path="products" element={<ProductsSettingsWrapper />} />
                                                                <Route path="expenses" element={<ExpensesSettings />} />
                                                                <Route path="shops" element={<ShopsSettings />} />
                                                                <Route path="customers" element={<CustomersSettings />} />
                                                                <Route path="sales" element={<SalesSettings />} />
                                                                <Route path="inventory" element={<InventorySettings />} />
                                                                <Route path="staff" element={<StaffSettings />} />
                                                                <Route path="suppliers" element={<SuppliersSettings />} />
                                                                <Route path="purchase-orders" element={<PurchaseOrdersSettings />} />
                                                                <Route path="repairs" element={<RepairsSettings />} />
                                                                <Route path="markets" element={<MarketsSettings />} />
                                                              </Route>

                                                              {/* Shops Routes */}
                                                               <Route path="/shops">
                                                                 <Route index element={<ShopsPage />} />
                                                                 <Route path="new" element={<ShopAddPage />} />
                                                                 <Route path=":shopId" element={<ShopDetailsPage />} />
                                                                 <Route path="staff" element={<ShopStaffPage />} />
                                                                 <Route path="reports" element={<ShopReportsPage />} />
                                                               </Route>

                                                              {/* Finance Routes */}
                                                              <Route path="/finance">
                                                                <Route index element={<Navigate to="/finance/revenue" replace />} />
                                                                <Route element={<FinanceProviders>
                                                                  <Outlet />
                                                                </FinanceProviders>}>
                                                                  <Route path="revenue" element={<RevenueTrackingPage />} />
                                                                  <Route path="expenses" element={<ExpenseManagementPage />} />
                                                                  <Route path="profit-loss" element={<ProfitLossPage />} />
                                                                  <Route path="taxes" element={<TaxesPage />} />
                                                                  <Route path="reconciliation" element={<ReconciliationPage />} />
                                                                  <Route path="reports" element={<FinanceReportsPage />} />
                                                                  <Route path="settings" element={<FinanceSettingsPage />} />
                                                                </Route>
                                                              </Route>

                                                              {/* Help Center */}
                                                              <Route path="/help" element={<HelpCenterPage />} />
                                                            </Route>

                                                            {/* POS Sale Route */}
                                                            <Route path="/pos" element={
                                                              <ProtectedRoute>
                                                                <POSLayout />
                                                              </ProtectedRoute>
                                                            }>
                                                              <Route index element={<POSSalePage />} />
                                                            </Route>

                                                            {/* Redirect to dashboard if no match instead of login */}
                                                            <Route path="*" element={<Navigate to="/" replace />} />
                                                          </Routes>
                                                          <Toaster />
                                                        </RealShopProvider>
                                                      </PricingSettingsProvider>
                                                    </ReportHistoryProvider>
                                                  </SettingsHistoryProvider>
                                                </ExpenseHistoryProvider>
                                              </LocationHistoryProvider>
                                            </RepairHistoryProvider>
                                          </PurchaseOrderHistoryProvider>
                                        </SupplierHistoryProvider>
                                      </RoleHistoryProvider>
                                    </StaffHistoryProvider>
                                  </InventoryHistoryProvider>
                                </SalesHistoryProvider>
                              </CustomerHistoryProvider>
                            </ProductHistoryProvider>
                          </ProductProvider>
                        </VariationTemplateProvider>
                      </BrandProvider>
                    </CategoryProvider>
                  </CompanyProvider>
                </StoreProvider>
              </NotificationProvider>
            </AuthProvider>
          </ScrollbarProvider>
        </ThemeProvider>
      </Router>
    </UnifiedErrorBoundary>
  );
}

export default App;
