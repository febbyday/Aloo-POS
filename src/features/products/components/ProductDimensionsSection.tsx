import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../context/ProductFormContext';

interface ProductDimensionsSectionProps {
  form: UseFormReturn<ProductFormData>;
}

export const ProductDimensionsSection: React.FC<ProductDimensionsSectionProps> = ({
  form,
}) => {
  // Initialize dimensions object if it doesn't exist
  useEffect(() => {
    const dimensions = form.getValues('dimensions');
    if (!dimensions) {
      form.setValue('dimensions', {
        length: 0,
        width: 0,
        height: 0,
        unit: 'cm'
      });
    }
  }, [form]);

  // Helper function to update a specific dimension
  const updateDimension = (dimension: 'length' | 'width' | 'height', value: number) => {
    const currentDimensions = form.getValues('dimensions') || { length: 0, width: 0, height: 0, unit: 'cm' };
    form.setValue('dimensions', {
      ...currentDimensions,
      [dimension]: value
    });
  };

  // Helper function to update the unit
  const updateUnit = (unit: 'cm' | 'in') => {
    const currentDimensions = form.getValues('dimensions') || { length: 0, width: 0, height: 0, unit: 'cm' };
    form.setValue('dimensions', {
      ...currentDimensions,
      unit
    });
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-4 p-4">
          <h3 className="text-lg font-medium">Dimensions & Weight</h3>
          <Separator />

          <div className="grid grid-cols-1 gap-4">
            {/* Weight */}
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : undefined;
                          field.onChange(value);
                        }}
                        step="0.01"
                        min="0"
                        autoComplete="off"
                      />
                      <span className="absolute right-3 top-2.5 text-muted-foreground">kg</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Product weight in kilograms
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dimensions */}
            <div className="space-y-2">
              <FormLabel>Dimensions</FormLabel>
              <div className="grid grid-cols-4 gap-4">
                {/* Length */}
                <div className="space-y-2">
                  <FormLabel className="text-sm text-muted-foreground">Length</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.getValues('dimensions')?.length || 0}
                    onChange={(e) => updateDimension('length', parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    autoComplete="off"
                  />
                </div>

                {/* Width */}
                <div className="space-y-2">
                  <FormLabel className="text-sm text-muted-foreground">Width</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.getValues('dimensions')?.width || 0}
                    onChange={(e) => updateDimension('width', parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    autoComplete="off"
                  />
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <FormLabel className="text-sm text-muted-foreground">Height</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.getValues('dimensions')?.height || 0}
                    onChange={(e) => updateDimension('height', parseFloat(e.target.value) || 0)}
                    step="0.1"
                    min="0"
                    autoComplete="off"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-2">
                  <FormLabel className="text-sm text-muted-foreground">Unit</FormLabel>
                  <Select
                    value={form.getValues('dimensions')?.unit || 'cm'}
                    onValueChange={(value) => updateUnit(value as 'cm' | 'in')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="in">in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <FormDescription>
                Product dimensions in the selected unit
              </FormDescription>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDimensionsSection;
