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
import { CreditCard, Wallet, Smartphone, Receipt, Calendar } from 'lucide-react'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  onProcessPayment: (paymentDetails: PaymentDetails) => void
}

export interface PaymentDetails {
  method: 'cash' | 'card' | 'mobile' | 'installment'
  amount: number
  change?: number
  cardType?: string
  mobileProvider?: string
  installmentPlan?: {
    months: number
    downPayment: number
    monthlyAmount: number
  }
}

export function PaymentDialog({ open, onOpenChange, total, onProcessPayment }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'installment'>('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [cardType, setCardType] = useState('')
  const [mobileProvider, setMobileProvider] = useState('')
  const [installmentMonths, setInstallmentMonths] = useState('3')
  const [downPayment, setDownPayment] = useState('')

  const change = Number(amountPaid) - total
  const isValidPayment = paymentMethod === 'cash' ? Number(amountPaid) >= total : Number(amountPaid) === total
  
  const installmentDownPaymentAmount = downPayment ? Number(downPayment) : 0
  const remainingAmount = total - installmentDownPaymentAmount
  const monthlyAmount = installmentMonths ? remainingAmount / Number(installmentMonths) : 0
  const isValidInstallment = installmentDownPaymentAmount > 0 && installmentDownPaymentAmount < total

  const handlePayment = () => {
    const paymentDetails: PaymentDetails = {
      method: paymentMethod,
      amount: Number(amountPaid),
      ...(paymentMethod === 'cash' && { change }),
      ...(paymentMethod === 'card' && { cardType }),
      ...(paymentMethod === 'mobile' && { mobileProvider }),
      ...(paymentMethod === 'installment' && { 
        installmentPlan: {
          months: Number(installmentMonths),
          downPayment: installmentDownPaymentAmount,
          monthlyAmount
        } 
      })
    }
    onProcessPayment(paymentDetails)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>
        
        <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="cash" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Cash
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile
            </TabsTrigger>
            <TabsTrigger value="installment" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Installment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cash">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Amount</Label>
                  <Input value={total.toFixed(2)} disabled />
                </div>
                <div>
                  <Label>Amount Paid</Label>
                  <Input value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
                </div>
              </div>
              {Number(amountPaid) > 0 && (
                <div>
                  <Label>Change</Label>
                  <Input value={change.toFixed(2)} disabled />
                </div>
              )}
              <NumpadInput
                value={amountPaid}
                onChange={setAmountPaid}
                onSubmit={isValidPayment ? handlePayment : undefined}
              />
            </div>
          </TabsContent>

          <TabsContent value="card">
            <div className="space-y-4">
              <div>
                <Label>Card Type</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                >
                  <option value="">Select Card Type</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                </select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input value={total.toFixed(2)} disabled />
              </div>
              <Button 
                className="w-full" 
                onClick={handlePayment}
                disabled={!cardType}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Process Card Payment
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="mobile">
            <div className="space-y-4">
              <div>
                <Label>Mobile Provider</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={mobileProvider}
                  onChange={(e) => setMobileProvider(e.target.value)}
                >
                  <option value="">Select Provider</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="airtel">Airtel Money</option>
                </select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input value={total.toFixed(2)} disabled />
              </div>
              <Button 
                className="w-full" 
                onClick={handlePayment}
                disabled={!mobileProvider}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Process Mobile Payment
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="installment">
            <div className="space-y-4">
              <div>
                <Label>Number of Months</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={installmentMonths}
                  onChange={(e) => setInstallmentMonths(e.target.value)}
                >
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="24">24 Months</option>
                </select>
              </div>
              <div>
                <Label>Down Payment</Label>
                <Input 
                  value={downPayment} 
                  onChange={(e) => setDownPayment(e.target.value)}
                  placeholder="Enter down payment amount" 
                />
              </div>
              {Number(downPayment) > 0 && (
                <>
                  <div>
                    <Label>Total Amount</Label>
                    <Input value={total.toFixed(2)} disabled />
                  </div>
                  <div>
                    <Label>Remaining Balance</Label>
                    <Input value={remainingAmount.toFixed(2)} disabled />
                  </div>
                  <div>
                    <Label>Monthly Payment</Label>
                    <Input value={monthlyAmount.toFixed(2)} disabled />
                  </div>
                </>
              )}
              <NumpadInput
                value={downPayment}
                onChange={setDownPayment}
                onSubmit={isValidInstallment ? handlePayment : undefined}
              />
              <Button 
                className="w-full" 
                onClick={handlePayment}
                disabled={!isValidInstallment}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Setup Installment Plan
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
