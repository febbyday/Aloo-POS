// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  SupplierTable, 
  SupplierTableHeader, 
  SupplierTableBody, 
  SupplierTableRow, 
  SupplierTableHead, 
  SupplierTableCell,
  SupplierTableFooter 
} from "@/components/ui/table/SupplierTable"
import { 
  Eye, 
  Filter, 
  Plus, 
  Search, 
  RefreshCw, 
  FileDown, 
  Upload, 
  FileText, 
  Pencil, 
  ShoppingCart, 
  Calendar, 
  Building2, 
  Package, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  MoreHorizontal,
  Trash2
} from "lucide-react"
import { CreateOrderModal } from '../components/CreateOrderModal'
import { ViewOrderModal } from '../components/ViewOrderModal'
import { EditOrderModal } from '../components/EditOrderModal'
import { useToast } from "@/components/ui/use-toast"
import { Toolbar, ToolbarButton, ToolbarGroup } from "@/components/ui/toolbar"
import { cn } from "@/lib/utils"
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { 
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data for orders
const mockOrders = [
  {
    id: "ORD-001",
    orderNumber: "PO-2024-001",
    supplier: "Luxury Leather Co.",
    date: "2024-02-20",
    status: "Delivered",
    total: 2500.75,
    items: 12
  },
  {
    id: "ORD-002",
    orderNumber: "PO-2024-002",
    supplier: "Global Bags Distribution",
    date: "2024-02-19",
    status: "Processing",
    total: 1876.50,
    items: 8
  },
  {
    id: "ORD-003",
    orderNumber: "PO-2024-003",
    supplier: "Eco Bags Direct",
    date: "2024-02-18",
    status: "Pending",
    total: 3240.25,
    items: 15
  }
]

// Mock company details (in a real app, this would come from your company context/settings)
const companyDetails = {
  name: "Your Company Name",
  address: "123 Business Street",
  city: "Business City",
  state: "BS",
  zip: "12345",
  phone: "+1 234-567-8900",
  email: "contact@yourcompany.com",
  website: "www.yourcompany.com",
  logo: "path/to/logo.png" // In a real app, this would be your company logo
}

// Add columns definition
const columns = [
  { 
    id: 'orderNumber', 
    label: 'Order #',
    icon: ShoppingCart,
    width: 'w-[180px]'
  },
  { 
    id: 'supplier', 
    label: 'Supplier',
    icon: Building2,
    width: 'w-[250px]'
  },
  { 
    id: 'date', 
    label: 'Date',
    icon: Calendar,
    width: 'w-[150px]'
  },
  { 
    id: 'items', 
    label: 'Items',
    icon: Package,
    width: 'w-[120px]'
  },
  { 
    id: 'total', 
    label: 'Total',
    icon: DollarSign,
    width: 'w-[150px]',
    align: 'text-right'
  },
  { 
    id: 'status', 
    label: 'Status',
    icon: CheckCircle,
    width: 'w-[150px]'
  }
]

export function SupplierOrders() {
  const { toast } = useToast()
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage] = useState(10)

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCreateOrder = (data: any) => {
    console.log('Creating order:', data)
    // Add your order creation logic here
    setOrderModalOpen(false)
    toast({
      title: "Success",
      description: "Order created successfully"
    })
  }

  const handleRefresh = () => {
    // Add refresh logic here
    toast({
      title: "Refreshed",
      description: "Orders list has been refreshed"
    })
  }

  const handleExport = () => {
    // Create new PDF document
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // Add company header
    doc.setFontSize(20)
    doc.text(companyDetails.name, pageWidth / 2, 20, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text([
      companyDetails.address,
      `${companyDetails.city}, ${companyDetails.state} ${companyDetails.zip}`,
      `Phone: ${companyDetails.phone}`,
      `Email: ${companyDetails.email}`,
      `Website: ${companyDetails.website}`
    ], pageWidth / 2, 30, { align: 'center' })

    // Add report title
    doc.setFontSize(16)
    doc.text('Supplier Orders Report', pageWidth / 2, 60, { align: 'center' })
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, pageWidth / 2, 70, { align: 'center' })

    // Add filters info
    doc.setFontSize(10)
    doc.text([
      `Status Filter: ${statusFilter === 'all' ? 'All' : statusFilter}`,
      `Search Term: ${searchTerm || 'None'}`
    ], 14, 80)

    // Prepare table data
    const tableData = paginatedOrders.map(order => [
      order.orderNumber,
      order.supplier,
      order.date,
      order.items.toString(),
      `$${order.total.toFixed(2)}`,
      order.status
    ])

    // Add table
    doc.autoTable({
      head: [['Order #', 'Supplier', 'Date', 'Items', 'Total', 'Status']],
      body: tableData,
      startY: 90,
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [66, 66, 66]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })

    // Add summary
    const totalAmount = paginatedOrders.reduce((sum, order) => sum + order.total, 0)
    const totalItems = paginatedOrders.reduce((sum, order) => sum + order.items, 0)
    
    const finalY = (doc as any).lastAutoTable.finalY || 90
    doc.setFontSize(10)
    doc.text([
      `Total Orders: ${paginatedOrders.length}`,
      `Total Items: ${totalItems}`,
      `Total Amount: $${totalAmount.toFixed(2)}`
    ], 14, finalY + 10)

    // Add footer
    doc.setFontSize(8)
    doc.text(
      'This is a computer-generated document. No signature is required.',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )

    // Save the PDF
    doc.save(`supplier_orders_${format(new Date(), 'yyyy-MM-dd')}.pdf`)

    toast({
      title: "Exported",
      description: "Orders have been exported to PDF"
    })
  }

  const handleImport = () => {
    // Add import logic here
    toast({
      title: "Import",
      description: "Import functionality coming soon"
    })
  }

  const handleViewOrder = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order)
    setViewModalOpen(true)
  }

  const handleEditOrder = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order)
    setEditModalOpen(true)
  }

  const handleEditSubmit = (data: any) => {
    // Update the order in the orders list
    setOrders(orders.map(order => 
      order.id === data.id ? { ...order, ...data } : order
    ))
    setEditModalOpen(false)
    toast({
      title: "Success",
      description: "Order updated successfully"
    })
  }

  const handleRowClick = (orderId: string, event: React.MouseEvent) => {
    // Prevent triggering when clicking checkbox or action buttons
    if ((event.target as HTMLElement).closest('input, button')) {
      return
    }
    setSelectedItems([orderId])
  }

  const handleRowDoubleClick = (order: typeof mockOrders[0], event: React.MouseEvent) => {
    // Prevent triggering when double-clicking checkbox or action buttons
    if ((event.target as HTMLElement).closest('input, button')) {
      return
    }
    handleViewOrder(order)
  }

  const handleSort = (column: string) => {
    if (sortConfig?.column === column) {
      setSortConfig({
        column,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      })
    } else {
      setSortConfig({
        column,
        direction: 'asc'
      })
    }
  }

  const handleDeleteOrder = () => {
    if (selectedItems.length === 0) return
    
    // Add your delete logic here
    setOrders(orders.filter(order => !selectedItems.includes(order.id)))
    setSelectedItems([])
    toast({
      title: "Success",
      description: "Selected orders have been deleted"
    })
  }

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: RefreshCw,
          label: "Refresh",
          onClick: handleRefresh
        },
        {
          icon: Plus,
          label: "Create Order",
          onClick: () => setOrderModalOpen(true)
        },
        {
          icon: Pencil,
          label: "Edit Order",
          onClick: () => {
            if (selectedItems.length === 1) {
              const order = orders.find(o => o.id === selectedItems[0])
              if (order) {
                handleEditOrder(order)
              }
            }
          },
          disabled: selectedItems.length !== 1
        },
        {
          icon: Eye,
          label: "View Order",
          onClick: () => {
            if (selectedItems.length === 1) {
              const order = orders.find(o => o.id === selectedItems[0])
              if (order) {
                handleViewOrder(order)
              }
            }
          },
          disabled: selectedItems.length !== 1
        },
        {
          icon: Trash2,
          label: "Delete Order",
          onClick: handleDeleteOrder,
          disabled: selectedItems.length === 0
        }
      ]
    },
    {
      buttons: [
        {
          icon: FileDown,
          label: "Export",
          onClick: handleExport
        },
        {
          icon: Upload,
          label: "Import",
          onClick: handleImport
        }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <Toolbar groups={toolbarGroups} />
      
      <Card className="border-0">
        <CardHeader className="p-0">
          <div className="flex items-center justify-between pb-6">
            <div>
            </div>
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2 w-full">
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-6">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px] p-3">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={selectedItems.length === paginatedOrders.length && paginatedOrders.length > 0}
                      onCheckedChange={() => {
                        setSelectedItems(
                          selectedItems.length === paginatedOrders.length
                            ? []
                            : paginatedOrders.map(order => order.id)
                        )
                      }}
                      aria-label="Select all orders"
                    />
                  </div>
                </TableHead>
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      "h-12 px-4 cursor-pointer hover:bg-muted/50",
                      column.width,
                      column.align
                    )}
                    onClick={() => handleSort(column.id)}
                  >
                    <div className={cn(
                      "flex items-center gap-2",
                      column.align === 'text-right' && "justify-end"
                    )}>
                      <column.icon className="h-4 w-4 text-muted-foreground" />
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
              {paginatedOrders.map((order) => (
                <TableRow 
                  key={order.id}
                  className={cn(
                    "transition-colors hover:bg-muted/50 cursor-pointer",
                    selectedItems.includes(order.id) && "bg-muted"
                  )}
                  onClick={(e) => handleRowClick(order.id, e)}
                  onDoubleClick={(e) => handleRowDoubleClick(order, e)}
                >
                  <TableCell className="w-[50px] p-3">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedItems.includes(order.id)}
                        onCheckedChange={() => {
                          setSelectedItems(current =>
                            current.includes(order.id)
                              ? current.filter(id => id !== order.id)
                              : [...current, order.id]
                          )
                        }}
                        aria-label={`Select order ${order.id}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{order.orderNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{order.supplier}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{order.date}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{order.items}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge 
                      variant={
                        order.status === 'Delivered' ? 'default' : 
                        order.status === 'Processing' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateOrderModal
        open={orderModalOpen}
        onOpenChange={setOrderModalOpen}
        supplierId=""
        onSubmit={handleCreateOrder}
      />

      <ViewOrderModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        order={selectedOrder}
      />

      <EditOrderModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        order={selectedOrder}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
} 