import { useState } from 'react'
import { 
  Eye, 
  Printer, 
  FileDown, 
  Trash2, 
  Receipt,
  ShoppingCart,
  Calendar,
  User,
  CreditCard,
  Wallet,
  Smartphone,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Package,
  UserCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FileText,
  Hash,
  Info,
  Barcode,
  ShoppingBag,
  Percent
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { SalesToolbar } from '../components/toolbars/SalesToolbar'
import { Button } from '@/components/ui/button'
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// Mock data for sales
const mockSales = Array.from({ length: 20 }, (_, i) => ({
  id: `SALE-${1000 + i}`,
  invoiceNo: `INV-${2024}${String(i + 1).padStart(4, '0')}`,
  date: new Date(2025, 2, 1 - i),
  customer: i % 3 === 0 ? null : `Customer ${i + 1}`,
  total: Math.round((50 + Math.random() * 200) * 100) / 100,
  items: Math.floor(Math.random() * 10) + 1,
  status: ['completed', 'pending', 'cancelled'][i % 3] as 'completed' | 'pending' | 'cancelled',
  employee: `Employee ${(i % 5) + 1}`,
  location: ['Main Store', 'Branch A', 'Branch B', 'Branch C'][i % 4],
  addedBy: `User ${(i % 3) + 1}`,
  note: i % 2 === 0 ? `Sample note for sale ${i + 1}` : null,
  paymentStatus: ['paid', 'partial', 'unpaid'][i % 3] as 'paid' | 'partial' | 'unpaid',
  paymentMethod: ['cash', 'card', 'multiple'][i % 3] as 'cash' | 'card' | 'multiple',
  totalPaid: (amount => amount > 0 ? amount : 0)(
    Math.round((50 + Math.random() * 200) * 100) / 100
  )
}))

interface SaleFilter {
  search: string
  status: string | null
  startDate: Date | null
  endDate: Date | null
}

// Add sort configuration type
interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

// Add columns definition
const columns = [
  { 
    id: 'invoiceNo', 
    label: 'Invoice No.',
    icon: Receipt
  },
  { 
    id: 'date', 
    label: 'Date',
    icon: Calendar
  },
  { 
    id: 'customer', 
    label: 'Customer',
    icon: User
  },
  { 
    id: 'location', 
    label: 'Location',
    icon: ShoppingCart
  },
  { 
    id: 'items', 
    label: 'Items',
    icon: Package
  },
  { 
    id: 'total', 
    label: 'Total',
    icon: DollarSign
  },
  { 
    id: 'totalPaid', 
    label: 'Paid',
    icon: DollarSign
  },
  { 
    id: 'paymentMethod', 
    label: 'Payment Method',
    icon: CreditCard
  },
  { 
    id: 'paymentStatus', 
    label: 'Payment Status',
    icon: CheckCircle
  },
  { 
    id: 'status', 
    label: 'Status',
    icon: CheckCircle
  }
]

// Add mock data for charts
const salesChartData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  amount: Math.round(Math.random() * 1000) + 500
}))

const transactionsChartData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  count: Math.floor(Math.random() * 20) + 5
}))

const averageSaleChartData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  average: Math.round((Math.random() * 50) + 25)
}))

