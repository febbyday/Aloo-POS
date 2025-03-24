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
import { Eye, Filter, Plus, Search, RefreshCw, FileDown, Upload, FileText, Pencil } from "lucide-react"
import { CreateOrderModal } from '../components/CreateOrderModal'
import { ViewOrderModal } from '../components/ViewOrderModal'
import { EditOrderModal } from '../components/EditOrderModal'
import { useToast } from "@/components/ui/use-toast"
import { Toolbar, ToolbarButton, ToolbarGroup } from "@/components/ui/toolbar"
import { cn } from "@/lib/utils"
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'

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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

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
    const tableData = filteredOrders.map(order => [
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
    const totalAmount = filteredOrders.reduce((sum, order) => sum + order.total, 0)
    const totalItems = filteredOrders.reduce((sum, order) => sum + order.items, 0)
    
    const finalY = (doc as any).lastAutoTable.finalY || 90
    doc.setFontSize(10)
    doc.text([
      `Total Orders: ${filteredOrders.length}`,
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
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders List</CardTitle>
              <CardDescription>View and manage supplier orders</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[200px]"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
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
        <CardContent>
          <SupplierTable>
            <SupplierTableHeader>
              <SupplierTableRow>
                <SupplierTableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredOrders.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(filteredOrders.map(order => order.id))
                      } else {
                        setSelectedItems([])
                      }
                    }}
                  />
                </SupplierTableHead>
                <SupplierTableHead>Order #</SupplierTableHead>
                <SupplierTableHead>Supplier</SupplierTableHead>
                <SupplierTableHead>Date</SupplierTableHead>
                <SupplierTableHead>Items</SupplierTableHead>
                <SupplierTableHead className="text-right">Total</SupplierTableHead>
                <SupplierTableHead>Status</SupplierTableHead>
                <SupplierTableHead className="text-right">Actions</SupplierTableHead>
              </SupplierTableRow>
            </SupplierTableHeader>
            <SupplierTableBody>
              {filteredOrders.map((order) => (
                <SupplierTableRow 
                  key={order.id}
                  onClick={(e) => handleRowClick(order.id, e)}
                  onDoubleClick={(e) => handleRowDoubleClick(order, e)}
                  className={cn(
                    "cursor-pointer",
                    selectedItems.includes(order.id) && "bg-muted/50"
                  )}
                >
                  <SupplierTableCell>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(order.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, order.id])
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== order.id))
                        }
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent row click when clicking checkbox
                    />
                  </SupplierTableCell>
                  <SupplierTableCell className="font-medium">{order.orderNumber}</SupplierTableCell>
                  <SupplierTableCell>{order.supplier}</SupplierTableCell>
                  <SupplierTableCell>{order.date}</SupplierTableCell>
                  <SupplierTableCell>{order.items}</SupplierTableCell>
                  <SupplierTableCell className="text-right">${order.total.toFixed(2)}</SupplierTableCell>
                  <SupplierTableCell>
                    <Badge 
                      variant={
                        order.status === 'Delivered' ? "default" : 
                        order.status === 'Processing' ? "secondary" : 
                        "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </SupplierTableCell>
                  <SupplierTableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewOrder(order)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditOrder(order)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </SupplierTableCell>
                </SupplierTableRow>
              ))}
            </SupplierTableBody>
          </SupplierTable>
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