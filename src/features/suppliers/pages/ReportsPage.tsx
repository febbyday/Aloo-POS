import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Download, Loader2, BarChart4, RefreshCw, FileText, Eye } from "lucide-react"
import { cn } from '@/lib/utils';
import { format } from "date-fns"
import { DateRange } from "@/types/date"
import { ReportPreview } from "../components/reports/ReportPreview"
import { Calendar } from "@/components/ui/calendar"
import { ReportsToolbar } from "../components/reports/ReportsToolbar"
import { generateSupplierReportPdf, generateSuppliersReportPdf } from "@/lib/pdf-export"
import { useToast } from "@/components/ui/use-toast"
import { ReportPdfPreview } from "../components/reports/ReportPdfPreview"

// Default report settings
const DEFAULT_REPORT_SETTINGS = {
  baseCommissionRate: 0.025,
  performanceBonus: 0.2,
  qualityThreshold: 0.95,
  deliveryTimeThreshold: 3
}

// Mock supplier data for demonstration
const MOCK_SUPPLIERS = [
  {
    id: "1",
    name: "Supplier 1",
    orderVolume: 156,
    totalRevenue: 45600,
    avgDeliveryTime: 2.8,
    qualityScore: 0.96,
    baseCommission: 1140,
    performanceBonus: 228,
    totalCommission: 1368
  },
  {
    id: "2",
    name: "Supplier 2",
    orderVolume: 98,
    totalRevenue: 28400,
    avgDeliveryTime: 3.2,
    qualityScore: 0.92,
    baseCommission: 710,
    performanceBonus: 142,
    totalCommission: 852
  },
  {
    id: "3",
    name: "Supplier 3",
    orderVolume: 72,
    totalRevenue: 19800,
    avgDeliveryTime: 3.5,
    qualityScore: 0.88,
    baseCommission: 495,
    performanceBonus: 0,
    totalCommission: 495
  }
]

export default function ReportsPage() {
  const [selectedSupplier, setSelectedSupplier] = useState("all")
  const [date, setDate] = useState<DateRange>({
    from: new Date(2023, 0, 20),
    to: new Date(2023, 1, 25),
  })
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewSupplier, setPreviewSupplier] = useState<typeof MOCK_SUPPLIERS[0] | null>(null)
  const { toast } = useToast()

  const handleExportPdf = async () => {
    try {
      if (!date?.from || !date?.to) {
        toast({
          title: "Date range required",
          description: "Please select a date range for the report",
          variant: "destructive"
        })
        return
      }
      
      setIsExporting(true)
      
      // Get supplier data based on selection
      if (selectedSupplier === "all") {
        // Export individual PDF reports for each supplier
        console.log("Exporting individual reports for all suppliers")
        
        // Create a promise for each supplier's PDF generation
        const exportPromises = MOCK_SUPPLIERS.map(supplier => {
          const pdfDoc = generateSupplierReportPdf(supplier, date, DEFAULT_REPORT_SETTINGS)
          const filename = `supplier-${supplier.id}-report-${format(date.from, 'yyyy-MM-dd')}-to-${format(date.to, 'yyyy-MM-dd')}.pdf`
          return pdfDoc.save(filename)
        })
        
        // Wait for all PDFs to be generated
        await Promise.all(exportPromises)
        
        toast({
          title: "Reports exported successfully",
          description: `${MOCK_SUPPLIERS.length} individual supplier reports have been downloaded`,
          variant: "default"
        })
      } else {
        // Export single supplier report
        const supplier = MOCK_SUPPLIERS.find(s => s.id === selectedSupplier)
        
        if (!supplier) {
          toast({
            title: "Supplier not found",
            description: "The selected supplier could not be found",
            variant: "destructive"
          })
          setIsExporting(false)
          return
        }
        
        console.log("Exporting single supplier report:", supplier.name)
        const pdfDoc = generateSupplierReportPdf(supplier, date, DEFAULT_REPORT_SETTINGS)
        const filename = `supplier-${supplier.id}-report-${format(date.from, 'yyyy-MM-dd')}-to-${format(date.to, 'yyyy-MM-dd')}.pdf`
        
        // Save the PDF
        pdfDoc.save(filename)
        
        toast({
          title: "Report exported successfully",
          description: `The report has been downloaded as ${filename}`,
          variant: "default"
        })
      }
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF report. " + (error instanceof Error ? error.message : ''),
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }
  
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      console.log("Report data refreshed")
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handlePreviewPdf = () => {
    if (!date?.from || !date?.to) {
      toast({
        title: "Date range required",
        description: "Please select a date range for the report",
        variant: "destructive"
      })
      return
    }

    // Preview single supplier report
    const supplier = MOCK_SUPPLIERS.find(s => s.id === selectedSupplier)
    
    if (!supplier) {
      toast({
        title: "Supplier not found",
        description: "The selected supplier could not be found",
        variant: "destructive"
      })
      return
    }
    
    console.log("Previewing supplier report:", supplier.name)
    setPreviewSupplier(supplier)
    setIsPreviewing(true)
  }

  return (
    <div className="h-full flex-1 flex-col space-y-6 md:flex">
      <ReportsToolbar
        groups={[
          {
            buttons: [
              {
                icon: RefreshCw,
                label: "Refresh Data",
                onClick: handleRefresh,
                disabled: isRefreshing
              },
              {
                icon: FileText,
                label: "Export PDF",
                onClick: handleExportPdf,
                disabled: isExporting || !date?.from || !date?.to
              },
              {
                icon: Eye,
                label: "Preview PDF",
                onClick: handlePreviewPdf,
                disabled: !date?.from || !date?.to || selectedSupplier === "all"
              }
            ]
          }
        ]}
        rightContent={
          <div className="flex items-center gap-2">
            <Select
              value={selectedSupplier}
              onValueChange={setSelectedSupplier}
            >
              <SelectTrigger className="w-[180px] h-8 bg-transparent border-zinc-700 text-zinc-100">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="1">Supplier 1</SelectItem>
                <SelectItem value="2">Supplier 2</SelectItem>
                <SelectItem value="3">Supplier 3</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal h-8 bg-transparent border-zinc-700 text-zinc-100",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        }
      />
      
      <div className="flex items-center gap-2 mt-2">
        <BarChart4 className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Performance Report</h3>
        {isRefreshing && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Refreshing data...</span>
          </div>
        )}
        {isExporting && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Exporting PDF...</span>
          </div>
        )}
      </div>
      
      <div className="grid gap-4">
        <ReportPreview 
          supplier={selectedSupplier} 
          dateRange={date} 
          settings={DEFAULT_REPORT_SETTINGS}
          reportData={selectedSupplier === 'all' 
            ? MOCK_SUPPLIERS 
            : MOCK_SUPPLIERS.filter(s => s.id === selectedSupplier)
          }
        />
      </div>

      {/* PDF Preview Dialog */}
      <ReportPdfPreview
        open={isPreviewing}
        onOpenChange={setIsPreviewing}
        supplier={previewSupplier}
        dateRange={date}
        settings={DEFAULT_REPORT_SETTINGS}
      />
    </div>
  )
}
