import { useState } from 'react'
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data
const purchaseOrders = [
  {
    id: "PO001",
    supplier: "Fabric World Ltd",
    date: "2025-02-15",
    total: 1499.99,
    items: 5,
    status: "Delivered",
    paymentStatus: "Paid"
  },
  {
    id: "PO002",
    supplier: "Fashion Wholesale Co",
    date: "2025-02-18",
    total: 2499.99,
    items: 8,
    status: "Pending",
    paymentStatus: "Unpaid"
  }
]

const columns = [
  {
    accessorKey: "id",
    header: "PO Number"
  },
  {
    accessorKey: "supplier",
    header: "Supplier"
  },
  {
    accessorKey: "date",
    header: "Date"
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.getValue("items") as number
      return (
        <Badge variant="secondary">
          {items} items
        </Badge>
      )
    }
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = row.getValue("total") as number
      return `$${total.toFixed(2)}`
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={
          status === "Delivered" 
            ? "default" 
            : status === "Pending" 
              ? "secondary" 
              : "destructive"
        }>
          {status}
        </Badge>
      )
    }
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string
      return (
        <Badge variant={status === "Paid" ? "default" : "destructive"}>
          {status}
        </Badge>
      )
    }
  }
]

export function PurchaseOrdersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage purchase orders with suppliers
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Awaiting delivery
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable 
        columns={columns} 
        data={purchaseOrders}
      />
    </div>
  )
}
