// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, ProductLocation } from "../types";
import { useState } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash, Upload, Layers, Info, X } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { generateSKU, generateBarcode, generateVariantSKU } from "../utils/productUtils";
import { PreviewProductDialog } from "./PreviewProductDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { VariantManager } from "./VariantManager";
import { TabsContent } from "@/components/ui/tabs";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  product?: Product;
  onSave: (data: Partial<Product>) => void;
}

export function ProductDialog({ 
  open, 
  onOpenChange, 
  mode, 
  product, 
  onSave 
}: ProductDialogProps) {
  const defaultLocations = [
    { locationId: 'store1', stock: 0, minStock: 0, maxStock: 0 },
    { locationId: 'store2', stock: 0, minStock: 0, maxStock: 0 },
    { locationId: 'warehouse', stock: 0, minStock: 0, maxStock: 0 },
  ];

  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || '',
    category: product?.category || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    costPrice: product?.costPrice || 0,
    retailPrice: product?.retailPrice || 0,
    salePrice: product?.salePrice || 0,
    supplier: product?.supplier || { id: '', name: '' },
    locations: product?.locations || [],
    variants: product?.variants || [{ id: '1' }],
    imageUrl: product?.imageUrl || '',
    images: product?.images || [],
    minStock: product?.minStock || 0,
    maxStock: product?.maxStock || 0,
    productType: product?.productType || 'simple',
    status: product?.status || 'draft',
    featured: product?.featured || false,
    catalogVisibility: product?.catalogVisibility || 'visible',
    taxStatus: product?.taxStatus || 'taxable',
    taxClass: product?.taxClass || '',
    weight: product?.weight || 0,
    dimensions: product?.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
    shippingClass: product?.shippingClass || '',
    downloadable: product?.downloadable || false,
    virtual: product?.virtual || false,
    purchaseNote: product?.purchaseNote || '',
    manageStock: product?.manageStock || true,
    stockStatus: product?.stockStatus || 'instock',
    backorders: product?.backorders || 'no',
    backordersAllowed: product?.backordersAllowed || false,
    soldIndividually: product?.soldIndividually || false,
    attributes: product?.attributes || [],
    defaultAttributes: product?.defaultAttributes || [],
    reviewsAllowed: product?.reviewsAllowed || true,
    categories: product?.categories || [],
    tags: product?.tags || [],
    wcStatus: product?.wcStatus || 'pending'
  });

  const [variants, setVariants] = useState<Partial<any>[]>( 
    product?.variants || [{ id: '1', sku: '', barcode: generateBarcode() }]
  );
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
  const [locations, setLocations] = useState<ProductLocation[]>(
    product?.locations || defaultLocations
  );

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'name' || field === 'category') {
      if (formData.name && formData.category) {
        const sku = generateSKU(formData.category, formData.name);
        setFormData(prev => ({ ...prev, sku }));
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        updateFormData('imageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const updatedData = {
      ...formData,
      variants,
      locations,
    };
    onSave(updatedData);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Create New Product' : 'Edit Product'}</DialogTitle>
            <DialogDescription>
              {mode === 'create' ? 'Add a new product to your inventory' : 'Update product information'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
              <FormField>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Enter product name"
                  />
                </FormControl>
              </FormField>

              <FormField>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Enter product description"
                  />
                </FormControl>
              </FormField>

              <FormField>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                    )}
                    <Input type="file" onChange={handleImageUpload} accept="image/*" />
                  </div>
                </FormControl>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField>
                  <FormLabel>Cost Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) => updateFormData('costPrice', parseFloat(e.target.value))}
                    />
                  </FormControl>
                </FormField>

                <FormField>
                  <FormLabel>Retail Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={formData.retailPrice}
                      onChange={(e) => updateFormData('retailPrice', parseFloat(e.target.value))}
                    />
                  </FormControl>
                </FormField>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{mode === 'create' ? 'Create Product' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
