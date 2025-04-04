import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../context/ProductFormContext';
import { FieldHelpTooltip } from "@/components/ui/help-tooltip";

interface ProductPricingSectionProps {
  form: UseFormReturn<ProductFormData>;
}

export const ProductPricingSection: React.FC<ProductPricingSectionProps> = ({
  form,
}) => {
  // Cross-field validation for pricing
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only run this validation when price fields change
      if (name === 'retailPrice' || name === 'salePrice' || name === 'costPrice') {
        const retailPrice = value.retailPrice as number;
        const salePrice = value.salePrice as number | undefined;
        const costPrice = value.costPrice as number | undefined;

        // Validate sale price is less than retail price
        if (salePrice && retailPrice && salePrice >= retailPrice) {
          form.setError('salePrice', {
            type: 'manual',
            message: 'Sale price must be less than retail price'
          });
        } else if (name === 'salePrice' || name === 'retailPrice') {
          form.clearErrors('salePrice');
        }

        // Validate cost price is less than retail price
        if (costPrice && retailPrice && costPrice >= retailPrice) {
          form.setError('costPrice', {
            type: 'manual',
            message: 'Cost price should be less than retail price'
          });
        } else if (name === 'costPrice' || name === 'retailPrice') {
          form.clearErrors('costPrice');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-4 p-4">
          <h3 className="text-lg font-medium">Pricing</h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Retail Price */}
            <FormField
              control={form.control}
              name="retailPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retail Price <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        type="number"
                        className="pl-6"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0.01"
                        autoComplete="transaction-amount"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    The regular price customers will pay
                  </FormDescription>
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
                  <FormLabel>
                    Cost Price
                    <FieldHelpTooltip content="The price you pay to acquire this product" />
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        type="number"
                        className="pl-6"
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
                    </div>
                  </FormControl>
                  <FormDescription>
                    Used to calculate profit margins
                  </FormDescription>
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
                  <FormLabel>
                    Sale Price
                    <FieldHelpTooltip content="Special promotional price" />
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        type="number"
                        className="pl-6"
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
                    </div>
                  </FormControl>
                  <FormDescription>
                    Must be less than the retail price
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPricingSection;
