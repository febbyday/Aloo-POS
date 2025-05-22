import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge'
import { ProductsToolbar } from '../components/ProductsToolbar'
import { useNavigate } from 'react-router-dom'
import {
  FileDown,
  FileText,
  Printer,
  RefreshCw,
  Upload,
  ArrowLeftRight,
  History,
  Plus as PlusIcon,
  Calendar,
  Building2,
  Store,
  Package,
  Clock,
  ActivitySquare,
  Eye,
  Table as TableIcon,
  Barcode,
  ArrowRightLeft,
  CircleDot,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useToast } from '@/lib/toast'
import { cn } from '@/lib/utils/cn';
import { TransferDetailsDialog } from "../components/TransferDetailsDialog"
import { format } from 'date-fns'
import { exportTransferToPDF, exportTransferListToPDF, exportTransferToExcel, exportTransferListToExcel } from '../utils/exportUtils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data - replace with actual API call
const transfers = [
  {
    id: "TR001",
    source: "Warehouse A",
    destination: "Store B",
    status: "Pending",
    createdAt: "2024-02-19T10:00:00Z",
    createdBy: "John Doe",
    items: [
      {
        name: "Organic Coffee Beans",
        sku: "COF123",
        quantity: 5,
        unitPrice: 15.99,
        category: "Beverages",
        unit: "kg"
      },
      {
        name: "Premium Tea Bags",
        sku: "TEA456",
        quantity: 3,
        unitPrice: 12.50,
        category: "Beverages",
        unit: "box"
      }
    ],
    notes: "Regular stock transfer"
  },
  {
    id: "TR002",
    source: "Store C",
    destination: "Store D",
    status: "Completed",
    createdAt: "2024-02-18T15:30:00Z",
    createdBy: "Jane Smith",
    items: [
      {
        name: "Fresh Milk",
        sku: "MLK789",
        quantity: 10,
        unitPrice: 3.99,
        category: "Dairy",
        unit: "liter"
      },
      {
        name: "Cheese Selection",
        sku: "CHS101",
        quantity: 5,
        unitPrice: 8.99,
        category: "Dairy",
        unit: "pack"
      }
    ],
    notes: "Emergency restock"
  },
  {
    id: "TR003",
    source: "Warehouse A",
    destination: "Store E",
    status: "In Transit",
    createdAt: "2024-02-17T09:15:00Z",
    createdBy: "Mike Johnson",
    items: [
      {
        name: "Organic Apples",
        sku: "APL234",
        quantity: 20,
        unitPrice: 1.49,
        category: "Produce",
        unit: "kg"
      },
      {
        name: "Fresh Bananas",
        sku: "BAN567",
        quantity: 15,
        unitPrice: 0.99,
        category: "Produce",
        unit: "kg"
      }
    ],
    notes: "Weekly produce delivery"
  },
  {
    id: "TR004",
    source: "Store F",
    destination: "Store G",
    status: "Completed",
    createdAt: "2024-02-16T14:45:00Z",
    createdBy: "Sarah Williams",
    items: [
      {
        name: "Whole Wheat Bread",
        sku: "BRD123",
        quantity: 8,
        unitPrice: 3.49,
        category: "Bakery",
        unit: "loaf"
      },
      {
        name: "Chocolate Croissants",
        sku: "CRO456",
        quantity: 12,
        unitPrice: 2.99,
        category: "Bakery",
        unit: "piece"
      }
    ],
    notes: "Bakery items transfer"
  },
  {
    id: "TR005",
    source: "Warehouse B",
    destination: "Store H",
    status: "Cancelled",
    createdAt: "2024-02-15T11:30:00Z",
    createdBy: "Alex Thompson",
    items: [
      {
        name: "Dish Soap",
        sku: "SOP789",
        quantity: 15,
        unitPrice: 4.99,
        category: "Household",
        unit: "bottle"
      },
      {
        name: "Paper Towels",
        sku: "PAP101",
        quantity: 10,
        unitPrice: 5.99,
        category: "Household",
        unit: "roll"
      }
    ],
    notes: "Cancelled due to inventory error"
  },
  {
    id: "TR006",
    source: "Store A",
    destination: "Store C",
    status: "Pending",
    createdAt: "2024-02-14T13:20:00Z",
    createdBy: "Mark Wilson",
    items: [
      {
        name: "Athletic Shoes",
        sku: "SHO123",
        quantity: 8,
        unitPrice: 79.99,
        category: "Footwear",
        unit: "pair"
      },
      {
        name: "Sports Socks",
        sku: "SOC456",
        quantity: 20,
        unitPrice: 9.99,
        category: "Apparel",
        unit: "pair"
      }
    ],
    notes: "Sports department restocking"
  },
  {
    id: "TR007",
    source: "Warehouse B",
    destination: "Store D",
    status: "Completed",
    createdAt: "2024-02-12T09:15:00Z",
    createdBy: "Lisa Johnson",
    items: [
      {
        name: "Laptop Computer",
        sku: "LAP789",
        quantity: 5,
        unitPrice: 899.99,
        category: "Electronics",
        unit: "unit"
      },
      {
        name: "Computer Mouse",
        sku: "MOU101",
        quantity: 15,
        unitPrice: 24.99,
        category: "Electronics",
        unit: "unit"
      }
    ],
    notes: "Technology department update"
  },
  {
    id: "TR008",
    source: "Store E",
    destination: "Store F",
    status: "In Transit",
    createdAt: "2024-02-10T14:30:00Z",
    createdBy: "David Smith",
    items: [
      {
        name: "Office Chair",
        sku: "CHR234",
        quantity: 4,
        unitPrice: 149.99,
        category: "Furniture",
        unit: "unit"
      },
      {
        name: "Desk Lamp",
        sku: "LMP567",
        quantity: 8,
        unitPrice: 34.99,
        category: "Furniture",
        unit: "unit"
      }
    ],
    notes: "Furniture department reorganization"
  }
]

