/**
 * useZodForm Hook
 * 
 * A custom hook that integrates React Hook Form with Zod validation.
 * This hook provides a type-safe way to use form validation and state management.
 * 
 * @module forms/useZodForm
 */

import { useState, useCallback } from 'react';
import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldValues,
  DefaultValues,
  Path,
  FieldPath,
  FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * Extends the React Hook Form props with a Zod schema for type-safe validation
 */
export interface UseZodFormProps<TFormValues extends FieldValues> extends Omit<UseFormProps<TFormValues>, 'resolver'> {
  schema: z.ZodType<TFormValues>;
}

/**
 * Extended return type for useZodForm with additional utilities
 */
export interface UseZodFormReturn<TFormValues extends FieldValues> extends UseFormReturn<TFormValues> {
  /**
   * The success message after form submission
   */
  successMessage: string | null;
  
  /**
   * Sets a success message
   */
  setSuccessMessage: (message: string | null) => void;
  
  /**
   * Sets a custom error for a specific field
   */
  setFieldError: (field: Path<TFormValues>, error: string) => void;
  
  /**
   * Sets a custom error for the whole form
   */
  setFormError: (error: string) => void;
  
  /**
   * Clears all form messages (success and errors)
   */
  clearMessages: () => void;
  
  /**
   * Indicates if the form is currently submitting
   */
  isSubmitting: boolean;
  
  /**
   * Sets the submitting state
   */
  setIsSubmitting: (isSubmitting: boolean) => void;
  
  /**
   * A general error message for the form
   */
  formError: string | null;
}

/**
 * A hook to create a form with Zod schema validation using react-hook-form.
 * 
 * @param props Form configuration including the Zod schema
 * @returns Enhanced form utilities including success/error handling
 * 
 * @example
 * const schema = z.object({
 *   name: z.string().min(2),
 *   email: z.string().email(),
 * });
 * 
 * const form = useZodForm({
 *   schema,
 *   defaultValues: { name: '', email: '' },
 * });
 * 
 * const onSubmit = (data) => {
 *   // Handle form submission
 * };
 * 
 * // In your component
 * <form onSubmit={form.handleSubmit(onSubmit)}>
 *   <input {...form.register('name')} />
 *   {form.formState.errors.name && <p>{form.formState.errors.name.message}</p>}
 * </form>
 */
export function useZodForm<TFormValues extends FieldValues>({
  schema,
  defaultValues,
  ...formProps
}: UseZodFormProps<TFormValues>): UseZodFormReturn<TFormValues> {
  // Create the form with Zod resolver
  const form = useForm<TFormValues>({
    ...formProps,
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Additional state for success/error messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Set a custom error for a specific field
   */
  const setFieldError = useCallback(
    (field: Path<TFormValues>, error: string) => {
      form.setError(field as FieldPath<TFormValues>, {
        type: 'manual',
        message: error,
      });
    },
    [form]
  );

  /**
   * Clear all form messages (success and errors)
   */
  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setFormError(null);
  }, []);

  // Return the extended form utilities
  return {
    ...form,
    successMessage,
    setSuccessMessage,
    setFieldError,
    setFormError,
    clearMessages,
    isSubmitting,
    setIsSubmitting,
    formError,
  };
}

export default useZodForm; 