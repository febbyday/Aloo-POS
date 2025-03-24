import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomerGroupsTable } from "../components/pricing/CustomerGroupsTable"
import { PriceHistoryTable } from "../components/pricing/PriceHistoryTable"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Package, 
  Hash, 
  DollarSign, 
  FolderTree,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Calendar, 
  History, 
  Tags, 
  Users, 
  FileUp, 
  FileDown,
  TrendingUp,
  Calculator,
  Table as TableIcon,
  Tag,
  RefreshCw,
  Pencil
} from "lucide-react"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { SpecialPricesTable } from "../components/pricing/SpecialPricesTable"
import { BulkPriceUpdateDialog } from "../components/pricing/BulkPriceUpdateDialog"
import { PricingDashboard } from "../components/pricing/PricingDashboard"
import { PriceRulesDialog } from "../components/pricing/PriceRulesDialog"
import { ImportPricesDialog } from "../components/pricing/ImportPricesDialog"
import { ExportPricesDialog } from "../components/pricing/ExportPricesDialog"
import { BulkSpecialPriceForm } from "../components/pricing/BulkSpecialPriceForm"
import { SpecialPrices } from "../components/pricing/SpecialPrices"
import type { Product, CustomerGroup, SpecialPrice, PriceHistory } from "../types"
import { useProducts } from "../context/ProductContext"
import { CategoryProvider } from "../context/CategoryContext"
import { PricingRules } from "../components/pricing/PricingRules"

