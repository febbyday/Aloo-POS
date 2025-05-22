import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Tent, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  ArrowUpDown,
  Store,
  Activity,
  DollarSign,
  ChevronsUpDown
} from 'lucide-react'
import { MarketStockTransfer } from './MarketStockTransfer'
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress'
import { Market, MarketFilter } from '../pages/MarketsPage'
import { MarketsToolbar } from './MarketsToolbar'
import { useNavigate } from 'react-router-dom'
import { MARKETS_FULL_ROUTES } from '@/routes/marketRoutes'

interface MarketsTableProps {
  filters: MarketFilter
  selectedMarkets: string[]
  onSelectionChange: (selectedMarkets: string[]) => void
  onEdit: (market: Market) => void
  onViewDetails: (market: Market) => void
  onRefresh: () => void
  onNewMarket: () => void
  onEditMarket: () => void
  onDeleteMarket: () => void
  onExport: () => void
  setFilters: (filters: MarketFilter) => void
}

// Mock data - replace with actual API call
const mockMarkets: Market[] = [
  {
    id: '1',
    name: 'Summer Festival Market',
    location: 'Central Park',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-07'),
    status: 'planning',
    progress: 25,
    stockAllocation: {
      allocated: 150,
      total: 500
    },
    staffAssigned: {
      assigned: 5,
      required: 12
    }
  },
  {
    id: '2',
    name: 'Holiday Pop-up Market',
    location: 'Downtown Mall',
    startDate: new Date('2024-12-15'),
    endDate: new Date('2024-12-24'),
    status: 'active',
    progress: 75,
    stockAllocation: {
      allocated: 300,
      total: 400
    },
    staffAssigned: {
      assigned: 8,
      required: 8
    }
  },
]

function getStatusColor(status: Market['status']) {
  switch (status) {
    case 'planning':
      return 'bg-blue-500/10 text-blue-500'
    case 'active':
      return 'bg-green-500/10 text-green-500'
    case 'completed':
      return 'bg-zinc-500/10 text-zinc-500'
    case 'cancelled':
      return 'bg-red-500/10 text-red-500'
    default:
      return 'bg-zinc-500/10 text-zinc-500'
  }
}

