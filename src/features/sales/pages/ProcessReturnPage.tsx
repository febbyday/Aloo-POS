import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Package,
  Receipt,
  User,
  Calendar,
  DollarSign,
  Plus,
  Trash,
  Save,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils';

// Mock data for sales lookup
const mockSales = [
  {
    id: 'SALE-2001',
    date: new Date(2024, 2, 1),
    customer: 'John Doe',
    total: 299.99,
    items: [
      { id: 1, name: 'Nike Air Max', sku: 'NIKE-001', quantity: 2, price: 99.99, returnable: true },
      { id: 2, name: 'Adidas Ultra Boost', sku: 'ADI-002', quantity: 1, price: 100.01, returnable: true }
    ]
  },
  {
    id: 'SALE-2002',
    date: new Date(2024, 2, 15),
    customer: 'Jane Smith',
    total: 450.00,
    items: [
      { id: 3, name: 'Apple Watch Series 8', sku: 'APL-001', quantity: 1, price: 399.99, returnable: true },
      { id: 4, name: 'Watch Band', sku: 'ACC-001', quantity: 1, price: 50.01, returnable: true }
    ]
  },
  {
    id: 'SALE-2003',
    date: new Date(2024, 2, 20),
    customer: 'Bob Wilson',
    total: 1299.99,
    items: [
      { id: 5, name: 'MacBook Air M2', sku: 'APL-002', quantity: 1, price: 1199.99, returnable: true },
      { id: 6, name: 'USB-C Hub', sku: 'ACC-002', quantity: 1, price: 49.99, returnable: true },
      { id: 7, name: 'Laptop Sleeve', sku: 'ACC-003', quantity: 1, price: 50.01, returnable: true }
    ]
  },
  {
    id: 'SALE-2004',
    date: new Date(2024, 3, 1),
    customer: 'Alice Johnson',
    total: 799.99,
    items: [
      { id: 8, name: 'iPhone 15', sku: 'APL-003', quantity: 1, price: 699.99, returnable: true },
      { id: 9, name: 'Phone Case', sku: 'ACC-004', quantity: 1, price: 29.99, returnable: true },
      { id: 10, name: 'Screen Protector', sku: 'ACC-005', quantity: 1, price: 19.99, returnable: true },
      { id: 11, name: 'Lightning Cable', sku: 'ACC-006', quantity: 1, price: 50.02, returnable: true }
    ]
  }
]

const returnReasons = [
  'Defective',
  'Wrong Item',
  'Changed Mind',
  'Size Issue',
  'Other'
]

const itemConditions = [
  'New',
  'Used',
  'Damaged'
]

interface ReturnItem {
  id: number
  name: string
  sku: string
  quantity: number
  maxQuantity: number
  price: number
  reason: string
  condition: string
}

export function ProcessReturnPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSale, setSelectedSale] = useState<typeof mockSales[0] | null>(null)
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([])
  const [notes, setNotes] = useState('')

  // Add filtered sales state
  const [filteredSales, setFilteredSales] = useState(mockSales)

  const handleSaleSelect = (sale: typeof mockSales[0]) => {
    setSelectedSale(sale)
    // Reset return items when selecting a new sale
    setReturnItems([])
  }

  const handleAddItem = (item: typeof mockSales[0]['items'][0]) => {
    const existingItem = returnItems.find(ri => ri.id === item.id)
    if (existingItem) {
      toast({
        title: "Item already added",
        description: "This item is already in the return list",
        variant: "destructive"
      })
      return
    }

    setReturnItems([...returnItems, {
      id: item.id,
      name: item.name,
      sku: item.sku,
      quantity: 1,
      maxQuantity: item.quantity,
      price: item.price,
      reason: returnReasons[0],
      condition: itemConditions[0]
    }])
  }

  const handleUpdateItem = (id: number, field: keyof ReturnItem, value: any) => {
    setReturnItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    )
  }

  const handleRemoveItem = (id: number) => {
    setReturnItems(items => items.filter(item => item.id !== id))
  }

  const handleProcessReturn = () => {
    if (!selectedSale || returnItems.length === 0) {
      toast({
        title: "Cannot process return",
        description: "Please select a sale and add items to return",
        variant: "destructive"
      })
      return
    }

    // Here you would typically make an API call to process the return
    toast({
      title: "Return processed successfully",
      description: "The return has been created and is pending approval"
    })
    navigate('/sales/returns')
  }

  const totalRefund = returnItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  )

  // Update search functionality
  const handleSearch = () => {
    const query = searchQuery.toLowerCase()
    const filtered = mockSales.filter(sale => 
      sale.id.toLowerCase().includes(query) ||
      sale.customer.toLowerCase().includes(query)
    )
    setFilteredSales(filtered)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/sales/returns')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Process Return</h1>
            <p className="text-sm text-muted-foreground">
              Create a new return for a previous sale
            </p>
          </div>
        </div>
      </div>

      {/* Sale Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Sale</CardTitle>
          <CardDescription>
            Search for the sale you want to process a return for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by sale ID or customer name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (!e.target.value) {
                    setFilteredSales(mockSales)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="w-full"
              />
            </div>
            <Button variant="secondary" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Search Results */}
          <div className="mt-4 border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No sales found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSaleSelect(sale)}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{format(sale.date, 'PPP')}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>${sale.total.toFixed(2)}</TableCell>
                      <TableCell>{sale.items.length} items</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Return Details */}
      {selectedSale && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Return Details</CardTitle>
            <CardDescription>
              Select items to return and provide return information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sale Summary */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Sale ID
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{selectedSale.id}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Sale Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    {format(selectedSale.date, 'PPP')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{selectedSale.customer}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Sale Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">
                    ${selectedSale.total.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Available Items */}
            <div className="rounded-lg border">
              <div className="bg-muted/50 px-4 py-3 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Available Items
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSale.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${(item.quantity * item.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddItem(item)}
                          disabled={!item.returnable || returnItems.some(ri => ri.id === item.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Return Items */}
            {returnItems.length > 0 && (
              <div className="rounded-lg border">
                <div className="bg-muted/50 px-4 py-3 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items to Return
                  </h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead className="text-right">Refund</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.sku}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Select
                              value={item.quantity.toString()}
                              onValueChange={(value) => 
                                handleUpdateItem(item.id, 'quantity', parseInt(value))
                              }
                            >
                              <SelectTrigger className="w-[80px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: item.maxQuantity }, (_, i) => (
                                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    {i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.reason}
                            onValueChange={(value) => 
                              handleUpdateItem(item.id, 'reason', value)
                            }
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {returnReasons.map((reason) => (
                                <SelectItem key={reason} value={reason}>
                                  {reason}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.condition}
                            onValueChange={(value) => 
                              handleUpdateItem(item.id, 'condition', value)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {itemConditions.map((condition) => (
                                <SelectItem key={condition} value={condition}>
                                  {condition}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${(item.quantity * item.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="bg-muted/50 p-4 border-t">
                  <div className="flex justify-end">
                    <div className="w-[300px] space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Refund:</span>
                        <span className="font-medium">${totalRefund.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <Input
                placeholder="Add any additional notes about this return..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
      </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              variant="outline"
              onClick={() => navigate('/sales/returns')}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleProcessReturn}
              disabled={returnItems.length === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Process Return
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
