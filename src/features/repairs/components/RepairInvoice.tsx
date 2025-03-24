import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { Download, Printer } from "lucide-react"
import { Repair, RepairItem } from '../types'
import { generateRepairInvoicePDF } from '@/lib/generate-repair-invoice'

interface RepairInvoiceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repair: Repair
  companyInfo: {
    name: string
    address: string
    phone: string
    email: string
    website?: string
    logo?: string
    taxId?: string
  }
}

export function RepairInvoice({
  open,
  onOpenChange,
  repair,
  companyInfo
}: RepairInvoiceProps) {
  const calculateSubtotal = (items: RepairItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal(repair.items)
    // Add any additional charges or tax calculations here
    return subtotal
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    try {
      const pdfBlob = await generateRepairInvoicePDF(repair, companyInfo)
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `repair-invoice-${repair.ticketNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      // TODO: Show error toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Repair Invoice</DialogTitle>
          <DialogDescription>
            Invoice #{repair.ticketNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 print:p-8">
          {/* Header */}
          <div className="flex justify-between">
            <div>
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo}
                  alt="Company Logo"
                  className="h-16 w-auto mb-4"
                />
              )}
              <h2 className="text-2xl font-bold">{companyInfo.name}</h2>
              <p className="text-muted-foreground">{companyInfo.address}</p>
              <p className="text-muted-foreground">{companyInfo.phone}</p>
              <p className="text-muted-foreground">{companyInfo.email}</p>
              {companyInfo.website && (
                <p className="text-muted-foreground">{companyInfo.website}</p>
              )}
            </div>
            <div className="text-right">
              <h3 className="text-xl font-semibold">INVOICE</h3>
              <p>Date: {format(new Date(), 'PPP')}</p>
              <p>Invoice #: {repair.ticketNumber}</p>
              {companyInfo.taxId && <p>Tax ID: {companyInfo.taxId}</p>}
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p>{repair.customerName}</p>
              <p>{repair.customerPhone}</p>
              {repair.customerEmail && <p>{repair.customerEmail}</p>}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Repair Details:</h3>
              <p>Product: {repair.productType}</p>
              <p>Status: {repair.status}</p>
              <p>Created: {format(repair.createdAt, 'PPP')}</p>
              {repair.completedAt && (
                <p>Completed: {format(repair.completedAt, 'PPP')}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="w-24 text-right">Quantity</TableHead>
                <TableHead className="w-32 text-right">Unit Price</TableHead>
                <TableHead className="w-32 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repair.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}

              {/* Summary */}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Subtotal
                </TableCell>
                <TableCell className="text-right">
                  ${calculateSubtotal(repair.items).toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Deposit Paid
                </TableCell>
                <TableCell className="text-right">
                  ${repair.depositAmount.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">
                  Balance Due
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ${(calculateTotal() - repair.depositAmount).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Notes */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Repair Notes:</h4>
              <p className="text-muted-foreground">{repair.issueDescription}</p>
              {repair.additionalNotes && (
                <p className="text-muted-foreground mt-2">{repair.additionalNotes}</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                <li>Payment is due upon completion of repair</li>
                <li>Warranty claims must be made within 30 days of repair</li>
                <li>Items left over 90 days will be considered abandoned</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
            {companyInfo.website && <p>Visit us at: {companyInfo.website}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 print:hidden">
            <Button
              variant="outline"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
