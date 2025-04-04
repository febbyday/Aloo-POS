import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, Save, Trash2, Plus, XCircle } from "lucide-react";
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData } from '../context/ProductFormContext';
import { ProductStatus } from '../types/unified-product.types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ProductFormSidebarProps {
  form: UseFormReturn<ProductFormData>;
  onPreview: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isEdit?: boolean;
}

export const ProductFormSidebar: React.FC<ProductFormSidebarProps> = ({
  form,
  onPreview,
  onDelete,
  onCancel,
  onSubmit,
  isLoading,
  isEdit = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Status */}
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

      {/* Product Image */}
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

      {/* Actions */}
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
              onClick={onPreview}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            
            {/* Save Product Button */}
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isLoading}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : isEdit ? 'Update Product' : 'Save Product'}
            </Button>
            
            {/* Cancel Button */}
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>

            {/* Delete Button - Only show for edit mode */}
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Product
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductFormSidebar;
