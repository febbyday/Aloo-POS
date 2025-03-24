/**
 * FormProvider Component
 * 
 * A wrapper around react-hook-form's FormProvider that adds additional functionality
 * such as form error handling, success messages, and loading states.
 * 
 * @module forms/FormProvider
 */

import React, { useId } from 'react';
import { FormProvider as RHFFormProvider, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { UseZodFormReturn } from './useZodForm';

export interface FormProviderProps<TFormValues extends FieldValues> {
  /**
   * The form instance from useZodForm
   */
  form: UseZodFormReturn<TFormValues>;

  /**
   * Children elements
   */
  children: React.ReactNode;

  /**
   * Form submission handler
   */
  onSubmit?: (data: TFormValues) => void | Promise<void>;

  /**
   * CSS classes to apply to the form element
   */
  className?: string;

  /**
   * Form element ID
   */
  id?: string;

  /**
   * Whether to show error messages
   * @default true
   */
  showErrors?: boolean;

  /**
   * Whether to show success messages
   * @default true
   */
  showSuccess?: boolean;

  /**
   * Disable form when submitting
   * @default true 
   */
  disableOnSubmit?: boolean;
  
  /**
   * Position of the form messages
   * @default 'top'
   */
  messagesPosition?: 'top' | 'bottom';
}

/**
 * Enhanced form provider component that wraps react-hook-form's FormProvider
 * and adds functionality for handling form submissions, errors, and success messages.
 * 
 * @example
 * const form = useZodForm({
 *   schema: userSchema,
 *   defaultValues: { name: '', email: '' }
 * });
 * 
 * const handleSubmit = async (data) => {
 *   try {
 *     await saveUser(data);
 *     form.setSuccessMessage('User created successfully');
 *   } catch (error) {
 *     form.setFormError(error.message);
 *   }
 * };
 * 
 * return (
 *   <FormProvider form={form} onSubmit={handleSubmit}>
 *     <FormField name="name" label="Name" />
 *     <FormField name="email" label="Email" />
 *     <Button type="submit">Submit</Button>
 *   </FormProvider>
 * );
 */
export function FormProvider<TFormValues extends FieldValues>({
  form,
  children,
  onSubmit,
  className,
  id,
  showErrors = true,
  showSuccess = true,
  disableOnSubmit = true,
  messagesPosition = 'top',
}: FormProviderProps<TFormValues>) {
  const formId = useId();
  const uniqueId = id || `form-${formId}`;
  
  // Handle form submission
  const handleSubmit = async (data: TFormValues) => {
    if (!onSubmit) return;
    
    try {
      form.clearMessages();
      form.setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      
      if (error instanceof Error) {
        form.setFormError(error.message);
      } else {
        form.setFormError('An unexpected error occurred');
      }
    } finally {
      form.setIsSubmitting(false);
    }
  };
  
  // Render form messages
  const renderMessages = () => {
    if (!showErrors && !showSuccess) return null;
    
    return (
      <>
        {showSuccess && form.successMessage && (
          <Alert className="mb-4 bg-success/10 text-success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{form.successMessage}</AlertDescription>
          </Alert>
        )}
        
        {showErrors && form.formError && (
          <Alert className="mb-4 bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{form.formError}</AlertDescription>
          </Alert>
        )}
      </>
    );
  };
  
  return (
    <RHFFormProvider {...form}>
      <form
        id={uniqueId}
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('space-y-4', className)}
        noValidate
        {...(disableOnSubmit && form.isSubmitting ? { 'aria-disabled': true } : {})}
      >
        {messagesPosition === 'top' && renderMessages()}
        {children}
        {messagesPosition === 'bottom' && renderMessages()}
      </form>
    </RHFFormProvider>
  );
}

export default FormProvider; 