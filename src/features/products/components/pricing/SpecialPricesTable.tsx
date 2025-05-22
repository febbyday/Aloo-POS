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
import { useState, useEffect } from "react"
import { formatCurrency } from '@/lib/utils/formatters';
import { apiClient } from "@/lib/api/api-client"
import { useApiTransition } from "@/hooks/useApiTransition"
import { ApiTransitionWrapper } from "@/components/api-transition-wrapper"

interface SpecialPricesTableProps {
  categories: Category[]
  data?: SpecialPrice[]
}

// Fallback data for when API is unavailable
const fallbackSpecialPrices: SpecialPrice[] = [
  {
    id: "1",
    productId: "prod-1",
    productName: "Organic Coffee Beans",
    regularPrice: 12.99,
    specialPrice: 9.99,
    startDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    minimumQuantity: 2,
    status: "active",
    customerGroupId: null,
    categoryId: "cat-1"
  },
  {
    id: "2",
    productId: "prod-2",
    productName: "Stainless Steel Water Bottle",
    regularPrice: 24.99,
    specialPrice: 19.99,
    startDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    minimumQuantity: 1,
    status: "scheduled",
    customerGroupId: null,
    categoryId: "cat-2"
  },
  {
    id: "3",
    productId: "prod-3",
    productName: "Wireless Earbuds",
    regularPrice: 79.99,
    specialPrice: 59.99,
    startDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    minimumQuantity: 1,
    status: "expired",
    customerGroupId: "group-1",
    categoryId: "cat-3"
  },
  {
    id: "4",
    productId: "prod-4",
    productName: "Organic Tea Sampler",
    regularPrice: 18.99,
    specialPrice: 14.99,
    startDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    minimumQuantity: 3,
    status: "active",
    customerGroupId: null,
    categoryId: "cat-1"
  },
  {
    id: "5",
    productId: "prod-5",
    productName: "Bamboo Cutting Board",
    regularPrice: 29.99,
    specialPrice: 22.99,
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    minimumQuantity: 1,
    status: "active",
    customerGroupId: null,
    categoryId: "cat-2"
  }
];

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
  const itemsPerPage = 15

  // Use API transition hook if no data is provided as prop
  const {
    data: apiSpecialPrices,
    isLoading,
    error,
    isFallback
  } = useApiTransition<SpecialPrice[]>({
    apiCall: () => apiClient.get('products/special-prices'),
    fallbackData: fallbackSpecialPrices,
    dependencies: [],
    // Only call the API if no data was provided via props
    autoRetry: true,
    silent: data.length > 0
  });

  // Use provided data if available, otherwise use API data
  const displayData = data.length > 0 ? data : (apiSpecialPrices || []);

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

  const renderPageNumbers = () => {
    const pageNumbers = []
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    } else {
      // Always show first page
      pageNumbers.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      )

      // Show ellipsis if current page is > 3
      if (currentPage > 3) {
        pageNumbers.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      // Show current page and neighbors
      const startNeighbor = Math.max(2, currentPage - 1)
      const endNeighbor = Math.min(totalPages - 1, currentPage + 1)

      for (let i = startNeighbor; i <= endNeighbor; i++) {
        pageNumbers.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }

      // Show ellipsis if current page is < totalPages - 2
      if (currentPage < totalPages - 2) {
        pageNumbers.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      // Always show last page
      pageNumbers.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return pageNumbers
  }

  // Return the main content wrapped in our transition component
  return (
    <ApiTransitionWrapper
      componentName="Special Prices Table"
      isLoading={isLoading && data.length === 0}
      error={error}
      requiresRealApi={false}
    >
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.id} className="w-auto">
                    <div className="flex items-center gap-2">
                      <column.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{column.label}</span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-32 text-center">
                    No special prices found
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        SKU: {item.productId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-primary">
                        {formatCurrency(item.specialPrice)}
                      </div>
                      <div className="text-sm text-muted-foreground line-through">
                        {formatCurrency(item.regularPrice)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(item.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(item.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {item.minimumQuantity > 1 ? (
                        <Badge variant="outline">{item.minimumQuantity}+</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {renderPageNumbers()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {isFallback && data.length === 0 && (
          <div className="text-sm text-muted-foreground italic px-2">
            Note: Currently showing sample data. Connect to API for real-time pricing information.
          </div>
        )}
      </div>
    </ApiTransitionWrapper>
  )
}

export default SpecialPricesTable;
