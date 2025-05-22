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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Package,
  Hash,
  DollarSign,
  Boxes,
  AlertCircle,
  BarChart,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Layers,
} from "lucide-react"
import { Product } from "@/types/inventory"
import { useState } from 'react'
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

interface ProductsTableProps {
  data: Product[]
  selectedItems: string[]
  onSelectionChange: (selectedItems: string[]) => void
  onProductDoubleClick?: (product: Product) => void
  sortConfig: { column: string; direction: 'asc' | 'desc' } | null
  onSort: (column: string) => void
  visibleColumns: string[]
}

interface ActionMenuProps {
  product: Product
}

function ActionMenu({ product }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleActionClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation()
    console.log(action, product.id)
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
            className="block w-full px-4 py-2 text-left text-foreground hover:bg-muted/50"
            onClick={(e) => handleActionClick(e, 'edit')}
          >
            <span className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </span>
          </button>
          <button 
            className="block w-full px-4 py-2 text-left text-foreground hover:bg-muted/50"
            onClick={(e) => handleActionClick(e, 'transfer')}
          >
            <span className="flex items-center">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Transfer
            </span>
          </button>
          <button 
            className="block w-full px-4 py-2 text-left text-foreground hover:bg-muted/50"
            onClick={(e) => handleActionClick(e, 'history')}
          >
            <span className="flex items-center">
              <History className="mr-2 h-4 w-4" />
              View History
            </span>
          </button>
          <div className="border-t border-zinc-800 my-1" />
          <button 
            className="block w-full px-4 py-2 text-left text-red-500 hover:bg-muted/50"
            onClick={(e) => handleActionClick(e, 'delete')}
          >
            <span className="flex items-center">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
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
    label: 'Product Name',
    icon: Package
  },
  { 
    id: 'productType', 
    label: 'Type',
    icon: Layers
  },
  { 
    id: 'sku', 
    label: 'SKU',
    icon: Hash
  },
  { 
    id: 'price', 
    label: 'Price',
    icon: DollarSign
  },
  { 
    id: 'stock', 
    label: 'Stock',
    icon: Boxes
  },
  { 
    id: 'status', 
    label: 'Status',
    icon: AlertCircle
  },
  { 
    id: 'category', 
    label: 'Category',
    icon: BarChart
  },
  { 
    id: 'supplier', 
    label: 'Supplier',
    icon: Package
  }
]

export function ProductsTable({ 
  data,
  selectedItems, 
  onSelectionChange,
  onProductDoubleClick,
  sortConfig,
  onSort,
  visibleColumns,
}: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const navigate = useNavigate();

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = data.slice(startIndex, endIndex)
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const toggleRowSelection = (id: string) => {
    const newSelection = selectedItems.includes(id)
      ? selectedItems.filter(item => item !== id)
      : [...selectedItems, id]
    onSelectionChange(newSelection)
  }

  const toggleAllSelection = () => {
    onSelectionChange(
      selectedItems.length === data.length 
        ? [] 
        : data.map(item => item.id)
    )
  }

  const handleViewProduct = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <Checkbox
                  checked={selectedItems.length === data.length && data.length > 0}
                  onCheckedChange={toggleAllSelection}
                  aria-label="Select all products"
                />
              </TableHead>
              {columns.filter(col => visibleColumns.includes(col.id)).map((column) => (
                <TableHead
                  key={column.id}
                  className="h-12 cursor-pointer hover:bg-muted/50"
                  onClick={() => onSort(column.id)}
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow 
                key={item.id} 
                className={cn(
                  "border-b border-border transition-colors hover:bg-muted/50 cursor-pointer",
                  selectedItems.includes(item.id) && "bg-muted"
                )}
                onClick={() => toggleRowSelection(item.id)}
                onDoubleClick={() => onProductDoubleClick?.(item)}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleRowSelection(item.id)}
                    aria-label={`Select product ${item.name}`}
                  />
                </TableCell>
                {visibleColumns.includes('name') && (
                  <TableCell className="h-[50px] py-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-400" />
                      {item.name}
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('productType') && (
                  <TableCell className="h-[50px] py-3">
                    <Badge variant={item.productType === 'single' ? 'outline' : 'secondary'}>
                      {item.productType === 'single' ? 'Single' : 'Variable'}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('sku') && (
                  <TableCell className="h-[50px] py-3">
                    {item.sku}
                  </TableCell>
                )}
                {visibleColumns.includes('price') && (
                  <TableCell className="h-[50px] py-3">
                    <span className="font-medium">
                      ${item.retailPrice.toFixed(2)}
                    </span>
                  </TableCell>
                )}
                {visibleColumns.includes('stock') && (
                  <TableCell className="h-[50px] py-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const totalStock = item.locations.reduce((total, loc) => total + loc.stock, 0)
                        const isLowStock = item.locations.some(loc => 
                          loc.stock < (loc.minStock ?? item.minStock)
                        )
                        return (
                          <>
                            <span className={isLowStock ? "text-red-500" : "text-green-500"}>
                              {totalStock}
                            </span>
                            {isLowStock && (
                              <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes('status') && (
                  <TableCell className="h-[50px] py-3">
                    <Badge 
                      variant={
                        item.locations.every(loc => loc.stock >= (loc.minStock ?? item.minStock))
                          ? 'success'
                          : item.locations.every(loc => loc.stock === 0)
                            ? 'destructive'
                            : 'default'
                      }
                      className="capitalize"
                    >
                      {item.locations.every(loc => loc.stock >= (loc.minStock ?? item.minStock))
                        ? 'In Stock'
                        : item.locations.every(loc => loc.stock === 0)
                          ? 'Out of Stock'
                          : 'Low Stock'
                      }
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.includes('category') && (
                  <TableCell className="h-[50px] py-3">
                    {item.category}
                  </TableCell>
                )}
                {visibleColumns.includes('supplier') && (
                  <TableCell className="h-[50px] py-3">
                    {item.supplier?.name || 'Not specified'}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct(item);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(0)
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-8 px-3 py-1.5"
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <Button
              key={page}
              variant={currentPage === page - 1 ? "default" : "outline"}
              className="h-8 px-3 py-1.5 hidden md:inline-flex"
              onClick={() => setCurrentPage(page - 1)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-8 px-3 py-1.5"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
