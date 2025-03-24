import { Card, CardContent, CardTitle } from "@/components/ui/card"
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
  Building2, 
  Package, 
  Clock, 
  Star, 
  DollarSign,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  Calendar,
  FileText,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { ReportPdfPreview } from "./ReportPdfPreview"
import { DateRange } from "@/types/date"
import { Button } from "@/components/ui/button"

interface ReportSettings {
  baseCommissionRate: number
  performanceBonus: number
  qualityThreshold: number
  deliveryTimeThreshold: number
}

interface ReportPreviewProps {
  supplier: string
  dateRange: DateRange | undefined
  settings: ReportSettings
  reportData: SupplierReportItem[]
}

interface SupplierReportItem {
  id: string
  name: string
  orderVolume: number
  totalRevenue: number
  avgDeliveryTime: number
  qualityScore: number
  baseCommission: number
  performanceBonus: number
  totalCommission: number
}

interface Column {
  id: string
  label: string
  icon: React.ElementType
  cell: (item: SupplierReportItem, settings?: ReportSettings) => React.ReactNode
}

const columns: Column[] = [
  {
    id: 'name',
    label: 'Supplier',
    icon: Building2,
    cell: (item: SupplierReportItem) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-zinc-500" />
        <span>{item.name}</span>
      </div>
    )
  },
  {
    id: 'orderVolume',
    label: 'Orders',
    icon: Package,
    cell: (item: SupplierReportItem) => (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-zinc-500" />
        <span>{item.orderVolume}</span>
      </div>
    )
  },
  {
    id: 'revenue',
    label: 'Revenue',
    icon: DollarSign,
    cell: (item: SupplierReportItem) => (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-zinc-500" />
        <span>${item.totalRevenue.toLocaleString()}</span>
      </div>
    )
  },
  {
    id: 'deliveryTime',
    label: 'Delivery Time',
    icon: Clock,
    cell: (item: SupplierReportItem, settings: ReportSettings) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-zinc-500" />
        <span>{item.avgDeliveryTime} days</span>
        {item.avgDeliveryTime <= settings.deliveryTimeThreshold && (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Fast
          </Badge>
        )}
      </div>
    )
  },
  {
    id: 'quality',
    label: 'Quality',
    icon: Star,
    cell: (item: SupplierReportItem, settings: ReportSettings) => (
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-zinc-500" />
        <span>{(item.qualityScore * 100).toFixed(0)}%</span>
        {item.qualityScore >= settings.qualityThreshold && (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            High
          </Badge>
        )}
      </div>
    )
  },
  {
    id: 'baseCommission',
    label: 'Base Commission',
    icon: DollarSign,
    cell: (item: SupplierReportItem) => (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-zinc-500" />
        <span>${item.baseCommission.toLocaleString()}</span>
      </div>
    )
  },
  {
    id: 'bonus',
    label: 'Bonus',
    icon: TrendingUp,
    cell: (item: SupplierReportItem) => (
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-zinc-500" />
        <span>${item.performanceBonus.toLocaleString()}</span>
      </div>
    )
  },
  {
    id: 'total',
    label: 'Total',
    icon: DollarSign,
    cell: (item: SupplierReportItem) => (
      <div className="flex items-center gap-2 font-medium">
        <DollarSign className="h-4 w-4 text-zinc-500" />
        <span>${item.totalCommission.toLocaleString()}</span>
      </div>
    )
  }
]

export function ReportPreview({
  supplier,
  dateRange,
  settings,
  reportData = []
}: ReportPreviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState<{column: string, direction: 'asc' | 'desc'} | null>(null)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierReportItem | null>(null)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const handleSort = (columnId: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig && sortConfig.column === columnId && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ column: columnId, direction })
  }

  // Ensure reportData is an array before spreading
  const sortedData = [...(reportData || [])].sort((a, b) => {
    if (!sortConfig) return 0
    
    const { column, direction } = sortConfig
    const aValue = a[column as keyof SupplierReportItem]
    const bValue = b[column as keyof SupplierReportItem]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue)
    }
    
    // For numeric values
    return direction === 'asc' 
      ? (aValue as number) - (bValue as number) 
      : (bValue as number) - (aValue as number)
  })

  if (!dateRange?.from || !dateRange?.to) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center max-w-md">
          <h3 className="text-xl font-medium mb-2">Select a date range</h3>
          <p className="text-muted-foreground">
            Choose a date range from the calendar above to generate a supplier performance report.
            Reports show key metrics like revenue, order volume, and quality scores.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading report data...</p>
      </div>
    )
  }

  if (reportData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
          <Info className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center max-w-md">
          <h3 className="text-xl font-medium mb-2">No data available</h3>
          <p className="text-muted-foreground mb-4">
            There is no data available for the selected supplier and date range.
            Try selecting a different supplier or adjusting the date range.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              // Reset supplier to "all" to show all suppliers
              // This is just a mock implementation
              console.log("Reset filters clicked")
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <Card className="shadow-none border-none">
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <div className="bg-muted/10 rounded-md px-3 py-2">
                <span className="text-sm text-muted-foreground">Period:</span>
                <span className="ml-2 font-medium">
                  {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                </span>
              </div>
              <div className="bg-muted/10 rounded-md px-3 py-2">
                <span className="text-sm text-muted-foreground">Supplier:</span>
                <span className="ml-2 font-medium">
                  {supplier === "all" ? "All Suppliers" : `Supplier ${supplier}`}
                </span>
              </div>
            </div>

            <div className="border-b border-border overflow-x-auto">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                    {sortedData.map((item) => (
                      <TableRow
                        key={item.id}
                        className={cn(
                          "transition-colors h-[50px]",
                          selectedSupplier === item ? "bg-white/5" : "hover:bg-white/5"
                        )}
                        onMouseEnter={() => setSelectedSupplier(item)}
                        onMouseLeave={() => setSelectedSupplier(null)}
                        onDoubleClick={() => {
                          setSelectedSupplier(item)
                          setPdfPreviewOpen(true)
                        }}
                      >
                        {columns.map((column) => (
                          <TableCell 
                            key={column.id}
                            className="text-zinc-100 h-[50px] py-3"
                          >
                            {column.cell(item, settings)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="text-sm text-muted-foreground bg-muted/10 p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <p className="font-medium">Commission Calculation:</p>
              </div>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Base Commission: {settings.baseCommissionRate * 100}% of total revenue</li>
                <li>Performance Bonus: +{settings.performanceBonus * 100}% for high quality (≥{settings.qualityThreshold * 100}%) and fast delivery (≤{settings.deliveryTimeThreshold} days)</li>
              </ul>
              <p className="mt-2 text-xs opacity-70">Double-click on any row to view detailed PDF report</p>
            </div>
          </div>
        </CardContent>

        <ReportPdfPreview
          open={pdfPreviewOpen}
          onOpenChange={setPdfPreviewOpen}
          supplier={selectedSupplier}
          dateRange={dateRange}
          settings={settings}
        />
      </Card>
    </div>
  )
}
