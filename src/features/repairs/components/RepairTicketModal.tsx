import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { 
  Calendar as CalendarIcon, 
  Upload, 
  UserPlus, 
  PlusCircle, 
  Search,
  XCircle
} from "lucide-react"
import { 
  Repair, 
  RepairStatus,
  RepairPriority,
  LeatherProductType,
  RepairIssueType,
  PaymentMethod,
  repairSchema,
  CreateRepairDTO,
  UpdateRepairDTO 
} from '../types'
import { Customer } from '@/features/customers/pages/CustomersPage'
import { CustomerDialog } from '@/features/customers/components/CustomerDialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { Badge } from "@/components/ui/badge"
import { useDropzone } from 'react-dropzone'

interface RepairTicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repair?: Repair
  onSubmit: (data: CreateRepairDTO | UpdateRepairDTO) => void
  technicians: string[] // List of available technicians
}

type Product = {
  id: string
  name: string
  sku: string
  type: LeatherProductType
  description: string
  variants: ProductVariant[]
}

type ProductVariant = {
  id: string
  color: string
  size?: string
  stock: number
  price: number
}

export function RepairTicketModal({
  open,
  onOpenChange,
  repair,
  onSubmit,
  technicians
}: RepairTicketModalProps) {
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [colorSearchValue, setColorSearchValue] = useState("")
  const [beforeRepairImages, setBeforeRepairImages] = useState<string[]>([])
  
  // Mock product data
  const products = useMemo<Product[]>(() => [
    {
      id: "1",
      name: "Leather Handbag",
      sku: "LHB-001",
      type: LeatherProductType.BAG,
      description: "Premium leather handbag with gold hardware",
      variants: [
        { id: "1-1", color: "Black", size: "Medium", stock: 5, price: 299.99 },
        { id: "1-2", color: "Brown", size: "Medium", stock: 3, price: 299.99 },
        { id: "1-3", color: "Red", size: "Small", stock: 2, price: 249.99 },
      ]
    },
    {
      id: "2",
      name: "Leather Wallet",
      sku: "LW-002",
      type: LeatherProductType.WALLET,
      description: "Bifold leather wallet with multiple card slots",
      variants: [
        { id: "2-1", color: "Black", stock: 10, price: 79.99 },
        { id: "2-2", color: "Brown", stock: 8, price: 79.99 },
        { id: "2-3", color: "Tan", stock: 6, price: 89.99 },
      ]
    },
    {
      id: "3",
      name: "Leather Belt",
      sku: "LB-003",
      type: LeatherProductType.BELT,
      description: "Full-grain leather belt with metal buckle",
      variants: [
        { id: "3-1", color: "Black", size: "32", stock: 15, price: 59.99 },
        { id: "3-2", color: "Brown", size: "34", stock: 12, price: 59.99 },
        { id: "3-3", color: "Tan", size: "36", stock: 8, price: 59.99 },
      ]
    }
  ], []);

  // Mock customer data - in a real app, this would come from an API
  useEffect(() => {
    setCustomers([
      {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        joinDate: new Date("2023-01-15"),
        loyaltyPoints: 250,
        tier: "silver",
        totalSpent: 1250.75,
        lastPurchase: new Date("2023-05-20"),
        status: "active"
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "987-654-3210",
        joinDate: new Date("2022-11-05"),
        loyaltyPoints: 520,
        tier: "gold",
        totalSpent: 3450.25,
        lastPurchase: new Date("2023-06-10"),
        status: "active"
      },
      {
        id: "3",
        name: "Michael Johnson",
        email: "michael.j@example.com",
        phone: "555-123-4567",
        joinDate: new Date("2023-03-22"),
        loyaltyPoints: 100,
        tier: "bronze",
        totalSpent: 750.50,
        lastPurchase: new Date("2023-05-30"),
        status: "active"
      }
    ]);
  }, []);

  const form = useForm<CreateRepairDTO | UpdateRepairDTO>({
    resolver: zodResolver(repairSchema),
    defaultValues: repair || {
      priority: RepairPriority.MEDIUM,
      status: RepairStatus.PENDING,
      warranty: false,
      depositAmount: 0,
      notifyCustomer: true,
      diagnostics: [],
      items: [],
      workLogs: [],
      payments: [],
      productImages: [],
    }
  })

  // Update form when a customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      form.setValue("customerName", selectedCustomer.name);
      form.setValue("customerPhone", selectedCustomer.phone);
      form.setValue("customerEmail", selectedCustomer.email);
    }
  }, [selectedCustomer, form]);

  // Update form when a product is selected
  useEffect(() => {
    if (selectedProduct && selectedVariant) {
      form.setValue("productType", selectedProduct.type);
      form.setValue("productDescription", selectedProduct.description);
      form.setValue("color", selectedVariant.color);
    }
  }, [selectedProduct, selectedVariant, form]);

  const handleSubmit = (data: CreateRepairDTO | UpdateRepairDTO) => {
    onSubmit(data)
    onOpenChange(false)
  }

  const handleNewCustomerAdded = (newCustomer: Customer) => {
    setCustomers(prev => [...prev, newCustomer]);
    setSelectedCustomer(newCustomer);
    setIsAddingCustomer(false);
  }

  const handleProductSelect = (product: Product, variant: ProductVariant) => {
    setSelectedProduct(product);
    setSelectedVariant(variant);
    setProductSearchOpen(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Create preview URLs for the accepted files
    const imageUrls = acceptedFiles.map(file => URL.createObjectURL(file));
    setBeforeRepairImages(prev => [...prev, ...imageUrls]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5242880 // 5MB
  });

  const removeImage = (index: number) => {
    setBeforeRepairImages(prev => prev.filter((_, i) => i !== index));
  };

  const getColorStyle = (color: string) => {
    // Map common color names to CSS colors
    const colorMap: Record<string, string> = {
      black: "#000000",
      brown: "#8B4513",
      tan: "#D2B48C",
      red: "#FF0000",
      blue: "#0000FF",
      green: "#008000",
      yellow: "#FFFF00",
      orange: "#FFA500",
      purple: "#800080",
      pink: "#FFC0CB",
      gray: "#808080",
      grey: "#808080",
      white: "#FFFFFF",
      silver: "#C0C0C0",
      gold: "#FFD700",
      navy: "#000080",
      beige: "#F5F5DC",
      burgundy: "#800020",
      cream: "#FFFDD0",
      khaki: "#C3B091",
    };

    const lowerColor = color.toLowerCase();
    return {
      backgroundColor: colorMap[lowerColor] || lowerColor,
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      display: "inline-block",
      border: "1px solid #ccc",
      marginRight: "8px",
      verticalAlign: "middle"
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-secondary/20">
        <DialogHeader className="pb-4 border-b space-y-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {repair ? 'Edit Repair Ticket' : 'New Repair Ticket'}
            </DialogTitle>
            {repair && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                Ticket #{repair.ticketNumber}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-base">
            {repair 
              ? `Created on ${format(repair.createdAt, 'PPP')} at ${format(repair.createdAt, 'p')}` 
              : `Creating new ticket on ${format(new Date(), 'PPP')} at ${format(new Date(), 'p')}`
            }
          </DialogDescription>
          {repair && (
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={
                  repair.status === RepairStatus.COMPLETED 
                    ? "success" 
                    : repair.status === RepairStatus.IN_PROGRESS 
                    ? "default" 
                    : "secondary"
                }
                className="text-xs"
              >
                {repair.status}
              </Badge>
              <Badge 
                variant={
                  repair.priority === RepairPriority.HIGH 
                    ? "destructive" 
                    : repair.priority === RepairPriority.MEDIUM 
                    ? "default" 
                    : "outline"
                }
                className="text-xs"
              >
                {repair.priority} Priority
              </Badge>
            </div>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Customer Information</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddingCustomer(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Customer
                </Button>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Select Customer</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const customer = customers.find(c => c.id === value);
                          setSelectedCustomer(customer || null);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-[var(--radix-select-trigger-width)]" position="popper" align="start" sideOffset={5}>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} ({customer.phone})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {selectedCustomer && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted/20">
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Loyalty Tier</p>
                      <p className="text-sm capitalize">{selectedCustomer.tier}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Product Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Product Information</h3>
              
              <div className="space-y-4">
                {/* Product Search */}
                <div className="flex flex-col space-y-2">
                  <FormLabel>Select Product</FormLabel>
                  <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={productSearchOpen}
                        className="w-full justify-between"
                      >
                        {selectedProduct && selectedVariant
                          ? `${selectedProduct.name} - ${selectedVariant.color}${selectedVariant.size ? ` (${selectedVariant.size})` : ''}`
                          : "Search products..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" sideOffset={5}>
                      <Command className="w-full">
                        <CommandInput placeholder="Search products..." className="w-full" />
                        <CommandEmpty>No products found.</CommandEmpty>
                        {products.map((product) => (
                          <CommandGroup key={product.id} heading={product.name}>
                            {product.variants.map((variant) => (
                              <CommandItem
                                key={variant.id}
                                value={variant.id}
                                onSelect={() => handleProductSelect(product, variant)}
                              >
                                <div className="flex items-center">
                                  <div style={getColorStyle(variant.color)}></div>
                                  <div>
                                    <div>{product.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {variant.color}{variant.size ? ` / ${variant.size}` : ''} - Stock: {variant.stock}
                                    </div>
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Color Field with Visual Indicator */}
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <div className="flex items-center space-x-2">
                        {field.value && (
                          <div style={getColorStyle(field.value)}></div>
                        )}
                        <FormControl>
                          <Input {...field} onChange={(e) => {
                            field.onChange(e);
                            setColorSearchValue(e.target.value);
                          }} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Product Description */}
                <FormField
                  control={form.control}
                  name="productDescription"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Product Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Repair Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Repair Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="issueType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-[var(--radix-select-trigger-width)]" position="popper" align="start" sideOffset={5}>
                          {Object.values(RepairIssueType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-[var(--radix-select-trigger-width)]" position="popper" align="start" sideOffset={5}>
                          {Object.values(RepairPriority).map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
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
                  name="issueDescription"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Issue Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Before Repair Images */}
                <div className="col-span-2 space-y-2">
                  <FormLabel>Before Repair Images</FormLabel>
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-md p-6 cursor-pointer transition-colors ${
                      isDragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-2 text-center">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {isDragActive ? 'Drop the images here' : 'Drag & drop images here'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          or click to select files (max 5MB each)
                        </p>
                      </div>
                    </div>
                  </div>

                  {beforeRepairImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {beforeRepairImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full h-24 border rounded-md overflow-hidden">
                            <img 
                              src={img} 
                              alt={`Before repair ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(RepairStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
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
                  name="estimatedCompletionDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Estimated Completion</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Financial Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Additional Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <FormField
                  control={form.control}
                  name="warranty"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Under Warranty</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notifyCustomer"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Notify Customer of Updates</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {repair ? 'Update Ticket' : 'Create Ticket'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      {isAddingCustomer && (
        <CustomerDialog
          open={isAddingCustomer}
          onOpenChange={setIsAddingCustomer}
          onCustomerAdded={handleNewCustomerAdded}
        />
      )}
    </Dialog>
  )
}
