import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DollarSign,
  ArrowLeft,
  Plus,
  CreditCard,
  Calendar,
  User,
  FileText,
  Printer,
  Download
} from "lucide-react"
import { format } from 'date-fns'
import { useToast } from "@/components/ui/use-toast"
import { Repair, RepairStatus } from '../types'
import { mockRepairs } from './RepairsPage' // In a real app, this would come from an API

interface Payment {
  id: string
  amount: number
  date: Date
  method: 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Other'
  reference?: string
  notes?: string
}

export function RepairPaymentsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [paymentAmount, setPaymentAmount] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<Payment['method']>('Cash')
  const [paymentReference, setPaymentReference] = useState<string>("")
  const [paymentNotes, setPaymentNotes] = useState<string>("")
  const [payments, setPayments] = useState<Payment[]>([])
  const { toast } = useToast()
  
  // In a real app, this would be fetched from an API
  const repair = mockRepairs.find(r => r.id === id)
  
  useEffect(() => {
    // In a real app, this would fetch the payment history from an API
    // For now, we'll create a mock payment if a deposit exists
    if (repair && repair.depositAmount > 0) {
      setPayments([
        {
          id: "p1",
          amount: repair.depositAmount,
          date: repair.createdAt,
          method: 'Cash',
          notes: 'Initial deposit'
        }
      ]);
    }
  }, [repair]);
  
  if (!repair) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h2 className="text-2xl font-bold mb-4">Repair Not Found</h2>
        <p className="text-muted-foreground mb-8">The repair ticket you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/repairs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Repairs
        </Button>
      </div>
    )
  }
  
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = repair.estimatedCost - totalPaid;
  
  const handleAddPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }
    
    const amount = parseFloat(paymentAmount);
    
    // In a real app, this would add the payment to the database
    const newPayment: Payment = {
      id: `p${payments.length + 1}`,
      amount,
      date: new Date(),
      method: paymentMethod,
      reference: paymentReference || undefined,
      notes: paymentNotes || undefined
    };
    
    setPayments([...payments, newPayment]);
    
    toast({
      title: "Payment Added",
      description: `Added payment of $${amount.toFixed(2)}`,
    });
    
    // Reset form
    setPaymentAmount("");
    setPaymentReference("");
    setPaymentNotes("");
  };
  
  const handlePrintReceipt = (paymentId: string) => {
    toast({
      title: "Printing Receipt",
      description: `Printing receipt for payment #${paymentId}`,
    });
  };
  
  return (
    <div className="h-full flex-1 flex-col flex space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(`/repairs/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Repair
          </Button>
          <h1 className="text-3xl font-bold">Payments for Repair #{repair.ticketNumber}</h1>
        </div>
        <Badge className={repair.status === RepairStatus.COMPLETED ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
          {repair.status}
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Customer: {repair.customerName} • Created on {format(repair.createdAt, 'PPP')}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Cost:</span>
              <span className="font-medium">${repair.estimatedCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Paid:</span>
              <span className="font-medium text-green-600">${totalPaid.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Remaining Balance:</span>
              <span className={`font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${remainingBalance.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-muted-foreground">Payment Status:</span>
              <Badge variant={remainingBalance <= 0 ? "success" : "outline"}>
                {remainingBalance <= 0 ? "Paid in Full" : "Partially Paid"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Add Payment</CardTitle>
            <CardDescription>Record a new payment for this repair</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="pl-8"
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as Payment['method'])}
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Reference (Optional)</label>
                <Input
                  placeholder="Transaction ID, Check #, etc."
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Input
                  placeholder="Additional payment details"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              className="w-full mt-6" 
              onClick={handleAddPayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Record of all payments for this repair</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(payment.date, 'PPP')}</TableCell>
                    <TableCell className="font-medium">${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.reference || '-'}</TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handlePrintReceipt(payment.id)}>
                        <Printer className="h-4 w-4" />
                        <span className="sr-only">Print Receipt</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Payments Yet</h3>
              <p className="text-muted-foreground max-w-md">
                No payments have been recorded for this repair. Use the form above to add a payment.
              </p>
            </div>
          )}
        </CardContent>
        {payments.length > 0 && (
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print All Receipts
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Payment History
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
