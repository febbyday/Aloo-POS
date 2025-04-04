import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useProducts } from '../context/ProductContext';
import { useToast } from '@/components/ui/use-toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { FieldHelpTooltip } from "@/components/ui/help-tooltip";
import { OperationButton } from "@/components/ui/action-feedback";
import { RefreshCw, Save, ArrowLeft, Eye, Trash2, Plus, Store } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProductEditPreview } from '../components/ProductPreview';
import { useProductForm, ProductFormData } from '../context/ProductFormContext';
import { PRODUCTS_FULL_ROUTES } from '@/routes/productRoutes';
import { ProductFormAdapter } from '../components';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StoreSelect } from '@/features/store/components/StoreSelect';
import { useShops } from '@/features/shops/hooks/useShops';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateProduct, getProduct, deleteProduct } = useProducts();
  const { toast } = useToast();
  const showToast = useToastManager();

  // Use the shared form context
  const {
    form,
    technicalFields,
    setTechnicalFields,
    isLoading,
    setIsLoading,
    isDescriptionExpanded,
    setIsDescriptionExpanded,
    handleFieldChange,
    resetForm,
    generateSKU
  } = useProductForm();

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // State for product data
  const [product, setProduct] = useState<{
    id: string;
    sku: string;
    barcode: string;
    name: string;
    description: string;
    shortDescription: string;
    category: string;
    brand: string;
    supplier: string;
    productType: string;
    status: string;
    retailPrice: number;
    costPrice: number;
    salePrice: number | null;
    taxRate: number;
    minStock: number;
    maxStock: number;
    createdAt: string;
    updatedAt: string;
    images: string[];
    gallery: string[];
    featuredImage: string;
    variants: never[];
    locations: {
      locationId: string;
      enabled: boolean;
      stock: number;
      minStock: number;
      maxStock: number;
    }[];
    attributes: Array<{
      name: string;
      options: string[];
      isVisibleOnProductPage: boolean;
      isUsedForVariations: boolean;
    }>;
    variations: Array<{
      id: string;
      attributes: Record<string, string>;
      sku: string;
      price: number;
      stock: number;
      image: string;
    }>;
  }>({
    id: id || '',
    sku: '',
    barcode: '',
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    brand: '',
    supplier: '',
    productType: 'simple',
    status: 'active',
    retailPrice: 0,
    costPrice: 0,
    salePrice: null,
    taxRate: 0,
    minStock: 0,
    maxStock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [],
    gallery: [],
    featuredImage: '',
    variants: [],
    locations: [],
    attributes: [],
    variations: []
  });

  // State for attribute dialog
  const [attributeDialogOpen, setAttributeDialogOpen] = useState(false);
  const [newAttribute, setNewAttribute] = useState<{
    name: string;
    options: string[];
    isVisibleOnProductPage: boolean;
    isUsedForVariations: boolean;
  }>({
    name: '',
    options: [],
    isVisibleOnProductPage: true,
    isUsedForVariations: false,
  });
  const [newOption, setNewOption] = useState('');

  // Inside the component, add these hooks to fetch real data
  const { items: stores, loading: loadingStores } = useShops({ autoLoad: true });
  const { items: suppliers, loading: loadingSuppliers } = useSuppliers({ autoLoad: true });

  // Initialize locations based on stores
  useEffect(() => {
    if (stores && stores.length > 0 && (!product.locations || product.locations.length === 0)) {
      setProduct(prev => ({
        ...prev,
        locations: stores.map(store => ({
          locationId: store.id,
          enabled: false,
          stock: 0,
          minStock: 0,
          maxStock: 100
        }))
      }));
    }
  }, [stores]);

  // Load product data
  useEffect(() => {
    if (id) {
      const loadProduct = async () => {
        try {
          setIsLoading(true);
          const productData = await getProduct(id);

          if (productData) {
            // Set form data with all required fields
            resetForm({
              name: productData.name,
              retailPrice: productData.retailPrice,
              costPrice: productData.costPrice || 0,
              salePrice: productData.salePrice || 0,
              brand: productData.brand || '',
              description: productData.description || '',
              productType: productData.productType || 'single',
              category: productData.category || '',
              supplier: productData.supplier || undefined,
              shortDescription: productData.shortDescription || '',
            });

            // Set technical fields
            setTechnicalFields({
              sku: productData.sku || '',
              barcode: productData.barcode || '',
              createdAt: productData.createdAt || '',
              updatedAt: productData.updatedAt || '',
              updatedBy: 'Current User' // This would come from auth context
            });

            // Ensure locations are initialized
            const productWithLocations = { ...productData };

            // If the product doesn't have locations or they're empty, initialize them
            if (!productWithLocations.locations || productWithLocations.locations.length === 0) {
              if (stores && stores.length > 0) {
                productWithLocations.locations = stores.map(store => ({
                  locationId: store.id,
                  name: store.name,
                  type: store.type,
                  enabled: false,
                  stock: 0,
                  minStock: 0,
                  maxStock: 100
                }));
              } else {
                // Initialize with an empty array to prevent null errors
                productWithLocations.locations = [];
              }
            }

            // Update the product state with the enhanced product data
            setProduct(productWithLocations);
          } else {
            showToast.error('Error', 'Product not found');
            navigate(PRODUCTS_FULL_ROUTES.LIST);
          }
        } catch (error) {
          console.error('Failed to load product:', error);
          showToast.error('Error', 'Failed to load product');
        } finally {
          setIsLoading(false);
        }
      };

      loadProduct();
    }
  }, [id, getProduct, navigate, showToast, resetForm, setTechnicalFields, setIsLoading, stores]);

  // Form submission handler
  const onSubmit = async (data: ProductFormData) => {
    try {
      // Create an updated product object
      const updatedProduct = {
        id,
        ...data,
        updatedAt: new Date().toISOString(),
        // Include all product data from state
        locations: product.locations ? product.locations.filter(loc => loc.enabled) : [],
        attributes: product.attributes || [],
        variations: product.variations || [],
        gallery: product.gallery || [],
        featuredImage: product.featuredImage
      };

      // Update the product
      await updateProduct(id!, updatedProduct);

      // Show success message
      showToast.success('Success', 'Product updated successfully');

      // Navigate to the product list
      navigate(PRODUCTS_FULL_ROUTES.LIST);
    } catch (error) {
      console.error('Failed to update product:', error);
      showToast.error('Error', 'Failed to update product');
    }
  };

  // Delete product handler
  const handleDeleteProduct = async () => {
    if (!id) return;

    try {
      await deleteProduct(id);
      showToast.success('Success', 'Product deleted successfully');
      navigate(PRODUCTS_FULL_ROUTES.LIST);
    } catch (error) {
      console.error('Failed to delete product:', error);
      showToast.error('Error', 'Failed to delete product');
    }
  };

  // Function to generate variations based on attributes
  const generateVariations = () => {
    // Check if product.attributes exists
    if (!product.attributes || product.attributes.length === 0) {
      showToast.info('Info', 'No attributes available to generate variations');
      return;
    }

    // Filter attributes that are used for variations
    const variationAttributes = product.attributes.filter(attr => attr.isUsedForVariations);

    if (variationAttributes.length === 0) return;

    // Generate all possible combinations of attribute options
    const generateCombinations = (
      attributes: typeof variationAttributes,
      currentIndex: number,
      currentCombination: Record<string, string>,
      result: Record<string, string>[]
    ) => {
      if (currentIndex === attributes.length) {
        result.push({...currentCombination});
        return;
      }

      const currentAttribute = attributes[currentIndex];
      if (currentAttribute) {
        for (const option of currentAttribute.options) {
          currentCombination[currentAttribute.name] = option;
          generateCombinations(attributes, currentIndex + 1, currentCombination, result);
        }
      }
    };

    const combinations: Record<string, string>[] = [];
    generateCombinations(variationAttributes, 0, {}, combinations);

    // Create variations based on combinations
    const newVariations = combinations.map((combination, index) => {
      // Check if this combination already exists
      const existingVariation = product.variations.find(v => {
        return Object.entries(combination).every(
          ([attr, value]) => v.attributes[attr] === value
        );
      });

      if (existingVariation) {
        return existingVariation;
      }

      // Generate a unique SKU for the variation
      const baseSku = product.sku || 'PROD';
      const attributeString = Object.values(combination).join('-');
      const sku = `${baseSku}-${attributeString}`;

      return {
        id: `${product.id}-var-${index}`,
        attributes: combination,
        sku,
        price: product.retailPrice || 0,
        stock: 0,
        image: ''
      };
    });

    setProduct({
      ...product,
      variations: newVariations
    });
  };

  // Add function to handle adding a new attribute
  const handleAddAttribute = () => {
    if (!newAttribute.name || newAttribute.options.length === 0) {
      showToast.error('Error', 'Attribute name and at least one option are required');
      return;
    }

    setProduct(prev => ({
      ...prev,
      attributes: [...prev.attributes, { ...newAttribute }]
    }));

    // Reset the new attribute form
    setNewAttribute({
      name: '',
      options: [],
      isVisibleOnProductPage: true,
      isUsedForVariations: true
    });

    // Close the dialog
    setAttributeDialogOpen(false);
  };

  // Add function to handle adding a new option to an attribute
  const handleAddOption = () => {
    if (!newOption.trim()) return;

    setNewAttribute(prev => ({
      ...prev,
      options: [...prev.options, newOption.trim()]
    }));

    setNewOption('');
  };

  // Handle store selection
  const handleStoreChange = (store: { id: string; name: string; address: string; type: string }) => {
    // Get the current stock value from the form
    const currentStock = form.getValues('stock') || 0;

    // Check if product.locations exists
    if (!product.locations || product.locations.length === 0) {
      // Initialize locations if they don't exist
      const initialLocations = stores?.map(s => ({
        locationId: s.id,
        enabled: s.id === store.id,
        stock: s.id === store.id && store.name === "Main Store" ? currentStock : 0,
        minStock: 0,
        maxStock: 100
      })) || [];

      setProduct({ ...product, locations: initialLocations });
      showToast.success('Store Selected', `${store.name} has been activated for this product`);
      return;
    }

    // Enable the selected store in the locations array
    const newLocations = product.locations.map(loc => {
      // If this is the selected store
      if (loc.locationId === store.id) {
        // If this is the Main Store, assign the current stock value to it
        if (store.name === "Main Store") {
          return {
            ...loc,
            enabled: true,
            stock: currentStock
          };
        }
        // Otherwise just enable it
        return { ...loc, enabled: true };
      }
      return loc;
    });

    setProduct({ ...product, locations: newLocations });
    showToast.success('Store Selected', `${store.name} has been activated for this product`);
  };

  if (isLoading || loadingStores || loadingSuppliers) {
    return (
      <div className="w-full pb-6 flex items-center justify-center h-screen mx-auto max-w-[1920px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <PageHeader
        title="Edit Product"
        description="Update product information"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(PRODUCTS_FULL_ROUTES.LIST)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <OperationButton
              variant="default"
              onClick={form.handleSubmit(onSubmit)}
              icon={<Save className="h-4 w-4 mr-2" />}
            >
              Save Changes
            </OperationButton>
          </div>
        }
      />

      <div className="w-full">
        <ProductFormAdapter
          product={product}
          isEdit={true}
          onSubmit={onSubmit}
          onCancel={() => navigate(PRODUCTS_FULL_ROUTES.LIST)}
          onSuccess={(product) => {
            showToast.success('Success', 'Product updated successfully');
            navigate(PRODUCTS_FULL_ROUTES.LIST);
          }}
          className="w-full"
        />
      </div>
      
      {/* Keeping the old form structure for reference - to be removed */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" style={{display: 'none'}}>
        {/* Main Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4 p-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter product name"
                      {...form.register('name')}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      onValueChange={(value) => handleFieldChange('category', value)}
                      value={form.getValues('category')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Audio">Audio</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Lighting">Lighting</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      placeholder="Enter brand name"
                      {...form.register('brand')}
                      onChange={(e) => handleFieldChange('brand', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select
                      onValueChange={(value) => {
                        const supplier = suppliers.find(s => s.id === value);
                        if (supplier) {
                          handleFieldChange('supplier', { id: supplier.id, name: supplier.name });
                        }
                      }}
                      value={form.getValues('supplier')?.id}
                      disabled={loadingSuppliers}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingSuppliers ? "Loading suppliers..." : "Select supplier"} />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers && suppliers.length > 0 ? (
                          suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-suppliers" disabled>
                            No suppliers available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productType">
                      Product Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => handleFieldChange('productType', value)}
                      value={form.getValues('productType')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Product</SelectItem>
                        <SelectItem value="variable">Variable Product</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.productType && (
                      <p className="text-red-500 text-sm">{form.formState.errors.productType.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4 p-4">
                <h3 className="text-lg font-medium">Pricing</h3>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="retailPrice">
                      Retail Price <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="retailPrice"
                        type="number"
                        className="pl-6"
                        placeholder="0.00"
                        {...form.register('retailPrice', { valueAsNumber: true })}
                        onChange={(e) => handleFieldChange('retailPrice', parseFloat(e.target.value))}
                      />
                    </div>
                    {form.formState.errors.retailPrice && (
                      <p className="text-red-500 text-sm">{form.formState.errors.retailPrice.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="costPrice">
                      Cost Price
                      <FieldHelpTooltip content="The price you pay to acquire this product" />
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="costPrice"
                        type="number"
                        className="pl-6"
                        placeholder="0.00"
                        {...form.register('costPrice', { valueAsNumber: true })}
                        onChange={(e) => handleFieldChange('costPrice', parseFloat(e.target.value))}
                      />
                    </div>
                    {form.formState.errors.costPrice && (
                      <p className="text-red-500 text-sm">{form.formState.errors.costPrice.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salePrice">
                      Sale Price
                      <FieldHelpTooltip content="Special promotional price" />
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="salePrice"
                        type="number"
                        className="pl-6"
                        placeholder="0.00"
                        {...form.register('salePrice', { valueAsNumber: true })}
                        onChange={(e) => handleFieldChange('salePrice', parseFloat(e.target.value))}
                      />
                    </div>
                    {form.formState.errors.salePrice && (
                      <p className="text-red-500 text-sm">{form.formState.errors.salePrice.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4 p-4">
                <h3 className="text-lg font-medium">Description</h3>
                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter detailed product description"
                    className="min-h-32"
                    {...form.register('description')}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    placeholder="Enter short product description"
                    className="min-h-20"
                    {...form.register('shortDescription')}
                    onChange={(e) => handleFieldChange('shortDescription', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4 p-4">
                <h3 className="text-lg font-medium">Inventory</h3>
                <Separator />

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Current Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="0"
                        value={form.getValues('stock') || 0}
                        onChange={(e) => handleFieldChange('stock', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minStock">Min Stock</Label>
                      <Input
                        id="minStock"
                        type="number"
                        placeholder="0"
                        value={form.getValues('minStock') || 0}
                        onChange={(e) => handleFieldChange('minStock', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxStock">Max Stock</Label>
                      <Input
                        id="maxStock"
                        type="number"
                        placeholder="100"
                        value={form.getValues('maxStock') || 100}
                        onChange={(e) => handleFieldChange('maxStock', parseInt(e.target.value) || 100)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Track Inventory</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trackInventory"
                        checked={form.getValues('trackInventory') !== false}
                        onCheckedChange={(checked) => handleFieldChange('trackInventory', !!checked)}
                      />
                      <label
                        htmlFor="trackInventory"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Enable inventory tracking
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Availability Section */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Store Availability</h3>
                  <Badge variant="outline" className="px-3 py-1">
                    {product.locations && product.locations.length > 0
                      ? `${product.locations.filter(loc => loc.enabled).length} of ${stores?.length || 0} stores selected`
                      : "0 stores selected"}
                  </Badge>
                </div>
                <Separator />

                {loadingStores ? (
                  <div className="p-8 text-center border border-dashed rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-muted-foreground">Loading stores...</p>
                  </div>
                ) : !product.locations || product.locations.filter(loc => loc.enabled).length === 0 ? (
                  <div className="p-8 text-center border border-dashed rounded-lg">
                    <Store className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-2">No Stores Selected</h3>
                    <p className="text-muted-foreground mb-4">
                      Use the store selector at the top of the page to activate stores for this product.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Enable all stores
                        const newLocations = product.locations ? product.locations.map(loc => ({
                          ...loc,
                          enabled: true
                        })) : [];
                        setProduct({ ...product, locations: newLocations });
                      }}
                      disabled={!stores || stores.length === 0}
                    >
                      <Store className="h-4 w-4 mr-2" />
                      Enable All Stores
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-4">
                      {stores && stores.length > 0 ? stores.map((store) => {
                        const location = product.locations ? product.locations.find(loc => loc.locationId === store.id) : undefined;
                        const isEnabled = location?.enabled || false;

                        return (
                          <Card key={store.id} className={`flex-1 min-w-[250px] transition-all ${isEnabled ? 'ring-2 ring-primary' : 'opacity-70'}`}>
                            <CardContent className="p-0">
                              <div className="flex items-start justify-between p-4">
                                <div className="space-y-1">
                                  <div className="font-medium">{store.name}</div>
                                  <div className="text-sm text-muted-foreground">{store.location || store.address}</div>
                                  <Badge variant={isEnabled ? "default" : "secondary"}>{store.type}</Badge>
                                </div>
                                <Switch
                                  checked={isEnabled}
                                  onCheckedChange={(checked) => {
                                    const newLocations = product.locations.map(loc =>
                                      loc.locationId === store.id
                                        ? { ...loc, enabled: checked }
                                        : loc
                                    );
                                    setProduct({ ...product, locations: newLocations });
                                  }}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      }) : (
                        <div className="w-full p-4 text-center text-muted-foreground">
                          No stores available
                        </div>
                      )}
                    </div>

                    {/* Stock Management Section - Only shown when stores are selected */}
                    <div className="mt-8 pt-4 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Stock Management</h3>
                        <Badge variant="outline" className="px-3 py-1">
                          {product.locations ? product.locations.filter(loc => loc.enabled).length : 0} stores enabled
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {product.locations ? product.locations.filter(loc => loc.enabled).map((location) => {
                          const store = stores.find(s => s.id === location.locationId);
                          return (
                            <div key={location.locationId} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                              <div className="grid gap-2">
                                <Label>Location</Label>
                                <div className="text-sm font-medium">
                                  {store?.name || location.locationId}
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`stock-${location.locationId}`}>Current Stock</Label>
                                <Input
                                  id={`stock-${location.locationId}`}
                                  type="number"
                                  value={location.stock}
                                  onChange={(e) => {
                                    const newLocations = [...product.locations];
                                    const index = newLocations.findIndex(loc => loc.locationId === location.locationId);
                                    if (index !== -1) {
                                      newLocations[index] = {
                                        ...location,
                                        stock: parseInt(e.target.value) || 0
                                      };
                                      setProduct({ ...product, locations: newLocations });
                                    }
                                  }}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`minStock-${location.locationId}`}>Min Stock</Label>
                                <Input
                                  id={`minStock-${location.locationId}`}
                                  type="number"
                                  value={location.minStock}
                                  onChange={(e) => {
                                    const newLocations = [...product.locations];
                                    const index = newLocations.findIndex(loc => loc.locationId === location.locationId);
                                    if (index !== -1) {
                                      newLocations[index] = {
                                        ...location,
                                        minStock: parseInt(e.target.value) || 0
                                      };
                                      setProduct({ ...product, locations: newLocations });
                                    }
                                  }}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`maxStock-${location.locationId}`}>Max Stock</Label>
                                <Input
                                  id={`maxStock-${location.locationId}`}
                                  type="number"
                                  value={location.maxStock}
                                  onChange={(e) => {
                                    const newLocations = [...product.locations];
                                    const index = newLocations.findIndex(loc => loc.locationId === location.locationId);
                                    if (index !== -1) {
                                      newLocations[index] = {
                                        ...location,
                                        maxStock: parseInt(e.target.value) || 0
                                      };
                                      setProduct({ ...product, locations: newLocations });
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }) : null}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attributes & Variations */}
          {form.getValues('productType') === 'variable' && (
            <Card>
              <CardContent className="p-0">
                <div className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Attributes & Variations</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAttributeDialogOpen(true)}
                      className="text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Attribute
                    </Button>
                  </div>
                  <Separator />

                  {product.attributes.length > 0 ? (
                    <div className="space-y-4">
                      {product.attributes.map((attr, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{attr.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newAttributes = [...product.attributes];
                                newAttributes.splice(index, 1);
                                setProduct({ ...product, attributes: newAttributes });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {attr.options.map((option, optIndex) => (
                              <Badge key={optIndex} variant="secondary">
                                {option}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center mt-2 space-x-2">
                            <Checkbox
                              id={`visible-${index}`}
                              checked={attr.isVisibleOnProductPage}
                              onCheckedChange={(checked) => {
                                const newAttributes = [...product.attributes];
                                newAttributes[index] = {
                                  ...attr,
                                  isVisibleOnProductPage: !!checked
                                };
                                setProduct({ ...product, attributes: newAttributes });
                              }}
                            />
                            <Label htmlFor={`visible-${index}`} className="text-sm">Visible on product page</Label>
                          </div>
                          <div className="flex items-center mt-2 space-x-2">
                            <Checkbox
                              id={`variation-${index}`}
                              checked={attr.isUsedForVariations}
                              onCheckedChange={(checked) => {
                                const newAttributes = [...product.attributes];
                                newAttributes[index] = {
                                  ...attr,
                                  isUsedForVariations: !!checked
                                };
                                setProduct({ ...product, attributes: newAttributes });
                              }}
                            />
                            <Label htmlFor={`variation-${index}`} className="text-sm">Used for variations</Label>
                          </div>
                        </div>
                      ))}

                      {/* Generate Variations Button */}
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={generateVariations}
                          disabled={!product.attributes.some(attr => attr.isUsedForVariations)}
                        >
                          Generate Variations
                        </Button>
                      </div>

                      {/* Variations Table */}
                      {product.variations.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-medium mb-2">Product Variations ({product.variations.length})</h4>
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="px-4 py-2 text-left">Variation</th>
                                  <th className="px-4 py-2 text-left">SKU</th>
                                  <th className="px-4 py-2 text-left">Price</th>
                                  <th className="px-4 py-2 text-left">Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {product.variations.map((variation, index) => (
                                  <tr key={variation.id} className="border-t">
                                    <td className="px-4 py-2">
                                      {Object.entries(variation.attributes)
                                        .map(([attr, value]) => `${attr}: ${value}`)
                                        .join(', ')}
                                    </td>
                                    <td className="px-4 py-2">
                                      <Input
                                        value={variation.sku}
                                        onChange={(e) => {
                                          const newVariations = [...product.variations];
                                          newVariations[index] = {
                                            ...variation,
                                            sku: e.target.value
                                          };
                                          setProduct({ ...product, variations: newVariations });
                                        }}
                                        className="h-8"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <div className="relative">
                                        <span className="absolute left-2 top-1.5">$</span>
                                        <Input
                                          type="number"
                                          value={variation.price}
                                          onChange={(e) => {
                                            const newVariations = [...product.variations];
                                            newVariations[index] = {
                                              ...variation,
                                              price: parseFloat(e.target.value) || 0
                                            };
                                            setProduct({ ...product, variations: newVariations });
                                          }}
                                          className="h-8 pl-6"
                                        />
                                      </div>
                                    </td>
                                    <td className="px-4 py-2">
                                      <Input
                                        type="number"
                                        value={variation.stock}
                                        onChange={(e) => {
                                          const newVariations = [...product.variations];
                                          newVariations[index] = {
                                            ...variation,
                                            stock: parseInt(e.target.value) || 0
                                          };
                                          setProduct({ ...product, variations: newVariations });
                                        }}
                                        className="h-8"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground border rounded-lg">
                      No attributes defined. Add attributes to create product variations.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4 p-4">
                <h3 className="text-lg font-medium">Status</h3>
                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">Active</Label>
                    <p className="text-sm text-muted-foreground">Product will be available for sale</p>
                  </div>
                  <Switch id="active" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="featured">Featured</Label>
                    <p className="text-sm text-muted-foreground">Show in featured products section</p>
                  </div>
                  <Switch id="featured" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Image */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4 p-4">
                <h3 className="text-lg font-medium">Product Image</h3>
                <Separator />

                <div className="grid grid-cols-1 gap-4">
                  {/* Featured Image */}
                  <div className="space-y-2">
                    <Label>Featured Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      {product.featuredImage ? (
                        <div className="relative">
                          <img
                            src={product.featuredImage}
                            alt="Featured product"
                            className="max-h-48 mx-auto rounded-md"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setProduct({...product, featuredImage: ''})}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Add Featured Image</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Drag & drop or click to upload
                          </p>
                          <Input
                            type="file"
                            className="hidden"
                            id="featuredImage"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // In a real app, you would upload this to a server
                                // For now, we'll create a local URL
                                const imageUrl = URL.createObjectURL(file);
                                setProduct({...product, featuredImage: imageUrl});
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => document.getElementById('featuredImage')?.click()}
                          >
                            Select Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Images */}
                  <div className="space-y-2">
                    <Label>Product Images</Label>
                    <div className="border-2 border-dashed rounded-lg p-6">
                      {product.gallery.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {product.gallery.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Product image ${index + 1}`}
                                className="h-24 w-full object-cover rounded-md"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => {
                                  const newGallery = [...product.gallery];
                                  newGallery.splice(index, 1);
                                  setProduct({...product, gallery: newGallery});
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <div
                            className="h-24 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer"
                            onClick={() => document.getElementById('galleryImages')?.click()}
                          >
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Plus className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
                          <p className="text-sm font-medium">Add Product Images</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Drag & drop or click to upload
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => document.getElementById('galleryImages')?.click()}
                          >
                            Select Image
                          </Button>
                        </div>
                      )}
                      <Input
                        type="file"
                        className="hidden"
                        id="galleryImages"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            // In a real app, you would upload these to a server
                            // For now, we'll create local URLs
                            const newImages = Array.from(files).map(file => URL.createObjectURL(file));
                            setProduct({
                              ...product,
                              gallery: [...product.gallery, ...newImages]
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4 p-4">
                <h3 className="text-lg font-medium">Actions</h3>
                <Separator />

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setPreviewOpen(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Product
                  </Button>

                  <OperationButton
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={Object.values(form.formState.errors).some(error => error !== undefined)}
                    successMessage="Product updated successfully"
                    errorMessage="Failed to update product"
                    variant="default"
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </OperationButton>

                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Product
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <ProductEditPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        product={{
          id: id || '',
          ...form.getValues(),
          featuredImage: product.featuredImage,
          gallery: product.gallery,
          status: 'active',
          images: [],
          variants: [],
          locations: []
        }}
        stores={stores || []}
        isDescriptionExpanded={isDescriptionExpanded}
        setIsDescriptionExpanded={setIsDescriptionExpanded}
        generateSKU={generateSKU}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Attribute Dialog */}
      <Dialog open={attributeDialogOpen} onOpenChange={setAttributeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Attribute</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="attributeName">Attribute Name</Label>
              <Input
                id="attributeName"
                value={newAttribute.name}
                onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Size, Color, Material"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="attributeOptions">Options</Label>
              <div className="flex gap-2">
                <Input
                  id="attributeOptions"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Enter an option"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddOption}>Add</Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {newAttribute.options.map((option, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {option}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => {
                        const newOptions = [...newAttribute.options];
                        newOptions.splice(index, 1);
                        setNewAttribute(prev => ({ ...prev, options: newOptions }));
                      }}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
                {newAttribute.options.length === 0 && (
                  <div className="text-sm text-muted-foreground">No options added yet</div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isVisibleOnProductPage"
                checked={newAttribute.isVisibleOnProductPage}
                onCheckedChange={(checked) =>
                  setNewAttribute(prev => ({ ...prev, isVisibleOnProductPage: !!checked }))
                }
              />
              <Label htmlFor="isVisibleOnProductPage">Visible on product page</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isUsedForVariations"
                checked={newAttribute.isUsedForVariations}
                onCheckedChange={(checked) =>
                  setNewAttribute(prev => ({ ...prev, isUsedForVariations: !!checked }))
                }
              />
              <Label htmlFor="isUsedForVariations">Used for variations</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAttributeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAttribute}>Add Attribute</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}