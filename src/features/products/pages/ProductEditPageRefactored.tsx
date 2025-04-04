import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useToast } from '@/components/ui/use-toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { useProductForm, ProductFormData } from '../context/ProductFormContext';
import { PRODUCTS_FULL_ROUTES } from '@/routes/productRoutes';
import { ProductEditPreview } from '../components/ProductPreview';
import { useShops } from '@/features/shops/hooks/useShops';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
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

// Import our new components
import ProductFormHeader from '../components/ProductFormHeader';
import ProductFormSidebar from '../components/ProductFormSidebar';
import ProductBasicInfoSection from '../components/ProductBasicInfoSection';
import ProductPricingSection from '../components/ProductPricingSection';
import ProductDimensionsSection from '../components/ProductDimensionsSection';
import ProductInventorySection from '../components/ProductInventorySection';
import ProductStoreSection from '../components/ProductStoreSection';
import ProductVariationsSection from '../components/ProductVariationsSection';

export function ProductEditPageRefactored() {
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
              shortDescription: productData.shortDescription || '',
              productType: productData.productType || 'single',
              category: productData.category || '',
              supplier: productData.supplier || undefined,
              stock: productData.stock || 0,
              minStock: productData.minStock || 0,
              maxStock: productData.maxStock || 100,
              trackInventory: productData.trackInventory !== false,
              status: productData.status || 'active',
              featured: productData.featured || false,
              weight: productData.weight || 0,
              dimensions: productData.dimensions || {
                length: 0,
                width: 0,
                height: 0,
                unit: 'cm'
              }
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
      {/* Page Header */}
      <ProductFormHeader
        title="Edit Product"
        description="Update product information"
        form={form}
        onSubmit={onSubmit}
        onBack={() => navigate(PRODUCTS_FULL_ROUTES.LIST)}
        onDelete={() => setDeleteDialogOpen(true)}
        isEdit={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Basic Information */}
          <ProductBasicInfoSection
            form={form}
            suppliers={suppliers || []}
            loadingSuppliers={loadingSuppliers}
          />

          {/* Pricing */}
          <ProductPricingSection form={form} />

          {/* Dimensions & Weight */}
          <ProductDimensionsSection form={form} />

          {/* Inventory */}
          <ProductInventorySection form={form} />

          {/* Store Availability */}
          <ProductStoreSection
            form={form}
            stores={stores || []}
            loadingStores={loadingStores}
            product={product}
            setProduct={setProduct}
          />

          {/* Attributes & Variations - Only shown for variable products */}
          {form.watch('productType') === 'variable' && (
            <ProductVariationsSection
              form={form}
              product={product}
              setProduct={setProduct}
              generateVariations={generateVariations}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ProductFormSidebar
            form={form}
            onPreview={() => setPreviewOpen(true)}
            onDelete={() => setDeleteDialogOpen(true)}
            onCancel={() => navigate(PRODUCTS_FULL_ROUTES.LIST)}
            onSubmit={form.handleSubmit(onSubmit)}
            isLoading={isLoading}
            isEdit={true}
          />
        </div>
      </div>

      {/* Preview Dialog */}
      <ProductEditPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        product={product}
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
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ProductEditPageRefactored;
