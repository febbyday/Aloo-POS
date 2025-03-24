" 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤"

import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { useForm, UseFormReturn, FieldValues, DefaultValues, SubmitHandler, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';

/**
 * Enhanced form builder hook that provides a comprehensive API for form management
 * 
 * @param options Configuration options for the form
 * @returns Form utilities and state
 */
export function useFormBuilder<T extends FieldValues>({
  defaultValues,
  schema,
  onSubmit,
  resetOnSubmit = false,
  validateOnChange = false,
  validateOnBlur = true,
}: {
  defaultValues: DefaultValues<T>;
  schema: z.ZodType<any, any>;
  onSubmit: SubmitHandler<T>;
  resetOnSubmit?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Initialize the form with react-hook-form
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: validateOnChange ? 'onChange' : validateOnBlur ? 'onBlur' : 'onSubmit',
  });

  // Handle form submission
  const handleSubmit = useCallback(async (data: T) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await onSubmit(data);
      setSubmitSuccess('Form submitted successfully');
      
      if (resetOnSubmit) {
        form.reset(defaultValues);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred during submission');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onSubmit, resetOnSubmit, defaultValues]);

  // Reset form with optional new values
  const resetForm = useCallback((newValues?: DefaultValues<T>) => {
    form.reset(newValues || defaultValues);
    setSubmitError(null);
    setSubmitSuccess(null);
  }, [form, defaultValues]);

  // Clear form status
  const clearStatus = useCallback(() => {
    setSubmitError(null);
    setSubmitSuccess(null);
  }, []);

  // Set custom error
  const setCustomError = useCallback((error: string) => {
    setSubmitError(error);
  }, []);

  // Set custom success message
  const setCustomSuccess = useCallback((message: string) => {
    setSubmitSuccess(message);
  }, []);

  // Set field errors manually
  const setFieldErrors = useCallback((errors: Record<string, string>) => {
    Object.entries(errors).forEach(([field, message]) => {
      form.setError(field as any, {
        type: 'manual',
        message,
      });
    });
  }, [form]);

  // Get form values
  const getValues = useCallback(() => {
    return form.getValues();
  }, [form]);

  // Watch specific fields
  const watchFields = useCallback((fields: Array<keyof T>) => {
    return form.watch(fields as any);
  }, [form]);

  return {
    form,
    isSubmitting,
    submitError,
    submitSuccess,
    handleSubmit: form.handleSubmit(handleSubmit),
    resetForm,
    clearStatus,
    setCustomError,
    setCustomSuccess,
    setFieldErrors,
    getValues,
    watchFields,
    formState: form.formState,
  };
}

export type FormBuilderReturn<T extends FieldValues> = ReturnType<typeof useFormBuilder<T>>;
