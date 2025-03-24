import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertTriangle, Search, Package, Barcode, Hash, 
  CircleDot, FolderClosed, AlertCircle, History 
} from "lucide-react"
import { ProductsToolbar } from '../components/ProductsToolbar'
import { useToast } from '@/components/ui/use-toast'
import { StockAlert } from '../services/stockAlerts'
import { useStockAlerts } from '../hooks/useStockAlerts'

export function LowStockAlertsPage() {
  const { toast } = useToast()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'warning'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const { 
    alerts, 
    loading, 
    error,
    totalCount,
    criticalCount,
    warningCount,
    fetchAlerts,
    createRestockOrder 
  } = useStockAlerts()

  useEffect(() => {
    fetchAlerts({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      status: statusFilter === 'all' ? undefined : statusFilter,
      category: categoryFilter === 'all' ? undefined : categoryFilter
    })
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, categoryFilter])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(alerts.map(item => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedItems(newSelected)
  }

  const handleRestock = async () => {
    if (selectedItems.size === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to restock",
        variant: "destructive"
      })
      return
    }

    try {
      await createRestockOrder(Array.from(selectedItems))
      toast({
        title: "Restock order created",
        description: `Created restock order for ${selectedItems.size} items`
      })
      setSelectedItems(new Set())
      fetchAlerts()
    } catch (err) {
      toast({
        title: "Error creating restock order",
        description: "Please try again later",
        variant: "destructive"
      })
    }
  }

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: AlertTriangle,
          label: "Restock Selected",
          onClick: handleRestock,
          disabled: selectedItems.size === 0
        }
      ]
    }
    // ... other toolbar groups
  ]

  if (error) {
    return (
      <div className="p-4 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h2 className="text-lg font-semibold">Error loading stock alerts</h2>
        <p className="text-muted-foreground">Please try again later</p>
        <Button onClick={() => fetchAlerts()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ProductsToolbar 
        groups={toolbarGroups} 
        rightContent={
          <div className="flex gap-2">
            <Badge variant="destructive">
              {criticalCount} Critical
            </Badge>
            <Badge variant="warning">
              {warningCount} Warning
            </Badge>
          </div>
        }
      />
      
      <Card className="border-none">
        <CardContent className="p-0">
          <div className="flex justify-between gap-4 p-4">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select 
                value={statusFilter} 
                onValueChange={(value: 'all' | 'critical' | 'warning') => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-b border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px] h-12">
                    <Checkbox 
                      checked={selectedItems.size === alerts.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all items"
                    />
                  </TableHead>
                  <TableHead className="h-12">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Product</span>
                    </div>
                  </TableHead>
                  <TableHead className="h-12">
                    <div className="flex items-center gap-2">
                      <Barcode className="h-4 w-4" />
                      <span>SKU</span>
                    </div>
                  </TableHead>
                  <TableHead className="h-12">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      <span>Current Stock</span>
                    </div>
                  </TableHead>
                  <TableHead className="h-12">
                    <div className="flex items-center gap-2">
                      <CircleDot className="h-4 w-4" />
                      <span>Min Threshold</span>
                    </div>
                  </TableHead>
                  <TableHead className="h-12">
                    <div className="flex items-center gap-2">
                      <FolderClosed className="h-4 w-4" />
                      <span>Category</span>
                    </div>
                  </TableHead>
                  <TableHead className="h-12">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Status</span>
                    </div>
                  </TableHead>
                  <TableHead className="h-12">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      <span>Last Restocked</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-[200px] text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <span className="text-muted-foreground">Loading alerts...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-[200px] text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <span className="text-muted-foreground">No low stock alerts found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((item) => (
                    <TableRow 
                      key={item.id}
                      className="border-b transition-colors hover:bg-muted/5"
                    >
                      <TableCell className="h-[50px] py-3">
                        <Checkbox 
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked)}
                          aria-label={`Select ${item.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium h-[50px] py-3">{item.name}</TableCell>
                      <TableCell className="h-[50px] py-3">{item.sku}</TableCell>
                      <TableCell className="h-[50px] py-3">{item.currentStock}</TableCell>
                      <TableCell className="h-[50px] py-3">{item.minThreshold}</TableCell>
                      <TableCell className="h-[50px] py-3">{item.category}</TableCell>
                      <TableCell className="h-[50px] py-3">
                        <Badge 
                          variant={item.status === 'critical' ? 'destructive' : 'warning'}
                          className="capitalize"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-[50px] py-3">
                        {new Date(item.lastRestocked).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {alerts.length} of {totalCount} items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage * itemsPerPage >= totalCount}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
