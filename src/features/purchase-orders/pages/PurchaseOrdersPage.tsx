import { useState } from 'react'
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Plus,
  Search,
  Filter,
  FileDown,
  Upload,
  RefreshCw,
  Eye,
  Pencil,
  Trash,
  FileText,
  Package,
  ShoppingCart,
  DollarSign,
  Clock
} from "lucide-react"
import { PurchaseOrderModal } from '../components/PurchaseOrderModal'
import { PurchaseOrdersToolbar } from '../components/PurchaseOrdersToolbar'
import { PurchaseOrdersTable } from '../components/PurchaseOrdersTable'
import { useToast } from "@/lib/toast"

// Types
interface PurchaseOrder {
  id: string
  orderNumber: string
  supplier: {
    id: string
    name: string
  }
  date: string
  status: 'Draft' | 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'
  total: number
  items: number
  expectedDelivery?: string
}

// Mock data
const purchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    orderNumber: "PO-001",
    supplier: {
      id: "SUP-001",
      name: "Audio Supplies Co."
    },
    date: "2024-02-24",
    status: "Pending",
    total: 2499.99,
    items: 5,
    expectedDelivery: "2024-03-01"
  },
  {
    id: "2",
    orderNumber: "PO-002",
    supplier: {
      id: "SUP-002",
      name: "Pro Audio Systems"
    },
    date: "2024-02-23",
    status: "Delivered",
    total: 1799.99,
    items: 3,
    expectedDelivery: "2024-02-28"
  },
  {
    id: "3",
    orderNumber: "PO-003",
    supplier: {
      id: "SUP-003",
      name: "Sound Equipment Ltd"
    },
    date: "2024-02-22",
    status: "Shipped",
    total: 3299.99,
    items: 7,
    expectedDelivery: "2024-02-27"
  }
]

export function PurchaseOrdersPage() {
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)

  const handleCreate = () => {
    setEditingOrder(null)
    setIsModalOpen(true)
  }

  const handleEdit = () => {
    const order = purchaseOrders.find(po => po.id === selectedItems[0])
    if (order) {
      setEditingOrder(order)
      setIsModalOpen(true)
    }
  }

  const handleDelete = () => {
    toast.success(
      "Purchase Orders Deleted",
      `${selectedItems.length} purchase orders have been deleted.`
    )
    setSelectedItems([])
  }

  const handleRefresh = () => {
    toast.info(
      "Refreshed",
      "Purchase orders list has been refreshed."
    )
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
          onClick: handleCreate
        },
        {
          icon: Eye,
          label: "View",
          onClick: () => {},
          disabled: selectedItems.length !== 1
        },
        {
          icon: Pencil,
          label: "Edit",
          onClick: handleEdit,
          disabled: selectedItems.length !== 1
        },
        {
          icon: Trash,
          label: "Delete",
          onClick: handleDelete,
          disabled: selectedItems.length === 0
        }
      ]
    },
    {
      buttons: [
        {
          icon: FileDown,
          label: "Export",
          onClick: () => {}
        },
        {
          icon: Upload,
          label: "Import",
          onClick: () => {}
        }
      ]
    }
  ]

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || order.status === filterStatus

    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    if (!sortConfig) return 0

    const { column, direction } = sortConfig
    const modifier = direction === 'asc' ? 1 : -1

    switch (column) {
      case 'orderNumber':
      case 'status':
        return modifier * a[column].localeCompare(b[column])
      case 'date':
        return modifier * (new Date(a.date).getTime() - new Date(b.date).getTime())
      case 'total':
      case 'items':
        return modifier * (a[column] - b[column])
      default:
        return 0
    }
  })

  const metrics = {
    total: purchaseOrders.length,
    pending: purchaseOrders.filter(po => po.status === "Pending").length,
    delivered: purchaseOrders.filter(po => po.status === "Delivered").length,
    totalValue: purchaseOrders.reduce((acc, po) => acc + po.total, 0)
  }

  return (
    <div className="space-y-6">
      <PurchaseOrdersToolbar
        groups={toolbarGroups}
        rightContent={
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-[200px] bg-transparent"
            />
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="h-8 w-[140px] bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="flex-1">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.delivered} orders delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {purchaseOrders.reduce((acc, po) => acc + po.items, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                All purchase orders
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="border-0">
          <PurchaseOrdersTable
            data={filteredOrders}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            sortConfig={sortConfig}
            onSort={(column) => {
              if (sortConfig?.column === column) {
                setSortConfig({
                  column,
                  direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                })
              } else {
                setSortConfig({ column, direction: 'asc' })
              }
            }}
          />
        </div>
      </div>

      <PurchaseOrderModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={editingOrder}
      />
    </div>
  )
}
