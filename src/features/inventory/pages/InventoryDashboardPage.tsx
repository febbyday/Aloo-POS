import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, ArrowLeftRight, AlertTriangle, History, Tags, Download, BarChart, Users, Link as LinkIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from 'react'
import { SupplierModal } from '@/features/suppliers/components/SupplierModal'

const inventoryStats = {
  totalProducts: 150,
  lowStock: 12,
  recentlyAdded: 8,
  outOfStock: 5
}

export function InventoryDashboardPage() {
  const [supplierModalOpen, setSupplierModalOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Inventory Overview</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => setSupplierModalOpen(true)}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Suppliers
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Link to="/products">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                Total Products
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/products/transfers">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transfers
              </CardTitle>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">
                Pending Transfers
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/products/low-stock">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Items Below Threshold
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/products/history">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Stock History
              </CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">485</div>
              <p className="text-xs text-muted-foreground">
                Transactions This Month
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/products/categories">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Categories
              </CardTitle>
              <Tags className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Active Categories
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stock Value Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Stock value chart coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Moving Products</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Top products chart coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Stock Movement Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Stock movement trends chart coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Inventory insights and analytics coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Inventory reports and exports coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SupplierModal 
        open={supplierModalOpen} 
        onOpenChange={setSupplierModalOpen}
      />
    </div>
  )
}
