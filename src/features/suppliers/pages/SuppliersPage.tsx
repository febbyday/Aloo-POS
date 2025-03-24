import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Star,
  Filter,
  FileDown,
  Upload,
  RefreshCw,
  Eye,
  Pencil,
  Trash,
  FileText,
  ShoppingCart,
  Package,
  AlertCircle
} from "lucide-react"
import { SupplierModal } from '../components/SupplierModal'
import { SuppliersToolbar } from '../components/SuppliersToolbar'
import { SuppliersTable } from '../components/SuppliersTable'
import { useToast } from "@/components/ui/use-toast"
import { Supplier, SUPPLIER_STATUS, SupplierType } from '../types'

// Mock data
const suppliers: Supplier[] = [
  {
    id: "SUP-001",
    name: "Audio Supplies Co.",
    type: SupplierType.MANUFACTURER,
    contactPerson: "John Smith",
    email: "john@audiosupplies.com",
    phone: "+1 234-567-8901",
    products: 45,
    rating: 4.5,
    status: SUPPLIER_STATUS.ACTIVE,
    lastOrder: "2024-02-20"
  },
  {
    id: "SUP-002",
    name: "Pro Audio Systems",
    type: SupplierType.DISTRIBUTOR,
    contactPerson: "Sarah Johnson",
    email: "sarah@proaudio.com",
    phone: "+1 234-567-8902",
    products: 32,
    rating: 4.8,
    status: SUPPLIER_STATUS.ACTIVE,
    lastOrder: "2024-02-19"
  },
  {
    id: "SUP-003",
    name: "Sound Equipment Ltd",
    type: SupplierType.RETAILER,
    contactPerson: "Mike Wilson",
    email: "mike@soundequip.com",
    phone: "+1 234-567-8903",
    products: 12,
    rating: 4.2,
    status: SUPPLIER_STATUS.INACTIVE,
    lastOrder: "2024-02-18"
  },
  {
    id: "SUP-004",
    name: "Music Gear Direct",
    type: SupplierType.MANUFACTURER,
    contactPerson: "Lisa Brown",
    email: "lisa@musicgear.com",
    phone: "+1 234-567-8904",
    products: 28,
    rating: 4.6,
    status: SUPPLIER_STATUS.ACTIVE,
    lastOrder: "2024-02-17"
  },
  {
    id: "SUP-005",
    name: "Audio Tech Solutions",
    type: SupplierType.DISTRIBUTOR,
    contactPerson: "David Lee",
    email: "david@audiotech.com",
    phone: "+1 234-567-8905",
    products: 8,
    rating: 4.0,
    status: SUPPLIER_STATUS.INACTIVE,
    lastOrder: "2024-02-16"
  }
]

export function SuppliersPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<SupplierType>("all")
  const [filterStatus, setFilterStatus] = useState<SUPPLIER_STATUS>("all")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<{column: string; direction: 'asc' | 'desc'} | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleRowClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setModalOpen(true)
  }

  const handleViewSupplier = (supplier: Supplier) => {
    navigate(`/suppliers/${supplier.id}`)
  }

  const handleSort = (column: string) => {
    setSortConfig(current => {
      if (!current || current.column !== column) {
        return { column, direction: 'asc' }
      }
      if (current.direction === 'asc') {
        return { column, direction: 'desc' }
      }
      return null
    })
  }

  const handleRefresh = () => {
    toast({
      title: "Refreshing data...",
      description: "Your supplier data is being updated."
    })
  }

  const handleCreate = () => {
    setSelectedSupplier(null)
    setModalOpen(true)
  }

  const handleEdit = () => {
    if (selectedItems.length !== 1) {
      toast({
        title: "Select one supplier",
        description: "Please select exactly one supplier to edit.",
        variant: "destructive"
      })
      return
    }
    const supplier = suppliers.find(s => s.id === selectedItems[0])
    setSelectedSupplier(supplier || null)
    setModalOpen(true)
  }

  const handleDelete = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No suppliers selected",
        description: "Please select at least one supplier to delete.",
        variant: "destructive"
      })
      return
    }
    // TODO: Implement delete functionality
    toast({
      title: "Delete suppliers",
      description: `${selectedItems.length} suppliers will be deleted.`
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
          label: "Add Supplier",
          onClick: handleCreate
        },
        {
          icon: Eye,
          label: "View",
          onClick: () => {
            if (selectedItems.length === 1) {
              const supplier = suppliers.find(s => s.id === selectedItems[0])
              if (supplier) {
                handleViewSupplier(supplier)
              }
            }
          },
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
          icon: ShoppingCart,
          label: "Create Order",
          onClick: () => {},
          disabled: selectedItems.length !== 1
        },
        {
          icon: FileText,
          label: "Documents",
          onClick: () => {},
          disabled: selectedItems.length !== 1
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

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === "all" || supplier.type === filterType
    const matchesStatus = filterStatus === "all" || supplier.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  }).sort((a, b) => {
    if (!sortConfig) return 0

    const { column, direction } = sortConfig
    const modifier = direction === 'asc' ? 1 : -1

    switch (column) {
      case 'name':
      case 'type':
      case 'contactPerson':
      case 'email':
      case 'status':
        return modifier * a[column].localeCompare(b[column])
      case 'products':
      case 'rating':
        return modifier * (a[column] - b[column])
      default:
        return 0
    }
  })

  const metrics = {
    total: suppliers.length,
    active: suppliers.filter(s => s.status === SUPPLIER_STATUS.ACTIVE).length,
    lowStock: suppliers.filter(s => s.status === SUPPLIER_STATUS.INACTIVE).length,
    totalProducts: suppliers.reduce((acc, s) => acc + s.products, 0)
  }

  return (
    <div className="space-y-6">
      <SuppliersToolbar groups={toolbarGroups} />

      <div className="mb-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.active} active suppliers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.lowStock}</div>
              <p className="text-xs text-muted-foreground">
                Suppliers with low stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Across all suppliers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                From 5 suppliers
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={SupplierType.MANUFACTURER}>Manufacturer</SelectItem>
              <SelectItem value={SupplierType.DISTRIBUTOR}>Distributor</SelectItem>
              <SelectItem value={SupplierType.RETAILER}>Retailer</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={SUPPLIER_STATUS.ACTIVE}>Active</SelectItem>
              <SelectItem value={SUPPLIER_STATUS.INACTIVE}>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <SuppliersTable
          data={filteredSuppliers}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          onSupplierClick={handleRowClick}
          onViewSupplier={handleViewSupplier}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </div>

      <SupplierModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={selectedSupplier}
      />
    </div>
  )
}
