import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '../types';
import { Plus } from 'lucide-react';

// ProductAddPreview component for previewing new products
export const ProductAddPreview = ({ 
  open, 
  onOpenChange, 
  product, 
  form, 
  stores,
  onSaveAndAddNew,
  isDescriptionExpanded,
  setIsDescriptionExpanded,
  generateSKU
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl flex items-center gap-2">
              <span className="text-primary">Preview New Product</span>
              <Badge variant="outline" className="bg-background">New</Badge>
            </DialogTitle>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={onSaveAndAddNew}
              >
                <Plus className="h-4 w-4 mr-1" />
                Save & Add
              </Button>
            </div>
          </DialogHeader>
        </div>
        
        <div className="max-h-[80vh] overflow-y-auto px-6 py-4">
          <div className="grid md:grid-cols-[1fr,2fr] gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Product Image Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Featured Image</h3>
                </div>
                <div className="p-4">
                  {product.featuredImage ? (
                    <div className="relative group">
                      <img
                        src={product.featuredImage}
                        alt={product.name || form.watch('name')}
                        className="w-full aspect-square object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                        <span className="text-white text-sm font-medium">Featured Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-muted rounded-md flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-muted-foreground text-sm">No image added</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Gallery Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Gallery</h3>
                </div>
                <div className="p-4">
                  {product.gallery && product.gallery.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {product.gallery?.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Gallery ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                            <span className="text-white text-xs">{index + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                      No gallery images added
                    </div>
                  )}
                </div>
              </div>
              
              {/* Attributes Card - Only for variable products */}
              {(product.productType === 'variable' || form.watch('productType') === 'variable') && (
                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted/30 px-4 py-2 border-b flex justify-between items-center">
                    <h3 className="font-medium text-sm">Attributes</h3>
                    <Badge variant="outline" className="text-xs">Variable Product</Badge>
                  </div>
                  <div className="p-4">
                    {product.attributes?.map((attr, index) => (
                      <div key={index} className="mb-3 last:mb-0">
                        <div className="font-medium text-sm mb-1 flex items-center">
                          <span className="w-2 h-2 bg-primary/70 rounded-full mr-2"></span>
                          {attr.name}
                        </div>
                        <div className="flex flex-wrap gap-1 pl-4">
                          {attr.options.map((option, i) => (
                            <span key={i} className="bg-muted px-2 py-1 rounded-md text-xs">
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {(!product.attributes || product.attributes.length === 0) && (
                      <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                        No attributes added
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Basic Information Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Basic Information</h3>
                </div>
                <div className="p-4">
                  <div className="grid gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Name</span>
                      <span className="font-medium">{product.name || form.watch('name') || "Untitled Product"}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">Category</span>
                        <span className="capitalize">{product.category || form.watch('category') || "Uncategorized"}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">Brand</span>
                        <span>{product.brand || form.watch('brand') || "Not specified"}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">Supplier</span>
                        <span>{product.supplier?.name || "Not specified"}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">Product Type</span>
                        <span className="capitalize flex items-center">
                          {(product.productType === 'variable' || form.watch('productType') === 'variable') 
                            ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Variable Product
                              </>
                            ) 
                            : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                Single Product
                              </>
                            )
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Pricing</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Retail Price</span>
                      <span className="font-medium text-lg">${product.retailPrice || form.watch('retailPrice') || 0}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Cost Price</span>
                      <span className="text-sm">${product.costPrice || form.watch('costPrice') || 0}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Sale Price</span>
                      {(product.salePrice || form.watch('salePrice')) > 0 ? (
                        <span className="text-green-600 font-medium">${product.salePrice || form.watch('salePrice')}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not set</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Technical Details</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">SKU</span>
                      <span className="font-mono text-sm">
                        <span className="text-muted-foreground italic">Will be generated automatically</span>
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Barcode</span>
                      <span className="font-mono text-sm">
                        <span className="text-muted-foreground italic">Will be generated automatically</span>
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Created</span>
                      <span className="text-sm">
                        <span className="text-muted-foreground italic">Upon creation</span>
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Last Updated</span>
                      <span className="text-sm">
                        <span className="text-muted-foreground italic">Upon creation</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Description</h3>
                </div>
                <div className="p-4">
                  {(product.shortDescription || form.watch('shortDescription')) && (
                    <div className="mb-4">
                      <span className="text-xs text-muted-foreground block mb-1">Short Description</span>
                      <p className="text-sm">{product.shortDescription || form.watch('shortDescription')}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Full Description</span>
                    <div className="text-sm prose prose-sm max-w-none">
                      {isDescriptionExpanded ? (
                        <>
                          <p>{product.description || form.watch('description') || "No description provided."}</p>
                          <Button
                            variant="link"
                            className="text-xs p-0 h-auto"
                            onClick={() => setIsDescriptionExpanded(false)}
                          >
                            Show Less
                          </Button>
                        </>
                      ) : (
                        <>
                          <p>
                            {(product.description || form.watch('description') || "No description provided.").slice(0, 150)}
                            {((product.description || form.watch('description') || "").length) > 150 && '...'}
                          </p>
                          {((product.description || form.watch('description') || "").length) > 150 && (
                            <Button
                              variant="link"
                              className="text-xs p-0 h-auto"
                              onClick={() => setIsDescriptionExpanded(true)}
                            >
                              Show More
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Inventory</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Min Stock Level</span>
                      <span>{product.minStock || 0} units</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Max Stock Level</span>
                      <span>{product.maxStock || 0} units</span>
                    </div>
                  </div>
                  
                  {product.locations && product.locations.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-2">Store Inventory</span>
                      <div className="space-y-2 border rounded-md p-3 bg-muted/10">
                        {product.locations.filter(loc => loc.enabled).map((location, idx) => {
                          const store = stores.find(s => s.id === location.locationId);
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {store?.name || location.locationId}:
                              </span>
                              <span className="font-medium">{location.stock || 0} units</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Variations Card - Only for variable products */}
              {(product.productType === 'variable' || form.watch('productType') === 'variable') && (
                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted/30 px-4 py-2 border-b">
                    <h3 className="font-medium text-sm">Variations</h3>
                  </div>
                  <div className="p-4">
                    {(product.variations || []).map((variation, index) => (
                      <div key={index} className="border rounded-md p-3 mb-3 last:mb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm bg-muted/50 px-2 py-1 rounded">
                            {Object.entries(variation.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-medium">${variation.retailPrice || 0}</span>
                          </div>
                          {variation.salePrice > 0 && (
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Sale Price</span>
                              <span className="text-green-600 font-medium">${variation.salePrice}</span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Stock</span>
                            <span>{variation.stock || 0} units</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!product.variations || product.variations.length === 0) && (
                      <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                        No variations added yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ProductEditPreview component for previewing existing products
export const ProductEditPreview = ({ 
  open, 
  onOpenChange, 
  product, 
  stores,
  isDescriptionExpanded, 
  setIsDescriptionExpanded,
  generateSKU
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-400/5 px-6 py-4 border-b">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl flex items-center gap-2">
              <span className="text-blue-600">View Product</span>
              <Badge variant="outline" className="bg-background text-blue-600 border-blue-200">
                ID: {product.id?.substring(0, 8)}
              </Badge>
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogHeader>
        </div>
        
        <div className="max-h-[80vh] overflow-y-auto px-6 py-4">
          <div className="grid md:grid-cols-[1fr,2fr] gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Product Image Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm text-blue-700">Featured Image</h3>
                </div>
                <div className="p-4">
                  {product.featuredImage ? (
                    <div className="relative group">
                      <img
                        src={product.featuredImage}
                        alt={product.name}
                        className="w-full aspect-square object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                        <span className="text-white text-sm font-medium">Featured Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-muted rounded-md flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-muted-foreground text-sm">No image available</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Gallery Card */}
              {product.gallery && product.gallery.length > 0 && (
                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-blue-50 px-4 py-2 border-b">
                    <h3 className="font-medium text-sm text-blue-700">Gallery</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-2">
                      {product.gallery?.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                            <span className="text-white text-xs">{index + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Attributes Card - Only for variable products */}
              {product.productType === 'variable' && product.attributes && product.attributes.length > 0 && (
                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-blue-50 px-4 py-2 border-b flex justify-between items-center">
                    <h3 className="font-medium text-sm text-blue-700">Attributes</h3>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Variable Product</Badge>
                  </div>
                  <div className="p-4">
                    {product.attributes?.map((attr, index) => (
                      <div key={index} className="mb-3 last:mb-0">
                        <div className="font-medium text-sm mb-1 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {attr.name}
                        </div>
                        <div className="flex flex-wrap gap-1 pl-4">
                          {attr.options.map((option, i) => (
                            <span key={i} className="bg-blue-50 px-2 py-1 rounded-md text-xs text-blue-700">
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Basic Information Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm text-blue-700">Basic Information</h3>
                </div>
                <div className="p-4">
                  <div className="grid gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Name</span>
                      <span className="font-medium text-lg">{product.name}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">Category</span>
                        <span className="capitalize">{product.category}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">Brand</span>
                        <span>{product.brand || "Not specified"}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">Supplier</span>
                        <span>{product.supplier?.name || "Not specified"}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">Product Type</span>
                        <span className="capitalize flex items-center">
                          {product.productType === 'variable' 
                            ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Variable Product
                              </>
                            ) 
                            : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                Single Product
                              </>
                            )
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm text-blue-700">Pricing</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Retail Price</span>
                      <span className="font-medium text-lg">${product.retailPrice}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Cost Price</span>
                      <span className="text-sm">${product.costPrice || 0}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Sale Price</span>
                      {product.salePrice > 0 ? (
                        <span className="text-green-600 font-medium">${product.salePrice}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not set</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm text-blue-700">Technical Details</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">SKU</span>
                      <span className="font-mono text-sm">
                        <span className="text-muted-foreground italic">Will be generated automatically</span>
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Barcode</span>
                      <span className="font-mono text-sm">
                        <span className="text-muted-foreground italic">Will be generated automatically</span>
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Created</span>
                      <span className="text-sm">
                        <span className="text-muted-foreground italic">Upon creation</span>
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Last Updated</span>
                      <span className="text-sm">
                        <span className="text-muted-foreground italic">Upon update</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm text-blue-700">Description</h3>
                </div>
                <div className="p-4">
                  {product.shortDescription && (
                    <div className="mb-4">
                      <span className="text-xs text-muted-foreground block mb-1">Short Description</span>
                      <p className="text-sm">{product.shortDescription}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Full Description</span>
                    <div className="text-sm prose prose-sm max-w-none">
                      {isDescriptionExpanded ? (
                        <>
                          <p>{product.description || "No description provided."}</p>
                          <Button
                            variant="link"
                            className="text-xs p-0 h-auto text-blue-600"
                            onClick={() => setIsDescriptionExpanded(false)}
                          >
                            Show Less
                          </Button>
                        </>
                      ) : (
                        <>
                          <p>
                            {(product.description || "No description provided.").slice(0, 150)}
                            {(product.description?.length || 0) > 150 && '...'}
                          </p>
                          {(product.description?.length || 0) > 150 && (
                            <Button
                              variant="link"
                              className="text-xs p-0 h-auto text-blue-600"
                              onClick={() => setIsDescriptionExpanded(true)}
                            >
                              Show More
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Card */}
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b">
                  <h3 className="font-medium text-sm text-blue-700">Inventory</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Min Stock Level</span>
                      <span>{product.minStock || 0} units</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">Max Stock Level</span>
                      <span>{product.maxStock || 0} units</span>
                    </div>
                  </div>
                  
                  {product.locations && product.locations.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-2">Store Inventory</span>
                      <div className="space-y-2 border rounded-md p-3 bg-blue-50/30">
                        {product.locations.filter(loc => loc.enabled).map((location, idx) => {
                          const store = stores.find(s => s.id === location.locationId);
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {store?.name || location.locationId}:
                              </span>
                              <span className="font-medium">{location.stock || 0} units</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Variations Card - Only for variable products */}
              {product.productType === 'variable' && (
                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-blue-50 px-4 py-2 border-b">
                    <h3 className="font-medium text-sm text-blue-700">Variations</h3>
                  </div>
                  <div className="p-4">
                    {(product.variations || []).map((variation, index) => (
                      <div key={index} className="border rounded-md p-3 mb-3 last:mb-0 bg-blue-50/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm bg-blue-100 px-2 py-1 rounded text-blue-700">
                            {Object.entries(variation.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-medium">${variation.retailPrice || 0}</span>
                          </div>
                          {variation.salePrice > 0 && (
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Sale Price</span>
                              <span className="text-green-600 font-medium">${variation.salePrice}</span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">Stock</span>
                            <span>{variation.stock || 0} units</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!product.variations || product.variations.length === 0) && (
                      <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                        No variations added yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 