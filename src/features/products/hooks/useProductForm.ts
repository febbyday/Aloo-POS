/**
 * Product Form Hook
 * 
 * This hook provides form handling for product creation and editing.
 * It uses React Hook Form with Zod validation.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  UnifiedProduct, 
  ProductFormData, 
  UnifiedProductSchema,
  ProductType,
  ProductStatus,
  StockStatus
} from '../types/unified-product.types';
import { useProductOperations } from './useProductOperations';

/**
 * Default values for a new product
 */
const defaultValues: Partial<ProductFormData> = {
  name: '',
  description: '',
  shortDescription: '',
  category: '',
  productType: ProductType.SIMPLE,
  status: ProductStatus.DRAFT,
  retailPrice: 0,
  stock: 0,
  minStock: 0,
  maxStock: 0,
  stockStatus: StockStatus.IN_STOCK,
  manageStock: true,
  images: [],
};

/**
 * Hook for product form handling
 */
export function useProductForm(initialData?: Partial<UnifiedProduct>) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Get product operations
  const { createProduct, updateProduct } = useProductOperations();
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<ProductFormData>({
    resolver: zodResolver(UnifiedProductSchema),
    defaultValues: initialData ? {
      ...defaultValues,
      ...initialData,
    } : defaultValues,
  });
  
  /**
   * Handle form submission
   */
  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (initialData?.id) {
        // Update existing product
        await updateProduct(initialData.id, data);
      } else {
        // Create new product
        await createProduct(data);
      }
      
      setSuccess(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product';
      setError(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * Reset the form to initial values
   */
  const resetForm = () => {
    form.reset(initialData ? {
      ...defaultValues,
      ...initialData,
    } : defaultValues);
    setError(null);
    setSuccess(false);
  };
  
  /**
   * Set a specific field value
   */
  const setFieldValue = (field: keyof ProductFormData, value: any) => {
    form.setValue(field, value);
  };
  
  /**
   * Set multiple field values
   */
  const setFieldValues = (values: Partial<ProductFormData>) => {
    Object.entries(values).forEach(([field, value]) => {
      form.setValue(field as keyof ProductFormData, value);
    });
  };
  
  /**
   * Get the current form values
   */
  const getFormValues = (): ProductFormData => {
    return form.getValues();
  };
  
  /**
   * Check if the form is dirty (has changes)
   */
  const isDirty = (): boolean => {
    return form.formState.isDirty;
  };
  
  /**
   * Check if the form has validation errors
   */
  const hasErrors = (): boolean => {
    return Object.keys(form.formState.errors).length > 0;
  };
  
  /**
   * Get all form errors
   */
  const getErrors = () => {
    return form.formState.errors;
  };
  
  return {
    // Form state
    form,
    saving,
    error,
    success,
    
    // Form actions
    onSubmit: form.handleSubmit(onSubmit),
    resetForm,
    setFieldValue,
    setFieldValues,
    getFormValues,
    isDirty,
    hasErrors,
    getErrors,
    
    // Form helpers
    register: form.register,
    control: form.control,
    formState: form.formState,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
    trigger: form.trigger,
  };
}

export default useProductForm; 