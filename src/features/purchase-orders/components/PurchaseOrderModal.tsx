import { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { 
  ShoppingCart,
  Building2,
  Calendar,
  Package,
  DollarSign,
  Clock,
  AlertCircle,
  Trash2,
  X
} from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

const purchaseOrderSchema = z.object({
  orderNumber: z.string().min(3, "Order number must be at least 3 characters"),
  supplierId: z.string().min(1, "Please select a supplier"),
  date: z.string().min(1, "Please select a date"),
  status: z.enum([
    "Draft",
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled"
  ], {
    required_error: "Please select a status"
  }),
  expectedDelivery: z.string().optional(),
  notes: z.string().optional()
})

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>

interface PurchaseOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: any
}

// Mock suppliers data
const mockSuppliers = [
  { id: "SUP-001", name: "Audio Supplies Co." },
  { id: "SUP-002", name: "Pro Audio Systems" },
  { id: "SUP-003", name: "Sound Equipment Ltd" },
  { id: "SUP-004", name: "Music Gear Direct" },
  { id: "SUP-005", name: "Audio Tech Solutions" }
]

// Mock products data
const mockProducts = [
  { id: "PROD-001", name: "Studio Microphone", price: 299.99, sku: "MIC-001" },
  { id: "PROD-002", name: "Audio Interface", price: 199.50, sku: "AIF-002" },
  { id: "PROD-003", name: "Studio Monitors (Pair)", price: 499.00, sku: "MON-003" },
  { id: "PROD-004", name: "Headphones", price: 149.99, sku: "HPH-004" },
  { id: "PROD-005", name: "XLR Cable", price: 24.99, sku: "CBL-005" }
]

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export function PurchaseOrderModal({ 
  open, 
  onOpenChange,
  initialData 
}: PurchaseOrderModalProps) {
  const { toast } = useToast()
  const [items, setItems] = useState<OrderItem[]>([])
  const [showItemForm, setShowItemForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)

  // Load items when initialData changes
  useEffect(() => {
    if (initialData && Array.isArray(initialData.items)) {
      setItems(initialData.items);
    } else {
      setItems([]);
    }
  }, [initialData]);

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      orderNumber: initialData?.orderNumber || "",
      supplierId: initialData?.supplier?.id || "",
      date: initialData?.date || new Date().toISOString().split('T')[0],
      status: initialData?.status || "Draft",
      expectedDelivery: initialData?.expectedDelivery || "",
      notes: initialData?.notes || ""
    }
  })

  function onSubmit(data: PurchaseOrderFormValues) {
    // Include items in the submitted data
    const completeData = {
      ...data,
      items
    }
    console.log(completeData)
    toast({
      title: "Purchase Order saved",
      description: "The purchase order has been saved successfully."
    })
    onOpenChange(false)
  }

  const handleAddItem = () => {
    setShowItemForm(true)
  }

  const handleCancelAddItem = () => {
    setShowItemForm(false)
    setSelectedProduct("")
    setQuantity(1)
  }

  const handleSaveItem = () => {
    if (!selectedProduct || quantity <= 0) {
      toast({
        title: "Invalid item",
        description: "Please select a product and enter a valid quantity.",
        variant: "destructive"
      })
      return
    }

    const product = mockProducts.find(p => p.id === selectedProduct)
    if (!product) return

    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      total: product.price * quantity
    }

    setItems([...items, newItem])
    setShowItemForm(false)
    setSelectedProduct("")
    setQuantity(1)

    toast({
      title: "Item added",
      description: `${product.name} has been added to the order.`
    })
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const calculateOrderTotal = () => {
    return Array.isArray(items) ? items.reduce((sum, item) => sum + item.total, 0) : 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Purchase Order" : "Create Purchase Order"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Update the purchase order details below." 
              : "Fill in the purchase order details below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ShoppingCart className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="PO-001" className="pl-8 font-mono" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <Building2 className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockSuppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-4">Order Items</h3>
              {items.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No items added yet. Click "Add Item" to start adding products to this order.
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(items) && items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">Total:</TableCell>
                        <TableCell className="text-right font-medium">${calculateOrderTotal().toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {showItemForm ? (
                <div className="mt-4 border rounded-md p-3 bg-muted/30">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium">Add New Item</h4>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleCancelAddItem}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <FormLabel className="text-xs">Product</FormLabel>
                      <Select onValueChange={setSelectedProduct} value={selectedProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProducts.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (${product.price.toFixed(2)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <FormLabel className="text-xs">Quantity</FormLabel>
                      <Input 
                        type="number" 
                        min="1" 
                        value={quantity} 
                        onChange={e => setQuantity(parseInt(e.target.value) || 0)} 
                      />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={handleSaveItem}
                  >
                    Add to Order
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={handleAddItem}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? "Update Order" : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
