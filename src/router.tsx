import { createBrowserRouter } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import DashboardPage from "@/features/dashboard/pages/DashboardPage"
import { ProductsPage } from "@/features/products/pages/ProductsPage"
import { SalesPage } from "@/features/sales/pages/SalesPage"
import { InventoryPage } from "@/features/inventory/pages/InventoryPage"
import { StaffPage } from "@/features/staff/pages/StaffPage"
import { RolesPage } from "@/features/staff/pages/RolesPage"
import { EmploymentTypePage } from "@/features/staff/pages/EmploymentTypePage"
import { EmploymentStatusPage } from "@/features/staff/pages/EmploymentStatusPage"
import { SettingsPage } from "@/features/settings/pages/SettingsPage"
import { SupplierOrders } from "@/features/suppliers/pages/SupplierOrders"
import { SupplierPage } from "@/features/suppliers/pages/SupplierPage"
import { ProductDetailsPage } from "@/features/products/pages/ProductDetailsPage"

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
        path: "/sales",
        element: <SalesPage />,
      },
      {
        path: "/inventory",
        element: <InventoryPage />,
      },
      {
        path: "/staff",
        element: <StaffPage />,
      },
      {
        path: "/staff/roles",
        element: <RolesPage />,
      },
      {
        path: "/staff/employment-types",
        element: <EmploymentTypePage />,
      },
      {
        path: "/staff/employment-status",
        element: <EmploymentStatusPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/suppliers/orders",
        element: <SupplierOrders />,
      },
      {
        path: "/suppliers/:id",
        element: <SupplierPage />,
      },
    ],
  },
])
