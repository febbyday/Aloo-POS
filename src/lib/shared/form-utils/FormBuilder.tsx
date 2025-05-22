" 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤"

import React from 'react';
import { z } from 'zod';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'custom';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormFieldConfig<T extends FieldValues> {
  name: keyof T & string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  className?: string;
  labelClassName?: string;
  controlClassName?: string;
  render?: (field: any, form: UseFormReturn<T>) => React.ReactNode;
  hidden?: boolean;
  autoFocus?: boolean;
  defaultChecked?: boolean;
}

export interface FormBuilderProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  fields: FormFieldConfig<T>[];
  onSubmit: (data: T) => void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string | null;
  success?: string | null;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  showSubmitButton?: boolean;
  showCancelButton?: boolean;
  submitButtonClassName?: string;
  cancelButtonClassName?: string;
  submitButtonDisabled?: boolean;
  formFooter?: React.ReactNode;
}

export function FormBuilder<T extends FieldValues>({
  form,
  fields,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  isSubmitting = false,
  error,
  success,
  columns = 1,
  className,
  showSubmitButton = true,
  showCancelButton = true,
  submitButtonClassName,
  cancelButtonClassName,
  submitButtonDisabled = false,
  formFooter,
}: FormBuilderProps<T>) {
  // Generate grid columns class based on the columns prop with improved responsive behavior
  const gridClass = {
    1: 'space-y-4',
    2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    4: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  }[columns];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-6", className)}>
        <div className={gridClass}>
          {fields.map((field) => {
            if (field.hidden) return null;

            return (
              <FormField
                key={field.name as string}
                control={form.control}
                name={field.name as string}
                render={({ field: formField }) => (
                  <FormItem className={field.className}>
                    <FormLabel className={field.labelClassName}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <FormControl className={field.controlClassName}>
                      {field.type === 'custom' && field.render ? (
                        field.render(formField, form)
                      ) : field.type === 'textarea' ? (
                        <Textarea
                          {...formField}
                          placeholder={field.placeholder}
                          disabled={field.disabled || isSubmitting}
                          rows={field.rows || 3}
                          autoFocus={field.autoFocus}
                        />
                      ) : field.type === 'select' ? (
                        <Select
                          value={formField.value}
                          onValueChange={formField.onChange}
                          disabled={field.disabled || isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === 'checkbox' ? (
                        <Checkbox
                          checked={formField.value}
                          onCheckedChange={formField.onChange}
                          disabled={field.disabled || isSubmitting}
                          defaultChecked={field.defaultChecked}
                        />
                      ) : field.type === 'switch' ? (
                        <Switch
                          checked={formField.value}
                          onCheckedChange={formField.onChange}
                          disabled={field.disabled || isSubmitting}
                          defaultChecked={field.defaultChecked}
                        />
                      ) : field.type === 'number' ? (
                        <Input
                          {...formField}
                          type="number"
                          placeholder={field.placeholder}
                          disabled={field.disabled || isSubmitting}
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          autoFocus={field.autoFocus}
                        />
                      ) : (
                        <Input
                          {...formField}
                          type={field.type}
                          placeholder={field.placeholder}
                          disabled={field.disabled || isSubmitting}
                          autoFocus={field.autoFocus}
                        />
                      )}
                    </FormControl>
                    {field.description && <FormDescription>{field.description}</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:space-x-2">
          {formFooter}

          {showCancelButton && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className={cn("w-full sm:w-auto", cancelButtonClassName)}
            >
              {cancelLabel}
            </Button>
          )}

          {showSubmitButton && (
            <Button
              type="submit"
              disabled={isSubmitting || submitButtonDisabled}
              className={cn("w-full sm:w-auto", submitButtonClassName)}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
