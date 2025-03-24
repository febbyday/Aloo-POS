import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Calendar,
  Download,
  Filter,
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  RefreshCw,
  Printer,
  FileText,
  Upload,
  FileDown,
  History,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Check,
  Package,
  Hash,
  AlertCircle,
  FileText as FileIcon,
  User
} from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { ColumnVisibilityDialog } from "../components/ColumnVisibilityDialog"
import { StatsCard } from "@/features/products/components/StatsCard"
import { StockHistoryToolbar } from "../components/toolbars/StockHistoryToolbar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect } from "react"

type StockHistory = {
  id: string
  date: Date
  product: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  reference: string
  user: string
}

// Mock data
const mockHistory: StockHistory[] = [
  {
    id: '1',
    date: new Date('2024-02-15'),
    product: 'Cotton T-Shirt',
    type: 'in',
    quantity: 50,
    reason: 'Purchase Order',
    reference: 'PO-001',
    user: 'John Doe'
  },
  {
    id: '2',
    date: new Date('2024-02-14'),
    product: 'Denim Jeans',
    type: 'out',
    quantity: -10,
    reason: 'Sales Order',
    reference: 'SO-002',
    user: 'Jane Smith'
  },
  {
    id: '3',
    date: new Date('2024-02-13'),
    product: 'Cotton T-Shirt',
    type: 'adjustment',
    quantity: -2,
    reason: 'Damaged Items',
    reference: 'ADJ-003',
    user: 'John Doe'
  },
  {
    id: '4',
    date: new Date('2024-02-12'),
    product: 'Running Shoes',
    type: 'in',
    quantity: 30,
    reason: 'Purchase Order',
    reference: 'PO-004',
    user: 'Mike Johnson'
  },
  {
    id: '5',
    date: new Date('2024-02-11'),
    product: 'Running Shoes',
    type: 'out',
    quantity: -5,
    reason: 'Sales Order',
    reference: 'SO-005',
    user: 'Jane Smith'
  },
  {
    id: '6',
    date: new Date('2024-02-10'),
    product: 'Denim Jeans',
    type: 'adjustment',
    quantity: -1,
    reason: 'Quality Check',
    reference: 'ADJ-006',
    user: 'Mike Johnson'
  },
  {
    id: '7',
    date: new Date('2024-02-09'),
    product: 'Cotton T-Shirt',
    type: 'out',
    quantity: -15,
    reason: 'Sales Order',
    reference: 'SO-007',
    user: 'John Doe'
  }
]

const generateMockData = (baseValue: number, days: number = 30) => {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    value: Math.floor(baseValue * (0.8 + Math.random() * 0.4))
  }))
}

const statsData = [
  {
    title: "Total Transactions",
    value: 1284,
    change: 12,
    data: generateMockData(40),
    iconColor: "text-blue-500",
    iconBgColor: "bg-blue-100",
    icon: History
  },
  {
    title: "Stock In",
    value: 485,
    change: 15,
    data: generateMockData(15),
    iconColor: "text-green-500",
    iconBgColor: "bg-green-100",
    icon: ArrowUpDown
  },
  {
    title: "Stock Out",
    value: 728,
    change: 8,
    data: generateMockData(25),
    iconColor: "text-red-500",
    iconBgColor: "bg-red-100",
    icon: ArrowUpDown
  },
  {
    title: "Adjustments",
    value: 71,
    change: -2,
    data: generateMockData(3),
    iconColor: "text-purple-500",
    iconBgColor: "bg-purple-100",
    icon: SlidersHorizontal
  }
]

const columns = [
  { 
    id: 'date', 
    label: 'Date',
    icon: Calendar
  },
  { 
    id: 'type', 
    label: 'Type',
    icon: ArrowUpDown
  },
  { 
    id: 'product', 
    label: 'Product',
    icon: Package
  },
  { 
    id: 'quantity', 
    label: 'Quantity',
    icon: Hash
  },
  { 
    id: 'reason', 
    label: 'Reason',
    icon: AlertCircle
  },
  { 
    id: 'reference', 
    label: 'Reference',
    icon: FileIcon
  },
  { 
    id: 'user', 
    label: 'User',
    icon: User
  }
]

interface FilterCondition {
  column: string
  operator: string
  value: string
}

interface SortCondition {
  column: string
  direction: "asc" | "desc"
}

