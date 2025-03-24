import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface ViewOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: {
    id: string
    orderNumber: string
    supplier: string
    date: string
    status: string
    total: number
    items: number
  } | null
}

export function ViewOrderModal({ open, onOpenChange, order }: ViewOrderModalProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            View detailed information about this order
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[600px]">
          <div className="space-y-6">
            {/* Order Header Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Order Number</h4>
                <p className="text-lg font-semibold">{order.orderNumber}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                <Badge 
                  variant={
                    order.status === 'Delivered' ? "default" : 
                    order.status === 'Processing' ? "secondary" : 
                    "outline"
                  }
                >
                  {order.status}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Supplier Information */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Supplier</h4>
              <p className="text-lg">{order.supplier}</p>
            </div>

            <Separator />

            {/* Order Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                <p>{order.date}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Items</h4>
                <p>{order.items} items</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Total</h4>
                <p className="text-lg font-semibold">${order.total.toFixed(2)}</p>
              </div>
            </div>

            <Separator />

            {/* Additional Information (Mock Data) */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Payment Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <p>Paid</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p>Bank Transfer</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Shipping Information (Mock Data) */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Shipping Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Expected Delivery</p>
                  <p>2024-03-01</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shipping Method</p>
                  <p>Standard Shipping</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 