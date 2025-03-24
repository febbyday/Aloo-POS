import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Product } from "../types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ViewProductsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
}

export function ViewProductsDialog({ 
  open, 
  onOpenChange,
  products
}: ViewProductsDialogProps) {
  const [expandedProducts, setExpandedProducts] = useState<string[]>([])

  const toggleProduct = (productId: string) => {
    setExpandedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const getLocationName = (locationId: string) => {
    switch (locationId) {
      case 'store1': return 'Main Store'
      case 'store2': return 'Branch Store'
      case 'warehouse': return 'Warehouse'
      default: return locationId
    }
  }

  const getTotalStock = (product: Product) => {
    return product.locations.reduce((total, loc) => total + loc.stock, 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>View Products</DialogTitle>
          <DialogDescription>
            Detailed information about selected products and their variants
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[600px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Cost Price</TableHead>
                <TableHead className="text-right">Retail Price</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Total Stock</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <>
                  <TableRow key={product.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleProduct(product.id)}
                      >
                        {expandedProducts.includes(product.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-sm">
                          No image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      ${product.costPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${product.retailPrice.toFixed(2)}
                    </TableCell>
                    <TableCell>{product.supplier.name}</TableCell>
                    <TableCell className="text-right">
                      {getTotalStock(product)}
                    </TableCell>
                    <TableCell>
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  {expandedProducts.includes(product.id) && (
                    <>
                      <TableRow>
                        <TableCell colSpan={11}>
                          <div className="pl-8 pr-4 py-4 space-y-4">
                            {/* Location Stock */}
                            <div>
                              <h4 className="font-semibold mb-2">Stock by Location</h4>
                              <div className="grid grid-cols-3 gap-4">
                                {product.locations.map((location) => (
                                  <div 
                                    key={location.locationId}
                                    className="p-4 rounded-lg bg-muted/50"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">
                                        {getLocationName(location.locationId)}
                                      </span>
                                      <Badge variant={
                                        location.stock <= (location.minStock || 0) ? "destructive" :
                                        location.stock >= (location.maxStock || Infinity) ? "default" :
                                        "secondary"
                                      }>
                                        {location.stock} in stock
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                      <div className="flex justify-between">
                                        <span>Min Stock:</span>
                                        <span>{location.minStock || '-'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Max Stock:</span>
                                        <span>{location.maxStock || '-'}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Variants */}
                            <div>
                              <h4 className="font-semibold mb-2">Variants</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Barcode</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Style</TableHead>
                                    <TableHead className="text-right">Cost Price</TableHead>
                                    <TableHead className="text-right">Retail Price</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {product.variants.map((variant) => (
                                    <TableRow key={variant.id}>
                                      <TableCell>{variant.sku}</TableCell>
                                      <TableCell>{variant.barcode || '-'}</TableCell>
                                      <TableCell>{variant.size || '-'}</TableCell>
                                      <TableCell>{variant.color || '-'}</TableCell>
                                      <TableCell>{variant.style || '-'}</TableCell>
                                      <TableCell className="text-right">
                                        ${(variant.costPrice || product.costPrice).toFixed(2)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        ${(variant.retailPrice || product.retailPrice).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
