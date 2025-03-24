import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, Download, Calendar, Building2, TrendingUp } from "lucide-react"
import { DateRange } from "@/types/date"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { generateSupplierReportPdf } from "@/lib/pdf-export"
import { ReportToolbar } from "./ReportToolbar"

interface ReportSettings {
  baseCommissionRate: number
  performanceBonus: number
  qualityThreshold: number
  deliveryTimeThreshold: number
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

interface ReportPdfPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: SupplierReportItem | null
  dateRange: DateRange
  settings: ReportSettings
}

export function ReportPdfPreview({
  open,
  onOpenChange,
  supplier,
  dateRange,
  settings
}: ReportPdfPreviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Simulate PDF generation when dialog opens
  useEffect(() => {
    if (open && supplier) {
      setIsLoading(true)
      
      // Simulate PDF generation delay
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1200)
      
      return () => clearTimeout(timer)
    }
  }, [open, supplier])
  
  // Format date to a readable string
  const formatDate = (date: Date): string => {
    return format(date, 'MMMM dd, yyyy')
  }
  
  const handleDownload = () => {
    if (!supplier) return;
    console.log("Downloading PDF for", supplier.name);
    // Generate and download PDF
    const pdfDoc = generateSupplierReportPdf(supplier, dateRange, settings);
    const filename = `supplier-${supplier.id}-report-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.pdf`;
    pdfDoc.save(filename);
  };
  
  if (!supplier) return null
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark-mode-scrollbar">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Supplier Performance Report</span>
          </DialogTitle>
          <ReportToolbar onDownload={handleDownload} />
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Generating PDF preview...</p>
          </div>
        ) : (
          <div className="space-y-6 print:space-y-8">
            {/* Company Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">TechMart Solutions</h2>
                  <p className="text-sm text-muted-foreground">Inventory Management System</p>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Report Period: </span>
                  <span className="font-medium">{formatDate(dateRange.from)} - {formatDate(dateRange.to)}</span>
                </div>
                <p className="text-sm text-muted-foreground">Generated on {formatDate(new Date())}</p>
              </div>
            </div>
            
            {/* Supplier Info */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Supplier Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">{supplier.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Supplier ID:</span>
                        <span>{supplier.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Order Volume:</span>
                        <span>{supplier.orderVolume} orders</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Revenue:</span>
                        <span className="font-medium">{formatCurrency(supplier.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Quality Score:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={supplier.qualityScore >= settings.qualityThreshold ? "success" : "default"}>
                          {(supplier.qualityScore * 100).toFixed(0)}%
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          (Threshold: {(settings.qualityThreshold * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg. Delivery Time:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={supplier.avgDeliveryTime <= settings.deliveryTimeThreshold ? "success" : "default"}>
                          {supplier.avgDeliveryTime.toFixed(1)} days
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          (Threshold: {settings.deliveryTimeThreshold} days)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-muted-foreground">Performance Rating:</span>
                      <Badge variant="outline" className="font-medium">
                        {supplier.qualityScore >= settings.qualityThreshold && 
                         supplier.avgDeliveryTime <= settings.deliveryTimeThreshold 
                          ? "Excellent" 
                          : supplier.qualityScore >= settings.qualityThreshold * 0.9 || 
                            supplier.avgDeliveryTime <= settings.deliveryTimeThreshold * 1.1
                            ? "Good"
                            : "Needs Improvement"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Commission Calculation */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Commission Calculation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead>Calculation</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Base Commission</TableCell>
                        <TableCell>
                          {formatCurrency(supplier.totalRevenue)} × {(settings.baseCommissionRate * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(supplier.baseCommission)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Performance Bonus</TableCell>
                        <TableCell>
                          {supplier.qualityScore >= settings.qualityThreshold && 
                           supplier.avgDeliveryTime <= settings.deliveryTimeThreshold
                            ? `${formatCurrency(supplier.baseCommission)} × ${(settings.performanceBonus * 100).toFixed(1)}%`
                            : "Not eligible"}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(supplier.performanceBonus)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Total Commission</TableCell>
                        <TableCell>Base + Performance Bonus</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(supplier.totalCommission)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground bg-muted/20 p-3 rounded-md">
                  <p><strong>Commission Policy:</strong></p>
                  <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                    <li>Base Commission: {(settings.baseCommissionRate * 100).toFixed(1)}% of total revenue</li>
                    <li>Performance Bonus: Additional {(settings.performanceBonus * 100).toFixed(1)}% of base commission when quality score is at least {(settings.qualityThreshold * 100).toFixed(0)}% and average delivery time is at most {settings.deliveryTimeThreshold} days</li>
                  </ul>
                  <p className="mt-2 text-xs opacity-70">This report is automatically prepared by the logged-in staff member.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
