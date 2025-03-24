import React, { useState, Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { format, addMonths, startOfToday, isBefore, isAfter, startOfDay, eachDayOfInterval } from 'date-fns'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Store, 
  Warehouse, 
  CalendarIcon,
  Search,
  Plus,
  Minus,
  X,
  Package,
  Tags,
  ShoppingCart,
  ImageIcon,
  ClipboardList,
  TruckIcon,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Location = {
  id: string
  name: string
  type: 'store' | 'market' | 'warehouse'
  status: 'active' | 'inactive'
}

type ProductVariant = {
  id: string
  size: string
  color: string
  stock: number
  price: number
}

type Product = {
  id: string
  name: string
  sku: string
  category: string
  supplier: string
  description: string
  image: string
  variants: ProductVariant[]
}

// Mock data
const mockLocations: Location[] = [
  { id: '1', name: 'Main Warehouse', type: 'warehouse', status: 'active' },
  { id: '2', name: 'Downtown Store', type: 'store', status: 'active' },
  { id: '3', name: 'Summer Pop-up Market', type: 'market', status: 'active' },
  { id: '4', name: 'Mall Store', type: 'store', status: 'active' },
]

const categories = [
  'All',
  'Apparel',
  'Electronics',
  'Home & Living',
  'Beauty',
  'Sports',
  'Books',
  'Toys'
]

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Cotton T-Shirt',
    sku: 'TS-001',
    category: 'Apparel',
    supplier: 'Fashion Wholesale Co.',
    description: 'Classic cotton t-shirt with comfortable fit',
    image: 'https://placehold.co/100x100.png',
    variants: [
      { id: '1-1', size: 'M', color: 'Black', stock: 15, price: 29.99 },
      { id: '1-2', size: 'L', color: 'Black', stock: 10, price: 29.99 },
      { id: '1-3', size: 'XL', color: 'Black', stock: 5, price: 29.99 },
    ]
  },
  {
    id: '2',
    name: 'Denim Jeans',
    sku: 'DJ-002',
    category: 'Apparel',
    supplier: 'Denim Masters Ltd.',
    description: 'Classic blue denim jeans with straight fit',
    image: 'https://placehold.co/100x100.png',
    variants: [
      { id: '2-1', size: '32', color: 'Blue', stock: 8, price: 79.99 },
      { id: '2-2', size: '34', color: 'Blue', stock: 12, price: 79.99 },
      { id: '2-3', size: '36', color: 'Blue', stock: 6, price: 79.99 },
    ]
  },
  {
    id: '3',
    name: 'Leather Jacket',
    sku: 'LJ-003',
    category: 'Outerwear',
    supplier: 'Leather Goods Inc.',
    description: 'Premium leather jacket with quilted lining',
    image: 'https://placehold.co/100x100.png',
    variants: [
      { id: '3-1', size: 'S', color: 'Brown', stock: 5, price: 199.99 },
      { id: '3-2', size: 'M', color: 'Brown', stock: 7, price: 199.99 },
      { id: '3-3', size: 'L', color: 'Brown', stock: 3, price: 199.99 },
    ]
  },
  {
    id: '4',
    name: 'Running Shoes',
    sku: 'RS-004',
    category: 'Footwear',
    supplier: 'Sneaker Co.',
    description: 'Lightweight running shoes with cushioned sole',
    image: 'https://placehold.co/100x100.png',
    variants: [
      { id: '4-1', size: '40', color: 'White', stock: 10, price: 89.99 },
      { id: '4-2', size: '42', color: 'White', stock: 8, price: 89.99 },
      { id: '4-3', size: '44', color: 'White', stock: 6, price: 89.99 },
    ]
  }
]

const suppliers = Array.from(new Set(mockProducts.map(p => p.supplier)))

export interface TransferWizardProps {
  onComplete: (transferData: any) => void
  onCancel: () => void
  initialData?: {
    source: string
    destination: string
    transferType: string
    scheduledDate: Date
    selectedProducts: Array<{
      product: Product
      variant: ProductVariant
      quantity: number
    }>
    notes: string
    reason: string
  }
}