export function SalesPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [selectedSales, setSelectedSales] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [filters, setFilters] = useState<SaleFilter>({
    search: '',
    status: null,
    startDate: null,
    endDate: null
  })
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [viewSale, setViewSale] = useState<typeof mockSales[0] | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const handleRefresh = () => {
    toast({
      title: 'Refreshing sales data',
      description: 'The sales list has been updated.'
    })
  }

  const handleFilter = () => {
    setShowFilterDialog(true)
  }

  const handleExport = () => {
    toast({
      title: 'Exporting sales data',
      description: 'Your export will be ready shortly.'
    })
  }

  const handlePrint = () => {
    toast({
      title: 'Printing sales report',
      description: 'Sending sales report to printer.'
    })
  }

  const handleNewSale = () => {
    navigate('/sales/new')
  }

  const handleSearch = (query: string) => {
    setFilters({
      ...filters,
      search: query
    })
  }

  const handleViewSale = (sale: typeof mockSales[0]) => {
    setViewSale(sale)
  }

  const handleDeleteSale = (id: string) => {
    toast({
      title: 'Sale deleted',
      description: `Sale ${id} has been deleted.`
    })
  }

  const handleSort = (column: string) => {
    setSortConfig(current => {
      if (current?.column === column) {
        return {
          column,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      return {
        column,
        direction: 'asc'
      }
    })
  }

  const filteredSales = mockSales.filter(sale => {
    if (filters.search && !sale.id.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.status && sale.status !== filters.status) {
      return false
    }
    if (filters.startDate && sale.date < filters.startDate) {
      return false
    }
    if (filters.endDate && sale.date > filters.endDate) {
      return false
    }
    return true
  })

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (!sortConfig) return 0
    
    const aValue = a[sortConfig.column as keyof typeof a]
    const bValue = b[sortConfig.column as keyof typeof b]
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  // Add pagination calculation
  const totalPages = Math.ceil(sortedSales.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSales = sortedSales.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-6">
      <SalesToolbar
        onRefresh={handleRefresh}
        onFilter={handleFilter}
        onExport={handleExport}
        onPrint={handlePrint}
        onNewSale={handleNewSale}
        onSearch={handleSearch}
        onViewDetails={() => {
          // Get the selected sale
          const selectedSale = sortedSales.find(sale => selectedSales.includes(sale.id))
          if (selectedSale) {
            handleViewSale(selectedSale)
          }
        }}
        onDelete={() => {
          // Delete all selected sales
          selectedSales.forEach(id => handleDeleteSale(id))
          setSelectedSales([])
        }}
        selectedCount={selectedSales.length}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CardDescription>Current month</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  ${mockSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Area Chart for Total Sales */}
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesChartData}
                  margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide={true} />
                  <YAxis hide={true} />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Sales']}
                    labelFormatter={(label) => `Day ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderRadius: '6px',
                      fontSize: '12px',
                      padding: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#salesGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CardDescription>Current month</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{mockSales.length}</div>
                <p className="text-xs text-muted-foreground">
                  +8.2% from last month
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Bar Chart for Transactions */}
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transactionsChartData}
                  margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="day" hide={true} />
                  <YAxis hide={true} />
                  <Tooltip
                    formatter={(value) => [`${value}`, 'Transactions']}
                    labelFormatter={(label) => `Day ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderRadius: '6px',
                      fontSize: '12px',
                      padding: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <CardDescription>Current month</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  ${(mockSales.reduce((sum, sale) => sum + sale.total, 0) / mockSales.length).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Line Chart for Average Sale */}
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={averageSaleChartData}
                  margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="day" hide={true} />
                  <YAxis hide={true} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, 'Average']}
                    labelFormatter={(label) => `Day ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderRadius: '6px',
                      fontSize: '12px',
                      padding: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="average" 
                    stroke="#f43f5e" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none border-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px] p-3">
                  <div className="flex items-center justify-center">
                  <Checkbox
                    checked={selectedSales.length === filteredSales.length && filteredSales.length > 0}
                    onCheckedChange={() => {
                      setSelectedSales(
                        selectedSales.length === filteredSales.length
                          ? []
                          : filteredSales.map(sale => sale.id)
                      )
                    }}
                    aria-label="Select all sales"
                  />
                  </div>
                </TableHead>
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      "h-12 px-4 cursor-pointer hover:bg-muted/50",
                      column.id === 'invoiceNo' && "w-[160px]",
                      column.id === 'date' && "w-[160px]",
                      column.id === 'customer' && "w-[180px]",
                      column.id === 'location' && "w-[140px]",
                      column.id === 'items' && "w-[100px]",
                      column.id === 'total' && "w-[120px]",
                      column.id === 'totalPaid' && "w-[120px]",
                      column.id === 'paymentMethod' && "w-[140px]",
                      column.id === 'paymentStatus' && "w-[140px]",
                      column.id === 'status' && "w-[120px]"
                    )}
                    onClick={() => handleSort(column.id)}
                  >
                    <div className="flex items-center gap-2">
                      <column.icon className="h-4 w-4" />
                      <span>{column.label}</span>
                      <div className="w-4">
                        {sortConfig?.column === column.id ? (
                          sortConfig.direction === 'desc' ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 opacity-30" />
                        )}
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSales.map((sale) => (
                <TableRow 
                  key={sale.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/50 cursor-pointer",
                    selectedSales.includes(sale.id) && "bg-muted"
                  )}
                  onClick={(e) => {
                    // Prevent double click from triggering both handlers
                    if (e.detail === 1) {
                    setSelectedSales(current =>
                      current.includes(sale.id)
                        ? current.filter(id => id !== sale.id)
                        : [...current, sale.id]
                    )
                    }
                  }}
                  onDoubleClick={() => handleViewSale(sale)}
                >
                  <TableCell className="w-[50px] p-3">
                    <div className="flex items-center justify-center">
                    <Checkbox
                      checked={selectedSales.includes(sale.id)}
                      onCheckedChange={() => {
                        setSelectedSales(current =>
                          current.includes(sale.id)
                            ? current.filter(id => id !== sale.id)
                            : [...current, sale.id]
                        )
                      }}
                      aria-label={`Select sale ${sale.id}`}
                    />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">{sale.invoiceNo}</TableCell>
                  <TableCell className="px-4 py-3">{format(sale.date, 'PPP')}</TableCell>
                  <TableCell className="px-4 py-3">{sale.customer || 'Walk-in'}</TableCell>
                  <TableCell className="px-4 py-3">{sale.location}</TableCell>
                  <TableCell className="px-4 py-3">{sale.items}</TableCell>
                  <TableCell className="px-4 py-3">${sale.total.toFixed(2)}</TableCell>
                  <TableCell className="px-4 py-3">${sale.totalPaid.toFixed(2)}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {sale.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge 
                      variant={
                        sale.paymentStatus === 'paid' ? 'default' : 
                        sale.paymentStatus === 'partial' ? 'secondary' : 'destructive'
                      }
                    >
                      {sale.paymentStatus.charAt(0).toUpperCase() + sale.paymentStatus.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge 
                      variant={
                        sale.status === 'completed' ? 'default' : 
                        sale.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Add pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedSales.length)} of {sortedSales.length} entries
            </div>
            <div className="flex items-center space-x-2">
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

      {/* Sale Details Dialog */}
      {viewSale && (
        <Dialog open={!!viewSale} onOpenChange={(open) => !open && setViewSale(null)}>
          <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/50 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 dark:[&::-webkit-scrollbar-track]:bg-muted/30 dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 dark:hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold">Sale Details</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Invoice No: {viewSale.invoiceNo}
                  </p>
                </div>
                <Badge 
                  variant={
                    viewSale.status === 'completed' ? 'default' : 
                    viewSale.status === 'pending' ? 'secondary' : 'destructive'
                  }
                  className="text-sm px-3 py-1"
                >
                  {viewSale.status.charAt(0).toUpperCase() + viewSale.status.slice(1)}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Header Info Grid */}
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                    <p className="text-base font-semibold mt-1">
                      {format(viewSale.date, 'PPP')}
                  </p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer</p>
                    <p className="text-base font-semibold mt-1">
                    {viewSale.customer || 'Walk-in'}
                  </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-base font-semibold mt-1">
                      {viewSale.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Employee</p>
                    <p className="text-base font-semibold mt-1">
                      {viewSale.employee}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Added By</p>
                    <p className="text-base font-semibold mt-1">
                      {viewSale.addedBy}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                    <Badge variant="outline" className="capitalize mt-2">
                      {viewSale.paymentMethod}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Payment Status Card */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                  <Badge 
                    variant={
                      viewSale.paymentStatus === 'paid' ? 'default' : 
                      viewSale.paymentStatus === 'partial' ? 'secondary' : 'destructive'
                    }
                    className="mt-2"
                  >
                    {viewSale.paymentStatus.charAt(0).toUpperCase() + viewSale.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold mt-1">
                    ${viewSale.total.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                  <p className="text-xl font-bold mt-1">
                    ${viewSale.totalPaid.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Balance</p>
                  <p className="text-xl font-bold mt-1">
                    ${(viewSale.total - viewSale.totalPaid).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Notes Section */}
              {viewSale.note && (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  </div>
                  <p className="text-sm mt-1">
                    {viewSale.note}
                  </p>
                </div>
              )}

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Items</h3>
                  </div>
                  <Badge variant="outline">
                    Total Items: {viewSale.items}
                  </Badge>
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[60px] text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span>No.</span>
                          </div>
                        </TableHead>
                        <TableHead className="w-[200px]">
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            <span>Product</span>
                          </div>
                        </TableHead>
                        <TableHead className="w-[120px]">
                          <div className="flex items-center gap-1">
                            <Barcode className="h-4 w-4 text-muted-foreground" />
                            <span>SKU</span>
                          </div>
                        </TableHead>
                        <TableHead className="w-[100px] text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>Qty</span>
                          </div>
                        </TableHead>
                        <TableHead className="w-[120px] text-right">
                          <div className="flex items-center justify-end gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>Price</span>
                          </div>
                        </TableHead>
                        <TableHead className="w-[120px] text-right">
                          <div className="flex items-center justify-end gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>Total</span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: viewSale.items }, (_, i) => ({
                        name: `Product ${i + 1}`,
                        sku: `SKU-${1000 + i}`,
                        qty: Math.floor(Math.random() * 5) + 1,
                        price: Math.round((10 + Math.random() * 50) * 100) / 100
                      })).map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-center font-medium">
                            <div className="flex items-center justify-center gap-1">
                              <Hash className="h-4 w-4 text-muted-foreground" />
                              <span>{i + 1}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">{item.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Barcode className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm">{item.sku}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            <div className="flex items-center justify-center gap-1">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>{item.qty}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>${item.price.toFixed(2)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <div className="flex items-center justify-end gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>${(item.qty * item.price).toFixed(2)}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[60px]"></TableHead>
                        <TableHead className="w-[200px]"></TableHead>
                        <TableHead className="w-[120px]"></TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                        <TableHead className="w-[120px] text-right">
                          <div className="space-y-1">
                            <div className="flex items-center justify-end gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm">Subtotal</p>
                            </div>
                            <div className="flex items-center justify-end gap-1">
                              <Percent className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm">Tax (0%)</p>
                            </div>
                            <div className="flex items-center justify-end gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <p className="text-base font-semibold">Total</p>
                            </div>
                          </div>
                        </TableHead>
                        <TableHead className="w-[120px] text-right">
                          <div className="space-y-1">
                            <p className="text-sm">${viewSale.total.toFixed(2)}</p>
                            <p className="text-sm">$0.00</p>
                            <p className="text-base font-semibold">${viewSale.total.toFixed(2)}</p>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>
              </div>
                </div>

            {/* Actions */}
            <div className="sticky bottom-0 left-0 right-0 flex justify-end gap-3 pt-4 mt-6 border-t bg-background">
              <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                Print Invoice
                  </Button>
              <Button variant="default">
                    <Receipt className="h-4 w-4 mr-2" />
                Download Receipt
                  </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
