import { useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, User, UserPlus, Phone, Mail, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  loyaltyPoints: number
  lastPurchase: string
}

interface CustomerSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectCustomer: (customer: Customer) => void
}

const mockCustomers: Customer[] = [
  { 
    id: 'CUST-001', 
    name: 'John Doe', 
    email: 'john.doe@example.com', 
    phone: '+1234567890', 
    loyaltyPoints: 150,
    lastPurchase: '2025-02-28'
  },
  { 
    id: 'CUST-002', 
    name: 'Jane Smith', 
    email: 'jane.smith@example.com', 
    phone: '+1987654321', 
    loyaltyPoints: 75,
    lastPurchase: '2025-03-01'
  },
  { 
    id: 'CUST-003', 
    name: 'Bob Wilson', 
    email: 'bob.wilson@example.com', 
    phone: '+1122334455', 
    loyaltyPoints: 220,
    lastPurchase: '2025-02-15'
  },
]

export function CustomerSearchDialog({ open, onOpenChange, onSelectCustomer }: CustomerSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [customers] = useState<Customer[]>(mockCustomers)

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              New Customer
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Loyalty Points</TableHead>
                  <TableHead>Last Purchase</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">{customer.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center text-xs">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          {customer.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {customer.loyaltyPoints} points
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs">
                        <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                        {customer.lastPurchase}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onSelectCustomer(customer)
                          onOpenChange(false)
                        }}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
