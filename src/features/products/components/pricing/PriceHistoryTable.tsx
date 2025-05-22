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
import type { PriceHistory } from "../../types"
import { useState, useEffect } from "react"
import {
  Calendar,
  Package,
  DollarSign,
  Info,
  User,
  RefreshCw,
  FileDown,
  Pencil,
  ChevronsUpDown,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { apiClient } from "@/lib/api/api-client"
import { useApiTransition } from "@/hooks/useApiTransition"
import { ApiTransitionWrapper } from "@/components/api-transition-wrapper"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PriceHistoryTableProps {
  data?: PriceHistory[]
  productId?: string
}

const columns = [
  {
    id: 'date',
    label: 'Date',
    icon: Calendar
  },
  {
    id: 'product',
    label: 'Product',
    icon: Package
  },
  {
    id: 'price',
    label: 'Price',
    icon: DollarSign
  },
  {
    id: 'reason',
    label: 'Reason',
    icon: Info
  },
  {
    id: 'updatedBy',
    label: 'Updated By',
    icon: User
  }
]

// Fallback data in case API is not available
const fallbackPriceHistory: PriceHistory[] = [
  {
    id: "1",
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    productId: "P-001",
    price: 24.99,
    previousPrice: 21.99,
    reason: "Market adjustment",
    updatedBy: "John Doe"
  },
  {
    id: "2",
    date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    productId: "P-002",
    price: 49.99,
    previousPrice: 59.99,
    reason: "Seasonal promotion",
    updatedBy: "Jane Smith"
  },
  {
    id: "3",
    date: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
    productId: "P-003",
    price: 14.50,
    previousPrice: 12.99,
    reason: "Supplier price increase",
    updatedBy: "Mike Johnson"
  },
  {
    id: "4",
    date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    productId: "P-001",
    price: 21.99,
    previousPrice: 19.99,
    reason: "Cost adjustment",
    updatedBy: "Emily Davis"
  },
  {
    id: "5",
    date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
    productId: "P-004",
    price: 35.00,
    previousPrice: 42.99,
    reason: "Clearance",
    updatedBy: "Robert Wilson"
  }
];

export function PriceHistoryTable({ data, productId }: PriceHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [isFallbackData, setIsFallbackData] = useState(false)

  const { data: fetchedData, isLoading: isApiLoading, error, isMock } = useApiTransition<PriceHistory[]>({
    apiCall: () => {
      const endpoint = productId
        ? `products/${productId}/price-history`
        : 'products/price-history';
      return apiClient.get(endpoint);
    },
    fallbackData: data || fallbackPriceHistory,
    dependencies: [productId],
    skip: Boolean(data) // Skip API call if data is provided via props
  });

  useEffect(() => {
    if (fetchedData) {
      setPriceHistory(fetchedData);
      setIsFallbackData(isMock);
    }
  }, [fetchedData, isMock]);

  // Handle manual refresh
  const handleRefresh = async () => {
    if (data) return; // Don't refresh if data is provided via props

    setIsLoading(true);
    try {
      const endpoint = productId
        ? `products/${productId}/price-history`
        : 'products/price-history';
      const response = await apiClient.get(endpoint);
      setPriceHistory(response.data);
      setIsFallbackData(false);
    } catch (error) {
      console.error('Failed to refresh price history:', error);
      // Keep using existing data
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on search term
  const filteredData = priceHistory.filter(item =>
    item.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.updatedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <ApiTransitionWrapper
      isLoading={isApiLoading || isLoading}
      error={error}
      isEmpty={!paginatedData.length}
      emptyMessage="No price history data available"
    >
      <div className="space-y-4">
        {isFallbackData && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Using demo data</AlertTitle>
            <AlertDescription>
              Connected to API in demo mode. Price history data shown is for demonstration purposes only.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
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
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <div className="h-8 w-[1px] bg-border" />
            <Button variant="outline" size="sm" className="h-8">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Prices
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              className="h-8 w-[200px]"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground border-none shadow-none">
          <div className="p-0">
            <div className="relative w-full overflow-auto">
              <div className="space-y-4 [&_[role=cell]]:py-3">
                <div className="rounded-md">
                  <div className="relative w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-2 text-left align-middle font-medium text-zinc-100 h-[50px] cursor-pointer hover:bg-zinc-800/50">
                            <div className="flex items-center gap-2">
                              <Checkbox className="translate-y-[2px]" />
                            </div>
                          </TableHead>
                          {columns.map((column) => (
                            <TableHead
                              key={column.id}
                              className="px-2 text-left align-middle font-medium text-zinc-100 h-[50px] cursor-pointer hover:bg-zinc-800/50"
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <column.icon className="h-4 w-4 text-muted-foreground" />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                                  >
                                    {column.label}
                                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="w-4">
                                  <ChevronsUpDown className="h-4 w-4 opacity-30" />
                                </div>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.map((history) => (
                          <TableRow
                            key={history.id}
                            className="transition-colors data-[state=selected]:bg-muted cursor-pointer"
                            data-state="false"
                          >
                            <TableCell className="px-2 align-middle [&:has([role=checkbox])]:pr-0">
                              <Checkbox className="translate-y-[2px]" />
                            </TableCell>
                            <TableCell className="px-2 align-middle [&:has([role=checkbox])]:pr-0">
                              <div className="flex items-center">
                                <span className="text-muted-foreground">
                                  {new Date(history.date).toLocaleDateString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 align-middle [&:has([role=checkbox])]:pr-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{history.productId}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 align-middle [&:has([role=checkbox])]:pr-0">
                              <div className="font-medium tabular-nums">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(history.price)}
                              </div>
                            </TableCell>
                            <TableCell className="px-2 align-middle [&:has([role=checkbox])]:pr-0">
                              <div className="flex items-center">
                                <span className="text-muted-foreground">{history.reason || "-"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 align-middle [&:has([role=checkbox])]:pr-0">
                              <div className="flex items-center">
                                <span className="text-muted-foreground">{history.updatedBy}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-500">Show</span>
                      <Select defaultValue={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                        <Select.Trigger className="w-[70px]">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="10">10</Select.Item>
                          <Select.Item value="15">15</Select.Item>
                          <Select.Item value="20">20</Select.Item>
                          <Select.Item value="30">30</Select.Item>
                          <Select.Item value="50">50</Select.Item>
                        </Select.Content>
                      </Select>
                      <span className="text-sm text-zinc-500">entries</span>
                    </div>
                    <div className="text-sm text-zinc-500">
                      Showing {filteredData.length ? startIndex + 1 : 0} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0 || !paginatedData.length}
                      aria-label="Previous page"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center">
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        const pageIndex = currentPage < 2 ? i :
                                         currentPage > totalPages - 3 ? totalPages - 5 + i :
                                         currentPage - 2 + i;
                        if (pageIndex >= 0 && pageIndex < totalPages) {
                          return (
                            <Button
                              key={pageIndex}
                              variant={currentPage === pageIndex ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageIndex)}
                              className="w-8 h-8 mx-1"
                              aria-label={`Page ${pageIndex + 1}`}
                              aria-current={currentPage === pageIndex ? "page" : undefined}
                            >
                              {pageIndex + 1}
                            </Button>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1 || !paginatedData.length}
                      aria-label="Next page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ApiTransitionWrapper>
  )
}

export default PriceHistoryTable;
