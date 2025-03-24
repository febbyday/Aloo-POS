import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign, 
  Calendar, 
  CalendarRange, 
  Hash,
  Activity,
  MoreVertical
} from "lucide-react"
import type { SpecialPrice, Category } from "../../types"
import { mockSpecialPrices } from "../../mocks/pricingData"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils"

interface SpecialPricesTableProps {
  categories: Category[]
  data?: SpecialPrice[]
}

const columns = [
  { 
    id: 'product', 
    label: 'Product',
    icon: Package
  },
  { 
    id: 'price', 
    label: 'Special Price',
    icon: DollarSign
  },
  { 
    id: 'startDate', 
    label: 'Start Date',
    icon: Calendar
  },
  { 
    id: 'endDate', 
    label: 'End Date',
    icon: CalendarRange
  },
  { 
    id: 'minimumQuantity', 
    label: 'Min. Quantity',
    icon: Hash
  },
  { 
    id: 'status', 
    label: 'Status',
    icon: Activity
  },
]

export function SpecialPricesTable({ 
  categories,
  data = [],
}: SpecialPricesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const displayData = data.length > 0 ? data : mockSpecialPrices

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = displayData.slice(startIndex, endIndex)
  const totalPages = Math.ceil(displayData.length / itemsPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/15 text-green-500"
      case "scheduled":
        return "bg-blue-500/15 text-blue-500"
      case "expired":
        return "bg-gray-500/15 text-gray-500"
      default:
        return "bg-gray-500/15 text-gray-500"
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return "No end date"
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <div className="">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead 
                  key={column.id}
                  className="font-medium h-12"
                >
                  <div className="flex items-center gap-2">
                    <column.icon className="h-4 w-4 text-muted-foreground" />
                    {column.label}
                  </div>
                </TableHead>
              ))}
              <TableHead className="font-medium text-right">
                <div className="flex items-center justify-end gap-2">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  Actions
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((price) => (
              <TableRow key={price.id} className="hover:bg-muted/50">
                <TableCell className="font-medium py-4">{price.productId}</TableCell>
                <TableCell className="py-4">{formatCurrency(price.price)}</TableCell>
                <TableCell className="py-4">{formatDate(price.startDate)}</TableCell>
                <TableCell className="py-4">{formatDate(price.endDate)}</TableCell>
                <TableCell className="py-4">{price.minimumQuantity}</TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="secondary"
                    className={getStatusColor(price.status)}
                  >
                    {price.status.charAt(0).toUpperCase() + price.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {totalPages <= 7 ? (
              Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))
            ) : (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(1)}
                    isActive={currentPage === 1}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {currentPage > 2 && <PaginationEllipsis />}
                {currentPage > 1 && currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(currentPage)}
                      isActive
                    >
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                )}
                {currentPage < totalPages - 1 && <PaginationEllipsis />}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(totalPages)}
                    isActive={currentPage === totalPages}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default SpecialPricesTable;
