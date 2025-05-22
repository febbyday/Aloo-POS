import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus, Search, X, ArrowRight, ArrowLeft, CheckCircle2, ClipboardList, Package, Trash2, Calendar } from "lucide-react"
import type { Product, Category, SpecialPrice } from "../../types"
import { useToast } from "@/components/ui/use-toast"
import { ProductCombobox } from "./ProductCombobox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils';
import { useCategories } from '../../context/CategoryContext'

const bulkSpecialPriceSchema = z.object({
  name: z.string({
    required_error: "Please enter a name for this special price",
  }),
  // Selection criteria
  selectionType: z.enum(["individual", "category", "price_range", "all"]),
  categoryIds: z.array(z.string()).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  productIds: z.array(z.string()).optional(),
  
  // Price adjustment
  adjustmentType: z.enum(["fixed", "percentage", "amount_off"]),
  adjustmentValue: z.number({
    required_error: "Please enter an adjustment value",
  }).min(0),
  
  // Common fields
  startDate: z.string({
    required_error: "Please select a start date",
  }),
  endDate: z.string().optional(),
  minimumQuantity: z.number().default(1),
  
  // Additional options
  applyToVariants: z.boolean().default(false),
  excludeDiscounted: z.boolean().default(false),
})

interface BulkSpecialPriceFormProps {
  categories: Category[]
  onSpecialPricesAdded: (prices: SpecialPrice[]) => void
  defaultSelectionType?: "individual" | "category" | "price_range" | "all"
  buttonProps?: {
    size?: "default" | "sm" | "lg" | "icon"
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    className?: string
    children?: React.ReactNode
  }
}

// Define steps for the wizard
const steps = [
  {
    id: 1,
    title: 'Basic Information',
    icon: ClipboardList,
    description: 'Set name and selection method',
  },
  {
    id: 2,
    title: 'Product Selection',
    icon: Package,
    description: 'Choose products for special pricing',
  },
  {
    id: 3,
    title: 'Date Range',
    icon: Calendar,
    description: 'Set date range for special pricing',
  },
  {
    id: 4,
    title: 'Price Configuration',
    icon: CheckCircle2,
    description: 'Configure pricing rules and options',
  }
]

// Mock products for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Classic Leather Wallet',
    sku: 'WAL-001',
    category: 'Wallets',
    price: 49.99,
    stock: 100,
    image: 'https://placehold.co/100x100.png',
  },
  {
    id: '2',
    name: 'Designer Tote Bag',
    sku: 'TOT-001',
    category: 'Totes',
    price: 89.99,
    stock: 50,
    image: 'https://placehold.co/100x100.png',
  },
  {
    id: '3',
    name: 'Urban Backpack',
    sku: 'BAC-001',
    category: 'Backpacks',
    price: 79.99,
    stock: 75,
    image: 'https://placehold.co/100x100.png',
  },
  {
    id: '4',
    name: 'Evening Clutch',
    sku: 'CLU-001',
    category: 'Clutches',
    price: 59.99,
    stock: 30,
    image: 'https://placehold.co/100x100.png',
  },
  {
    id: '5',
    name: 'Travel Duffel Bag',
    sku: 'TRV-001',
    category: 'Travel',
    price: 129.99,
    stock: 40,
    image: 'https://placehold.co/100x100.png',
  },
  {
    id: '6',
    name: 'Mini Crossbody Bag',
    sku: 'CRS-001',
    category: 'Crossbody',
    price: 69.99,
    stock: 80,
    image: 'https://placehold.co/100x100.png',
  },
  {
    id: '7',
    name: 'Card Holder Wallet',
    sku: 'WAL-002',
    category: 'Wallets',
    price: 29.99,
    stock: 150,
    image: 'https://placehold.co/100x100.png',
  },
  {
    id: '8',
    name: 'Fashion Mini Bag',
    sku: 'MIN-001',
    category: 'Mini Bags',
    price: 45.99,
    stock: 60,
    image: 'https://placehold.co/100x100.png',
  },
  {
    id: '9',
    name: 'Laptop Backpack',
    sku: 'BAC-002',
    category: 'Backpacks',
    price: 99.99,
    stock: 45,
    image: 'https://placehold.co/100x100.png',
  },
  {
    id: '10',
    name: 'Beach Tote',
    sku: 'TOT-002',
    category: 'Totes',
    price: 49.99,
    stock: 70,
    image: 'https://placehold.co/100x100.png',
  },
  {
    id: '11',
    name: 'Luxury Clutch',
    sku: 'CLU-002',
    category: 'Clutches',
    price: 149.99,
    stock: 25,
    image: 'https://placehold.co/100x100.png',
  },
  {
    id: '12',
    name: 'Weekend Travel Bag',
    sku: 'TRV-002',
    category: 'Travel',
    price: 159.99,
    stock: 35,
    image: 'https://placehold.co/100x100.png',
  }
]

