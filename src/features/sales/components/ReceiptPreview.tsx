import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Printer, Download } from 'lucide-react'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

interface ReceiptPreviewProps {
  items: CartItem[]
  subtotal: number
  tax: number
  discount?: {
    type: 'percentage' | 'amount'
    value: number
  }
  total: number
  customer?: string
  paymentMethod: 'cash' | 'card' | 'mobile'
  change?: number
  onPrint: () => void
}

export function ReceiptPreview({
  items,
  subtotal,
  tax,
  discount,
  total,
  customer,
  paymentMethod,
  change,
  onPrint
}: ReceiptPreviewProps) {
  const discountAmount = discount
    ? discount.type === 'percentage'
      ? (subtotal * discount.value) / 100
      : discount.value
    : 0

  const currentDate = new Date().toLocaleDateString()
  const currentTime = new Date().toLocaleTimeString()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>SALES RECEIPT</CardTitle>
        <p className="text-sm text-muted-foreground">POS System</p>
        <p className="text-sm text-muted-foreground">Main Branch</p>
        <div className="text-sm text-muted-foreground mt-2">
          <p>{currentDate} {currentTime}</p>
          <p>Receipt #: INV-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
          {customer && <p>Customer: {customer}</p>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-b pb-2">
            <div className="grid grid-cols-12 text-sm font-medium">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="grid grid-cols-12 text-sm">
                <div className="col-span-6">{item.name}</div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">${item.price.toFixed(2)}</div>
                <div className="col-span-2 text-right">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            {discount && (
              <div className="flex justify-between text-sm">
                <span>Discount {discount.type === 'percentage' ? `(${discount.value}%)` : ''}</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span>Tax (16%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-sm">
              <span>Payment Method</span>
              <span>{paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'card' ? 'Card' : 'Mobile'}</span>
            </div>
            
            {paymentMethod === 'cash' && change !== undefined && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Amount Paid</span>
                  <span>${(total + change).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Change</span>
                  <span>${change.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
          
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>Thank you for your purchase!</p>
            <p>For returns and exchanges, please present this receipt within 14 days.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}
