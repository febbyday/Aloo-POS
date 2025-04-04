import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../context/ProductFormContext';

interface ProductInventorySectionProps {
  form: UseFormReturn<ProductFormData>;
}

export const ProductInventorySection: React.FC<ProductInventorySectionProps> = ({
  form,
}) => {
  // Cross-field validation for inventory
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only run this validation when inventory fields change
      if (name === 'minStock' || name === 'maxStock') {
        const minStock = value.minStock as number | undefined;
        const maxStock = value.maxStock as number | undefined;

        // Validate min stock is less than max stock
        if (minStock !== undefined && maxStock !== undefined && minStock > maxStock) {
          form.setError('minStock', {
            type: 'manual',
            message: 'Min stock must be less than max stock'
          });
        } else if (name === 'minStock' || name === 'maxStock') {
          form.clearErrors('minStock');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-4 p-4">
          <h3 className="text-lg font-medium">Inventory</h3>
          <Separator />

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Stock */}
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        min="0"
                        step="1"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription>
                      Current quantity in stock
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Min Stock */}
              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        min="0"
                        step="1"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription>
                      Low stock alert threshold
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Stock */}
              <FormField
                control={form.control}
                name="maxStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        value={field.value || 100}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                        min="0"
                        step="1"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum stock capacity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Track Inventory */}
            <FormField
              control={form.control}
              name="trackInventory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value !== false}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Enable inventory tracking
                    </FormLabel>
                    <FormDescription>
                      Track stock levels and get low stock alerts
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="p-4 bg-muted/30 rounded-md">
              <p className="text-sm text-muted-foreground">SKU and barcode will be generated automatically.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductInventorySection;
