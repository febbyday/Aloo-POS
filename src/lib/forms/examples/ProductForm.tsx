/**
 * Product Form Example
 * 
 * This component demonstrates how to use the form system to create a product form.
 * It includes validation, field components, and form submission handling.
 */

import React from 'react';
import { z } from 'zod';
import { 
  useZodForm, 
  FormProvider, 
  createFormSchema, 
  SchemaCreators,
  ValidationPatterns
} from '../index';

// Define the form schema
const productFormSchema = createFormSchema({
  name: SchemaCreators.string({ 
    required: true, 
    min: 3, 
    max: 100 
  }),
  description: SchemaCreators.string({ 
    required: true, 
    min: 10, 
    max: 500 
  }),
  price: SchemaCreators.price({ 
    required: true, 
    min: 0.01 
  }),
  quantity: SchemaCreators.number({ 
    required: true, 
    integer: true, 
    min: 0 
  }),
  sku: SchemaCreators.string({ 
    required: true, 
    pattern: ValidationPatterns.alphanumeric 
  }),
  category: SchemaCreators.enum(['electronics', 'clothing', 'food', 'other'] as const, { 
    required: true 
  }),
  isActive: SchemaCreators.boolean()
});

// Define the form value type
type ProductFormValues = z.infer<typeof productFormSchema>;

// Mock form field components
// In a real app, these would be proper form field components
const TextField = ({ 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  hasError 
}: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`w-full p-2 border rounded ${hasError ? 'border-red-500' : 'border-gray-300'}`}
    />
    {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const NumberField = ({ 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  hasError 
}: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      onBlur={onBlur}
      className={`w-full p-2 border rounded ${hasError ? 'border-red-500' : 'border-gray-300'}`}
    />
    {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SelectField = ({ 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  hasError,
  options 
}: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={`w-full p-2 border rounded ${hasError ? 'border-red-500' : 'border-gray-300'}`}
    >
      <option value="">Select...</option>
      {options.map((option: string) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    {hasError && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const CheckboxField = ({ 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  hasError 
}: any) => (
  <div className="mb-4 flex items-center">
    <input
      type="checkbox"
      checked={value || false}
      onChange={(e) => onChange(e.target.checked)}
      onBlur={onBlur}
      className={`mr-2 ${hasError ? 'border-red-500' : 'border-gray-300'}`}
    />
    <label className="text-sm font-medium">{label}</label>
    {hasError && <p className="text-red-500 text-xs ml-2">{error}</p>}
  </div>
);

// Create field components with the form field creator
const FormTextField = createFormField({
  component: TextField
});

const FormNumberField = createFormField({
  component: NumberField,
  defaultValueFn: (value) => (value === null || value === undefined) ? '' : value,
  transformValueFn: (value) => (value === '') ? null : value
});

const FormSelectField = createFormField({
  component: SelectField
});

const FormCheckboxField = createFormField({
  component: CheckboxField,
  defaultValueFn: (value) => Boolean(value)
});

/**
 * Props for the ProductForm component
 */
interface ProductFormProps {
  /**
   * Initial form values
   */
  initialValues?: Partial<ProductFormValues>;
  
  /**
   * Whether the form is in edit mode
   */
  isEditMode?: boolean;
  
  /**
   * Submit handler
   */
  onSubmit?: (values: ProductFormValues) => void | Promise<void>;
  
  /**
   * Cancel handler
   */
  onCancel?: () => void;
}

/**
 * ProductForm component
 */
export function ProductForm({
  initialValues,
  isEditMode = false,
  onSubmit,
  onCancel
}: ProductFormProps) {
  // Create form with Zod validation
  const form = useZodForm({
    schema: productFormSchema,
    defaultValues: initialValues,
    mode: 'onBlur'
  });
  
  // Handle form submission
  const handleSubmit = async (values: ProductFormValues) => {
    console.log('Form submitted:', values);
    
    // Call the onSubmit handler if provided
    if (onSubmit) {
      await onSubmit(values);
    }
  };
  
  return (
    <FormProvider
      form={form}
      isEditMode={isEditMode}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormTextField
              name="name"
              label="Product Name"
              required
            />
            
            <FormTextField
              name="description"
              label="Description"
              required
            />
            
            <FormTextField
              name="sku"
              label="SKU"
              required
            />
          </div>
          
          <div>
            <FormNumberField
              name="price"
              label="Price ($)"
              required
            />
            
            <FormNumberField
              name="quantity"
              label="Quantity"
              required
            />
            
            <FormSelectField
              name="category"
              label="Category"
              options={['electronics', 'clothing', 'food', 'other']}
              required
            />
            
            <FormCheckboxField
              name="isActive"
              label="Active Product"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => form.reset()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          
          <button
            type="button"
            onClick={() => form.submit()}
            disabled={form.formState.isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {form.formState.isSubmitting ? 'Submitting...' : isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </FormProvider>
  );
}

export default ProductForm; 