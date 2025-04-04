import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  RefreshCw,
  ArrowLeft,
  Grid,
  Tag,
  FileDown,
  Layers
} from 'lucide-react';
import {
  VariationMatrix,
  GlobalAttributesManager,
  VariationTemplatesTab
} from '../components/variations';
import { useProducts } from '../context/ProductContext';

// Mock data for attributes
const mockAttributes = [
  {
    id: '1',
    name: 'Color',
    slug: 'color',
    description: 'Product color options',
    type: 'color' as const,
    options: [
      { id: '1', value: 'Red', sortOrder: 0 },
      { id: '2', value: 'Blue', sortOrder: 1 },
      { id: '3', value: 'Green', sortOrder: 2 },
      { id: '4', value: 'Black', sortOrder: 3 },
      { id: '5', value: 'White', sortOrder: 4 },
    ],
    isVisibleOnProductPage: true,
    isUsedForVariations: true,
    isRequired: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Size',
    slug: 'size',
    description: 'Product size options',
    type: 'select' as const,
    options: [
      { id: '1', value: 'Small', sortOrder: 0 },
      { id: '2', value: 'Medium', sortOrder: 1 },
      { id: '3', value: 'Large', sortOrder: 2 },
      { id: '4', value: 'X-Large', sortOrder: 3 },
    ],
    isVisibleOnProductPage: true,
    isUsedForVariations: true,
    isRequired: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Material',
    slug: 'material',
    description: 'Product material',
    type: 'select' as const,
    options: [
      { id: '1', value: 'Cotton', sortOrder: 0 },
      { id: '2', value: 'Polyester', sortOrder: 1 },
      { id: '3', value: 'Wool', sortOrder: 2 },
      { id: '4', value: 'Leather', sortOrder: 3 },
    ],
    isVisibleOnProductPage: true,
    isUsedForVariations: false,
    isRequired: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Weight',
    slug: 'weight',
    description: 'Product weight in kg',
    type: 'number' as const,
    isVisibleOnProductPage: false,
    isUsedForVariations: false,
    isRequired: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock data for variations
const mockVariations = [
  {
    id: '1',
    attributes: { Color: 'Red', Size: 'Small' },
    sku: 'PROD-RED-S',
    price: 19.99,
    salePrice: 14.99,
    cost: 10.00,
    stock: 25,
    image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Red+Small',
    enabled: true,
  },
  {
    id: '2',
    attributes: { Color: 'Red', Size: 'Medium' },
    sku: 'PROD-RED-M',
    price: 19.99,
    salePrice: 14.99,
    cost: 10.00,
    stock: 30,
    image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Red+Medium',
    enabled: true,
  },
  {
    id: '3',
    attributes: { Color: 'Blue', Size: 'Small' },
    sku: 'PROD-BLUE-S',
    price: 19.99,
    salePrice: 14.99,
    cost: 10.00,
    stock: 15,
    image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Blue+Small',
    enabled: true,
  },
  {
    id: '4',
    attributes: { Color: 'Blue', Size: 'Medium' },
    sku: 'PROD-BLUE-M',
    price: 19.99,
    salePrice: 14.99,
    cost: 10.00,
    stock: 20,
    image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Blue+Medium',
    enabled: true,
  },
  {
    id: '5',
    attributes: { Color: 'Green', Size: 'Small' },
    sku: 'PROD-GREEN-S',
    price: 19.99,
    stock: 10,
    enabled: false,
  },
];

export function EnhancedVariationsPage() {
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProduct } = useProducts();
  const [activeTab, setActiveTab] = useState<'variations' | 'attributes'>('variations');
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [attributes, setAttributes] = useState(mockAttributes);
  const [variations, setVariations] = useState(mockVariations);

  useEffect(() => {
    const loadProduct = async () => {
      if (productId) {
        try {
          setLoading(true);
          const productData = await getProduct(productId);
          setProduct(productData);
        } catch (error) {
          console.error('Failed to load product:', error);
          toast({
            title: "Error",
            description: "Failed to load product information.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else {
        // No product ID, we're in the global attributes view
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, getProduct, toast]);

  // Handle variation update
  const handleVariationUpdate = async (variation: any) => {
    // In a real app, you would call an API to update the variation
    setVariations(variations.map(v => v.id === variation.id ? variation : v));
    return Promise.resolve();
  };

  // Handle bulk update
  const handleBulkUpdate = async (variationIds: string[], field: string, value: any) => {
    // In a real app, you would call an API to update multiple variations
    setVariations(variations.map(v =>
      variationIds.includes(v.id) ? { ...v, [field]: value } : v
    ));
    return Promise.resolve();
  };

  // Handle variation delete
  const handleVariationDelete = async (variationId: string) => {
    // In a real app, you would call an API to delete the variation
    setVariations(variations.filter(v => v.id !== variationId));
    return Promise.resolve();
  };

  // Handle variation image upload
  const handleVariationImageUpload = async (variationId: string, file: File) => {
    // In a real app, you would upload the file to a server and get a URL
    // For now, we'll just use a placeholder
    return Promise.resolve(`https://via.placeholder.com/150?text=${file.name}`);
  };

  // Handle generate variations
  const handleGenerateVariations = async () => {
    // In a real app, you would call an API to generate variations
    // For now, we'll just add a new variation
    const newVariation = {
      id: `${Date.now()}`,
      attributes: { Color: 'Black', Size: 'Large' },
      sku: `PROD-BLACK-L-${Date.now()}`,
      price: 19.99,
      stock: 10,
      enabled: true,
    };

    setVariations([...variations, newVariation]);
    return Promise.resolve();
  };

  // Handle attribute add
  const handleAttributeAdd = async (attribute: any) => {
    // In a real app, you would call an API to add the attribute
    const newAttribute = {
      ...attribute,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAttributes([...attributes, newAttribute]);
    return Promise.resolve();
  };

  // Handle attribute update
  const handleAttributeUpdate = async (id: string, attribute: any) => {
    // In a real app, you would call an API to update the attribute
    setAttributes(attributes.map(attr =>
      attr.id === id
        ? {
            ...attr,
            ...attribute,
            updatedAt: new Date().toISOString()
          }
        : attr
    ));
    return Promise.resolve();
  };

  // Handle attribute delete
  const handleAttributeDelete = async (id: string) => {
    // In a real app, you would call an API to delete the attribute
    setAttributes(attributes.filter(attr => attr.id !== id));
    return Promise.resolve();
  };

  // Handle export
  const handleExport = (format: 'csv' | 'excel') => {
    toast({
      title: `Export as ${format.toUpperCase()}`,
      description: `Data has been exported as ${format.toUpperCase()}.`,
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    toast({
      title: "Data Refreshed",
      description: "The data has been refreshed.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={productId ? `Variations: ${product?.name}` : "Variations & Attributes"}
        description={productId
          ? "Manage variations for this product"
          : "Manage global attributes and variations"
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {productId && (
              <Button variant="outline" onClick={() => navigate(`/products/${productId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Product
              </Button>
            )}
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="variations">
            <Grid className="h-4 w-4 mr-2" />
            {productId ? 'Product Variations' : 'Variations'}
          </TabsTrigger>
          <TabsTrigger value="attributes">
            <Tag className="h-4 w-4 mr-2" />
            {productId ? 'Product Attributes' : 'Global Attributes'}
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Layers className="h-4 w-4 mr-2" />
            Variation Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="variations" className="space-y-6 pt-4">
          {productId ? (
            <VariationMatrix
              productId={productId}
              productName={product?.name || ''}
              basePrice={product?.retailPrice || 0}
              baseCost={product?.costPrice}
              variations={variations}
              attributes={attributes.filter(attr => attr.isUsedForVariations)}
              onVariationUpdate={handleVariationUpdate}
              onBulkUpdate={handleBulkUpdate}
              onVariationDelete={handleVariationDelete}
              onVariationImageUpload={handleVariationImageUpload}
              onGenerateVariations={handleGenerateVariations}
              onExport={handleExport}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg">
              <Grid className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Product</h3>
              <p className="text-muted-foreground mb-4">
                Please select a product to manage its variations.
              </p>
              <Button onClick={() => navigate('/products')}>
                Go to Products
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="attributes" className="space-y-6 pt-4">
          <GlobalAttributesManager
            attributes={attributes}
            onAttributeAdd={handleAttributeAdd}
            onAttributeUpdate={handleAttributeUpdate}
            onAttributeDelete={handleAttributeDelete}
            onExport={handleExport}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6 pt-4">
          <VariationTemplatesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EnhancedVariationsPage;
