import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Clock, FileText, MapPin, Package2, Printer, User } from "lucide-react"
import { useCompany } from "@/features/store/context/CompanyContext"
import jsPDF from "jspdf"
import "jspdf-autotable"

interface TransferDetailsDialogProps {
  transfer: any // TODO: Replace with proper type
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransferDetailsDialog({
  transfer,
  open,
  onOpenChange,
}: TransferDetailsDialogProps) {
  if (!transfer) return null

  const { companyInfo } = useCompany()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    const { companyInfo } = useCompany()

    // Company Header
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(companyInfo.name, doc.internal.pageSize.width / 2, 20, { align: "center" })
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(companyInfo.address, doc.internal.pageSize.width / 2, 25, { align: "center" })
    doc.text(`Tel: ${companyInfo.phone}`, doc.internal.pageSize.width / 2, 30, { align: "center" })
    if (companyInfo.email) {
      doc.text(`Email: ${companyInfo.email}`, doc.internal.pageSize.width / 2, 35, { align: "center" })
    }

    // Document Title
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Stock Transfer Document", doc.internal.pageSize.width / 2, 45, { align: "center" })
    
    doc.setFontSize(10)
    doc.text(`Transfer #${transfer.id} - ${transfer.status}`, doc.internal.pageSize.width / 2, 50, { align: "center" })

    // Transfer Info
    doc.setFont("helvetica", "normal")
    doc.text(`From: ${transfer.sourceLocation}`, 20, 60)
    doc.text(`To: ${transfer.destinationLocation}`, 20, 65)
    doc.text(`Created By: ${transfer.createdBy}`, doc.internal.pageSize.width - 20, 60, { align: "right" })
    doc.text(`Date: ${format(new Date(transfer.createdAt), "PPpp")}`, doc.internal.pageSize.width - 20, 65, { align: "right" })

    // Items Table
    const tableColumn = ["Item Description", "SKU", "Category", "Quantity", "Unit Price", "Total"]
    const tableRows = transfer.items.map((item: any) => [
      item.name,
      item.sku,
      item.category,
      `${item.quantity} ${item.unit}`,
      `$${item.unitPrice.toFixed(2)}`,
      `$${(item.quantity * item.unitPrice).toFixed(2)}`
    ])

    // Add total row
    const totalQuantity = transfer.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
    const totalCost = transfer.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
    tableRows.push([
      "Total",
      "",
      "",
      `${totalQuantity} units`,
      "",
      `$${totalCost.toFixed(2)}`
    ])

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      theme: 'grid',
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      }
    })

    // Notes Section
    if (transfer.notes) {
      const finalY = (doc as any).lastAutoTable.finalY || 75
      doc.setFont("helvetica", "bold")
      doc.text("Notes:", 20, finalY + 10)
      doc.setFont("helvetica", "normal")
      doc.text(transfer.notes, 20, finalY + 15)
    }

    // Footer
    const finalY = ((doc as any).lastAutoTable.finalY || 75) + (transfer.notes ? 25 : 10)
    
    // Signature lines
    doc.setLineWidth(0.5)
    doc.line(20, finalY + 20, 80, finalY + 20)
    doc.line(20, finalY + 40, 80, finalY + 40)
    
    doc.setFontSize(9)
    doc.text(`Prepared By: ${transfer.createdBy}`, 20, finalY + 25)
    doc.text("Received By:", 20, finalY + 45)

    // Document info
    doc.text(`Document Generated: ${format(new Date(), "PPpp")}`, doc.internal.pageSize.width - 20, finalY + 25, { align: "right" })
    doc.text(`Reference: TR-${transfer.id}`, doc.internal.pageSize.width - 20, finalY + 30, { align: "right" })

    doc.save(`transfer-${transfer.id}.pdf`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="flex-row justify-between items-start">
          <div>
            <DialogTitle>Transfer Details</DialogTitle>
            <DialogDescription>
              Transfer #{transfer.id}
              <Badge 
                variant={getStatusColor(transfer.status)} 
                className="ml-2"
              >
                {transfer.status}
              </Badge>
            </DialogDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground"
              onClick={handleExportPDF}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Source Location
              </div>
              <div className="text-sm">{transfer.sourceLocation}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Destination Location
              </div>
              <div className="text-sm">{transfer.destinationLocation}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Created At
              </div>
              <div className="text-sm">
                {format(new Date(transfer.createdAt), "PPpp")}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Created By
              </div>
              <div className="text-sm">{transfer.createdBy}</div>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package2 className="h-4 w-4" />
                Items
              </div>
              <div className="text-sm font-medium">
                Total: ${transfer.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
              </div>
            </div>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-6">
                {transfer.items?.map((item: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-sm font-medium flex items-center gap-2">
                          {item.name}
                          <Badge variant="outline" className="ml-2">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {item.sku}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-right space-y-1">
                        <div>{item.quantity} {item.unit}</div>
                        <div className="text-muted-foreground">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    {index < transfer.items.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between text-sm font-medium pt-2 border-t">
              <div>Total Items</div>
              <div>{transfer.items?.reduce((sum, item) => sum + item.quantity, 0)} units</div>
            </div>
          </div>

          {transfer.notes && (
            <>
              <Separator className="my-2" />
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Notes
                </div>
                <div className="text-sm">{transfer.notes}</div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