export function PricingPage() {
  const { products } = useProducts()
  const [selectedTab, setSelectedTab] = useState("dashboard")
  const [showPriceRulesDialog, setShowPriceRulesDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  // Mock data - replace with real data from your backend
  const mockPriceHistory: PriceHistory[] = []
  const mockSpecialPrices: SpecialPrice[] = []
  const mockCustomerGroups: CustomerGroup[] = []

  return (
    <div className="p-0 m-0 border-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full px-4 py-2 flex items-center justify-between bg-zinc-900/95 backdrop-blur-sm overflow-hidden"
      >
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center shrink-0"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPriceRulesDialog(true)}
              className="text-zinc-100 hover:text-white hover:bg-white/10"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Price Rules
            </Button>
          </motion.div>

          <Separator orientation="vertical" className="h-8 bg-zinc-700/50 mx-2 shrink-0" />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center shrink-0"
          >
            <CategoryProvider>
              <BulkSpecialPriceForm
                onSpecialPricesAdded={(prices) => {
                  // Handle added prices
                  console.log('Added prices:', prices)
                }}
                defaultSelectionType="individual"
                buttonProps={{
                  variant: "ghost",
                  size: "sm",
                  className: "text-zinc-100 hover:text-white hover:bg-white/10",
                  children: (
                    <>
                      <Tag className="h-4 w-4 mr-2" />
                      Add Special Price
                    </>
                  ),
                }}
              />
            </CategoryProvider>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImportDialog(true)}
              className="text-zinc-100 hover:text-white hover:bg-white/10"
            >
              <FileUp className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExportDialog(true)}
              className="text-zinc-100 hover:text-white hover:bg-white/10"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6 mt-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="price-history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Price History
          </TabsTrigger>
          <TabsTrigger value="special" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Special Prices
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Price Rules
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Groups
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Product Prices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Product Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$24.99</div>
                <p className="text-xs text-muted-foreground">
                  Across {products.length} products
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Price Changes (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  In the last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Special Prices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Products Below Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">3</div>
                <p className="text-xs text-muted-foreground">Needs attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Price Trend</CardTitle>
                <CardDescription>Average product price over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {/* <PriceTrendChart data={priceTrendData} /> */}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest price changes and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 text-sm"
                    >
                      <activity.icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p>{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))} */}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="price-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>View the history of price changes for all products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <DataTable
                  data={mockPriceHistory}
                  columns={[
                    {
                      id: "select",
                      header: ({ table }) => (
                        <Checkbox
                          checked={table.getIsAllPageRowsSelected()}
                          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                          aria-label="Select all"
                          className="translate-y-[2px]"
                        />
                      ),
                      cell: ({ row }) => (
                        <Checkbox
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) => row.toggleSelected(!!value)}
                          aria-label="Select row"
                          className="translate-y-[2px]"
                        />
                      ),
                      enableSorting: false,
                      enableHiding: false,
                    },
                    {
                      accessorKey: "name",
                      header: ({ column }) => (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                          >
                            Product
                            {column.getIsSorted() === "asc" ? (
                              <ChevronUp className="ml-2 h-4 w-4" />
                            ) : column.getIsSorted() === "desc" ? (
                              <ChevronDown className="ml-2 h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="ml-2 h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ),
                      cell: ({ row }) => (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{row.getValue("name")}</span>
                        </div>
                      ),
                    },
                    {
                      accessorKey: "sku",
                      header: ({ column }) => (
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                          >
                            SKU
                            {column.getIsSorted() === "asc" ? (
                              <ChevronUp className="ml-2 h-4 w-4" />
                            ) : column.getIsSorted() === "desc" ? (
                              <ChevronDown className="ml-2 h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="ml-2 h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ),
                      cell: ({ row }) => (
                        <div className="flex items-center">
                          <span className="text-muted-foreground">{row.getValue("sku")}</span>
                        </div>
                      ),
                    },
                    {
                      accessorKey: "price",
                      header: ({ column }) => (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                          >
                            Base Price
                            {column.getIsSorted() === "asc" ? (
                              <ChevronUp className="ml-2 h-4 w-4" />
                            ) : column.getIsSorted() === "desc" ? (
                              <ChevronDown className="ml-2 h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="ml-2 h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ),
                      cell: ({ row }) => {
                        const price = parseFloat(row.getValue("price"))
                        const formatted = new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(price)
                        return (
                          <div className="font-medium tabular-nums">{formatted}</div>
                        )
                      },
                    },
                    {
                      accessorKey: "category",
                      header: ({ column }) => (
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                          >
                            Category
                            {column.getIsSorted() === "asc" ? (
                              <ChevronUp className="ml-2 h-4 w-4" />
                            ) : column.getIsSorted() === "desc" ? (
                              <ChevronDown className="ml-2 h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="ml-2 h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ),
                      cell: ({ row }) => (
                        <div className="flex items-center">
                          <span className="text-muted-foreground">{row.getValue("category")}</span>
                        </div>
                      ),
                    },
                  ]}
                  enableRowSelection
                  className="[&_[role=cell]]:py-3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <SpecialPrices />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <PricingRules />
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Customer Groups</CardTitle>
              <CardDescription>View and manage customer groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <DataTable
                  data={mockCustomerGroups}
                  columns={[
                    {
                      id: "select",
                      header: ({ table }) => (
                        <Checkbox
                          checked={table.getIsAllPageRowsSelected()}
                          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                          aria-label="Select all"
                          className="translate-y-[2px]"
                        />
                      ),
                      cell: ({ row }) => (
                        <Checkbox
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) => row.toggleSelected(!!value)}
                          aria-label="Select row"
                          className="translate-y-[2px]"
                        />
                      ),
                      enableSorting: false,
                      enableHiding: false,
                    },
                    {
                      accessorKey: "name",
                      header: ({ column }) => (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                          >
                            Group Name
                            {column.getIsSorted() === "asc" ? (
                              <ChevronUp className="ml-2 h-4 w-4" />
                            ) : column.getIsSorted() === "desc" ? (
                              <ChevronDown className="ml-2 h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="ml-2 h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ),
                      cell: ({ row }) => (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{row.getValue("name")}</span>
                        </div>
                      ),
                    },
                    {
                      accessorKey: "description",
                      header: ({ column }) => (
                        <div className="flex items-center gap-2">
                          <Tags className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                          >
                            Description
                            {column.getIsSorted() === "asc" ? (
                              <ChevronUp className="ml-2 h-4 w-4" />
                            ) : column.getIsSorted() === "desc" ? (
                              <ChevronDown className="ml-2 h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="ml-2 h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ),
                      cell: ({ row }) => (
                        <div className="flex items-center">
                          <span className="text-muted-foreground">{row.getValue("description")}</span>
                        </div>
                      ),
                    },
                  ]}
                  enableRowSelection
                  className="[&_[role=cell]]:py-3"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="outline" size="sm" className="h-8">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Prices
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search products..."
                  className="h-8 w-[200px]"
                />
              </div>
            </div>

            <Card className="border-none shadow-none">
              <CardContent className="p-0">
                <div className="relative w-full overflow-auto">
                  <DataTable
                    data={products}
                    columns={[
                      {
                        id: "select",
                        header: ({ table }) => (
                          <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                            aria-label="Select all"
                            className="translate-y-[2px]"
                          />
                        ),
                        cell: ({ row }) => (
                          <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                            className="translate-y-[2px]"
                          />
                        ),
                        enableSorting: false,
                        enableHiding: false,
                      },
                      {
                        accessorKey: "name",
                        header: ({ column }) => (
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="-ml-3 h-8 data-[state=open]:bg-accent"
                              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            >
                              Product
                              {column.getIsSorted() === "asc" ? (
                                <ChevronUp className="ml-2 h-4 w-4" />
                              ) : column.getIsSorted() === "desc" ? (
                                <ChevronDown className="ml-2 h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ),
                        cell: ({ row }) => (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{row.getValue("name")}</span>
                          </div>
                        ),
                      },
                      {
                        accessorKey: "sku",
                        header: ({ column }) => (
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="-ml-3 h-8 data-[state=open]:bg-accent"
                              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            >
                              SKU
                              {column.getIsSorted() === "asc" ? (
                                <ChevronUp className="ml-2 h-4 w-4" />
                              ) : column.getIsSorted() === "desc" ? (
                                <ChevronDown className="ml-2 h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ),
                        cell: ({ row }) => (
                          <div className="flex items-center">
                            <span className="text-muted-foreground">{row.getValue("sku")}</span>
                          </div>
                        ),
                      },
                      {
                        accessorKey: "price",
                        header: ({ column }) => (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="-ml-3 h-8 data-[state=open]:bg-accent"
                              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            >
                              Base Price
                              {column.getIsSorted() === "asc" ? (
                                <ChevronUp className="ml-2 h-4 w-4" />
                              ) : column.getIsSorted() === "desc" ? (
                                <ChevronDown className="ml-2 h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ),
                        cell: ({ row }) => {
                          const price = parseFloat(row.getValue("price"))
                          const formatted = new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(price)
                          return (
                            <div className="font-medium tabular-nums">{formatted}</div>
                          )
                        },
                      },
                      {
                        accessorKey: "category",
                        header: ({ column }) => (
                          <div className="flex items-center gap-2">
                            <FolderTree className="h-4 w-4 text-muted-foreground" />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="-ml-3 h-8 data-[state=open]:bg-accent"
                              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            >
                              Category
                              {column.getIsSorted() === "asc" ? (
                                <ChevronUp className="ml-2 h-4 w-4" />
                              ) : column.getIsSorted() === "desc" ? (
                                <ChevronDown className="ml-2 h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="ml-2 h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ),
                        cell: ({ row }) => (
                          <div className="flex items-center">
                            <span className="text-muted-foreground">{row.getValue("category")}</span>
                          </div>
                        ),
                      },
                    ]}
                    enableRowSelection
                    className="[&_[role=cell]]:py-3"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <PriceRulesDialog
        open={showPriceRulesDialog}
        onOpenChange={setShowPriceRulesDialog}
      />
      <ImportPricesDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
      <ExportPricesDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
      />
    </div>
  )
}
