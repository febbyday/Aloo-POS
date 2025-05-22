import { useState, useEffect } from 'react'
import {
  Printer,
  Search,
  Filter,
  RefreshCw,
  CheckSquare,
  Square,
  Settings,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Contexts
import { useProducts } from '../context/ProductContext'

// Hooks
import { useToast } from '@/lib/toast'

// Types
import type { Product } from '../types'

// Custom Components
import { PrintTemplatePreview } from '../components/PrintTemplatePreview'
import { PrintSettingsDialog } from '../components/PrintSettingsDialog'
import { ProductsToolbar } from '../components/ProductsToolbar'

/**
 * Print Labels Page Component
 * 
 * A page for selecting products and generating printable barcode/price labels
 */
export function PrintLabelsPage() {
  // State
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [labelType, setLabelType] = useState<'barcode' | 'price' | 'product'>('barcode')
  const [templateId, setTemplateId] = useState<string>('default')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // Hooks
  const { toast } = useToast()
  const { 
    products,
    loading,
    error,
    categories,
    fetchProducts
  } = useProducts()

  // Template options
  const labelTemplates = [
    { id: 'default', name: 'Default Template' },
    { id: 'compact', name: 'Compact' },
    { id: 'price-emphasis', name: 'Price Emphasis' },
    { id: 'product-detail', name: 'Product Detail' }
  ]

  // Mock label sizes (in real app, these would come from settings)
  const labelSizes = [
    { id: 'small', name: '1.5" x 1"' },
    { id: 'medium', name: '2" x 1"' },
    { id: 'large', name: '3" x 2"' },
    { id: 'custom', name: 'Custom Size' }
  ]

  // Fetch products when page loads or filters change
  useEffect(() => {
    fetchProducts({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      category: categoryFilter === 'all' ? undefined : categoryFilter
    })
  }, [currentPage, itemsPerPage, searchQuery, categoryFilter, fetchProducts])

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  // Select all products on current page
  const selectAllOnPage = () => {
    if (!products) return
    
    const currentPageIds = products.map(p => p.id)
    
    // If all current page products are selected, deselect them
    if (currentPageIds.every(id => selectedProducts.has(id))) {
      const newSelected = new Set(selectedProducts)
      currentPageIds.forEach(id => newSelected.delete(id))
      setSelectedProducts(newSelected)
    } else {
      // Otherwise select all products on current page
      const newSelected = new Set(selectedProducts)
      currentPageIds.forEach(id => newSelected.add(id))
      setSelectedProducts(newSelected)
    }
  }

  // Print the selected product labels
  const printLabels = () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "No products selected",
        description: "Please select at least one product to print labels",
        variant: "destructive"
      })
      return
    }

    // In a real implementation, this would generate and print the labels
    // For now, we'll just show a toast
    toast({
      title: `Printing ${selectedProducts.size} labels`,
      description: `Using ${labelType} template: ${labelTemplates.find(t => t.id === templateId)?.name}`,
      variant: "success"
    })
  }

  // Clear all selected products
  const clearSelection = () => {
    setSelectedProducts(new Set())
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProductsToolbar title="Print Product Labels" />
      
      {/* Main content area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product selection */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Select Products</CardTitle>
            <CardDescription>
              Select the products you want to print labels for
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => fetchProducts({
                  page: 1,
                  limit: itemsPerPage,
                  search: searchQuery,
                  category: categoryFilter === 'all' ? undefined : categoryFilter
                })}
                className="shrink-0"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Products table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={products?.length > 0 && products.every(p => selectedProducts.has(p.id))}
                        onCheckedChange={selectAllOnPage}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        Loading products...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-red-500">
                        Error loading products. Please try again.
                      </TableCell>
                    </TableRow>
                  ) : products?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No products found. Try changing your search or filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products?.map((product) => (
                      <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="p-2">
                          <Checkbox
                            checked={selectedProducts.has(product.id)}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium truncate max-w-[200px]">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.sku}
                        </TableCell>
                        <TableCell>
                          {product.category ? (
                            <Badge variant="outline" className="font-normal">
                              {product.category.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">No category</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          ${product.price?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination controls */}
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{products?.length ?? 0}</strong> of{" "}
                <strong>{products?.length ?? 0}</strong> products
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!products || products.length < itemsPerPage || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Label configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Label Settings</CardTitle>
            <CardDescription>
              Configure your label print settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Label Type</h3>
              <RadioGroup 
                value={labelType} 
                onValueChange={(value) => setLabelType(value as 'barcode' | 'price' | 'product')}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="barcode" id="barcode" />
                  <Label htmlFor="barcode">Barcode Labels</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="price" id="price" />
                  <Label htmlFor="price">Price Labels</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="product" id="product" />
                  <Label htmlFor="product">Product Info Labels</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Template</h3>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {labelTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Label Size</h3>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {labelSizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Quantity</h3>
              <div className="flex items-center space-x-2">
                <Input 
                  type="number" 
                  min={1} 
                  defaultValue={1} 
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">
                  label(s) per product
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="pt-2">
              <div className="text-sm flex justify-between mb-4">
                <span>Selected:</span> 
                <span className="font-medium">{selectedProducts.size} products</span>
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={printLabels}
                  disabled={selectedProducts.size === 0}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Labels
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Printer Settings
                </Button>
                
                <Button
                  variant="link"
                  className="w-full"
                  onClick={clearSelection}
                  disabled={selectedProducts.size === 0}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Print Preview (hidden in mobile view) */}
      <Card className="hidden lg:block">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Print Preview</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  This is a preview of how your labels will look when printed
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4 flex justify-center">
            <div className="w-[400px] h-[200px] flex items-center justify-center bg-muted/50">
              {selectedProducts.size > 0 ? (
                <div className="text-center">
                  <div className="border border-dashed rounded-md p-4 w-56 h-28 mx-auto flex flex-col justify-center">
                    <div className="text-xs text-muted-foreground">Label preview</div>
                    <div className="text-xs">{labelType === 'barcode' ? 'Barcode' : labelType === 'price' ? 'Price Tag' : 'Product Info'} Label</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Preview for {labelTemplates.find(t => t.id === templateId)?.name}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center">
                  Select products to see label preview
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Print Settings Dialog (would be implemented in a real app) */}
      {isSettingsOpen && (
        <div className="hidden">
          {/* This would use the PrintSettingsDialog component in a real implementation */}
        </div>
      )}
    </div>
  )
}

export default PrintLabelsPage;
