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
  Trash2,
  Text,
  Clock,
  Target,
  Hash,
  Activity,
  Settings
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
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

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

// Update mock data for better visualization
const activeDiscountsData = Array.from({ length: 7 }, (_, i) => ({
  name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  active: Math.floor(Math.random() * 10) + 1,
  scheduled: Math.floor(Math.random() * 5)
}))

const savingsData = Array.from({ length: 7 }, (_, i) => ({
  name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  amount: Math.floor(Math.random() * 1000) + 100,
  transactions: Math.floor(Math.random() * 50) + 10
}))

const usageData = Array.from({ length: 7 }, (_, i) => ({
  name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  uses: Math.floor(Math.random() * 100) + 20
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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDiscounts = filteredDiscounts.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-6">
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
            <div className="h-[80px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeDiscountsData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="scheduledGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="url(#activeGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="scheduled"
                    stackId="1"
                    stroke="hsl(var(--secondary))"
                    fill="url(#scheduledGradient)"
                    strokeWidth={2}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="text-xs font-medium">{payload[0].payload.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Active: {payload[0].value}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Scheduled: {payload[1].value}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
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
            <div className="h-[80px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savingsData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 100', 'dataMax + 100']}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--success))"
                    fill="url(#savingsGradient)"
                    strokeWidth={2}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="text-xs font-medium">{payload[0].payload.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Savings: ${payload[0].value}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Transactions: {payload[0].payload.transactions}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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
            <div className="h-[80px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Bar
                    dataKey="uses"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="text-xs font-medium">{payload[0].payload.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Uses: {payload[0].value}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none border-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Text className="h-4 w-4 text-muted-foreground" />
                    <span>Name</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span>Type</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span>Value</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Period</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>Applicable To</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span>Usage</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Status</span>
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>Actions</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDiscounts.map((discount) => (
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

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDiscounts.length)} of {filteredDiscounts.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
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
