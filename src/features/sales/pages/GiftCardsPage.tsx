import { useState } from 'react'
import { 
  Plus,
  CreditCard,
  FileDown,
  Filter,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { GiftCardsToolbar } from '../components/toolbars/GiftCardsToolbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data for gift cards
const mockGiftCards = Array.from({ length: 10 }, (_, i) => ({
  id: `GC-${1000 + i}`,
  code: `GIFT${100000 + i}`,
  value: Math.floor(Math.random() * 20) * 5 + 10,
  balance: Math.floor(Math.random() * 20) * 5,
  issuedDate: new Date(2025, 2, 1 - i),
  expiryDate: new Date(2026, 2, 1 - i),
  status: ['active', 'used', 'expired'][i % 3] as 'active' | 'used' | 'expired',
  issuedTo: i % 2 === 0 ? `Customer ${i + 1}` : null
}))

interface GiftCardFilter {
  search: string
  status: string | null
}

export function GiftCardsPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState<GiftCardFilter>({
    search: '',
    status: null
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedGiftCard, setSelectedGiftCard] = useState<typeof mockGiftCards[0] | null>(null)

  const handleRefresh = () => {
    toast({
      title: 'Refreshing gift cards',
      description: 'The gift cards list has been updated.'
    })
  }

  const handleFilter = () => {
    // Implement filter logic
  }

  const handleExport = () => {
    toast({
      title: 'Exporting gift cards',
      description: 'Your export will be ready shortly.'
    })
  }

  const handleAddGiftCard = () => {
    setShowAddDialog(true)
  }

  const handleSearch = (query: string) => {
    setFilters({
      ...filters,
      search: query
    })
  }

  const handleEditGiftCard = (giftCard: typeof mockGiftCards[0]) => {
    setSelectedGiftCard(giftCard)
    setShowAddDialog(true)
  }

  const handleDeleteGiftCard = (id: string) => {
    toast({
      title: 'Gift card deleted',
      description: `Gift card ${id} has been deleted.`
    })
  }

  const filteredGiftCards = mockGiftCards.filter(giftCard => {
    if (filters.search && !giftCard.code.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.status && giftCard.status !== filters.status) {
      return false
    }
    return true
  })

  const totalActiveValue = mockGiftCards
    .filter(gc => gc.status === 'active')
    .reduce((sum, gc) => sum + gc.balance, 0)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gift Cards</h1>
      </div>

      <GiftCardsToolbar
        onRefresh={handleRefresh}
        onFilter={handleFilter}
        onExport={handleExport}
        onAddGiftCard={handleAddGiftCard}
        onSearch={handleSearch}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <CardDescription>Currently valid</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockGiftCards.filter(gc => gc.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <CardDescription>Active cards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalActiveValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Redeemed Value</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$345.00</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none border-none">
        <CardHeader className="px-0">
          <CardTitle>All Gift Cards</CardTitle>
          <CardDescription>
            Manage your gift cards and track their usage.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Issued To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGiftCards.map((giftCard) => (
                <TableRow key={giftCard.id}>
                  <TableCell className="font-medium">{giftCard.code}</TableCell>
                  <TableCell>${giftCard.value.toFixed(2)}</TableCell>
                  <TableCell>${giftCard.balance.toFixed(2)}</TableCell>
                  <TableCell>{format(giftCard.issuedDate, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(giftCard.expiryDate, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{giftCard.issuedTo || '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        giftCard.status === 'active' ? 'default' : 
                        giftCard.status === 'used' ? 'secondary' : 'destructive'
                      }
                    >
                      {giftCard.status.charAt(0).toUpperCase() + giftCard.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditGiftCard(giftCard)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGiftCard(giftCard.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Gift Card Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedGiftCard ? 'Edit Gift Card' : 'Add New Gift Card'}
            </DialogTitle>
            <DialogDescription>
              Create or modify a gift card.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <Input type="number" placeholder="Enter gift card value" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date</label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue To (Optional)</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer1">Customer 1</SelectItem>
                  <SelectItem value="customer2">Customer 2</SelectItem>
                  <SelectItem value="customer3">Customer 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: selectedGiftCard ? 'Gift card updated' : 'Gift card created',
                description: 'The changes have been saved successfully.'
              })
              setShowAddDialog(false)
              setSelectedGiftCard(null)
            }}>
              {selectedGiftCard ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
