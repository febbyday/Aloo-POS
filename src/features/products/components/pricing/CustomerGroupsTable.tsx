/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CustomerGroup } from "../../types"
import { useState, useEffect } from "react"
import {
  Users,
  FileText,
  Percent,
  DollarSign,
  AlertCircle,
  Search,
  Plus,
  RefreshCw
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api/api-client"
import { useApiTransition } from "@/hooks/useApiTransition"
import { ApiTransitionWrapper } from "@/components/api-transition-wrapper"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CustomerGroupsTableProps {
  data?: CustomerGroup[]
}

const columns = [
  {
    id: 'name',
    label: 'Group Name',
    icon: Users
  },
  {
    id: 'description',
    label: 'Description',
    icon: FileText
  },
  {
    id: 'discountType',
    label: 'Discount Type',
    icon: Percent
  },
  {
    id: 'discountValue',
    label: 'Discount Value',
    icon: DollarSign
  }
]

// Fallback data in case API is not available
const fallbackCustomerGroups: CustomerGroup[] = [
  {
    id: "1",
    name: "VIP Customers",
    description: "High-value repeat customers",
    discountType: "percentage",
    discountValue: 15,
    memberCount: 42,
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString()
  },
  {
    id: "2",
    name: "Wholesale",
    description: "Business and bulk purchase customers",
    discountType: "percentage",
    discountValue: 20,
    memberCount: 18,
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 8)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString()
  },
  {
    id: "3",
    name: "Employees",
    description: "Staff discount program",
    discountType: "percentage",
    discountValue: 25,
    memberCount: 11,
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 45)).toISOString()
  },
  {
    id: "4",
    name: "Loyalty Program",
    description: "Customers enrolled in loyalty program",
    discountType: "fixed",
    discountValue: 10,
    memberCount: 156,
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 10)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString()
  },
  {
    id: "5",
    name: "Seniors",
    description: "Senior citizen discount",
    discountType: "percentage",
    discountValue: 10,
    memberCount: 87,
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 7)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()
  }
];

export function CustomerGroupsTable({ data }: CustomerGroupsTableProps) {
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([])
  const [isFallbackData, setIsFallbackData] = useState(false)

  const { data: fetchedData, isLoading: isApiLoading, error, isMock } = useApiTransition<CustomerGroup[]>({
    apiCall: () => apiClient.get('products/customer-groups'),
    fallbackData: data || fallbackCustomerGroups,
    dependencies: [],
    skip: Boolean(data) // Skip API call if data is provided via props
  });

  useEffect(() => {
    if (fetchedData) {
      setCustomerGroups(fetchedData);
      setIsFallbackData(isMock);
    }
  }, [fetchedData, isMock]);

  // Handle manual refresh
  const handleRefresh = async () => {
    if (data) return; // Don't refresh if data is provided via props

    setIsLoading(true);
    try {
      const response = await apiClient.get('products/customer-groups');
      setCustomerGroups(response.data);
      setIsFallbackData(false);
    } catch (error) {
      console.error('Failed to refresh customer groups:', error);
      // Keep using existing data
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on search term
  const filteredData = customerGroups.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  return (
    <ApiTransitionWrapper
      isLoading={isApiLoading || isLoading}
      error={error}
      isEmpty={!paginatedData.length}
      emptyMessage="No customer groups available"
    >
      <div className="space-y-4">
        {isFallbackData && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Using demo data</AlertTitle>
            <AlertDescription>
              Connected to API in demo mode. Customer group data shown is for demonstration purposes only.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleRefresh}
              disabled={isLoading || Boolean(data)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-2" />
              New Group
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-2 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 w-[200px]"
              />
            </div>
          </div>
        </div>

        <div className="">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className="h-12"
                  >
                    <div className="flex items-center gap-2">
                      <column.icon className="h-4 w-4" />
                      <span>{column.label}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((group) => (
                <TableRow key={group.id} className="transition-colors hover:bg-white/5">
                  <TableCell className="text-zinc-100 h-[50px] py-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      {group.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-100 h-[50px] py-3">{group.description || "-"}</TableCell>
                  <TableCell className="text-zinc-100 h-[50px] py-3">
                    <Badge variant="outline">
                      {group.discountType.charAt(0).toUpperCase() + group.discountType.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-100 h-[50px] py-3">
                    {group.discountType === "percentage"
                      ? `${group.discountValue}%`
                      : new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(group.discountValue)
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Show</span>
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
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-zinc-500">entries</span>
            </div>
            <div className="text-sm text-zinc-500">
              Showing {filteredData.length ? startIndex + 1 : 0} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-8 px-3 py-1.5"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0 || !paginatedData.length}
              aria-label="Previous page"
            >
              Previous
            </Button>
            {totalPages <= 5 ? (
              // Show all pages if 5 or fewer
              Array.from({ length: totalPages }, (_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index ? "default" : "outline"}
                  className="h-8 px-3 py-1.5 hidden md:inline-flex"
                  onClick={() => setCurrentPage(index)}
                  aria-label={`Page ${index + 1}`}
                  aria-current={currentPage === index ? "page" : undefined}
                >
                  {index + 1}
                </Button>
              ))
            ) : (
              // Show a window of pages
              <>
                {/* First page */}
                {currentPage > 1 && (
                  <Button
                    variant="outline"
                    className="h-8 px-3 py-1.5 hidden md:inline-flex"
                    onClick={() => setCurrentPage(0)}
                    aria-label="First page"
                  >
                    1
                  </Button>
                )}

                {/* Ellipsis if not showing first page */}
                {currentPage > 2 && (
                  <div className="px-2 py-1.5 text-zinc-500">...</div>
                )}

                {/* Current page and neighbors */}
                {Array.from({ length: Math.min(3, totalPages) }, (_, index) => {
                  const pageIndex = currentPage <= 1 ? index :
                                   currentPage >= totalPages - 2 ? totalPages - 3 + index :
                                   currentPage - 1 + index;
                  if (pageIndex >= 0 && pageIndex < totalPages) {
                    return (
                      <Button
                        key={pageIndex}
                        variant={currentPage === pageIndex ? "default" : "outline"}
                        className="h-8 px-3 py-1.5 hidden md:inline-flex"
                        onClick={() => setCurrentPage(pageIndex)}
                        aria-label={`Page ${pageIndex + 1}`}
                        aria-current={currentPage === pageIndex ? "page" : undefined}
                      >
                        {pageIndex + 1}
                      </Button>
                    );
                  }
                  return null;
                })}

                {/* Ellipsis if not showing last page */}
                {currentPage < totalPages - 3 && (
                  <div className="px-2 py-1.5 text-zinc-500">...</div>
                )}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <Button
                    variant="outline"
                    className="h-8 px-3 py-1.5 hidden md:inline-flex"
                    onClick={() => setCurrentPage(totalPages - 1)}
                    aria-label="Last page"
                  >
                    {totalPages}
                  </Button>
                )}
              </>
            )}
            <Button
              variant="outline"
              className="h-8 px-3 py-1.5"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1 || !paginatedData.length}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </ApiTransitionWrapper>
  )
}

export default CustomerGroupsTable;
