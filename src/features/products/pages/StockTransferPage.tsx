import { useState } from 'react'
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
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
  Table,
  Barcode,
  ArrowRightLeft,
  CircleDot
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { TransferDetailsDialog } from "../components/TransferDetailsDialog"
import { format } from 'date-fns'
import { exportTransferToPDF, exportTransferListToPDF, exportTransferToExcel, exportTransferListToExcel } from '../utils/exportUtils'

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
  }
]

const columns = [
  {
    accessorKey: "id",
    header: () => (
      <div className="flex items-center gap-2">
        <Barcode className="w-4 h-4" />
        <span>Transfer ID</span>
      </div>
    )
  },
  {
    accessorKey: "source",
    header: () => (
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        <span>From</span>
      </div>
    )
  },
  {
    accessorKey: "destination",
    header: () => (
      <div className="flex items-center gap-2">
        <Store className="w-4 h-4" />
        <span>To</span>
      </div>
    )
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="flex items-center gap-2">
        <CircleDot className="w-4 h-4" />
        <span>Status</span>
      </div>
    ),
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge 
          variant={
            status === "Completed" ? "success" : 
            status === "Pending" ? "warning" : 
            "default"
          }
        >
          {status}
        </Badge>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: () => (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span>Created At</span>
      </div>
    ),
    cell: ({ row }) => format(new Date(row.original.createdAt), "PPp")
  },
  {
    accessorKey: "items",
    header: () => (
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4" />
        <span>Items</span>
      </div>
    ),
    cell: ({ row }) => {
      const items = row.original.items
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
      const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      return (
        <div className="flex flex-col">
          <span className="font-medium">{items.length} types</span>
          <span className="text-sm text-muted-foreground">
            {totalItems} units · ${totalCost.toFixed(2)}
          </span>
        </div>
      )
    }
  }
]

export function StockTransferPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [selectedTransfers, setSelectedTransfers] = useState<string[]>([])
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // TODO: Add actual refresh logic here
    setTimeout(() => {
      toast({
        title: "Transfers refreshed",
        description: "Your transfer list has been updated"
      })
      setIsRefreshing(false)
    }, 1000)
  }

  const handleNewTransfer = () => {
    navigate('/products/transfers/create')
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

    toast({
      title: `Export complete`,
      description: `Your data has been exported as ${format.toUpperCase()}.`
    })
  }

  const handleRowClick = (transferId: string) => {
    setSelectedTransfers(prev => {
      if (prev.includes(transferId)) {
        return prev.filter(id => id !== transferId)
      }
      return [transferId]
    })
  }

  const handleRowDoubleClick = (row: any) => {
    setSelectedTransfer({
      id: row.id,
      status: row.status,
      sourceLocation: row.source,
      destinationLocation: row.destination,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
      items: row.items,
      notes: row.notes
    })
    setDetailsOpen(true)
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
      navigate(`/products/transfers/edit/${transfer.id}`, {
        state: { transfer }
      })
    }
  }

  const enhancedColumns = [
    {
      id: 'select',
      header: ({ table }) => null,
      cell: ({ row }) => {
        const isSelected = selectedTransfers.includes(row.original.id)
        return (
          <div
            className={cn(
              "h-full w-1.5 absolute left-0 top-0 transition-colors duration-200",
              isSelected ? "bg-primary" : "bg-transparent group-hover:bg-primary/20"
            )}
          />
        )
      }
    },
    ...columns
  ]

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: RefreshCw,
          label: "Refresh",
          onClick: handleRefresh,
        },
        {
          icon: Plus,
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
          icon: Table,
          label: "Export as Excel",
          onClick: () => handleExport('excel'),
        }
      ]
    },
  ]

  return (
    <div className="space-y-4">
      <ProductsToolbar 
        groups={toolbarGroups}
        rightContent={null}
      />
      
      <DataTable 
        columns={enhancedColumns} 
        data={transfers}
        onRowSelection={setSelectedTransfers}
        selectedRows={selectedTransfers}
        className="[&_table]:border-0 [&_table]:rounded-none [&_thead]:bg-zinc-900/90 [&_tr]:border-0 [&_tr]:border-b [&_tr]:border-zinc-800 [&_tr:last-child]:border-b [&_tr:last-child]:border-zinc-800 [&_td]:px-2 [&_td]:text-zinc-100 [&_th]:px-2 [&_th]:text-zinc-100 [&_tr]:h-[50px] [&_tr]:relative [&_tr]:group hover:[&_tr]:bg-white/5 [&_tr]:transition-colors"
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
      />

      <TransferDetailsDialog 
        transfer={selectedTransfer}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  )
}
