" 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤"

import React, { useState } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { FormBuilder, FormFieldConfig } from './FormBuilder';
import { cn } from '@/lib/utils';

export interface FormDialogProps<T extends FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  form: UseFormReturn<T>;
  fields: FormFieldConfig<T>[];
  onSubmit: (data: T) => void | Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  success?: string | null;
  submitLabel?: string;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  contentClassName?: string;
  showSubmitButton?: boolean;
  showCancelButton?: boolean;
  submitButtonClassName?: string;
  cancelButtonClassName?: string;
  submitButtonDisabled?: boolean;
  formFooter?: React.ReactNode;
  preventCloseOnSuccess?: boolean;
  onSuccess?: () => void;
}

export function FormDialog<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  form,
  fields,
  onSubmit,
  isSubmitting = false,
  error,
  success,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  size = 'md',
  columns = 1,
  className,
  contentClassName,
  showSubmitButton = true,
  showCancelButton = true,
  submitButtonClassName,
  cancelButtonClassName,
  submitButtonDisabled = false,
  formFooter,
  preventCloseOnSuccess = false,
  onSuccess,
}: FormDialogProps<T>) {
  const [internalSuccess, setInternalSuccess] = useState<string | null>(null);

  // Size mapping for dialog content
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw] w-full',
  };

  // Handle form submission
  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data);
      setInternalSuccess('Form submitted successfully');
      
      if (success) {
        setInternalSuccess(success);
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (!preventCloseOnSuccess) {
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    onOpenChange(false);
    setInternalSuccess(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(sizeClasses[size], contentClassName)}
        onInteractOutside={(e) => {
          if (isSubmitting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <FormBuilder
          form={form}
          fields={fields}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
          success={internalSuccess || success}
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
          onCancel={handleClose}
          columns={columns}
          className={className}
          showSubmitButton={showSubmitButton}
          showCancelButton={showCancelButton}
          submitButtonClassName={submitButtonClassName}
          cancelButtonClassName={cancelButtonClassName}
          submitButtonDisabled={submitButtonDisabled}
          formFooter={formFooter}
        />
      </DialogContent>
    </Dialog>
  );
}

export function useFormDialog<T extends FieldValues>(form: UseFormReturn<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const openDialog = () => {
    setIsOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setError(null);
    setSuccess(null);
    form.reset();
  };

  const handleSubmit = async (submitFn: (data: T) => Promise<void>) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const values = form.getValues();
      await submitFn(values as T);
      setSuccess('Form submitted successfully');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    openDialog,
    closeDialog,
    isSubmitting,
    setIsSubmitting,
    error,
    setError,
    success,
    setSuccess,
    handleSubmit,
  };
}