export function MarketsTable({ 
  filters, 
  selectedMarkets, 
  onSelectionChange,
  onEdit,
  onViewDetails,
  onRefresh,
  onNewMarket,
  onEditMarket,
  onDeleteMarket,
  onExport,
  setFilters
}: MarketsTableProps) {
  const navigate = useNavigate()
  const [itemsPerPage] = useState(10)
  const [currentPage] = useState(0)
  const [sortConfig, setSortConfig] = useState<{column: string; direction: 'asc' | 'desc'} | null>(null)
  const [showStockTransfer, setShowStockTransfer] = useState(false)

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = mockMarkets.slice(startIndex, endIndex)

  const handleSelectAll = (checked: boolean) => {
    onSelectionChange(checked ? mockMarkets.map(m => m.id) : [])
  }

  const handleSelectMarket = (id: string, checked: boolean) => {
    onSelectionChange(
      checked 
        ? [...selectedMarkets, id]
        : selectedMarkets.filter(m => m !== id)
    )
  }

  const handleSort = (column: string) => {
    setSortConfig(current => ({
      column,
      direction: current?.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleRowClick = (market: Market) => {
    const isSelected = selectedMarkets.includes(market.id)
    handleSelectMarket(market.id, !isSelected)
  }

  const handleRowDoubleClick = (market: Market) => {
    navigate(`${MARKETS_FULL_ROUTES.ROOT}/${market.id}`)
  }

  const handleViewDetails = () => {
    const selectedMarket = mockMarkets.find(m => m.id === selectedMarkets[0])
    if (selectedMarket) {
      navigate(`${MARKETS_FULL_ROUTES.ROOT}/${selectedMarket.id}`)
    }
  }

  return (
    <div className="space-y-2 relative">
      {showStockTransfer && selectedMarkets.length === 1 && (
        <MarketStockTransfer
          market={mockMarkets.find(m => m.id === selectedMarkets[0])!}
          onClose={() => setShowStockTransfer(false)}
        />
      )}

      <MarketsToolbar 
        selectedMarkets={selectedMarkets}
        onRefresh={onRefresh}
        onNewMarket={onNewMarket}
        onEditMarket={onEditMarket}
        onDeleteMarket={onDeleteMarket}
        onExport={onExport}
        onViewDetails={handleViewDetails}
        rightContent={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setShowStockTransfer(true)}
            >
              <Package className="h-4 w-4 mr-2" />
              Manage Stock
            </Button>
            <Input
              className="h-8 w-[200px]"
              placeholder="Search markets..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        }
      />

      <div className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
              <CardTitle className="text-sm font-medium">
                Total Markets
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
              <CardTitle className="text-sm font-medium">
                Active Markets
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-2xl font-bold">21</div>
              <p className="text-xs text-muted-foreground">
                87.5% of total markets
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
              <CardTitle className="text-sm font-medium">
                Average Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-2xl font-bold">$12,543</div>
              <p className="text-xs text-muted-foreground">
                +8.2% from previous quarter
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
              <CardTitle className="text-sm font-medium">
                Inventory Value
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-2xl font-bold">$1.2M</div>
              <p className="text-xs text-muted-foreground">
                Across all markets
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px] h-12">
                <Checkbox
                  checked={selectedMarkets.length === mockMarkets.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead 
                className="h-12 cursor-pointer hover:bg-zinc-800/50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  <Tent className="h-4 w-4 text-blue-400" />
                  <span>Market Name</span>
                  <div className="w-4">
                    {sortConfig?.column === 'name' ? (
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
              <TableHead 
                className="h-12 cursor-pointer hover:bg-zinc-800/50"
                onClick={() => handleSort('location')}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Location</span>
                  <div className="w-4">
                    {sortConfig?.column === 'location' ? (
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
              <TableHead 
                className="h-12 cursor-pointer hover:bg-zinc-800/50"
                onClick={() => handleSort('startDate')}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Date Range</span>
                  <div className="w-4">
                    {sortConfig?.column === 'startDate' ? (
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
              <TableHead 
                className="h-12 cursor-pointer hover:bg-zinc-800/50"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>Stock</span>
                  <div className="w-4">
                    {sortConfig?.column === 'stock' ? (
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
              <TableHead 
                className="h-12 cursor-pointer hover:bg-zinc-800/50"
                onClick={() => handleSort('staff')}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Staff</span>
                  <div className="w-4">
                    {sortConfig?.column === 'staff' ? (
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((market) => (
              <TableRow
                key={market.id}
                className={cn(
                  "border-b transition-colors hover:bg-white/5 cursor-pointer",
                  selectedMarkets.includes(market.id) && "bg-white/10"
                )}
                onClick={() => handleRowClick(market)}
                onDoubleClick={() => handleRowDoubleClick(market)}
              >
                <TableCell className="h-[50px] py-3" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedMarkets.includes(market.id)}
                    onCheckedChange={(checked) => handleSelectMarket(market.id, !!checked)}
                  />
                </TableCell>
                <TableCell className="h-[50px] py-3">
                  <div className="flex items-center gap-2">
                    <Tent className="h-4 w-4 text-blue-400" />
                    <span className="font-medium">{market.name}</span>
                    <Badge className={getStatusColor(market.status)}>
                      {market.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="h-[50px] py-3">
                  <div className="flex items-center">
                    <span className="text-foreground">{market.location}</span>
                  </div>
                </TableCell>
                <TableCell className="h-[50px] py-3">
                  <div className="flex items-center">
                    <span className="text-foreground">
                      {market.startDate.toLocaleDateString()} - {market.endDate.toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="h-[50px] py-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {market.stockAllocation.allocated} / {market.stockAllocation.total} items
                      </span>
                      <span className="text-foreground">
                        {Math.round((market.stockAllocation.allocated / market.stockAllocation.total) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(market.stockAllocation.allocated / market.stockAllocation.total) * 100}
                      className="h-2"
                    />
                  </div>
                </TableCell>
                <TableCell className="h-[50px] py-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {market.staffAssigned.assigned} / {market.staffAssigned.required} staff
                      </span>
                      <span className="text-foreground">
                        {Math.round((market.staffAssigned.assigned / market.staffAssigned.required) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(market.staffAssigned.assigned / market.staffAssigned.required) * 100}
                      className="h-2"
                    />
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
            <span className="text-sm text-zinc-500">Show</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-[70px]">
                <SelectValue />
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
            Showing {startIndex + 1} to {Math.min(endIndex, mockMarkets.length)} of {mockMarkets.length} entries
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <Button
            variant="default"
            size="sm"
            className="hidden md:inline-flex"
          >
            1
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={endIndex >= mockMarkets.length}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
