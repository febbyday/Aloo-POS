import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RotateCcw,
  Search,
  Filter,
  Plus,
  FileDown,
  RefreshCw,
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  ArrowLeft,
  Separator,
  ArrowLeftRight,
  History,
  CreditCard,
  DollarSign,
  Package,
  User,
  Calendar,
  CheckCircle,
  Receipt,
  Printer,
  Eye,
  FileText,
  Hash,
  ShoppingBag,
  Barcode,
  Info,
  Percent
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { ReturnsToolbar } from '../components/toolbars'
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock data for returns
const mockReturns = Array.from({ length: 10 }, (_, i) => ({
  id: `RET-${1000 + i}`,
  saleId: `SALE-${2000 + i}`,
  date: new Date(2024, 2, 1 - i),
  customer: `Customer ${i + 1}`,
  items: Math.floor(Math.random() * 5) + 1,
  total: Math.round((20 + Math.random() * 100) * 100) / 100,
  reason: ['Defective', 'Wrong Item', 'Changed Mind'][i % 3],
  status: ['pending', 'approved', 'rejected'][i % 3],
  processedBy: `Staff ${(i % 3) + 1}`
}))

// Add mock data for charts
const returnsChartData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  amount: Math.round(Math.random() * 200) + 50,
  count: Math.floor(Math.random() * 5) + 1
}))

const reasonsChartData = [
  { name: 'Defective', value: 35 },
  { name: 'Wrong Item', value: 25 },
  { name: 'Changed Mind', value: 20 },
  { name: 'Size Issue', value: 15 },
  { name: 'Other', value: 5 }
]

const statusChartData = [
  { name: 'Pending', value: 40 },
  { name: 'Approved', value: 45 },
  { name: 'Rejected', value: 15 }
]

const CHART_COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  pending: '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444'
}

const PIE_COLORS = ['#2563eb', '#64748b', '#22c55e', '#f59e0b', '#ef4444']

interface SortConfig {
  column: string
  direction: 'asc' | 'desc'
}

// Define columns for the table
const columns = [
  {
    id: 'id',
    label: 'Return ID',
    icon: Receipt
  },
  {
    id: 'saleId',
    label: 'Sale ID',
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
    id: 'reason',
    label: 'Reason',
    icon: CheckCircle
  },
  {
    id: 'status',
    label: 'Status',
    icon: CheckCircle
  },
  {
    id: 'processedBy',
    label: 'Processed By',
    icon: User
  }
]

// Mock data for return items
const getMockReturnItems = (returnId: string) => Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
  id: `${returnId}-ITEM-${i + 1}`,
  name: `Product ${i + 1}`,
  sku: `SKU-${1000 + i}`,
  quantity: Math.floor(Math.random() * 3) + 1,
  price: Math.round((10 + Math.random() * 50) * 100) / 100,
  reason: ['Defective', 'Wrong Item', 'Changed Mind'][i % 3],
  condition: ['New', 'Used', 'Damaged'][i % 3]
}))

