import { createBrowserRouter } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import DashboardPage from "@/features/dashboard/pages/DashboardPage"
import { ProductsPage } from "@/features/products/pages/ProductsPage"
import { SalesPage } from "@/features/sales/pages/SalesPage"
import { InventoryPage } from "@/features/inventory/pages/InventoryPage"
import { InventoryManagementPage } from "@/features/inventory/pages/InventoryManagementPage"
import { StockLevelsPage } from "@/features/inventory/pages/StockLevelsPage"
import { ReceiveStockPage } from "@/features/inventory/pages/ReceiveStockPage"
import { TransferStockPage } from "@/features/inventory/pages/TransferStockPage"
import { AdjustmentsPage } from "@/features/inventory/pages/AdjustmentsPage"
import { HistoryPage } from "@/features/inventory/pages/HistoryPage"
import { AlertsPage } from "@/features/inventory/pages/AlertsPage"
import { StaffPage } from "@/features/staff/pages/StaffPage"
import { RolesPage } from "@/features/users/pages/RolesPage"
import { RoleAddPage } from "@/features/users/pages/RoleAddPage"
import { RoleEditPage } from "@/features/users/pages/RoleEditPage"
import { PermissionsPage } from "@/features/users/pages/PermissionsPage"
import { EmploymentTypePage } from "@/features/staff/pages/EmploymentTypePage"
import { EmploymentStatusPage } from "@/features/staff/pages/EmploymentStatusPage"
import { SettingsPage } from "@/features/settings/pages/SettingsPage"
import { SupplierOrders } from "@/features/suppliers/pages/SupplierOrders"
import { SupplierPage } from "@/features/suppliers/pages/SupplierPage"
import { ProductDetailsPage } from "@/features/products/pages/ProductDetailsPage"
import { ReturnsPage } from "@/features/sales/pages/ReturnsPage"
import { NewSalePage } from "@/features/sales/pages/NewSalePage"
import { DiscountsPage } from "@/features/sales/pages/DiscountsPage"
import { GiftCardsPage } from "@/features/sales/pages/GiftCardsPage"
import { GiftCardDetailsPage } from "@/features/sales/pages/GiftCardDetailsPage"
import { TransactionBrowserPage } from "@/features/sales/pages/TransactionBrowserPage"
import { ProcessReturnPage } from "@/features/sales/pages/ProcessReturnPage"
import { ReturnHistoryPage } from "@/features/sales/pages/ReturnHistoryPage"
import { ReturnDetailsPage } from "@/features/sales/pages/ReturnDetailsPage"
import { RefundManagementPage } from "@/features/sales/pages/RefundManagementPage"
import { CustomersPage } from "@/features/customers/pages/CustomersPage"
import CustomerDetailPage from "@/features/customers/pages/CustomerDetailPage"
import { CustomerGroupsPage } from "@/features/customers/pages/CustomerGroupsPage"
import { LoyaltyProgramPage } from "@/features/customers/pages/LoyaltyProgramPage"
import { CustomerHistoryPage } from "@/features/customers/pages/CustomerHistoryPage"
import { CustomerAnalyticsPage } from "@/features/customers/pages/CustomerAnalyticsPage"
import { CustomerReportsPage } from "@/features/customers/pages/CustomerReportsPage"
import { StaffDetailsPage } from "@/features/staff/pages/StaffDetailsPage"
import { RoleDetailsPage } from "@/features/users/pages/RoleDetailsPage"
import { SupplierConnectionPage } from "@/features/suppliers/pages/SupplierConnectionPage"
// Temporarily commenting out the missing import and using a placeholder
// import RepairConnectionPage from "@/features/repairs/pages/RepairConnectionPage"
// Using a placeholder component until the actual module is available
const RepairConnectionPage = () => <div>Repair Connection Page</div>

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/products/:productId",
        element: <ProductDetailsPage />,
      },
      {
        path: "/customers",
        children: [
          {
            index: true,
            element: <CustomersPage />,
          },
          {
            path: "groups",
            element: <CustomerGroupsPage />,
          },
          {
            path: "loyalty",
            element: <LoyaltyProgramPage />,
          },
          {
            path: "analytics",
            element: <CustomerAnalyticsPage />,
          },
          {
            path: "reports",
            element: <CustomerReportsPage />,
          },
          {
            path: ":customerId",
            element: <CustomerDetailPage />,
          },
          {
            path: ":customerId/history",
            element: <CustomerHistoryPage />,
          },
        ],
      },
      {
        path: "/sales",
        children: [
          {
            index: true,
            element: <SalesPage />,
          },
          {
            path: "new",
            element: <NewSalePage />,
          },
          {
            path: "discounts",
            element: <DiscountsPage />,
          },
          {
            path: "gift-cards",
            children: [
              {
                index: true,
                element: <GiftCardsPage />,
              },
              {
                path: ":giftCardId",
                element: <GiftCardDetailsPage />,
              },
            ],
          },
          {
            path: "transactions",
            element: <TransactionBrowserPage />,
          },
          {
            path: "returns",
            children: [
              {
                index: true,
                element: <ReturnsPage />,
              },
              {
                path: ":returnId",
                element: <ReturnDetailsPage />,
              },
              {
                path: "process",
                element: <ProcessReturnPage />,
              },
              {
                path: "history",
                element: <ReturnHistoryPage />,
              },
              {
                path: "refunds",
                element: <RefundManagementPage />,
              },
            ],
          },
        ],
      },
      {
        path: "/inventory",
        children: [
          {
            index: true,
            element: <InventoryManagementPage />,
          },
          {
            path: "stock-levels",
            element: <StockLevelsPage />,
          },
          {
            path: "receive",
            element: <ReceiveStockPage />,
          },
          {
            path: "transfer",
            element: <TransferStockPage />,
          },
          {
            path: "adjustments",
            element: <AdjustmentsPage />,
          },
          {
            path: "history",
            element: <HistoryPage />,
          },
          {
            path: "alerts",
            element: <AlertsPage />,
          },
        ],
      },
      {
        path: "/staff",
        children: [
          {
            index: true,
            element: <StaffPage />,
          },
          {
            path: ":staffId",
            element: <StaffDetailsPage />,
          },
          {
            path: "roles",
            element: <RolesPage />,
          },
          {
            path: "roles/new",
            element: <RoleAddPage />,
          },
          {
            path: "roles/:roleId",
            element: <RoleDetailsPage />,
          },
          {
            path: "roles/:roleId/edit",
            element: <RoleEditPage />,
          },
          {
            path: "roles/:roleId/permissions",
            element: <PermissionsPage />,
          },
          {
            path: "employment-types",
            element: <EmploymentTypePage />,
          },
          {
            path: "employment-status",
            element: <EmploymentStatusPage />,
          },
        ],
      },
      {
        path: "/users",
        children: [
          {
            index: true,
            element: <StaffPage />,
          },
          {
            path: ":staffId",
            element: <StaffDetailsPage />,
          },
          {
            path: "roles",
            element: <RolesPage />,
          },
          {
            path: "roles/new",
            element: <RoleAddPage />,
          },
          {
            path: "roles/:roleId",
            element: <RoleDetailsPage />,
          },
          {
            path: "roles/:roleId/edit",
            element: <RoleEditPage />,
          },
          {
            path: "roles/:roleId/permissions",
            element: <PermissionsPage />,
          },
        ],
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/suppliers",
        children: [
          {
            index: true,
            element: <SupplierPage />,
          },
          {
            path: "orders",
            element: <SupplierOrders />,
          },
          {
            path: "connection",
            element: <SupplierConnectionPage />,
          },
        ],
      },
      {
        path: "/repairs",
        children: [
          {
            index: true,
            element: <div>Repairs Dashboard</div>, // Placeholder for the repairs main page
          },
          {
            path: "connection",
            element: <RepairConnectionPage />,
          },
          {
            path: "tickets",
            element: <div>Repair Tickets</div>, // Placeholder for the repair tickets page
          },
          {
            path: "technicians",
            element: <div>Repair Technicians</div>, // Placeholder for the repair technicians page
          },
        ],
      },
    ],
  },
])
