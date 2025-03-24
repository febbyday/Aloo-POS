import { useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NumpadInput } from './NumpadInput'
import { Percent, DollarSign } from 'lucide-react'

interface DiscountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subtotal: number
  onApplyDiscount: (discount: DiscountDetails) => void
}

export interface DiscountDetails {
  type: 'percentage' | 'amount'
  value: number
  reason?: string
}

export function DiscountDialog({ open, onOpenChange, subtotal, onApplyDiscount }: DiscountDialogProps) {
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [reason, setReason] = useState('')

  const handleApplyDiscount = () => {
    const value = Number(discountValue)
    if (value <= 0) return
    
    if (discountType === 'percentage' && value > 100) return
    if (discountType === 'amount' && value > subtotal) return

    onApplyDiscount({
      type: discountType,
      value,
      reason: reason || undefined
    })
    onOpenChange(false)
  }

  const discountAmount = discountType === 'percentage' 
    ? (subtotal * Number(discountValue)) / 100
    : Number(discountValue)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
        </DialogHeader>
        
        <Tabs value={discountType} onValueChange={(v) => setDiscountType(v as any)}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="percentage" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Percentage
            </TabsTrigger>
            <TabsTrigger value="amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Amount
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <div>
              <Label>Subtotal</Label>
              <Input value={`$${subtotal.toFixed(2)}`} disabled />
            </div>

            <div>
              <Label>{discountType === 'percentage' ? 'Discount %' : 'Discount Amount'}</Label>
              <Input
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
              />
            </div>

            {discountValue && (
              <div>
                <Label>Discount Amount</Label>
                <Input value={`$${discountAmount.toFixed(2)}`} disabled />
              </div>
            )}

            <div>
              <Label>Reason (Optional)</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for discount"
              />
            </div>

            <NumpadInput
              value={discountValue}
              onChange={setDiscountValue}
              onSubmit={handleApplyDiscount}
            />
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
