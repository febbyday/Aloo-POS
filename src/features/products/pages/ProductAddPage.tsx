import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useProducts } from '../context/ProductContext';
import { useToast } from '@/components/ui/use-toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { FieldHelpTooltip, InfoBox } from "@/components/ui/help-tooltip";
import { OperationButton } from "@/components/ui/action-feedback";
import { RefreshCw, Save, Plus, ArrowLeft, Eye, Trash2, Store, Clock } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProductAddPreview } from '../components/ProductPreview';
import { useProductForm, ProductFormData } from '../context/ProductFormContext';
import { PRODUCTS_FULL_ROUTES } from '@/routes/productRoutes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { v4 as uuidv4 } from 'uuid';
import { StoreSelect } from '@/features/store/components/StoreSelect';
import { ProductFormAdapter } from '../components';

// Store data (would typically come from an API)
const stores = [
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

// Supplier data (would typically come from an API)
const suppliers = [
  {
    id: "sup1",
    name: "Premium Food Supplies",
    contact: "John Doe",
    email: "john@premiumfoods.com",
    phone: "555-123-4567"
  },
  {
    id: "sup2",
    name: "Beverage Distributors Inc.",
    contact: "Jane Smith",
    email: "jane@beveragedist.com",
    phone: "555-987-6543"
  },
  {
    id: "sup3",
    name: "Fresh Ingredients Co.",
    contact: "Mike Johnson",
    email: "mike@freshingredients.com",
    phone: "555-456-7890"
  }
];

export function ProductAddPage() {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const { toast } = useToast();
  const showToast = useToastManager();
  
  // Use the shared form context
  const { 
    form, 
    technicalFields, 
    setTechnicalFields, 
    isDescriptionExpanded, 
    setIsDescriptionExpanded,
    handleFieldChange,
    generateSKU
  } = useProductForm();

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);
  
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
    id: uuidv4(),
    sku: '',
    barcode: '',
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    brand: '',
    supplier: '',
    productType: 'simple',
    status: 'draft',
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
    locations: stores.map(store => ({
      locationId: store.id,
      enabled: false,
      stock: 0,
      minStock: 0,
      maxStock: 100
    })),
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

  // Form submission handler
  const onSubmit = async (data: ProductFormData) => {
    try {
      // Create a new product object
      const newProduct = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        images: [],
        variants: [],
        minStock: 0,
        maxStock: 100,
        // Include all product data from state
        locations: product.locations.filter(loc => loc.enabled) || [],
        attributes: product.attributes || [],
        variations: product.variations || [],
        gallery: product.gallery || [],
        featuredImage: product.featuredImage
      };
      
      // Add the product
      await addProduct(newProduct);
      
      // Show success message
      showToast.success('Success', 'Product created successfully');
      
      // Navigate to the product list
      navigate(PRODUCTS_FULL_ROUTES.LIST);
    } catch (error) {
      console.error('Failed to create product:', error);
      showToast.error('Error', 'Failed to create product');
    }
  };

  // Handle creating a temporary product
  const handleCreateTemporary = async () => {
    try {
      // Validate that at least the name field is filled
      const name = form.getValues('name');
      if (!name) {
        showToast.error('Error', 'Product name is required for temporary products');
        return;
      }

      // Create a temporary product with minimal required fields
      const temporaryProduct = {
        id: crypto.randomUUID(),
        name: name,
        sku: `TEMP-${Date.now().toString().slice(-6)}`,
        barcode: '',
        retailPrice: Number(form.getValues('retailPrice')) || 0,
        costPrice: Number(form.getValues('costPrice')) || 0,
        salePrice: Number(form.getValues('salePrice')) || 0,
        productType: form.getValues('productType') || 'simple',
        brand: form.getValues('brand') || '',
        category: form.getValues('category') || '',
        description: form.getValues('description') || '',
        shortDescription: form.getValues('shortDescription') || '',
        supplier: form.getValues('supplier') || { id: '', name: '' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft', // Mark as draft to indicate it's temporary
        images: [],
        variants: [],
        stock: 0, // Default stock value
        minStock: 0,
        maxStock: 100,
        locations: product.locations.filter(loc => loc.enabled).map(loc => ({
          locationId: loc.locationId,
          enabled: loc.enabled,
          stock: 0,
          minStock: 0,
          maxStock: 100
        })),
        attributes: [],
        variations: [],
        gallery: product.gallery || [],
        featuredImage: product.featuredImage,
        isTemporary: true // Add a flag to identify temporary products
      };
      
      // Add the temporary product
      await addProduct(temporaryProduct);
      
      // Show success message
      showToast.success('Success', 'Temporary product created successfully');
      
      // Navigate to the product list
      navigate(PRODUCTS_FULL_ROUTES.LIST);
    } catch (error) {
      showToast.error('Error', `Failed to create temporary product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error creating temporary product:', error);
    }
  };

  // Save and add another product
  const handleSaveAndAddNew = async () => {
    try {
      const data = form.getValues();
      
      // Create a new product object
      const newProduct = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        images: [],
        variants: [],
        minStock: 0,
        maxStock: 100,
        // Include all product data from state
        locations: product.locations.filter(loc => loc.enabled) || [],
        attributes: product.attributes || [],
        variations: product.variations || [],
        gallery: product.gallery || [],
        featuredImage: product.featuredImage
      };
      
      // Add the product
      await addProduct(newProduct);
      
      // Show success message
      showToast.success('Success', 'Product created successfully');
      
      // Reset the form for a new product
      form.reset({
        name: '',
        retailPrice: 0,
        costPrice: 0,
        salePrice: 0,
        brand: '',
        description: '',
        productType: 'single',
      });
      
      setTechnicalFields({
        sku: '',
        barcode: '',
        createdAt: '',
        updatedAt: '',
        updatedBy: ''
      });
      
      // Close the preview
      setPreviewOpen(false);
    } catch (error) {
      console.error('Failed to create product:', error);
      showToast.error('Error', 'Failed to create product');
    }
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
      isUsedForVariations: false,
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

  // Function to generate variations based on attributes
  const generateVariations = () => {
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

  // Handle store selection
  const handleStoreChange = (store: { id: string; name: string; address: string; type: string }) => {
    // Get the current stock value from the form
    const currentStock = form.getValues('stock') || 0;
    
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

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <PageHeader
        title="Add New Product"
        description="Create a new product in your inventory"
        actions={
          <div className="flex items-center gap-2">
            <StoreSelect onStoreChange={handleStoreChange} />
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(true)}
            >
              Preview
            </Button>
            <Button
              variant="secondary"
              onClick={handleCreateTemporary}
              title="Save with minimal required fields for later completion"
            >
              <Clock className="h-4 w-4 mr-2" />
              Save as Temporary
            </Button>
            <OperationButton
              variant="outline"
              onClick={handleSaveAndAddNew}
            >
              Save & Add New
            </OperationButton>
            <OperationButton
              variant="default"
              onClick={form.handleSubmit(onSubmit)}
              icon={<Save className="h-4 w-4 mr-2" />}
            >
              Save Product
            </OperationButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <ProductFormAdapter
          onSubmit={onSubmit}
          onCancel={() => navigate(PRODUCTS_FULL_ROUTES.LIST)}
          onSuccess={(product) => {
            showToast.success('Success', 'Product created successfully');
            navigate(PRODUCTS_FULL_ROUTES.LIST);
          }}
        />
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Product Preview</DialogTitle>
          </DialogHeader>
          <ProductAddPreview product={product} formData={form.getValues()} />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
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

          <Card>
            <CardContent className="p-0">
              <div className="space-y-4 p-4">
                <h3 className="text-lg font-medium">Product Gallery</h3>
                <Separator />
                
                <div className="grid grid-cols-1 gap-4">
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
                  
                  <div className="space-y-2">
                    <Label>Gallery Images</Label>
                    <div className="border-2 border-dashed rounded-lg p-6">
                      {product.gallery.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {product.gallery.map((image, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={image} 
                                alt={`Product gallery ${index + 1}`} 
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
                          <p className="text-sm font-medium">Add Gallery Images</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Drag & drop or click to upload
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => document.getElementById('galleryImages')?.click()}
                          >
                            Select Images
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
                    successMessage="Product saved successfully"
                    errorMessage="Failed to save product"
                    variant="default"
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Product
                  </OperationButton>
                  
                  <OperationButton
                    onClick={handleSaveAndAddNew}
                    disabled={Object.values(form.formState.errors).some(error => error !== undefined)}
                    successMessage="Product saved, adding new"
                    errorMessage="Failed to save product"
                    variant="secondary"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Save & Add Another
                  </OperationButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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