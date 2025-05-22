import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Star,
  Building2,
  TrendingUp,
  Package,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Hash
} from "lucide-react"
import { cn } from '@/lib/utils';
import { useState } from "react"
import { SupplierPerformanceMetrics, SupplierReference } from '../../types'

/** Extended supplier type for ranking table that combines reference and performance data */
interface RankedSupplier extends SupplierReference {
  rating: number
  onTime: string
  quality: string
  volume: string
  trend: number
  category: string
  performanceMetrics: SupplierPerformanceMetrics
}

interface SupplierRankingTableProps {
  data: RankedSupplier[]
}

const columns = [
  {
    id: 'rank',
    label: 'Rank',
    icon: Hash,
    cell: (supplier: RankedSupplier, index: number) => (
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-zinc-500" />
        <span>#{index + 1}</span>
      </div>
    )
  },
  {
    id: 'name',
    label: 'Supplier',
    icon: Building2,
    cell: (supplier: RankedSupplier) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-zinc-500" />
        <span>{supplier.name}</span>
      </div>
    )
  },
  {
    id: 'category',
    label: 'Category',
    icon: Package,
    cell: (supplier: RankedSupplier) => (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-zinc-500" />
        <Badge variant="outline">{supplier.category}</Badge>
      </div>
    )
  },
  {
    id: 'rating',
    label: 'Rating',
    icon: Star,
    cell: (supplier: RankedSupplier) => (
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        <span>{supplier.rating}/5.0</span>
      </div>
    )
  },
  {
    id: 'onTime',
    label: 'On-Time',
    icon: Clock,
    cell: (supplier: RankedSupplier) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-zinc-500" />
        <span>{supplier.onTime}</span>
      </div>
    )
  },
  {
    id: 'quality',
    label: 'Quality',
    icon: Star,
    cell: (supplier: RankedSupplier) => (
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-zinc-500" />
        <span>{supplier.quality}</span>
      </div>
    )
  },
  {
    id: 'volume',
    label: 'Volume',
    icon: Package,
    cell: (supplier: RankedSupplier) => (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-zinc-500" />
        <span>{supplier.volume}</span>
      </div>
    )
  },
  {
    id: 'trend',
    label: 'Trend',
    icon: TrendingUp,
    cell: (supplier: RankedSupplier) => (
      <div className="flex items-center gap-2">
        <TrendingUp className={cn(
          "h-4 w-4",
          supplier.trend > 0 ? "text-green-500" : "text-red-500"
        )} />
        <span className={cn(
          supplier.trend > 0 ? "text-green-500" : "text-red-500"
        )}>
          {supplier.trend > 0 ? "+" : ""}{supplier.trend}%
        </span>
      </div>
    )
  }
]

export function SupplierRankingTable({ data }: SupplierRankingTableProps) {
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0

    const { column, direction } = sortConfig
    const modifier = direction === 'asc' ? 1 : -1

    switch (column) {
      case 'rating':
        return modifier * (a.rating - b.rating)
      case 'trend':
        return modifier * (a.trend - b.trend)
      case 'name':
        return modifier * a.name.localeCompare(b.name)
      case 'category':
        return modifier * a.category.localeCompare(b.category)
      case 'onTime':
        return modifier * (parseInt(a.onTime) - parseInt(b.onTime))
      default:
        return 0
    }
  })

  const handleSort = (column: string) => {
    setSortConfig(current => {
      if (current?.column === column) {
        return {
          column,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      return { column, direction: 'asc' }
    })
  }

  return (
    <div className="">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className="h-12 cursor-pointer hover:bg-zinc-800/50"
                onClick={() => handleSort(column.id)}
              >
                <div className="flex items-center gap-2">
                  <column.icon className="h-4 w-4 text-muted-foreground" />
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((supplier, index) => (
            <TableRow
              key={supplier.id}
              className={cn(
                "transition-colors cursor-pointer h-[50px]",
                hoveredRow === supplier.id ? "bg-white/5" : "hover:bg-white/5"
              )}
              onMouseEnter={() => setHoveredRow(supplier.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  className="text-zinc-100 h-[50px] py-3"
                >
                  {column.cell(supplier, index)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