export function ReturnsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [selectedReturns, setSelectedReturns] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [viewReturn, setViewReturn] = useState<(typeof mockReturns)[0] | null>(null)
  const [returnItems, setReturnItems] = useState<ReturnType<typeof getMockReturnItems>>([])

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

  const filteredReturns = mockReturns.filter(ret => {
    if (searchQuery && !ret.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (statusFilter !== 'all' && ret.status !== statusFilter) {
      return false
    }
    return true
  })

  const sortedReturns = [...filteredReturns].sort((a, b) => {
    if (!sortConfig) return 0

    const aValue = a[sortConfig.column as keyof typeof a]
    const bValue = b[sortConfig.column as keyof typeof b]

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedReturns = sortedReturns.slice(startIndex, startIndex + itemsPerPage)

  const handleViewReturn = (ret: typeof mockReturns[0]) => {
    // Navigate to the return details page
    navigate(`/sales/returns/${ret.id.split('-')[1]}`)
  }

  return (
    <div className="space-y-6">
      <ReturnsToolbar
        onRefresh={() => {
          toast({
            title: "Refreshing data",
            description: "Returns list has been updated"
          })
        }}
        onFilter={() => {}}
        onExport={() => {}}
        onNewReturn={() => navigate('process')}
        onViewHistory={() => navigate('history')}
        onManageRefunds={() => navigate('refunds')}
        onSearch={(query) => setSearchQuery(query)}
      />

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                <CardDescription>Current month</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  ${mockReturns.reduce((sum, ret) => sum + ret.total, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mockReturns.length} returns
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={returnsChartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={CHART_COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
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
                <CardTitle className="text-sm font-medium">Return Reasons</CardTitle>
                <CardDescription>Distribution</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reasonsChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {reasonsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-sm font-medium">Return Status</CardTitle>
                <CardDescription>Current distribution</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === 'Pending' ? CHART_COLORS.pending :
                          entry.name === 'Approved' ? CHART_COLORS.approved :
                          CHART_COLORS.rejected
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Returns Table */}
      <Card className="shadow-none border-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px] p-3">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={selectedReturns.length === paginatedReturns.length}
                      onCheckedChange={(checked) => {
                        setSelectedReturns(
                          checked ? paginatedReturns.map(r => r.id) : []
                        )
                      }}
                      aria-label="Select all returns"
                    />
                  </div>
                </TableHead>
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      "h-12 px-4 cursor-pointer hover:bg-muted/50",
                      column.id === 'id' && "w-[120px]",
                      column.id === 'saleId' && "w-[120px]",
                      column.id === 'date' && "w-[150px]",
                      column.id === 'customer' && "w-[180px]",
                      column.id === 'items' && "w-[100px]",
                      column.id === 'total' && "w-[120px]",
                      column.id === 'reason' && "w-[150px]",
                      column.id === 'status' && "w-[120px]",
                      column.id === 'processedBy' && "w-[150px]"
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
              {paginatedReturns.map((ret) => (
                <TableRow
                  key={ret.id}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-muted/50 cursor-pointer",
                    selectedReturns.includes(ret.id) && "bg-muted"
                  )}
                  onClick={(e) => {
                    if (e.detail === 1) {
                      setSelectedReturns(current =>
                        current.includes(ret.id)
                          ? current.filter(id => id !== ret.id)
                          : [...current, ret.id]
                      )
                    }
                  }}
                  onDoubleClick={() => handleViewReturn(ret)}
                >
                  <TableCell className="w-[50px] p-3">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedReturns.includes(ret.id)}
                        onCheckedChange={() => {
                          setSelectedReturns(current =>
                            current.includes(ret.id)
                              ? current.filter(id => id !== ret.id)
                              : [...current, ret.id]
                          )
                        }}
                        aria-label={`Select return ${ret.id}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium">{ret.id}</TableCell>
                  <TableCell className="px-4 py-3">{ret.saleId}</TableCell>
                  <TableCell className="px-4 py-3">{format(ret.date, 'PPP')}</TableCell>
                  <TableCell className="px-4 py-3">{ret.customer}</TableCell>
                  <TableCell className="px-4 py-3">{ret.items}</TableCell>
                  <TableCell className="px-4 py-3">${ret.total.toFixed(2)}</TableCell>
                  <TableCell className="px-4 py-3">{ret.reason}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant={
                        ret.status === 'approved' ? 'default' :
                        ret.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">{ret.processedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedReturns.length)} of {sortedReturns.length} entries
            </div>
            <div className="flex items-center space-x-2">
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
                disabled={startIndex + itemsPerPage >= sortedReturns.length}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Details Dialog */}
      {viewReturn && (
        <Dialog open={!!viewReturn} onOpenChange={(open) => !open && setViewReturn(null)}>
          <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/50 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
            {/* Header Section */}
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <DialogTitle className="text-2xl font-bold">Return #{viewReturn.id.split('-')[1]}</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(viewReturn.date, 'PPP')}
                    </p>
                  </div>
                  <div className="h-10 w-[1px] bg-border mx-2" />
                  <div>
                    <p className="text-sm font-medium">Original Sale</p>
                    <p className="text-base font-semibold mt-1 flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      {viewReturn.saleId}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={
                      viewReturn.status === 'approved' ? 'default' :
                      viewReturn.status === 'pending' ? 'secondary' : 'destructive'
                    }
                    className="text-sm px-3 py-1"
                  >
                    {viewReturn.status.charAt(0).toUpperCase() + viewReturn.status.slice(1)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Processed by {viewReturn.processedBy}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{viewReturn.customer}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Items Returned
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{viewReturn.items}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Return Reason
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="mt-1">
                      {viewReturn.reason}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total Refund
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">${viewReturn.total.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Return Items Table */}
              <div className="rounded-lg border">
                <div className="bg-muted/50 px-4 py-3 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Returned Items
                  </h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[300px]">Product Details</TableHead>
                      <TableHead className="w-[100px] text-center">Quantity</TableHead>
                      <TableHead className="w-[150px] text-right">Unit Price</TableHead>
                      <TableHead className="w-[150px] text-right">Total</TableHead>
                      <TableHead>Return Information</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnItems.map((item, i) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">
                              SKU: {item.sku}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${(item.quantity * item.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {item.reason}
                            </Badge>
                            <span className="text-muted-foreground">•</span>
                            <Badge variant="secondary">
                              {item.condition}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="bg-muted/50 p-4 border-t">
                  <div className="flex justify-end">
                    <div className="w-[300px] space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>${viewReturn.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (Refunded):</span>
                        <span>$0.00</span>
                      </div>
                      <div className="h-[1px] bg-border my-2" />
                      <div className="flex justify-between font-medium">
                        <span>Total Refund:</span>
                        <span>${viewReturn.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="sticky bottom-0 left-0 right-0 flex justify-between gap-3 pt-4 mt-6 border-t bg-background">
                <div className="text-sm text-muted-foreground">
                  Double-click on any item to view detailed history
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Return
                  </Button>
                  <Button variant="default">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Report
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