const steps = [
  {
    id: 1,
    title: 'Transfer Details',
    icon: ClipboardList,
    description: 'Set source, destination and schedule',
    subtitle: 'Set source, destination'
  },
  {
    id: 2,
    title: 'Select Products',
    icon: Package,
    description: 'Choose products to transfer',
    subtitle: 'Choose products to transfer'
  },
  {
    id: 3,
    title: 'Review & Notes',
    icon: CheckCircle2,
    description: 'Add notes and review transfer',
    subtitle: 'Add notes and review transfer'
  }
]

export function TransferWizard({ onComplete, onCancel, initialData }: TransferWizardProps) {
  const [step, setStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (initialData?.selectedProducts.length > 0) {
      return initialData.selectedProducts[0].product.category
    }
    return categories[0]
  })
  const [selectedSupplier, setSelectedSupplier] = useState('All')
  const [transferData, setTransferData] = useState(initialData || {
    source: '',
    destination: '',
    transferType: 'immediate',
    scheduledDate: new Date(),
    selectedProducts: [] as Array<{
      product: Product
      variant: ProductVariant
      quantity: number
    }>,
    notes: '',
    reason: ''
  })

  // Pre-filter products based on initial data
  const filteredProducts = mockProducts.filter(product => {
    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory
    const supplierMatch = selectedSupplier === 'All' || product.supplier === selectedSupplier
    const searchMatch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    
    // If we have initial data, include all products that were in the transfer
    if (initialData?.selectedProducts.some(p => p.product.sku === product.sku)) {
      return true
    }
    
    return categoryMatch && searchMatch && supplierMatch
  })

  const totalItems = transferData.selectedProducts.reduce((acc, item) => acc + item.quantity, 0)
  const totalValue = transferData.selectedProducts.reduce((acc, item) => acc + (item.variant.price * item.quantity), 0)

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      onComplete(transferData)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      onCancel()
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid gap-6 w-full">
            <div className="grid gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label>Source Location</Label>
                <Select
                  value={transferData.source}
                  onValueChange={(value) => 
                    setTransferData({ ...transferData, source: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select source location" />
                  </SelectTrigger>
                  <SelectContent className="w-full min-w-[300px]">
                    {mockLocations.map(location => (
                      <SelectItem 
                        key={location.id} 
                        value={location.id}
                      >
                        <div className="flex items-center">
                          {location.type === 'warehouse' ? (
                            <Warehouse className="mr-2 h-4 w-4" />
                          ) : (
                            <Store className="mr-2 h-4 w-4" />
                          )}
                          {location.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 w-full">
                <Label>Destination Location</Label>
                <Select
                  value={transferData.destination}
                  onValueChange={(value) => 
                    setTransferData({ ...transferData, destination: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select destination location" />
                  </SelectTrigger>
                  <SelectContent className="w-full min-w-[300px]">
                    {mockLocations
                      .filter(l => l.id !== transferData.source)
                      .map(location => (
                        <SelectItem 
                          key={location.id} 
                          value={location.id}
                        >
                          <div className="flex items-center">
                            {location.type === 'warehouse' ? (
                              <Warehouse className="mr-2 h-4 w-4" />
                            ) : (
                              <Store className="mr-2 h-4 w-4" />
                            )}
                            {location.name}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 w-full">
                <Label>Transfer Type</Label>
                <Select
                  value={transferData.transferType}
                  onValueChange={(value: 'immediate' | 'scheduled') => 
                    setTransferData({ ...transferData, transferType: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select transfer type" />
                  </SelectTrigger>
                  <SelectContent className="w-full min-w-[300px]">
                    <SelectItem value="immediate">Immediate Transfer</SelectItem>
                    <SelectItem value="scheduled">Scheduled Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {transferData.transferType === 'scheduled' && (
                <div className="space-y-4 w-full">
                  <div className="space-y-2">
                    <Label>Schedule Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !transferData.scheduledDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {transferData.scheduledDate ? (
                            format(transferData.scheduledDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4" align="start">
                        <Calendar
                          mode="single"
                          selected={transferData.scheduledDate}
                          onSelect={(date) => {
                            if (date) {
                              const [hours, minutes] = selectedTime.split(':').map(Number)
                              date.setHours(hours, minutes)
                              setTransferData({ ...transferData, scheduledDate: date })
                            }
                          }}
                          disabled={(date) => {
                            const today = startOfDay(new Date())
                            const threeMonthsLater = addMonths(today, 3)
                            return isBefore(date, today) || isAfter(date, threeMonthsLater)
                          }}
                          initialFocus
                          className="rounded-md"
                          modifiers={{
                            weekend: (date) => {
                              const day = date.getDay()
                              return day === 0 || day === 6
                            }
                          }}
                          modifiersClassNames={{
                            weekend: "text-red-500"
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Schedule Time</Label>
                    <Select
                      value={selectedTime}
                      onValueChange={(time) => {
                        setSelectedTime(time)
                        if (transferData.scheduledDate) {
                          const [hours, minutes] = time.split(':').map(Number)
                          const newDate = new Date(transferData.scheduledDate)
                          newDate.setHours(hours, minutes)
                          setTransferData({
                            ...transferData,
                            scheduledDate: newDate
                          })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 13 }, (_, i) => i + 8).map((hour) => (
                          <Fragment key={hour}>
                            <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                              {`${hour.toString().padStart(2, '0')}:00`}
                            </SelectItem>
                            <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                              {`${hour.toString().padStart(2, '0')}:30`}
                            </SelectItem>
                          </Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Schedule transfers between 8:00 AM and 8:30 PM, up to 3 months in advance
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label>Search Products</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or SKU"
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-[180px]">
                  <Label>Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[200px]">
                  <Label>Supplier</Label>
                  <Select
                    value={selectedSupplier}
                    onValueChange={setSelectedSupplier}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Suppliers</SelectItem>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier} value={supplier}>
                          {supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Available Products</h3>
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-lg border p-3 space-y-3 mb-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-md border overflow-hidden bg-zinc-50">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{product.name}</h4>
                                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                                <p className="text-sm text-muted-foreground">{product.description}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (product.variants.length > 0) {
                                    const variant = product.variants[0]
                                    setTransferData({
                                      ...transferData,
                                      selectedProducts: [
                                        ...transferData.selectedProducts,
                                        {
                                          product,
                                          variant,
                                          quantity: 1
                                        }
                                      ]
                                    })
                                  }
                                }}
                                disabled={transferData.selectedProducts.some(
                                  (p) => p.product.id === product.id
                                )}
                              >
                                {transferData.selectedProducts.some(
                                  (p) => p.product.id === product.id
                                )
                                  ? "Added"
                                  : "Add Product"}
                              </Button>
                            </div>
                            {transferData.selectedProducts.some(
                              (p) => p.product.id === product.id
                            ) && (
                              <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-4">
                                  <Select
                                    value={
                                      transferData.selectedProducts
                                        .find((p) => p.product.id === product.id)
                                        ?.variant.id
                                    }
                                    onValueChange={(variantId) => {
                                      const variant = product.variants.find(
                                        (v) => v.id === variantId
                                      )
                                      if (variant) {
                                        setTransferData({
                                          ...transferData,
                                          selectedProducts: transferData.selectedProducts.map(
                                            (p) =>
                                              p.product.id === product.id
                                                ? { ...p, variant }
                                                : p
                                          )
                                        })
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Select variant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {product.variants.map((variant) => (
                                        <SelectItem key={variant.id} value={variant.id}>
                                          {variant.size} - {variant.color} ({variant.stock} in stock)
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => {
                                        const currentProduct = transferData.selectedProducts.find(
                                          (p) => p.product.id === product.id
                                        )
                                        if (currentProduct && currentProduct.quantity > 1) {
                                          setTransferData({
                                            ...transferData,
                                            selectedProducts: transferData.selectedProducts.map(
                                              (p) =>
                                                p.product.id === product.id
                                                  ? { ...p, quantity: p.quantity - 1 }
                                                  : p
                                            )
                                          })
                                        }
                                      }}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={
                                        transferData.selectedProducts.find(
                                          (p) => p.product.id === product.id
                                        )?.variant.stock || 1
                                      }
                                      value={
                                        transferData.selectedProducts.find(
                                          (p) => p.product.id === product.id
                                        )?.quantity || 1
                                      }
                                      onChange={(e) => {
                                        const quantity = parseInt(e.target.value)
                                        if (!isNaN(quantity)) {
                                          setTransferData({
                                            ...transferData,
                                            selectedProducts: transferData.selectedProducts.map(
                                              (p) =>
                                                p.product.id === product.id
                                                  ? { ...p, quantity }
                                                  : p
                                            )
                                          })
                                        }
                                      }}
                                      className="w-20 text-center"
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => {
                                        const currentProduct = transferData.selectedProducts.find(
                                          (p) => p.product.id === product.id
                                        )
                                        if (currentProduct && 
                                            currentProduct.quantity < currentProduct.variant.stock) {
                                          setTransferData({
                                            ...transferData,
                                            selectedProducts: transferData.selectedProducts.map(
                                              (p) =>
                                                p.product.id === product.id
                                                  ? { ...p, quantity: p.quantity + 1 }
                                                  : p
                                            )
                                          })
                                        }
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setTransferData({
                                        ...transferData,
                                        selectedProducts: transferData.selectedProducts.filter(
                                          (p) => p.product.id !== product.id
                                        )
                                      })
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Selected Products</h3>
                  <div className="rounded-lg border p-3">
                    <div className="space-y-3">
                      {transferData.selectedProducts.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No products selected
                        </p>
                      ) : (
                        <>
                          {transferData.selectedProducts.map(({ product, variant, quantity }) => (
                            <div key={`${product.id}-${variant.id}`} className="flex items-start gap-3 py-1">
                              <div className="w-14 h-14 rounded-md border overflow-hidden bg-zinc-50">
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {variant.size} - {variant.color}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => {
                                          if (quantity > 1) {
                                            setTransferData({
                                              ...transferData,
                                              selectedProducts: transferData.selectedProducts.map(
                                                (p) =>
                                                  p.product.id === product.id
                                                    ? { ...p, quantity: p.quantity - 1 }
                                                    : p
                                              )
                                            })
                                          }
                                        }}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-sm font-medium w-8 text-center">
                                        {quantity}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => {
                                          if (quantity < variant.stock) {
                                            setTransferData({
                                              ...transferData,
                                              selectedProducts: transferData.selectedProducts.map(
                                                (p) =>
                                                  p.product.id === product.id
                                                    ? { ...p, quantity: p.quantity + 1 }
                                                    : p
                                              )
                                            })
                                          }
                                        }}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => {
                                        setTransferData({
                                          ...transferData,
                                          selectedProducts: transferData.selectedProducts.filter(
                                            (p) => p.product.id !== product.id
                                          )
                                        })
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                    <p className="font-medium text-sm">
                                      ${(variant.price * quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex items-center justify-between font-medium pt-1">
                            <div>
                              <p>Total Items</p>
                              <p className="text-sm text-muted-foreground">{totalItems} items</p>
                            </div>
                            <p>${totalValue.toFixed(2)}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
            {/* Left Column - Transfer Details & Notes */}
            <div className="space-y-6">
              {/* Transfer Details Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Transfer Details</h3>
                <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-sm font-medium">From</div>
                      <div className="flex items-center text-muted-foreground">
                        {mockLocations.find(l => l.id === transferData.source)?.type === 'warehouse' ? (
                          <Warehouse className="mr-2 h-4 w-4" />
                        ) : (
                          <Store className="mr-2 h-4 w-4" />
                        )}
                        {mockLocations.find(l => l.id === transferData.source)?.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">To</div>
                      <div className="flex items-center text-muted-foreground">
                        {mockLocations.find(l => l.id === transferData.destination)?.type === 'warehouse' ? (
                          <Warehouse className="mr-2 h-4 w-4" />
                        ) : (
                          <Store className="mr-2 h-4 w-4" />
                        )}
                        {mockLocations.find(l => l.id === transferData.destination)?.name}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Transfer Type</div>
                    <div className="text-muted-foreground flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {transferData.transferType === 'immediate' ? (
                        'Immediate Transfer'
                      ) : (
                        `Scheduled for ${format(transferData.scheduledDate, "PPP")}`
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notes & Reason</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Transfer Reason</Label>
                    <Select
                      value={transferData.reason}
                      onValueChange={(value) => 
                        setTransferData({ ...transferData, reason: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select reason for transfer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="restock">Restock</SelectItem>
                        <SelectItem value="seasonal">Seasonal Demand</SelectItem>
                        <SelectItem value="market">Market Allocation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      placeholder="Add any additional notes or instructions..."
                      value={transferData.notes}
                      onChange={(e) => 
                        setTransferData({ ...transferData, notes: e.target.value })
                      }
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Products Summary */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Products Summary</h3>
                <Badge variant="outline" className="px-4">
                  {transferData.selectedProducts.length} {transferData.selectedProducts.length === 1 ? 'Product' : 'Products'}
                </Badge>
              </div>
              <div className="border rounded-lg bg-card">
                <div className="p-4 border-b bg-muted/50">
                  <div className="grid grid-cols-[1fr,auto] gap-4 text-sm text-muted-foreground">
                    <div>Product Details</div>
                    <div>Amount</div>
                  </div>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-3">
                    {transferData.selectedProducts.map(({ product, variant, quantity }) => (
                      <div 
                        key={variant.id}
                        className="group flex items-start gap-4 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors"
                      >
                        <div className="w-16 h-16 rounded-md border overflow-hidden flex-shrink-0 bg-muted">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 overflow-hidden">
                              <div className="font-medium truncate">{product.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Package className="h-3 w-3" />
                                <span>SKU: {product.sku}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="bg-background">
                                  {variant.size} / {variant.color}
                                </Badge>
                                <Badge variant="secondary">
                                  {quantity} {quantity === 1 ? 'unit' : 'units'}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                ${(variant.price * quantity).toFixed(2)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ${variant.price.toFixed(2)} per unit
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-t bg-muted/50">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>Total Items</span>
                      </div>
                      <div className="font-medium">
                        {totalItems} {totalItems === 1 ? 'unit' : 'units'}
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Total Value</span>
                      </div>
                      <div className="text-lg font-semibold">
                        ${totalValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Steps Header */}
      <div className="w-full">
        <div className="flex items-start justify-between max-w-3xl mx-auto">
          {steps.map((s, i) => {
            const isActive = s.id === step
            const isComplete = s.id < step
            const Icon = s.icon

            return (
              <div 
                key={s.id}
                className="flex flex-col items-center relative"
              >
                {/* Progress Line */}
                {i < steps.length - 1 && (
                  <div 
                    className={cn(
                      "absolute top-4 left-8 w-[calc(100%+64px)] h-[2px] -z-10",
                      isComplete ? "bg-primary" : "bg-zinc-800"
                    )}
                  />
                )}
                
                {/* Step Number */}
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2",
                    isActive 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : isComplete 
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-zinc-800 text-zinc-500"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{s.id}</span>
                  )}
                </div>
                
                {/* Step Title */}
                <div className={cn(
                  "text-sm font-medium",
                  isActive ? "text-primary" : "text-zinc-400"
                )}>
                  {s.title}
                </div>
                
                {/* Step Subtitle */}
                <div className={cn(
                  "text-xs mt-1 text-center",
                  isActive ? "text-zinc-400" : "text-zinc-600"
                )}>
                  {s.subtitle}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="w-full border-zinc-800 bg-zinc-900/50">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <CardTitle className="text-lg font-medium">
            {steps.find(s => s.id === step)?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-zinc-800 pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-zinc-800 hover:bg-zinc-800"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              (step === 1 && (!transferData.source || !transferData.destination)) ||
              (step === 2 && transferData.selectedProducts.length === 0)
            }
            className="bg-primary hover:bg-primary/90"
          >
            {step === 3 ? 'Complete Transfer' : 'Continue'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
