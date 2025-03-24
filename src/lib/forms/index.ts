/**
 * Form System
 * 
 * This module exports all components and utilities for the form system.
 * It provides a comprehensive set of tools for building type-safe,
 * accessible forms with validation and error handling.
 * 
 * @module forms
 */

// Core hooks and components
export { default as useZodForm } from './useZodForm';
export type { UseZodFormProps, UseZodFormReturn } from './useZodForm';

export { default as FormProvider } from './FormProvider';
export type { FormProviderProps } from './FormProvider';

// Schema utilities
export { default as createFormSchema, SchemaCreators } from './createFormSchema';

// Form field utilities
export { default as createFormField } from './createFormField';
export type { 
  FormFieldBaseProps,
  FormFieldComponentBaseProps,
  FormFieldProps,
  CreateFormFieldConfig
} from './createFormField';

// Re-export zod for convenience
export { z } from 'zod';

/**
 * Default export with all form utilities
 */
export default {
  createFormSchema,
  createFormField,
  FormProvider,
  useZodForm,
  useFormContext
}; 