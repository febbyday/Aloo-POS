import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal,
  Edit,
  History,
  ArrowLeftRight,
  Star,
  Package,
  Mail,
  Phone,
  User,
  Building,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Hash,
} from "lucide-react"
import { useState } from 'react'
import { cn } from "@/lib/utils"
import { Supplier, SUPPLIER_STATUS } from '../types'

interface SuppliersTableProps {
  data: Supplier[]
  selectedItems: string[]
  onSelectionChange: (selectedItems: string[]) => void
  onSupplierClick?: (supplier: Supplier) => void
  onViewSupplier?: (supplier: Supplier) => void
  sortConfig: { column: string; direction: 'asc' | 'desc' } | null
  onSort: (column: string) => void
}

interface ActionMenuProps {
  supplier: Supplier
}

function ActionMenu({ supplier }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleActionClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation()
    console.log(action, supplier.id)
    setIsOpen(false)
  }

  return (
    <div className="relative action-menu" onClick={(e) => e.stopPropagation()}>
      <button 
        className="p-1 rounded-md hover:bg-muted/50"
        onClick={handleClick}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-popover border border-border shadow-lg w-48 rounded-md py-1 z-50">
          <button 
            className="block w-full px-4 py-2 text-left hover:bg-muted/50"
            onClick={(e) => handleActionClick(e, 'edit')}
          >
            <span className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </span>
          </button>
          <button 
            className="block w-full px-4 py-2 text-left hover:bg-muted/50"
            onClick={(e) => handleActionClick(e, 'history')}
          >
            <span className="flex items-center">
              <History className="mr-2 h-4 w-4" />
              View History
            </span>
          </button>
          <button 
            className="block w-full px-4 py-2 text-left hover:bg-muted/50"
            onClick={(e) => handleActionClick(e, 'orders')}
          >
            <span className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              View Orders
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

const columns = [
  { 
    id: 'name',
    label: 'Supplier Name',
    icon: Building,
    sortable: true,
    cell: (supplier: Supplier) => (
      <div className="flex items-center gap-2">
        <Building className="h-4 w-4 text-muted-foreground" />
        <span>{supplier.name}</span>
      </div>
    )
  },
  { 
    id: 'code',
    label: 'Code',
    icon: Hash,
    sortable: true,
    cell: (supplier: Supplier) => (
      <div className="font-mono text-sm">
        {supplier.id.toUpperCase()}
      </div>
    )
  },
  { 
    id: 'email',
    label: 'Email',
    icon: Mail,
    sortable: true,
    cell: (supplier: Supplier) => (
      <div>
        {supplier.email}
      </div>
    )
  },
  { 
    id: 'phone',
    label: 'Phone',
    icon: Phone,
    sortable: true,
    cell: (supplier: Supplier) => (
      <div>
        {supplier.phone}
      </div>
    )
  },
  { 
    id: 'products',
    label: 'Products',
    icon: Package,
    sortable: true,
    cell: (supplier: Supplier) => (
      <div>
        {supplier.products}
      </div>
    )
  },
  { 
    id: 'status',
    label: 'Status',
    icon: AlertCircle,
    sortable: true,
    cell: (supplier: Supplier) => {
      const statusStyles = {
        'In Stock': "text-green-500 bg-green-500/10",
        'Low Stock': "text-red-500 bg-red-500/10",
        'Out of Stock': "text-zinc-500 bg-zinc-500/10"
      }
      return (
        <div className={cn(
          "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
          statusStyles[supplier.status as keyof typeof statusStyles]
        )}>
          {supplier.status}
        </div>
      )
    }
  },
  { 
    id: 'type',
    label: 'Type',
    icon: Package,
    sortable: true,
    cell: (supplier: Supplier) => (
      <div>
        {supplier.type}
      </div>
    )
  },
  { 
    id: 'actions',
    label: '',
    sortable: false,
    cell: (supplier: Supplier) => <ActionMenu supplier={supplier} />
  }
]

export function SuppliersTable({ 
  data,
  selectedItems, 
  onSelectionChange,
  onSupplierClick,
  onViewSupplier,
  sortConfig,
  onSort,
}: SuppliersTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const handleSelectAll = () => {
    if (selectedItems.length === data.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(data.map(supplier => supplier.id))
    }
  }

  const handleSelectRow = (supplierId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (selectedItems.includes(supplierId)) {
      onSelectionChange(selectedItems.filter(id => id !== supplierId))
    } else {
      onSelectionChange([...selectedItems, supplierId])
    }
  }

  const handleRowClick = (supplier: Supplier) => {
    if (!selectedItems.includes(supplier.id)) {
      onSelectionChange([supplier.id])
    }
  }

  const handleRowDoubleClick = (supplier: Supplier) => {
    if (onViewSupplier) {
      onViewSupplier(supplier)
    }
  }

  const getSortIcon = (columnId: string) => {
    if (!sortConfig || sortConfig.column !== columnId) {
      return <ChevronsUpDown className="h-4 w-4" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }

  return (
    <div className="">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
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
                  column.sortable && "cursor-pointer hover:bg-muted/50"
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
          {data.map((supplier) => (
            <TableRow
              key={supplier.id}
              className={cn(
                "cursor-pointer transition-colors h-[50px]",
                hoveredRow === supplier.id ? "bg-muted/20" : "hover:bg-muted/20",
                selectedItems.includes(supplier.id) && "bg-muted/40"
              )}
              onMouseEnter={() => setHoveredRow(supplier.id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => handleRowClick(supplier)}
              onDoubleClick={() => handleRowDoubleClick(supplier)}
            >
              <TableCell className="w-[40px]">
                <Checkbox
                  checked={selectedItems.includes(supplier.id)}
                  onCheckedChange={(e) => handleSelectRow(supplier.id, e as any)}
                  aria-label="Select row"
                  className="translate-y-[2px]"
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  className={cn(
                    "h-[50px] py-0",
                    column.id === 'name' && "font-medium"
                  )}
                >
                  {column.cell(supplier)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
