import React, { useState, useEffect } from 'react';
import { useProductForm } from '../context/ProductFormContext';
import { UnifiedProduct, ProductType, ProductStatus, StockStatus, ProductAttribute, ProductVariation } from '../types/unified-product.types';
import { Product } from '../types';
import { StoreSelect } from '@/features/store/components/StoreSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Store as StoreIcon, 
  Warehouse, 
  Eye, 
  Save, 
  PlusCircle,
  XCircle
} from "lucide-react";
import { cn } from '@/lib/utils';
import VariationsManager from './VariationsManager';
import { PreviewProductDialog } from './PreviewProductDialog';

interface ProductFormProps {
  product?: UnifiedProduct;
  onSuccess?: (product: UnifiedProduct) => void;
  onCancel?: () => void;
  className?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSuccess,
  onCancel,
  className,
}) => {
  // State for variations management
  const [attributes, setAttributes] = useState<ProductAttribute[]>(product?.attributes || []);
  const [variations, setVariations] = useState<ProductVariation[]>(product?.variations || []);
  const [showVariationsManager, setShowVariationsManager] = useState(false);
  
  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);
  // Define the Store interface
  interface Store {
    id: string;
    name: string;
    address: string;
    type: 'store' | 'warehouse';
  }

  // Store data (would typically come from an API)
  const stores: Store[] = [
    {
      id: "store1",
      name: "Main Store",
      address: "123 Main St",
      type: "store"
    },
    {
      id: "store2",
      name: "Branch Store",
      address: "456 Branch Ave",
      type: "store"
    },
    {
      id: "warehouse",
      name: "Main Warehouse",
      address: "789 Warehouse Blvd",
      type: "warehouse"
    }
  ];

  // Extended store type with stock information
  interface StoreWithStock extends Store {
    stock?: number;
    minStock?: number;
    maxStock?: number;
  }

  const [selectedStores, setSelectedStores] = useState<StoreWithStock[]>([]);
  const [success, setSuccess] = useState(false);

  // Get form from ProductFormContext
  const { form, isLoading: saving, resetForm, generateSKU } = useProductForm();
  const [error, setError] = useState<string | null>(null);

  // Show variations manager when product type is Variable
  useEffect(() => {
    const productType = form.watch('productType');
    setShowVariationsManager(productType === ProductType.VARIABLE);
  }, [form.watch('productType')]);

  // Update form data with attributes and variations before submission
  const handleFormSubmit = async (data: UnifiedProduct) => {
    // Add attributes and variations to the form data if product type is Variable
    if (data.productType === ProductType.VARIABLE) {
      data.attributes = attributes;
      data.variations = variations;
    }
    data.locations = selectedStores.map(store => ({
      locationId: store.id,
      enabled: true,
      stock: store.stock || 0,
      minStock: store.minStock || 0,
      maxStock: store.maxStock || 100
    }));
    try {
      // Since we're using the context, we need to handle submission differently
      // This is just a placeholder - you'll need to implement the actual submission logic
      // using your product service or API
      console.log('Submitting product:', data);
      setSuccess(true);
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - 3/4 width on large screens */}
          <div className="lg:col-span-3">
            <Card className={cn("w-full", className)}>

              <CardContent className="space-y-6">
                {/* Display error message if there is one */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Display success message if form was submitted successfully */}
                {success && (
                  <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      {product ? 'Product updated successfully' : 'Product created successfully'}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium pt-6">Basic Information</h3>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Product Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product name" {...field} />
                            </FormControl>
                            <FormDescription>
                              The name of your product as it will appear to customers
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Product Type */}
                      <FormField
                        control={form.control}
                        name="productType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || ProductType.SIMPLE}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={ProductType.SIMPLE}>Simple Product</SelectItem>
                                <SelectItem value={ProductType.VARIABLE}>Variable Product</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The type of product determines available options. Variable products will require setting up attributes and variations after initial creation.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category */}
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter category" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Brand */}
                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter brand" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Full Description - spans both columns */}
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Detailed description of the product"
                                  className="resize-none"
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Dimensions */}
                      <div className="grid grid-cols-3 gap-4 col-span-2">
                        {/* Length */}
                        <FormField
                          control={form.control}
                          name="length"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Length</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Width */}
                        <FormField
                          control={form.control}
                          name="width"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Width</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Height */}
                        <FormField
                          control={form.control}
                          name="height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  value={field.value || ''}
                                  onChange={(e) => {
                                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Pricing</h3>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Regular Price */}
                      <FormField
                        control={form.control}
                        name="retailPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regular Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Sale Price */}
                      <FormField
                        control={form.control}
                        name="salePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sale Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => {
                                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Cost Price */}
                      <FormField
                        control={form.control}
                        name="costPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => {
                                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Inventory Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Inventory</h3>
                    <Separator />
                    <div className="grid grid-cols-1 gap-6">
                      {/* Inventory Controls Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Manage Stock */}
                        <FormField
                          control={form.control}
                          name="manageStock"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 h-full">
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Manage Stock</FormLabel>
                                <FormDescription>
                                  Enable stock management
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {/* Stock Quantity */}
                        <FormField
                          control={form.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  disabled={!form.watch('manageStock')}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Stock Status */}
                        <FormField
                          control={form.control}
                          name="stockStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value || StockStatus.IN_STOCK}
                                disabled={form.watch('manageStock')}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={StockStatus.IN_STOCK}>In Stock</SelectItem>
                                  <SelectItem value={StockStatus.OUT_OF_STOCK}>Out of Stock</SelectItem>
                                  <SelectItem value={StockStatus.ON_BACKORDER}>On Backorder</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="p-4 bg-muted/30 rounded-md">
                        <p className="text-sm text-muted-foreground">SKU and barcode will be generated automatically.</p>
                      </div>
                    </div>
                  </div>

                  {/* Shops Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Shops</h3>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label>Available in Shops</Label>
                        <p className="text-sm text-muted-foreground">Toggle shops where this product will be available</p>

                        <div className="mt-4 space-y-4">
                          {/* Store list with toggles */}
                          {stores.map(store => {
                            const isSelected = selectedStores.some(s => s.id === store.id);
                            return (
                              <div key={store.id} className="border rounded-md overflow-hidden">
                                <div className="flex items-center justify-between p-3 bg-card">
                                  <div className="flex items-center space-x-3">
                                    {store.type === 'warehouse' ?
                                      <Warehouse className="h-5 w-5 text-muted-foreground" /> :
                                      <StoreIcon className="h-5 w-5 text-muted-foreground" />
                                    }
                                    <div>
                                      <p className="font-medium">{store.name}</p>
                                      <p className="text-sm text-muted-foreground">{store.address}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Label htmlFor={`store-${store.id}`} className="text-sm mr-2">
                                      {isSelected ? 'Available' : 'Not Available'}
                                    </Label>
                                    <Switch
                                      id={`store-${store.id}`}
                                      checked={isSelected}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedStores([...selectedStores, store]);
                                        } else {
                                          setSelectedStores(selectedStores.filter(s => s.id !== store.id));
                                        }
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Stock options - only show when selected */}
                                {isSelected && (
                                  <div className="p-4 border-t bg-muted/20">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {/* Initial Stock */}
                                      <div className="space-y-2">
                                        <Label htmlFor={`stock-${store.id}`} className="text-sm">Initial Stock</Label>
                                        <Input
                                          id={`stock-${store.id}`}
                                          type="number"
                                          placeholder="0"
                                          min="0"
                                          className="w-full"
                                          value={selectedStores.find(s => s.id === store.id)?.stock || 0}
                                          onChange={(e) => {
                                            const value = parseInt(e.target.value) || 0;
                                            setSelectedStores(selectedStores.map(s =>
                                              s.id === store.id ? {...s, stock: value} : s
                                            ));
                                          }}
                                        />
                                      </div>

                                      {/* Min Stock */}
                                      <div className="space-y-2">
                                        <Label htmlFor={`min-stock-${store.id}`} className="text-sm">Min Stock</Label>
                                        <Input
                                          id={`min-stock-${store.id}`}
                                          type="number"
                                          placeholder="0"
                                          min="0"
                                          className="w-full"
                                          value={selectedStores.find(s => s.id === store.id)?.minStock || 0}
                                          onChange={(e) => {
                                            const value = parseInt(e.target.value) || 0;
                                            setSelectedStores(selectedStores.map(s =>
                                              s.id === store.id ? {...s, minStock: value} : s
                                            ));
                                          }}
                                        />
                                      </div>

                                      {/* Max Stock */}
                                      <div className="space-y-2">
                                        <Label htmlFor={`max-stock-${store.id}`} className="text-sm">Max Stock</Label>
                                        <Input
                                          id={`max-stock-${store.id}`}
                                          type="number"
                                          placeholder="100"
                                          min="0"
                                          className="w-full"
                                          value={selectedStores.find(s => s.id === store.id)?.maxStock || 100}
                                          onChange={(e) => {
                                            const value = parseInt(e.target.value) || 0;
                                            setSelectedStores(selectedStores.map(s =>
                                              s.id === store.id ? {...s, maxStock: value} : s
                                            ));
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {selectedStores.length === 0 && (
                            <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
                              No shops selected. This product won't be available in any shop.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Variations Manager - Only shown for variable products */}
                  {showVariationsManager && (
                    <div className="space-y-8">
                      <Separator />
                      <VariationsManager
                        productId={product?.id}
                        sku={form.watch('name') ? form.watch('name').substring(0, 8).toUpperCase() : ''}
                        attributes={attributes}
                        variations={variations}
                        retailPrice={form.watch('retailPrice') || 0}
                        onAttributesChange={setAttributes}
                        onVariationsChange={setVariations}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/4 width on large screens */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Product Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ProductStatus.ACTIVE}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ProductStatus.ACTIVE}>Active</SelectItem>
                          <SelectItem value={ProductStatus.DRAFT}>Draft</SelectItem>
                          <SelectItem value={ProductStatus.INACTIVE}>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Product Image Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Product Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><line x1="16" x2="22" y1="5" y2="5"></line><line x1="19" x2="19" y1="2" y2="8"></line><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                    </div>
                    <p className="text-sm font-medium">Upload Image</p>
                    <p className="text-xs text-muted-foreground">Drag & drop or click to upload</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4">
                    Select Files
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, WebP<br />
                  Maximum file size: 5MB
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  {/* Preview Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Open the preview dialog
                      setPreviewOpen(true);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  
                  {/* Save and Add New Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={async () => {
                      try {
                        // Submit the form
                        await handleFormSubmit(form.getValues());
                        // Reset the form for a new product
                        resetForm();
                        // Show success message
                        setSuccess(true);
                      } catch (error) {
                        console.error('Error saving product:', error);
                      }
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Save and Add New
                  </Button>
                  
                  {/* Save Product Button */}
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : product ? 'Update Product' : 'Save Product'}
                  </Button>
                  
                  {/* Cancel Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      if (onCancel) onCancel();
                    }}
                    className="w-full"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </form>
      </Form>
      
      {/* Preview Product Dialog */}
      <PreviewProductDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        product={{
          ...form.getValues(),
          // Convert form data to Product type
          id: product?.id || 'new',
          name: form.getValues('name') || '',
          costPrice: form.getValues('costPrice') || 0,
          retailPrice: form.getValues('retailPrice') || 0,
          salePrice: form.getValues('salePrice') || 0,
          category: form.getValues('category') || '',
          description: form.getValues('description') || '',
          sku: product?.sku || '',
          barcode: product?.barcode || '',
          status: form.getValues('status') as ProductStatus || ProductStatus.DRAFT,
          stockStatus: form.getValues('stockStatus') as StockStatus || StockStatus.IN_STOCK,
          stock: form.getValues('stock') || 0,
          variations: variations,
          attributes: attributes,
        }}
        onConfirm={() => {
          setPreviewOpen(false);
          // Submit the form after preview if needed
          // form.handleSubmit(handleFormSubmit)();
        }}
      />
    </>
  );
};

export default ProductForm;