const columns = [
  {
    id: "id",
    label: "Transfer ID",
    icon: Barcode
  },
  {
    id: "source",
    label: "From",
    icon: Building2
  },
  {
    id: "destination",
    label: "To",
    icon: Store
  },
  {
    id: "status",
    label: "Status",
    icon: CircleDot
  },
  {
    id: "createdAt",
    label: "Created At",
    icon: Calendar
  },
  {
    id: "items",
    label: "Items",
    icon: Package
  }
]

export function StockTransferPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [selectedTransfers, setSelectedTransfers] = useState<string[]>([])
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  } | null>({ column: 'createdAt', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // TODO: Add actual refresh logic here
    setTimeout(() => {
      toast.success(
        "Transfers refreshed",
        "Your transfer list has been updated"
      )
      setIsRefreshing(false)
    }, 1000)
  }

  const handleNewTransfer = () => {
    navigate('/products/stock/transfers/create')
  }

  const handleExport = (format: string) => {
    if (selectedTransfers.length === 1) {
      const transfer = transfers.find(t => t.id === selectedTransfers[0])
      if (!transfer) return

      if (format === 'pdf') {
        exportTransferToPDF(transfer)
      } else if (format === 'excel') {
        exportTransferToExcel(transfer)
      }
    } else {
      if (format === 'pdf') {
        exportTransferListToPDF(transfers)
      } else if (format === 'excel') {
        exportTransferListToExcel(transfers)
      }
    }

    toast.success(
      `Export complete`,
      `Your data has been exported as ${format.toUpperCase()}.`
    )
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

  const handleViewTransfer = () => {
    const transfer = transfers.find(t => t.id === selectedTransfers[0])
    if (transfer) {
      setSelectedTransfer({
        id: transfer.id,
        status: transfer.status,
        sourceLocation: transfer.source,
        destinationLocation: transfer.destination,
        createdAt: transfer.createdAt,
        createdBy: transfer.createdBy,
        items: transfer.items,
        notes: transfer.notes
      })
      setDetailsOpen(true)
    }
  }

  const handleEditTransfer = () => {
    const transfer = transfers.find(t => t.id === selectedTransfers[0])
    if (transfer) {
      navigate(`/products/stock/transfers/edit/${transfer.id}`, {
        state: { transfer }
      })
    }
  }

  // Filter transfers
  const filteredTransfers = transfers.filter(transfer => {
    // Apply search filter
    if (searchQuery && !transfer.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !transfer.source.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !transfer.destination.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Apply status filter
    if (statusFilter !== 'all' && transfer.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false
    }

    return true
  })

  // Sort transfers
  const sortedTransfers = [...filteredTransfers].sort((a, b) => {
    if (!sortConfig) return 0

    const { column, direction } = sortConfig

    if (column === 'createdAt') {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return direction === 'asc' ? dateA - dateB : dateB - dateA
    }

    if (column === 'items') {
      const itemsA = a.items.length
      const itemsB = b.items.length
      return direction === 'asc' ? itemsA - itemsB : itemsB - itemsA
    }

    const valueA = a[column as keyof typeof a]
    const valueB = b[column as keyof typeof b]

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA)
    }

    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedTransfers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransfers = sortedTransfers.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success'
      case 'in transit':
        return 'default'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: RefreshCw,
          label: "Refresh",
          onClick: handleRefresh,
        },
        {
          icon: PlusIcon,
          label: "New Transfer",
          onClick: handleNewTransfer,
        },
        {
          icon: PlusIcon,
          label: "Edit Transfer",
          onClick: handleEditTransfer,
          disabled: selectedTransfers.length !== 1,
        },
        {
          icon: Eye,
          label: "View Transfer",
          onClick: handleViewTransfer,
          disabled: selectedTransfers.length !== 1,
        },
      ]
    },
    {
      buttons: [
        {
          icon: FileText,
          label: "Export as PDF",
          onClick: () => handleExport('pdf'),
        },
        {
          icon: TableIcon,
          label: "Export as Excel",
          onClick: () => handleExport('excel'),
        }
      ]
    },
  ]

  return (
    <div className="space-y-0 py-6" data-component-name="StockTransferPage">
      <ProductsToolbar
        groups={toolbarGroups}
        rightContent={
          <Badge variant="outline" className="bg-zinc-800 text-zinc-100 border-zinc-700">
            {filteredTransfers.length} transfer{filteredTransfers.length === 1 ? '' : 's'}
          </Badge>
        }
      />

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-0 py-4" data-component-name="StockTransferPage">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search transfers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transfers</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in transit">In Transit</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-1" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" className="gap-1" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <Card className="border-0">
        <CardContent className="p-0">
          <div className="rounded-md">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-0">
                  <TableHead className="w-[50px] p-3">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedTransfers.length === filteredTransfers.length && filteredTransfers.length > 0}
                        onCheckedChange={() => {
                          setSelectedTransfers(
                            selectedTransfers.length === filteredTransfers.length
                              ? []
                              : filteredTransfers.map(transfer => transfer.id)
                          )
                        }}
                        aria-label="Select all transfers"
                      />
                    </div>
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead
                      key={column.id}
                      className={cn(
                        "cursor-pointer hover:bg-muted/70 transition-colors px-4 h-12",
                        column.id === 'id' && "w-[150px]",
                        column.id === 'source' && "w-[150px]",
                        column.id === 'destination' && "w-[150px]",
                        column.id === 'status' && "w-[120px]",
                        column.id === 'createdAt' && "w-[180px]",
                        column.id === 'items' && "w-[180px]"
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
                  <TableHead className="text-right w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransfers.length > 0 ? (
                  paginatedTransfers.map((transfer) => (
                    <TableRow
                      key={transfer.id}
                      className={cn(
                        "transition-colors hover:bg-muted/50",
                        selectedTransfers.includes(transfer.id) && "bg-muted"
                      )}
                      onClick={() => {
                        setSelectedTransfers(current =>
                          current.includes(transfer.id)
                            ? current.filter(id => id !== transfer.id)
                            : [...current, transfer.id]
                        )
                      }}
                    >
                      <TableCell className="p-3">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedTransfers.includes(transfer.id)}
                            aria-label={`Select transfer ${transfer.id}`}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTransfers(prev => [...prev, transfer.id])
                              } else {
                                setSelectedTransfers(prev => prev.filter(id => id !== transfer.id))
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium px-4 py-3">{transfer.id}</TableCell>
                      <TableCell className="px-4 py-3">{transfer.source}</TableCell>
                      <TableCell className="px-4 py-3">{transfer.destination}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant={getStatusBadgeVariant(transfer.status)}>
                          {transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">{format(new Date(transfer.createdAt), "PPp")}</TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{transfer.items.length} types</span>
                          <span className="text-sm text-muted-foreground">
                            {transfer.items.reduce((sum, item) => sum + item.quantity, 0)} units ·
                            ${transfer.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTransfer({
                                id: transfer.id,
                                status: transfer.status,
                                sourceLocation: transfer.source,
                                destinationLocation: transfer.destination,
                                createdAt: transfer.createdAt,
                                createdBy: transfer.createdBy,
                                items: transfer.items,
                                notes: transfer.notes
                              })
                              setDetailsOpen(true)
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/products/stock/transfers/edit/${transfer.id}`, {
                                state: { transfer }
                              })
                            }}>
                              <PlusIcon className="mr-2 h-4 w-4" />
                              <span>Edit Transfer</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              handleExport('pdf')
                            }}>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Export PDF</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2} className="text-center h-24 text-muted-foreground">
                      No transfers found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls - Always show */}
          <div className="flex items-center justify-between border-t px-4 py-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredTransfers.length)}</span> of{" "}
                <span className="font-medium">{filteredTransfers.length}</span> transfers
              </p>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(parseInt(value))
                  setCurrentPage(1) // Reset to first page when changing items per page
                }}
              >
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronLeft className="h-4 w-4 mr-1" />
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Go to previous page</span>
              </Button>

              {/* Page numbers */}
              <div className="flex items-center">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Display current page and adjacent pages
                  let pageNum = 0;

                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all pages
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // If near the start
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // If near the end
                    pageNum = totalPages - 4 + i;
                  } else {
                    // In the middle
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 mx-1"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Go to next page</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronRight className="h-4 w-4 mr-1" />
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <TransferDetailsDialog
        transfer={selectedTransfer}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  )
}
