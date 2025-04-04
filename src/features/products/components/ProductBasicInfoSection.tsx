import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../context/ProductFormContext';
import { ProductType } from '../types/unified-product.types';

interface ProductBasicInfoSectionProps {
  form: UseFormReturn<ProductFormData>;
  suppliers: Array<{ id: string; name: string }>;
  loadingSuppliers: boolean;
}

export const ProductBasicInfoSection: React.FC<ProductBasicInfoSectionProps> = ({
  form,
  suppliers,
  loadingSuppliers,
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-4 p-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter product name" 
                      {...field} 
                      autoComplete="product-name"
                    />
                  </FormControl>
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Audio">Audio</SelectItem>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Lighting">Lighting</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input 
                      placeholder="Enter brand name" 
                      {...field} 
                      value={field.value || ''}
                      autoComplete="organization"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Supplier */}
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const supplier = suppliers.find(s => s.id === value);
                      if (supplier) {
                        field.onChange({ id: supplier.id, name: supplier.name });
                      }
                    }}
                    value={field.value?.id}
                    disabled={loadingSuppliers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingSuppliers ? "Loading suppliers..." : "Select supplier"} />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormLabel>Product Type <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ProductType.SIMPLE}>Simple Product</SelectItem>
                      <SelectItem value={ProductType.VARIABLE}>Variable Product</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description - Full Width */}
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter detailed product description"
                        className="min-h-32 resize-y"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Short Description - Full Width */}
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter short product description"
                        className="min-h-20 resize-y"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief summary that appears in product listings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductBasicInfoSection;
