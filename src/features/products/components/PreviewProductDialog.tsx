import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Product } from "../types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Image } from "lucide-react"

interface PreviewProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Partial<Product>
  onConfirm: () => void
}

export function PreviewProductDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
}: PreviewProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Preview Product</DialogTitle>
          <DialogDescription>
            Review your product details before saving
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="w-40 h-40 rounded-lg border overflow-hidden flex-shrink-0 bg-muted">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Image className="h-8 w-8 mb-2" />
                      <span className="text-sm">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{product.category}</Badge>
                      <Badge variant="outline">{product.supplier?.name}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">SKU</span>
                      <p className="font-mono text-sm">{product.sku || 'Will be auto-generated'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Barcode</span>
                      <p className="font-mono text-sm">{product.barcode || 'Will be auto-generated'}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      {product.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <h4 className="font-semibold">Pricing & Stock Management</h4>
              <div className="grid grid-cols-4 gap-6">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Cost Price</span>
                  <p className="text-lg font-medium">
                    ${product.costPrice?.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Sale Price</span>
                  <p className="text-lg font-medium">
                    ${product.salePrice?.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Retail Price</span>
                  <p className="text-lg font-medium">
                    ${product.retailPrice?.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Total Stock</span>
                  <p className="text-lg font-medium">
                    {product.locations?.filter(loc => loc.enabled).reduce((total, loc) => total + (loc.stock || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Stock Locations */}
            <div className="space-y-4">
              <h4 className="font-semibold">Stock by Location</h4>
              <div className="grid gap-4">
                {product.locations?.filter(loc => loc.enabled).map((location, index) => {
                  const store = stores.find(s => s.id === location.locationId);
                  return (
                    <div key={index} className="grid grid-cols-4 gap-6 p-4 rounded-lg border">
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Location</span>
                        <p className="font-medium">{store?.name || location.locationId}</p>
                        <Badge variant="secondary" className="mt-1">{store?.type}</Badge>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Current Stock</span>
                        <p className="font-medium">{location.stock || 0}</p>
                        {location.stock <= (location.minStock || 0) && (
                          <Badge variant="destructive" className="mt-1">Low Stock</Badge>
                        )}
                        {location.stock >= (location.maxStock || Infinity) && (
                          <Badge variant="default" className="mt-1">Full Stock</Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Min Stock</span>
                        <p className="font-medium">{location.minStock || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Max Stock</span>
                        <p className="font-medium">{location.maxStock || 0}</p>
                      </div>
                    </div>
                  );
                })}
                {(!product.locations || !product.locations.some(loc => loc.enabled)) && (
                  <div className="text-center py-4 text-muted-foreground border rounded-lg">
                    No stock locations enabled
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <>
                <div className="space-y-4">
                  <h4 className="font-semibold">Product Variants</h4>
                  <div className="grid gap-4">
                    {product.variants.map((variant, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border grid grid-cols-7 gap-4"
                      >
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Size</span>
                          <p className="font-medium">{variant.size || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Color</span>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{variant.color || "-"}</p>
                            {variant.color && (
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: variant.color }}
                              />
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Style</span>
                          <p className="font-medium">{variant.style || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            Cost Price
                          </span>
                          <p className="font-medium">
                            ${(variant.costPrice || product.costPrice)?.toFixed(2)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            Sale Price
                          </span>
                          <p className="font-medium">
                            ${(variant.salePrice || product.salePrice)?.toFixed(2)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">SKU</span>
                          <p className="font-mono text-sm">{variant.sku || "Auto-generated"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">Barcode</span>
                          <p className="font-mono text-sm">{variant.barcode || "Auto-generated"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back to Edit
          </Button>
          <Button onClick={onConfirm}>
            Confirm & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
