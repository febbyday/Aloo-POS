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
  ChevronsUpDown
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
  date: new Date(2025, 2, 1 - i),
  customer: i % 3 === 0 ? null : `Customer ${i + 1}`,
  total: Math.round((50 + Math.random() * 200) * 100) / 100,
  items: Math.floor(Math.random() * 10) + 1,
  paymentMethod: ['cash', 'card', 'mobile'][i % 3] as 'cash' | 'card' | 'mobile',
  status: ['completed', 'pending', 'cancelled'][i % 3] as 'completed' | 'pending' | 'cancelled',
  employee: `Employee ${(i % 5) + 1}`
}))

interface SaleFilter {
  search: string
  status: string | null
  paymentMethod: string | null
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
    id: 'id', 
    label: 'Reference',
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
    id: 'paymentMethod', 
    label: 'Payment',
    icon: CreditCard
  },
  { 
    id: 'status', 
    label: 'Status',
    icon: CheckCircle
  },
  { 
    id: 'employee', 
    label: 'Employee',
    icon: UserCircle
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

const paymentMethodsData = [
  { name: 'Cash', value: 35, color: '#94A3B8' },
  { name: 'Card', value: 45, color: '#60A5FA' },
  { name: 'Mobile', value: 20, color: '#34D399' }
]

const COLORS = ['#94A3B8', '#60A5FA', '#34D399']

export function SalesPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [selectedSales, setSelectedSales] = useState<string[]>([])
  const [filters, setFilters] = useState<SaleFilter>({
    search: '',
    status: null,
    paymentMethod: null,
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
    if (filters.paymentMethod && sale.paymentMethod !== filters.paymentMethod) {
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

  return (
    <div className="space-y-6">
      <SalesToolbar
        onRefresh={handleRefresh}
        onFilter={handleFilter}
        onExport={handleExport}
        onPrint={handlePrint}
        onNewSale={handleNewSale}
        onSearch={handleSearch}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              +12.5% from last month
            </p>
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
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSales.length}</div>
            <p className="text-xs text-muted-foreground mb-2">
              +8.2% from last month
            </p>
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
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <CardDescription>Current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(mockSales.reduce((sum, sale) => sum + sale.total, 0) / mockSales.length).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              +2.1% from last month
            </p>
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

      {/* Add Payment Methods Distribution Chart */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            <CardDescription>Distribution by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Percentage']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderRadius: '6px',
                      fontSize: '12px',
                      padding: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-2 space-x-4">
              {paymentMethodsData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                  <div 
                    className="w-3 h-3 mr-1 rounded-sm" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sales Trend</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesChartData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="day" 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fontSize: 12 }}
                  />
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
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={{ r: 0 }}
                    activeDot={{ r: 4, fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none border-none">
        <CardContent className="p-0">
          <Table className="[&_td]:p-0 [&_th]:p-0">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px] px-3">
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
                </TableHead>
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className="h-12 px-3 cursor-pointer hover:bg-muted/50"
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
                <TableHead className="w-[100px] px-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSales.map((sale) => (
                <TableRow 
                  key={sale.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/50 cursor-pointer",
                    selectedSales.includes(sale.id) && "bg-muted"
                  )}
                  onClick={() => {
                    setSelectedSales(current =>
                      current.includes(sale.id)
                        ? current.filter(id => id !== sale.id)
                        : [...current, sale.id]
                    )
                  }}
                >
                  <TableCell className="w-[40px] px-3">
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
                  </TableCell>
                  <TableCell className="h-[50px] px-3">
                    <div className="flex items-center">
                      {sale.id}
                    </div>
                  </TableCell>
                  <TableCell className="h-[50px] px-3">
                    <div className="flex items-center">
                      {format(sale.date, 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell className="h-[50px] px-3">
                    <div className="flex items-center">
                      {sale.customer || 'Walk-in'}
                    </div>
                  </TableCell>
                  <TableCell className="h-[50px] px-3">
                    <div className="flex items-center">
                      {sale.items}
                    </div>
                  </TableCell>
                  <TableCell className="h-[50px] px-3">
                    <div className="flex items-center">
                      ${sale.total.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="h-[50px] px-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {sale.paymentMethod === 'cash' ? (
                        <>
                          <Wallet className="h-3 w-3" />
                          Cash
                        </>
                      ) : sale.paymentMethod === 'card' ? (
                        <>
                          <CreditCard className="h-3 w-3" />
                          Card
                        </>
                      ) : (
                        <>
                          <Smartphone className="h-3 w-3" />
                          Mobile
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="h-[50px] px-3">
                    <Badge 
                      variant={
                        sale.status === 'completed' ? 'default' : 
                        sale.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className="flex items-center gap-1"
                    >
                      {sale.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : sale.status === 'pending' ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="h-[50px] px-3">
                    <div className="flex items-center">
                      {sale.employee}
                    </div>
                  </TableCell>
                  <TableCell className="w-[100px] px-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewSale(sale)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.print()}>
                          Print Receipt
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteSale(sale.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sale Details Dialog */}
      {viewSale && (
        <Dialog open={!!viewSale} onOpenChange={(open) => !open && setViewSale(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Sale Details - {viewSale.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(viewSale.date, 'PPP')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">
                    {viewSale.customer || 'Walk-in'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground">
                    {viewSale.paymentMethod.charAt(0).toUpperCase() + viewSale.paymentMethod.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge 
                    variant={
                      viewSale.status === 'completed' ? 'default' : 
                      viewSale.status === 'pending' ? 'secondary' : 'destructive'
                    }
                  >
                    {viewSale.status.charAt(0).toUpperCase() + viewSale.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Items</p>
                <div className="rounded-md border mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: viewSale.items }, (_, i) => ({
                        name: `Product ${i + 1}`,
                        qty: Math.floor(Math.random() * 5) + 1,
                        price: Math.round((10 + Math.random() * 50) * 100) / 100
                      })).map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            ${(item.qty * item.price).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-xl font-bold">${viewSale.total.toFixed(2)}</p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="default" size="sm">
                    <Receipt className="h-4 w-4 mr-2" />
                    Receipt
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
