import { useState, useEffect } from 'react'
import {
  Receipt,
  ShoppingCart,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  DollarSign,
  Package,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FileText,
  Hash,
  Barcode,
  ShoppingBag,
  Percent,
  Printer
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/lib/toast'
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
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from '@/lib/utils/cn';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

import { salesService, Sale } from '../services/salesService';

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

// Using Sale type from salesService

export function SalesPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [selectedSales, setSelectedSales] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const [filters, setFilters] = useState<SaleFilter>({
    search: '',
    status: null,
    startDate: null,
    endDate: null
  })
  const [viewSale, setViewSale] = useState<Sale | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // Define default chart data
  const defaultChartData = Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    amount: 0,
    count: 0,
    average: 0
  }))

  const [salesSummary, setSalesSummary] = useState({
    totalSales: 0,
    totalTransactions: 0,
    averageSale: 0,
    salesChartData: defaultChartData,
    transactionsChartData: defaultChartData,
    averageSaleChartData: defaultChartData
  })

  // Fetch sales data from API
  const fetchSalesData = async () => {
    setIsLoading(true);
    try {
      // Fetch sales data using the service
      const [salesData, summaryData] = await Promise.all([
        salesService.fetchAll(),
        salesService.fetchSummary()
      ]);

      // Update state with the fetched data
      setSales(salesData);
      setSalesSummary({
        totalSales: summaryData.totalSales || 0,
        totalTransactions: summaryData.totalTransactions || 0,
        averageSale: summaryData.averageSale || 0,
        salesChartData: Array.isArray(summaryData.salesChartData) && summaryData.salesChartData.length > 0
          ? summaryData.salesChartData
          : defaultChartData,
        transactionsChartData: Array.isArray(summaryData.transactionsChartData) && summaryData.transactionsChartData.length > 0
          ? summaryData.transactionsChartData
          : defaultChartData,
        averageSaleChartData: Array.isArray(summaryData.averageSaleChartData) && summaryData.averageSaleChartData.length > 0
          ? summaryData.averageSaleChartData
          : defaultChartData
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch sales data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Load sales data on component mount
  useEffect(() => {
    fetchSalesData()
  }, [])

  const handleRefresh = () => {
    fetchSalesData()
    toast({
      title: 'Refreshing sales data',
      description: 'The sales list has been updated.'
    })
  }

  const handleFilter = () => {
    // TODO: Implement filter dialog
    toast({
      title: 'Filter',
      description: 'Filter functionality will be implemented soon.',
      variant: 'default'
    })
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

  const handleViewSale = (sale: Sale) => {
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

  const filteredSales = sales.filter(sale => {
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

    // Handle null or undefined values
    if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1
    if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1

    // Handle different types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    // Handle dates
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortConfig.direction === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime()
    }

    // Handle numbers and other types
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
                {isLoading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      ${(salesSummary?.totalSales || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +12.5% from last month
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Area Chart for Total Sales */}
            <div className="h-36">
              {isLoading ? (
                <div className="h-full w-full bg-muted animate-pulse rounded"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesSummary?.salesChartData || defaultChartData}
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
              )}
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
                {isLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{salesSummary?.totalTransactions || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +8.2% from last month
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Bar Chart for Transactions */}
            <div className="h-36">
              {isLoading ? (
                <div className="h-full w-full bg-muted animate-pulse rounded"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesSummary?.transactionsChartData || defaultChartData}
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
              )}
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
                {isLoading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      ${(salesSummary?.averageSale || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +2.1% from last month
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Line Chart for Average Sale */}
            <div className="h-36">
              {isLoading ? (
                <div className="h-full w-full bg-muted animate-pulse rounded"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesSummary?.averageSaleChartData || defaultChartData}
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
              )}
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
                    disabled={isLoading}
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
                    onClick={() => !isLoading && handleSort(column.id)}
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
              {isLoading ? (
                // Loading skeleton rows
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell className="w-[50px] p-3">
                      <div className="h-5 w-5 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={`loading-cell-${column.id}-${index}`} className="px-4 py-3">
                        <div className="h-5 bg-muted animate-pulse rounded"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedSales.length === 0 ? (
                // No data state
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No sales found</p>
                      <Button variant="outline" size="sm" onClick={handleRefresh}>
                        Refresh
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Actual data rows
                paginatedSales.map((sale) => (
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
                ))
              )}
            </TableBody>
          </Table>

          {/* Add pagination */}
          {!isLoading && sortedSales.length > 0 && (
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Show first page, last page, and pages around current page
                  let pageToShow;
                  if (totalPages <= 5) {
                    // Show all pages if 5 or fewer
                    pageToShow = i + 1;
                  } else if (currentPage <= 3) {
                    // Near the start
                    if (i < 4) {
                      pageToShow = i + 1;
                    } else {
                      pageToShow = totalPages;
                    }
                  } else if (currentPage >= totalPages - 2) {
                    // Near the end
                    if (i === 0) {
                      pageToShow = 1;
                    } else {
                      pageToShow = totalPages - (4 - i);
                    }
                  } else {
                    // In the middle
                    if (i === 0) {
                      pageToShow = 1;
                    } else if (i === 4) {
                      pageToShow = totalPages;
                    } else {
                      pageToShow = currentPage + (i - 2);
                    }
                  }

                  return (
                    <Button
                      key={pageToShow}
                      variant={currentPage === pageToShow ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageToShow)}
                    >
                      {pageToShow}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Loading state for pagination */}
          {isLoading && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="h-5 w-48 bg-muted animate-pulse rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
                <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          )}
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
                    Invoice No: {viewSale?.invoiceNo || 'N/A'}
                  </p>
                </div>
                <Badge
                  variant={
                    viewSale?.status === 'completed' ? 'default' :
                    viewSale?.status === 'pending' ? 'secondary' : 'destructive'
                  }
                  className="text-sm px-3 py-1"
                >
                  {viewSale?.status ? viewSale.status.charAt(0).toUpperCase() + viewSale.status.slice(1) : 'Unknown'}
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
                      {viewSale?.date ? format(viewSale.date, 'PPP') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer</p>
                    <p className="text-base font-semibold mt-1">
                      {viewSale?.customer || 'Walk-in'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-base font-semibold mt-1">
                      {viewSale?.location || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Employee</p>
                    <p className="text-base font-semibold mt-1">
                      {viewSale?.employee || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Added By</p>
                    <p className="text-base font-semibold mt-1">
                      {viewSale?.addedBy || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                    <Badge variant="outline" className="capitalize mt-2">
                      {viewSale?.paymentMethod || 'N/A'}
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
                      viewSale?.paymentStatus === 'paid' ? 'default' :
                      viewSale?.paymentStatus === 'partial' ? 'secondary' : 'destructive'
                    }
                    className="mt-2"
                  >
                    {viewSale?.paymentStatus
                      ? viewSale.paymentStatus.charAt(0).toUpperCase() + viewSale.paymentStatus.slice(1)
                      : 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold mt-1">
                    ${(viewSale?.total || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                  <p className="text-xl font-bold mt-1">
                    ${(viewSale?.totalPaid || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Balance</p>
                  <p className="text-xl font-bold mt-1">
                    ${((viewSale?.total || 0) - (viewSale?.totalPaid || 0)).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Notes Section */}
              {viewSale?.note && (
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
                    Total Items: {viewSale?.items || 0}
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
                      {Array.from({ length: viewSale?.items || 0 }, (_, i) => ({
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
                            <p className="text-sm">${(viewSale?.total || 0).toFixed(2)}</p>
                            <p className="text-sm">$0.00</p>
                            <p className="text-base font-semibold">${(viewSale?.total || 0).toFixed(2)}</p>
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
