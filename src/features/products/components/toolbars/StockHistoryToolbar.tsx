import { 
  RefreshCw, 
  Filter, 
  ArrowUpDown, 
  SlidersHorizontal,
  FileText,
  FileDown,
  Table2
} from "lucide-react"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { ProductsToolbar } from "../ProductsToolbar"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { useState } from "react"
import { FilterDialog } from "../FilterDialog"
import { SortDialog } from "../SortDialog"
import { ColumnVisibilityDialog } from "../ColumnVisibilityDialog"

interface StockHistoryToolbarProps {
  onColumnsChange: () => void
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  data: any[]
  columns: { id: string; label: string }[]
  onRefresh: () => void
  filters: { column: string; operator: string; value: string }[]
  onFiltersChange: (filters: { column: string; operator: string; value: string }[]) => void
  sortOrder: { column: string; direction: "asc" | "desc" }[]
  onSortOrderChange: (sortOrder: { column: string; direction: "asc" | "desc" }[]) => void
  visibleColumns: string[]
  onVisibleColumnsChange: (columns: string[]) => void
}

export function StockHistoryToolbar({ 
  onColumnsChange,
  dateRange,
  onDateRangeChange,
  data,
  columns,
  onRefresh,
  filters,
  onFiltersChange,
  sortOrder,
  onSortOrderChange,
  visibleColumns,
  onVisibleColumnsChange
}: StockHistoryToolbarProps) {
  const { toast } = useToast()
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [sortDialogOpen, setSortDialogOpen] = useState(false)
  const [columnDialogOpen, setColumnDialogOpen] = useState(false)

  const formatDateString = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return isNaN(date.getTime()) ? dateStr : format(date, 'MMM dd, yyyy')
    } catch {
      return dateStr
    }
  }

  const handleExport = async (exportFormat: 'csv' | 'excel' | 'pdf') => {
    try {
      // Format the data for export
      const formattedData = data.map(item => {
        const row: Record<string, any> = {}
        columns.forEach(col => {
          if (col.id === 'date') {
            row[col.label] = formatDateString(item[col.id])
          } else if (col.id === 'type') {
            row[col.label] = item[col.id]?.toUpperCase() || ''
          } else {
            row[col.label] = item[col.id] || ''
          }
        })
        return row
      })

      const filename = `stock-history-${format(new Date(), 'yyyy-MM-dd')}`

      if (exportFormat === 'csv') {
        // Create CSV content
        const header = columns.map(col => col.label).join(',')
        const rows = formattedData.map(row => 
          columns.map(col => {
            const value = row[col.label]?.toString() || ''
            return value.includes(',') ? `"${value}"` : value
          }).join(',')
        )
        const csvContent = [header, ...rows].join('\n')
        
        // Create and trigger download using Blob URL
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${filename}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } 
      else if (exportFormat === 'excel') {
        try {
          const XLSX = await import('xlsx/xlsx.mjs')
          const ws = XLSX.utils.json_to_sheet(formattedData)
          const wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, 'Stock History')
          XLSX.writeFile(wb, `${filename}.xlsx`)
        } catch (xlsxError) {
          console.error('XLSX error:', xlsxError)
          throw new Error('Failed to load Excel export module. Please try CSV format instead.')
        }
      } 
      else if (exportFormat === 'pdf') {
        const { jsPDF } = await import('jspdf')
        const autoTable = (await import('jspdf-autotable')).default
        
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        })

        const tableWidth = 277 // A4 landscape width in mm
        const columnCount = columns.length
        const baseWidth = Math.floor(tableWidth / columnCount)

        autoTable(doc, {
          head: [columns.map(col => col.label)],
          body: formattedData.map(row => columns.map(col => row[col.label])),
          styles: { 
            fontSize: 8,
            cellPadding: 1,
            overflow: 'linebreak',
            cellWidth: baseWidth
          },
          headStyles: { 
            fillColor: [41, 37, 36],
            textColor: 255,
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center'
          },
          margin: { top: 10 },
          didDrawPage: (data) => {
            doc.text(`Stock History - ${format(new Date(), 'MMM dd, yyyy')}`, data.settings.margin.left, 7)
          }
        })
        
        doc.save(`${filename}.pdf`)
      }

      toast({
        title: "Export successful",
        description: `Your data has been exported as ${exportFormat.toUpperCase()}`,
        variant: "default"
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "There was an error exporting your data. Please try again.",
        variant: "destructive"
      })
    }
  }

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: RefreshCw,
          label: "Refresh",
          onClick: () => {
            onRefresh()
            toast({
              title: "Refreshing data...",
              description: "Your stock history is being updated."
            })
          }
        }
      ]
    },
    {
      buttons: [
        {
          icon: Filter,
          label: "Filter",
          onClick: () => setFilterDialogOpen(true)
        },
        {
          icon: ArrowUpDown,
          label: "Sort",
          onClick: () => setSortDialogOpen(true)
        }
      ]
    },
    {
      buttons: [
        {
          icon: SlidersHorizontal,
          label: "Columns",
          onClick: () => setColumnDialogOpen(true)
        }
      ]
    },
    {
      buttons: [
        {
          icon: Table2,
          label: "CSV",
          onClick: () => handleExport('csv')
        },
        {
          icon: FileDown,
          label: "Excel",
          onClick: () => handleExport('excel')
        },
        {
          icon: FileText,
          label: "PDF",
          onClick: () => handleExport('pdf')
        }
      ]
    }
  ]

  return (
    <>
      <ProductsToolbar 
        groups={toolbarGroups}
        rightContent={
          <DateRangePicker
            date={dateRange}
            onDateChange={onDateRangeChange}
            className="bg-transparent"
          />
        }
      />

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        columns={columns}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />

      <SortDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        columns={columns}
        sortOrder={sortOrder}
        onSortOrderChange={onSortOrderChange}
      />

      <ColumnVisibilityDialog
        open={columnDialogOpen}
        onOpenChange={setColumnDialogOpen}
        columns={columns}
        visibleColumns={visibleColumns}
        onVisibilityChange={onVisibleColumnsChange}
      />
    </>
  )
}