export function StockHistoryPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState<DateRange>()
  const [columnVisibilityOpen, setColumnVisibilityOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState(columns.map(col => col.id))
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [reasonFilter, setReasonFilter] = useState<string>("all")
  const [sortConfig, setSortConfig] = useState<{column: string, direction: 'asc' | 'desc'} | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filters, setFilters] = useState<FilterCondition[]>([])
  const [sortOrder, setSortOrder] = useState<SortCondition[]>([])

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "The stock history has been refreshed.",
    })
  }
  
  const totalPages = Math.ceil(mockHistory.length / itemsPerPage)

  // Filter and sort data
  const filteredData = mockHistory.filter(item => {
    const matchesSearch = searchTerm === "" || 
      Object.values(item).some(val => 
        val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    const matchesType = typeFilter === "all" || item.type === typeFilter
    const matchesReason = reasonFilter === "all" || item.reason.toLowerCase().includes(reasonFilter.toLowerCase())
    const matchesDateRange = !dateRange?.from || !dateRange?.to || 
      (item.date >= dateRange.from && item.date <= dateRange.to)
    
    return matchesSearch && matchesType && matchesReason && matchesDateRange
  })

  // Sort data
  const sortedData = sortConfig 
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortConfig.column as keyof StockHistory]
        const bVal = b[sortConfig.column as keyof StockHistory]
        const modifier = sortConfig.direction === 'asc' ? 1 : -1
        return aVal < bVal ? -1 * modifier : aVal > bVal ? 1 * modifier : 0
      })
    : filteredData

  // Paginate data
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (column: string) => {
    setSortConfig(current => ({
      column,
      direction: current?.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const toggleRowSelection = (id: string) => {
    setSelectedRows(current => 
      current.includes(id) 
        ? current.filter(rowId => rowId !== id)
        : [...current, id]
    )
  }

  const toggleAllRows = () => {
    setSelectedRows(current => 
      current.length === paginatedData.length 
        ? [] 
        : paginatedData.map(item => item.id)
    )
  }

  return (
    <div className="space-y-4">
      <StockHistoryToolbar
        onColumnsChange={() => setColumnVisibilityOpen(true)}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        data={mockHistory}
        columns={columns}
        onRefresh={handleRefresh}
        filters={filters}
        onFiltersChange={setFilters}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        visibleColumns={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
            iconBgColor={stat.iconBgColor}
            trend={{
              data: stat.data.map(d => ({ value: d.value })),
              isPositive: stat.change > 0,
              percentage: Math.abs(stat.change)
            }}
          />
        ))}
      </div>

      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 md:gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in">Stock In</SelectItem>
                <SelectItem value="out">Stock Out</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder="Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="purchase">Purchase Order</SelectItem>
                <SelectItem value="sales">Sales Order</SelectItem>
                <SelectItem value="damage">Damaged Items</SelectItem>
                <SelectItem value="return">Returns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-b border-zinc-800">
          <Table>
            <TableHeader className="bg-zinc-900/90 border-b border-zinc-800">
              <TableRow>
                <TableHead className="w-[40px] text-zinc-100 h-12">
                  <Checkbox 
                    checked={selectedRows.length === paginatedData.length}
                    onCheckedChange={toggleAllRows}
                  />
                </TableHead>
                {visibleColumns.map((column) => {
                  const col = columns.find(c => c.id === column)
                  const Icon = col?.icon
                  const isSorted = sortConfig?.column === column
                  const sortDir = sortConfig?.direction
                
                  return (
                    <TableHead 
                      key={column} 
                      className="text-zinc-100 h-12 cursor-pointer hover:bg-zinc-800/50"
                      onClick={() => handleSort(column)}
                    >
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{col?.label}</span>
                        <div className="w-4">
                          {isSorted ? (
                            sortDir === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-30" />
                          )}
                        </div>
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={`border-zinc-800 hover:bg-white/5 ${
                    selectedRows.includes(item.id) ? 'bg-white/10' : ''
                  }`}
                >
                  <TableCell className="text-zinc-100 h-[50px] py-3">
                    <Checkbox 
                      checked={selectedRows.includes(item.id)}
                      onCheckedChange={() => toggleRowSelection(item.id)}
                    />
                  </TableCell>
                  {visibleColumns.map((column) => (
                    <TableCell key={column} className="text-zinc-100 h-[50px] py-3">
                      {column === 'date' && format(item.date, 'MMM d, yyyy')}
                      {column === 'type' && (
                        <Badge 
                          variant={
                            item.type === 'in' ? 'success' : 
                            item.type === 'out' ? 'destructive' : 
                            'default'
                          }
                          className="capitalize"
                        >
                          {item.type}
                        </Badge>
                      )}
                      {column === 'product' && item.product}
                      {column === 'quantity' && (
                        <span className={item.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                        </span>
                      )}
                      {column === 'reason' && item.reason}
                      {column === 'reference' && item.reference}
                      {column === 'user' && item.user}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Show</span>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1) // Reset to first page when changing items per page
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-zinc-500">entries</span>
            </div>
            <div className="text-sm text-zinc-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} entries
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="hidden md:inline-flex"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <ColumnVisibilityDialog
        open={columnVisibilityOpen}
        onOpenChange={setColumnVisibilityOpen}
        columns={columns}
        visibleColumns={visibleColumns}
        onVisibilityChange={setVisibleColumns}
      />
    </div>
  )
}
