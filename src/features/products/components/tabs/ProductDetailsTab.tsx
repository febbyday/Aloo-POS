import React, { useState } from "react";
import { FileText, Building, Clock, Calendar, Tag, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SectionCard } from '../SectionCard';
import { TemporaryProductAlert } from '../TemporaryProductAlert';
import { Product } from '../../types';
import UnifiedErrorBoundary from '@/components/unified-error-boundary';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";

export interface ProductDetailsTabProps {
  product: Product;
  onCompleteProduct?: () => void;
  onNavigateToSupplier?: (supplierId: string) => void;
  onUpdateProduct?: (productId: string, data: Partial<Product>) => Promise<void>;
}

function ProductDetailsTabContent({
  product,
  onCompleteProduct,
  onNavigateToSupplier,
  onUpdateProduct
}: ProductDetailsTabProps) {
  // State for tracking edit mode for different sections
  const [editMode, setEditMode] = useState({
    overview: false,
    description: false,
    pricing: false,
    supplier: false
  });

  // State for storing edited data
  const [editedData, setEditedData] = useState<Partial<Product>>({
    sku: product.sku,
    barcode: product.barcode || '',
    category: product.category || '',
    brand: product.brand || '',
    description: product.description || '',
    retailPrice: product.retailPrice,
    costPrice: product.costPrice || 0,
    salePrice: product.salePrice || 0,
    supplier: { ...product.supplier }
  });

  // Handler for enabling edit mode
  const handleEnableEdit = (section: keyof typeof editMode) => {
    setEditMode(prev => ({ ...prev, [section]: true }));
  };

  // Handler for canceling edit mode
  const handleCancelEdit = (section: keyof typeof editMode) => {
    setEditMode(prev => ({ ...prev, [section]: false }));
    // Reset edited data to original values
    setEditedData({
      sku: product.sku,
      barcode: product.barcode || '',
      category: product.category || '',
      brand: product.brand || '',
      description: product.description || '',
      retailPrice: product.retailPrice,
      costPrice: product.costPrice || 0,
      salePrice: product.salePrice || 0,
      supplier: { ...product.supplier }
    });
  };

  // Handler for saving edits
  const handleSaveEdit = async (section: keyof typeof editMode) => {
    if (onUpdateProduct) {
      try {
        await onUpdateProduct(product.id, editedData);
        setEditMode(prev => ({ ...prev, [section]: false }));
      } catch (error) {
        console.error(`Error saving ${section} data:`, error);
      }
    }
  };

  // Handler for input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    field: string,
    value?: string | number
  ) => {
    if (typeof e === 'string') {
      // Handle case for Select components where value is passed directly
      setEditedData(prev => ({
        ...prev,
        [field]: value !== undefined ? value : e
      }));
    } else {
      // Handle standard input elements
      const { name, value: inputValue } = e.target;
      setEditedData(prev => ({
        ...prev,
        [name || field]: inputValue
      }));
    }
  };

  // Handler for price input changes (convert to number)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = parseFloat(e.target.value) || 0;
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {product.isTemporary && (
        <TemporaryProductAlert onComplete={onCompleteProduct} />
      )}

      {/* Product Overview */}
      <SectionCard 
        title="Product Overview" 
        icon={FileText}
        headerRight={
          !editMode.overview ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleEnableEdit('overview')}
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleCancelEdit('overview')}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => handleSaveEdit('overview')}
              >
                Save
              </Button>
            </div>
          )
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-md">
                <h3 className="text-xs uppercase font-medium text-muted-foreground">SKU</h3>
                {editMode.overview ? (
                  <Input
                    name="sku"
                    value={editedData.sku}
                    onChange={e => handleInputChange(e, 'sku')}
                    className="mt-1 text-sm h-8"
                  />
                ) : (
                  <p className="text-sm font-medium">{product.sku}</p>
                )}
              </div>
              <div className="p-3 bg-muted/30 rounded-md">
                <h3 className="text-xs uppercase font-medium text-muted-foreground">Barcode</h3>
                {editMode.overview ? (
                  <Input
                    name="barcode"
                    value={editedData.barcode}
                    onChange={e => handleInputChange(e, 'barcode')}
                    className="mt-1 text-sm h-8"
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {product.barcode || (product.isTemporary ?
                      <span className="italic text-gray-400">Not specified</span> :
                      "N/A")}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-md">
                <h3 className="text-xs uppercase font-medium text-muted-foreground">Category</h3>
                {editMode.overview ? (
                  <Input
                    name="category"
                    value={editedData.category}
                    onChange={e => handleInputChange(e, 'category')}
                    className="mt-1 text-sm h-8"
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {product.category || (product.isTemporary ?
                      <span className="italic text-gray-400">Not specified</span> :
                      "Uncategorized")}
                  </p>
                )}
              </div>
              <div className="p-3 bg-muted/30 rounded-md">
                <h3 className="text-xs uppercase font-medium text-muted-foreground">Brand</h3>
                {editMode.overview ? (
                  <Input
                    name="brand"
                    value={editedData.brand}
                    onChange={e => handleInputChange(e, 'brand')}
                    className="mt-1 text-sm h-8"
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {product.brand || (product.isTemporary ?
                      <span className="italic text-gray-400">Not specified</span> :
                      "No brand")}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-md">
                <h3 className="text-xs uppercase font-medium text-muted-foreground">Supplier</h3>
                <p className="text-sm font-medium">
                  {product.supplier?.name || (product.isTemporary ?
                    <span className="italic text-gray-400">Not specified</span> :
                    "No supplier")}
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-md">
                <h3 className="text-xs uppercase font-medium text-muted-foreground">Created</h3>
                <p className="text-sm font-medium">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs uppercase font-medium text-muted-foreground flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Description
              </h3>
              {!editMode.description ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEnableEdit('description')}
                >
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCancelEdit('description')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => handleSaveEdit('description')}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 p-4 bg-muted/30 rounded-md">
              {editMode.description ? (
                <Textarea
                  name="description"
                  value={editedData.description}
                  onChange={e => handleInputChange(e, 'description')}
                  className="min-h-[120px] text-sm"
                  placeholder="Enter product description..."
                />
              ) : (
                <p className="text-sm">
                  {product.description || "No description provided for this product."}
                </p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Pricing Card */}
      <SectionCard 
        title="Pricing" 
        icon={Tag}
        headerRight={
          !editMode.pricing ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleEnableEdit('pricing')}
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleCancelEdit('pricing')}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => handleSaveEdit('pricing')}
              >
                Save
              </Button>
            </div>
          )
        }
      >
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30 flex flex-col items-center justify-center">
            <h3 className="text-xs uppercase font-medium text-muted-foreground mb-1">Retail Price</h3>
            {editMode.pricing ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-1">$</span>
                <Input
                  type="number"
                  name="retailPrice"
                  value={editedData.retailPrice}
                  onChange={e => handlePriceChange(e, 'retailPrice')}
                  className="text-2xl font-bold text-primary w-24 h-10"
                  step="0.01"
                  min="0"
                />
              </div>
            ) : (
              <p className="text-2xl font-bold text-primary">${product.retailPrice.toFixed(2)}</p>
            )}
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30 flex flex-col items-center justify-center">
            <h3 className="text-xs uppercase font-medium text-muted-foreground mb-1">Cost Price</h3>
            {editMode.pricing ? (
              <div className="flex items-center">
                <span className="text-2xl font-medium mr-1">$</span>
                <Input
                  type="number"
                  name="costPrice"
                  value={editedData.costPrice}
                  onChange={e => handlePriceChange(e, 'costPrice')}
                  className="text-2xl font-medium w-24 h-10"
                  step="0.01"
                  min="0"
                />
              </div>
            ) : (
              <p className="text-2xl font-medium">
                {product.costPrice ?
                  `$${product.costPrice.toFixed(2)}` :
                  (product.isTemporary ?
                    <span className="italic text-gray-400">Not set</span> :
                    "$0.00")}
              </p>
            )}
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-border/30 flex flex-col items-center justify-center">
            <h3 className="text-xs uppercase font-medium text-muted-foreground mb-1">Sale Price</h3>
            {editMode.pricing ? (
              <div className="flex items-center">
                <span className="text-2xl font-medium mr-1">$</span>
                <Input
                  type="number"
                  name="salePrice"
                  value={editedData.salePrice}
                  onChange={e => handlePriceChange(e, 'salePrice')}
                  className="text-2xl font-medium w-24 h-10"
                  step="0.01"
                  min="0"
                />
              </div>
            ) : (
              <p className="text-2xl font-medium">
                {product.salePrice ?
                  `$${product.salePrice.toFixed(2)}` :
                  (product.isTemporary ?
                    <span className="italic text-gray-400">Not set</span> :
                    "N/A")}
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Supplier Information */}
      {product.supplier && product.supplier.name && (
        <SectionCard title="Supplier Information" icon={Building} headerRight={
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToSupplier && onNavigateToSupplier(product.supplier?.id || '')}
            disabled={!product.supplier?.id}
            className="hover:bg-primary/10"
          >
            View Supplier
          </Button>
        }>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border/30">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`/assets/suppliers/${product.supplier?.id}.png`} alt={product.supplier?.name} />
                <AvatarFallback className="text-lg">{product.supplier?.name?.substring(0, 2).toUpperCase() || 'NA'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{product.supplier?.name}</p>
                <p className="text-sm text-muted-foreground">{product.supplier?.contact || 'No contact info'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                <h3 className="text-xs uppercase font-medium text-muted-foreground flex items-center mb-2">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  Lead Time
                </h3>
                <p className="text-lg font-medium">{product.supplier?.leadTime || 'N/A'} days</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                <h3 className="text-xs uppercase font-medium text-muted-foreground flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Last Order
                </h3>
                <p className="text-lg font-medium">{product.supplier?.lastOrder ? new Date(product.supplier.lastOrder).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

export function ProductDetailsTab(props: ProductDetailsTabProps) {
  return (
    <UnifiedErrorBoundary>
      <ProductDetailsTabContent {...props} />
    </UnifiedErrorBoundary>
  );
}
