import React, { createContext, useContext, useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProducts } from './ProductContext';
import { useProductHistory } from './ProductHistoryContext';
import { useToastManager } from '@/components/ui/toast-manager';

// Validation schema
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  retailPrice: z.number().positive('Price must be greater than 0'),
  costPrice: z.number().min(0, 'Cost price cannot be negative').optional(),
  salePrice: z.number().min(0, 'Sale price cannot be negative').optional(),
  productType: z.enum(['single', 'variable'], {
    required_error: 'Product type is required',
    invalid_type_error: 'Product type must be single or variable',
  }),
  brand: z.string().optional(),
  description: z.string().optional(),
  supplier: z.object({
    id: z.string(),
    name: z.string()
  }).optional(),
  category: z.string().optional(),
  shortDescription: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Technical fields interface
export interface TechnicalFields {
  sku: string;
  barcode: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

// Context interface
interface ProductFormContextType {
  form: UseFormReturn<ProductFormData>;
  technicalFields: TechnicalFields;
  setTechnicalFields: React.Dispatch<React.SetStateAction<TechnicalFields>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isDescriptionExpanded: boolean;
  setIsDescriptionExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  handleFieldChange: (field: keyof ProductFormData, value: any) => void;
  resetForm: (data?: ProductFormData) => void;
  generateSKU: () => string;
}

// Create context
const ProductFormContext = createContext<ProductFormContextType | undefined>(undefined);

// Provider component
export function ProductFormProvider({ children }: { children: React.ReactNode }) {
  const { trackAction, canUndo, undo, canRedo, redo } = useProductHistory();
  const showToast = useToastManager();
  const [isLoading, setIsLoading] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Technical fields state
  const [technicalFields, setTechnicalFields] = useState<TechnicalFields>({
    sku: '',
    barcode: '',
    createdAt: '',
    updatedAt: '',
    updatedBy: ''
  });

  // Initialize form
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      retailPrice: 0,
      costPrice: 0,
      salePrice: 0,
      brand: '',
      description: '',
      productType: 'single',
    }
  });

  // Track field changes for history
  const handleFieldChange = (field: keyof ProductFormData, value: any) => {
    const oldValue = form.getValues(field);
    form.setValue(field, value);
    
    trackAction(
      {
        type: 'update',
        id: form.getValues('id') || 'new-product',
        field,
        before: { [field]: oldValue },
        after: { [field]: value }
      },
      `Changed ${field}`
    );
  };

  // Reset form with optional data
  const resetForm = (data?: ProductFormData) => {
    if (data) {
      form.reset(data);
    } else {
      form.reset({
        name: '',
        retailPrice: 0,
        costPrice: 0,
        salePrice: 0,
        brand: '',
        description: '',
        productType: 'single',
      });
    }
  };

  // Generate SKU
  const generateSKU = () => {
    const productName = form.getValues('name') || '';
    const category = form.getValues('category') || '';
    const brand = form.getValues('brand') || '';
    
    // Extract first 3 letters of each part
    const namePart = productName.substring(0, 3).toUpperCase();
    const categoryPart = category.substring(0, 3).toUpperCase();
    const brandPart = brand.substring(0, 3).toUpperCase();
    
    // Generate random 4-digit number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    // Combine parts
    const sku = `${categoryPart || 'XXX'}-${brandPart || 'XXX'}-${namePart || 'XXX'}-${randomNum}`;
    
    return sku;
  };

  // Listen for undo/redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey && canRedo) {
          e.preventDefault();
          const action = redo();
          if (action?.type === 'update' && action.field) {
            form.setValue(action.field as any, action.after[action.field]);
            showToast.success('Success', `Redone change to ${action.field}`);
          }
        } else if (canUndo) {
          e.preventDefault();
          const action = undo();
          if (action?.type === 'update' && action.field) {
            form.setValue(action.field as any, action.before[action.field]);
            showToast.success('Success', `Undone change to ${action.field}`);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, form, showToast]);

  return (
    <ProductFormContext.Provider
      value={{
        form,
        technicalFields,
        setTechnicalFields,
        isLoading,
        setIsLoading,
        isDescriptionExpanded,
        setIsDescriptionExpanded,
        handleFieldChange,
        resetForm,
        generateSKU
      }}
    >
      {children}
    </ProductFormContext.Provider>
  );
}

// Hook for using the context
export function useProductForm() {
  const context = useContext(ProductFormContext);
  if (context === undefined) {
    throw new Error('useProductForm must be used within a ProductFormProvider');
  }
  return context;
} 