export function BulkSpecialPriceForm({ 
  onSpecialPricesAdded,
  defaultSelectionType = "category",
  buttonProps = {
    size: "sm",
    variant: "default",
    children: (
      <>
        <Plus className="h-4 w-4 mr-2" />
        Add Special Prices
      </>
    ),
  }
}: Omit<BulkSpecialPriceFormProps, 'categories'>) {
  const { categories } = useCategories()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts)
  const { toast } = useToast()

  // Filter products based on search and category
  useEffect(() => {
    const filtered = mockProducts.filter(product => {
      const categoryMatch = selectedCategory === 'All' || 
        // Match by category id instead of name
        product.category === categories.find(c => c.id === selectedCategory)?.name
      const searchMatch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      
      return categoryMatch && searchMatch
    })
    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategory, categories])

  const form = useForm<z.infer<typeof bulkSpecialPriceSchema>>({
    resolver: zodResolver(bulkSpecialPriceSchema),
    defaultValues: {
      selectionType: defaultSelectionType,
      adjustmentType: "percentage",
      adjustmentValue: 0,
      startDate: new Date().toISOString().split('T')[0],
      minimumQuantity: 1,
      applyToVariants: false,
      excludeDiscounted: false,
      productIds: [],
    },
  })

  const selectionType = form.watch("selectionType")
  const adjustmentType = form.watch("adjustmentType")

  // Skip product selection step if not using individual selection
  useEffect(() => {
    if (step === 2 && selectionType !== "individual") {
      setStep(3); // Skip to date range step
    }
  }, [step, selectionType]);

  const onSubmit = (values: z.infer<typeof bulkSpecialPriceSchema>) => {
    // Implementation would depend on your backend API
    console.log("Form values:", values)
    
    // Mock implementation for demonstration
    const specialPrices: SpecialPrice[] = []
    
    // In a real implementation, you would create special prices based on the form values
    // and selected products, categories, or price ranges
    
    onSpecialPricesAdded(specialPrices)
      toast({
      title: "Special prices added",
      description: "Your special prices have been added successfully.",
    })
    setOpen(false)
    setStep(1) // Reset step for next time
  }

  const handleNext = () => {
    if (step < steps.length) {
      // If we're on step 1 and not using individual selection, skip step 2
      if (step === 1 && selectionType !== "individual") {
        setStep(3); // Skip to date range step
      } else {
        setStep(step + 1);
      }
    } else {
      form.handleSubmit(onSubmit)()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      // If we're on step 3 and not using individual selection, skip back to step 1
      if (step === 3 && selectionType !== "individual") {
        setStep(1);
      } else {
        setStep(step - 1);
      }
    }
  }

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      }
      return [...prev, productId]
    })
    
    // Update form value
    form.setValue('productIds', selectedProducts.includes(productId) 
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId]
    )
  }

  // Render the current step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
  return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Price Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Summer Sale" />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for these special prices
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

                    <FormField
                      control={form.control}
                      name="selectionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selection Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="individual">Individual Products</SelectItem>
                              <SelectItem value="category">By Category</SelectItem>
                              <SelectItem value="price_range">By Price Range</SelectItem>
                              <SelectItem value="all">All Products</SelectItem>
                            </SelectContent>
                          </Select>
                  <FormDescription>
                    Choose how you want to select products for special pricing
                  </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectionType === "category" && (
                      <FormField
                        control={form.control}
                        name="categoryIds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categories</FormLabel>
                            <div className="relative">
                              <ScrollArea className="max-h-[250px] rounded-md border p-2">
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-1.5 pb-0.5">
                                  {categories.map((category) => (
                                    <div
                                      key={category.id}
                                      className={cn(
                                        "relative flex flex-col items-center p-1.5 rounded-md border cursor-pointer transition-all hover:shadow-sm",
                                        field.value?.includes(category.id)
                                          ? "bg-primary/5 border-primary"
                                          : "hover:bg-accent"
                                      )}
                                      onClick={() => {
                                        const currentValues = field.value || []
                                        const newValues = currentValues.includes(category.id)
                                          ? currentValues.filter((id) => id !== category.id)
                                          : [...currentValues, category.id]
                                        field.onChange(newValues)
                                      }}
                                    >
                                      <div className="text-center w-full">
                                        <Badge 
                                          variant={field.value?.includes(category.id) ? "default" : "outline"}
                                          className="w-full justify-center text-[10px] py-0.5 font-normal truncate"
                                        >
                                          {category.name}
                                        </Badge>
                                        <div className="text-[9px] text-muted-foreground mt-0.5">
                                          {category.products} items
                                        </div>
                                      </div>
                                      {field.value?.includes(category.id) && (
                                        <div className="absolute -top-1 -right-1">
                                          <CheckCircle2 className="h-3 w-3 text-primary" />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                            <FormDescription>
                              Click on categories to select or deselect them
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectionType === "price_range" && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="minPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
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
                          name="maxPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
          </div>
        )
      
      case 2: // Only shown for individual product selection
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <FormLabel>Search Products</FormLabel>
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
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                          {category.description && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({category.description})
                            </span>
                          )}
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
                                <p className="text-sm text-muted-foreground">Price: ${product.price}</p>
                                <p className="text-sm text-muted-foreground">Stock: {product.stock} units</p>
                              </div>
                                      <Button
                                variant={selectedProducts.includes(product.id) ? "secondary" : "outline"}
                                        size="sm"
                                onClick={() => handleProductSelect(product.id)}
                              >
                                {selectedProducts.includes(product.id) ? "Selected" : "Select"}
                                      </Button>
                            </div>
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
                      {selectedProducts.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No products selected
                        </p>
                      ) : (
                        <>
                          {filteredProducts
                            .filter(product => selectedProducts.includes(product.id))
                            .map((product) => (
                              <div key={product.id} className="flex items-start gap-3 py-1">
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
                                        SKU: {product.sku}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        Price: ${product.price}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleProductSelect(product.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          <Separator className="my-2" />
                          <div className="flex items-center justify-between font-medium pt-1">
                            <div>
                              <p>Total Products</p>
                              <p className="text-sm text-muted-foreground">{selectedProducts.length} products</p>
                            </div>
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
      
      case 3: // Date range selection (moved to step 3)
        return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                placeholder="No end date"
                              />
                            </FormControl>
                            <FormDescription>
                              Leave empty for an indefinite special price
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
          </div>
        )
      
      case 4: // Price configuration (now step 4)
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="adjustmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Adjustment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select adjustment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage Discount</SelectItem>
                        <SelectItem value="amount_off">Fixed Amount Off</SelectItem>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how you want to adjust the price
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adjustmentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {adjustmentType === "fixed" ? "Price" :
                       adjustmentType === "percentage" ? "Percentage Off" :
                       "Amount Off"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={adjustmentType === "percentage" ? "1" : "0.01"}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {adjustmentType === "percentage" ? "Enter percentage (e.g., 20 for 20% off)" :
                       adjustmentType === "fixed" ? "Enter the new fixed price" :
                       "Enter the amount to subtract from the original price"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

                    <FormField
                      control={form.control}
                      name="minimumQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum quantity required for this special price
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="applyToVariants"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>Apply to Variants</FormLabel>
                              <FormDescription>
                                Apply this special price to all variants of selected products
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="excludeDiscounted"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div>
                              <FormLabel>Exclude Already Discounted</FormLabel>
                              <FormDescription>
                                Don't apply this special price to products that already have a discount
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
          </div>
        )
      
      default:
        return null
    }
  }

  // Get the actual steps based on selection type
  const getVisibleSteps = () => {
    if (selectionType === "individual") {
      return steps; // Show all steps
    } else {
      // Filter out the product selection step
      return steps.filter(s => s.id !== 2);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size={buttonProps.size}
          variant={buttonProps.variant}
          className={buttonProps.className}
        >
          {buttonProps.children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Bulk Special Price Configuration</DialogTitle>
          <DialogDescription>
            Configure special pricing for multiple products at once.
          </DialogDescription>
        </DialogHeader>
        
        {/* Step indicator */}
        <div className="flex justify-between mb-6">
          {getVisibleSteps().map((s, index) => (
            <div 
              key={s.id} 
              className={cn(
                "flex flex-col items-center space-y-2 relative",
                index < getVisibleSteps().length - 1 && "after:content-[''] after:absolute after:top-4 after:w-full after:h-[1px] after:bg-gray-200 after:left-1/2"
              )}
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center z-10",
                  step === s.id ? "bg-primary text-primary-foreground" : 
                  step > s.id ? "bg-primary/80 text-primary-foreground" : 
                  "bg-muted text-muted-foreground"
                )}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <span className={cn(
                "text-xs font-medium",
                step === s.id ? "text-primary" : "text-muted-foreground"
              )}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderStepContent()}
            
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                
                <Button 
                  type="button" 
                  onClick={handleNext}
                >
                  {step === (selectionType === "individual" ? steps.length : steps.length - 1) ? (
                    "Add Special Prices"
                  ) : (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default BulkSpecialPriceForm;
