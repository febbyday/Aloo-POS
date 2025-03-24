import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  MoreHorizontal, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  ShoppingCart,
  Building2,
  Calendar,
  Package,
  DollarSign,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

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

interface ActionMenuProps {
  order: PurchaseOrder
}

function ActionMenu({ order }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>View details</DropdownMenuItem>
        <DropdownMenuItem>Edit order</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600">Delete order</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface PurchaseOrdersTableProps {
  data: PurchaseOrder[]
  selectedItems: string[]
  onSelectionChange: (selectedItems: string[]) => void
  sortConfig: { column: string; direction: 'asc' | 'desc' } | null
  onSort: (column: string) => void
}

const columns = [
  { 
    id: 'orderNumber',
    label: 'Order Number',
    icon: ShoppingCart,
    sortable: true,
    cell: (order: PurchaseOrder) => (
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-zinc-500" />
        <span className="font-medium">{order.orderNumber}</span>
      </div>
    )
  },
  { 
    id: 'supplier',
    label: 'Supplier',
    icon: Building2,
    sortable: true,
    cell: (order: PurchaseOrder) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-zinc-500" />
        <span>{order.supplier.name}</span>
      </div>
    )
  },
  { 
    id: 'date',
    label: 'Order Date',
    icon: Calendar,
    sortable: true,
    cell: (order: PurchaseOrder) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-zinc-500" />
        <span>{new Date(order.date).toLocaleDateString()}</span>
      </div>
    )
  },
  { 
    id: 'items',
    label: 'Items',
    icon: Package,
    sortable: true,
    cell: (order: PurchaseOrder) => (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-zinc-500" />
        <span>{order.items}</span>
      </div>
    )
  },
  { 
    id: 'total',
    label: 'Total',
    icon: DollarSign,
    sortable: true,
    cell: (order: PurchaseOrder) => (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-zinc-500" />
        <span>${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    )
  },
  { 
    id: 'expectedDelivery',
    label: 'Expected Delivery',
    icon: Clock,
    sortable: true,
    cell: (order: PurchaseOrder) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-zinc-500" />
        <span>{order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'N/A'}</span>
      </div>
    )
  },
  { 
    id: 'status',
    label: 'Status',
    sortable: true,
    cell: (order: PurchaseOrder) => {
      const statusStyles = {
        'Draft': "text-zinc-500 bg-zinc-500/10",
        'Pending': "text-yellow-500 bg-yellow-500/10",
        'Confirmed': "text-blue-500 bg-blue-500/10",
        'Shipped': "text-purple-500 bg-purple-500/10",
        'Delivered': "text-green-500 bg-green-500/10",
        'Cancelled': "text-red-500 bg-red-500/10"
      }
      return (
        <Badge className={cn(
          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
          statusStyles[order.status]
        )}>
          {order.status}
        </Badge>
      )
    }
  },
  { 
    id: 'actions',
    label: '',
    sortable: false,
    cell: (order: PurchaseOrder) => <ActionMenu order={order} />
  }
]

export function PurchaseOrdersTable({ 
  data,
  selectedItems,
  onSelectionChange,
  sortConfig,
  onSort
}: PurchaseOrdersTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const handleSelectAll = () => {
    onSelectionChange(selectedItems.length === data.length ? [] : data.map(item => item.id))
  }

  const handleSelectRow = (id: string) => {
    onSelectionChange(
      selectedItems.includes(id)
        ? selectedItems.filter(item => item !== id)
        : [...selectedItems, id]
    )
  }

  const getSortIcon = (columnId: string) => {
    if (sortConfig?.column !== columnId) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return sortConfig.direction === 'desc' 
      ? <ChevronDown className="h-4 w-4" />
      : <ChevronUp className="h-4 w-4" />
  }

  return (
    <div className="rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40px] h-12">
              <Checkbox
                checked={selectedItems.length === data.length && data.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
                className="translate-y-[2px]"
              />
            </TableHead>
            {columns.map((column) => (
              <TableHead 
                key={column.id}
                className={cn(
                  "h-12",
                  column.sortable && "cursor-pointer hover:bg-zinc-800/50"
                )}
                onClick={() => column.sortable && onSort(column.id)}
              >
                <div className="flex items-center gap-2">
                  {column.icon && <column.icon className="h-4 w-4 text-muted-foreground" />}
                  <span>{column.label}</span>
                  {column.sortable && (
                    <div className="w-4">
                      {getSortIcon(column.id)}
                    </div>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((order) => (
            <TableRow
              key={order.id}
              className={cn(
                "cursor-pointer transition-colors h-[50px]",
                hoveredRow === order.id ? "bg-white/5" : "hover:bg-white/5",
                selectedItems.includes(order.id) && "bg-white/10"
              )}
              onMouseEnter={() => setHoveredRow(order.id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => handleSelectRow(order.id)}
            >
              <TableCell className="w-[40px]">
                <Checkbox
                  checked={selectedItems.includes(order.id)}
                  onCheckedChange={() => handleSelectRow(order.id)}
                  aria-label="Select row"
                  className="translate-y-[2px]"
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  className="text-zinc-100 h-[50px] py-3"
                >
                  {column.cell(order)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
