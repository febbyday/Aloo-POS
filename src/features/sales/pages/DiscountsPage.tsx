import { useState } from 'react'
import { 
  Plus,
  Calendar,
  Percent,
  Tag,
  FileDown,
  Filter,
  Search,
  Edit,
  Trash2
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { DiscountsToolbar } from '../components/toolbars/DiscountsToolbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data for discounts
const mockDiscounts = Array.from({ length: 10 }, (_, i) => ({
  id: `DISC-${1000 + i}`,
  name: `Discount ${i + 1}`,
  type: ['percentage', 'fixed'][i % 2] as 'percentage' | 'fixed',
  value: i % 2 === 0 ? Math.floor(Math.random() * 50) : Math.floor(Math.random() * 100) * 10,
  startDate: new Date(2025, 2, 1),
  endDate: new Date(2025, 3, 1),
  status: ['active', 'scheduled', 'expired'][i % 3] as 'active' | 'scheduled' | 'expired',
  applicableTo: ['all', 'category', 'product'][i % 3] as 'all' | 'category' | 'product',
  target: ['all', 'Electronics', 'Product XYZ'][i % 3],
  usageCount: Math.floor(Math.random() * 100)
}))

interface DiscountFilter {
  search: string
  status: string | null
  type: string | null
}

export function DiscountsPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState<DiscountFilter>({
    search: '',
    status: null,
    type: null
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<typeof mockDiscounts[0] | null>(null)

  const handleRefresh = () => {
    toast({
      title: 'Refreshing discounts',
      description: 'The discounts list has been updated.'
    })
  }

  const handleFilter = () => {
    // Implement filter logic
  }

  const handleExport = () => {
    toast({
      title: 'Exporting discounts',
      description: 'Your export will be ready shortly.'
    })
  }

  const handleAddDiscount = () => {
    setShowAddDialog(true)
  }

  const handleSearch = (query: string) => {
    setFilters({
      ...filters,
      search: query
    })
  }

  const handleEditDiscount = (discount: typeof mockDiscounts[0]) => {
    setSelectedDiscount(discount)
    setShowAddDialog(true)
  }

  const handleDeleteDiscount = (id: string) => {
    toast({
      title: 'Discount deleted',
      description: `Discount ${id} has been deleted.`
    })
  }

  const filteredDiscounts = mockDiscounts.filter(discount => {
    if (filters.search && !discount.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.status && discount.status !== filters.status) {
      return false
    }
    if (filters.type && discount.type !== filters.type) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Discounts</h1>
      </div>

      <DiscountsToolbar
        onRefresh={handleRefresh}
        onFilter={handleFilter}
        onExport={handleExport}
        onAddDiscount={handleAddDiscount}
        onSearch={handleSearch}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
            <CardDescription>Currently running</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDiscounts.filter(d => d.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234.56</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usage Count</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDiscounts.reduce((sum, d) => sum + d.usageCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none border-none">
        <CardHeader className="px-0">
          <CardTitle>All Discounts</CardTitle>
          <CardDescription>
            Manage your discount campaigns and promotions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Applicable To</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDiscounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-medium">{discount.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                  </TableCell>
                  <TableCell>
                    {format(discount.startDate, 'MMM dd')} - {format(discount.endDate, 'MMM dd')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {discount.target}
                    </Badge>
                  </TableCell>
                  <TableCell>{discount.usageCount} uses</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        discount.status === 'active' ? 'default' : 
                        discount.status === 'scheduled' ? 'secondary' : 'destructive'
                      }
                    >
                      {discount.status.charAt(0).toUpperCase() + discount.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditDiscount(discount)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDiscount(discount.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Discount Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDiscount ? 'Edit Discount' : 'Add New Discount'}
            </DialogTitle>
            <DialogDescription>
              Create or modify a discount for your products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="Enter discount name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select defaultValue="percentage">
                <SelectTrigger>
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <Input type="number" placeholder="Enter discount value" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Applicable To</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="product">Specific Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: selectedDiscount ? 'Discount updated' : 'Discount created',
                description: 'The changes have been saved successfully.'
              })
              setShowAddDialog(false)
              setSelectedDiscount(null)
            }}>
              {selectedDiscount ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
