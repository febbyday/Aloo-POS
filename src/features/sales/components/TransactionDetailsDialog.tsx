import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Transaction } from '../pages/TransactionBrowserPage'
import { FileDown, Printer, RotateCcw } from "lucide-react"

interface TransactionDetailsDialogProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailsDialog({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailsDialogProps) {
  if (!transaction) return null

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'refunded':
        return 'destructive'
      case 'partially_refunded':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getPaymentMethodColor = (method: Transaction['paymentMethod']) => {
    switch (method) {
      case 'cash':
        return 'success'
      case 'card':
        return 'default'
      case 'mobile':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            View complete transaction information and perform actions
          </DialogDescription>
        </DialogHeader>

        {/* Transaction Header */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Reference</div>
            <div className="font-medium">{transaction.reference}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Date</div>
            <div className="font-medium">
              {transaction.date.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Customer</div>
            <div className="font-medium">
              {transaction.customer || 'Walk-in Customer'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Location</div>
            <div className="font-medium capitalize">{transaction.location}</div>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Badge variant={getStatusColor(transaction.status)} className="capitalize">
            {transaction.status.replace('_', ' ')}
          </Badge>
          <Badge variant={getPaymentMethodColor(transaction.paymentMethod)} className="capitalize">
            {transaction.paymentMethod}
          </Badge>
        </div>

        <Separator className="my-4" />

        {/* Items List */}
        <div className="space-y-4">
          <div className="font-medium">Items</div>
          <div className="rounded-lg border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-2 text-left text-sm font-medium">Item</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Quantity</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Price</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transaction.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">${item.price.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-muted/50 font-medium">
                  <td className="px-4 py-2" colSpan={3}>Total</td>
                  <td className="px-4 py-2 text-right">${transaction.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          {transaction.status === 'completed' && (
            <Button variant="destructive" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Process Refund
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
