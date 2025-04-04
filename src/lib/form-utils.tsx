import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

/**
 * Helper function to determine the appropriate autocomplete attribute based on field name and type
 */
function getDefaultAutoComplete(fieldName: string, fieldType: FieldType): string {
  const name = fieldName.toLowerCase();

  // Handle common field names
  if (name === 'email' || name.includes('email')) return 'email';
  if (name === 'username' || name === 'userid') return 'username';
  if (name === 'password' || name.includes('password')) return fieldType === 'password' ? 'current-password' : 'off';
  if (name === 'newpassword') return 'new-password';
  if (name === 'firstname' || name === 'fname' || name.includes('firstname')) return 'given-name';
  if (name === 'lastname' || name === 'lname' || name.includes('lastname')) return 'family-name';
  if (name === 'fullname' || name === 'name') return 'name';
  if (name === 'phone' || name.includes('phone') || name.includes('tel')) return 'tel';
  if (name === 'address' || name.includes('street')) return 'street-address';
  if (name === 'city') return 'address-level2';
  if (name === 'state' || name === 'province') return 'address-level1';
  if (name === 'zip' || name === 'zipcode' || name === 'postalcode') return 'postal-code';
  if (name === 'country') return 'country-name';
  if (name.includes('cardnumber') || name.includes('ccnumber')) return 'cc-number';
  if (name.includes('cardname') || name.includes('ccname')) return 'cc-name';
  if (name.includes('cardexp') || name.includes('ccexp')) return 'cc-exp';
  if (name.includes('cardcvv') || name.includes('cccvv') || name.includes('cvv')) return 'cc-csc';

  // Handle field types
  if (fieldType === 'password') return 'new-password';
  if (fieldType === 'email') return 'email';

  // Default to off for fields we don't recognize
  return 'off';
}

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

export interface FormFieldConfig<T extends FieldValues> {
  name: keyof T & string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  min?: number;
  max?: number;
  rows?: number;
  autoComplete?: string;
  customField?: (form: UseFormReturn<T>) => React.ReactNode;
  gridSpan?: 1 | 2 | 3 | 4;
  condition?: (values: T) => boolean;
}

export interface FormConfig<T extends FieldValues> {
  fields: FormFieldConfig<T>[];
  defaultValues: DefaultValues<T>;
  schema: z.ZodType<any, any>;
  onSubmit: SubmitHandler<T>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function GenericForm<T extends FieldValues>({
  fields,
  defaultValues,
  schema,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  loading = false,
  error,
  columns = 1,
  className,
}: FormConfig<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const renderField = (field: FormFieldConfig<T>, form: UseFormReturn<T>) => {
    const values = form.getValues();

    // Check if field should be conditionally hidden
    if (field.condition && !field.condition(values)) {
      return null;
    }

    if (field.hidden) {
      return null;
    }

    if (field.type === 'custom' && field.customField) {
      return field.customField(form);
    }

    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem className={field.gridSpan ? `col-span-${field.gridSpan}` : ''}>
            <FormLabel>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</FormLabel>
            <FormControl>
              {field.type === 'text' || field.type === 'email' || field.type === 'password' || field.type === 'number' ? (
                <Input
                  {...formField}
                  type={field.type}
                  placeholder={field.placeholder}
                  disabled={field.disabled || loading}
                  min={field.min}
                  max={field.max}
                  autoComplete={field.autoComplete || getDefaultAutoComplete(field.name, field.type)}
                  onChange={e => {
                    if (field.type === 'number') {
                      formField.onChange(e.target.value === '' ? '' : Number(e.target.value));
                    } else {
                      formField.onChange(e);
                    }
                  }}
                />
              ) : field.type === 'textarea' ? (
                <Textarea
                  {...formField}
                  placeholder={field.placeholder}
                  disabled={field.disabled || loading}
                  rows={field.rows || 3}
                  autoComplete={field.autoComplete || 'off'}
                />
              ) : field.type === 'select' ? (
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={String(formField.value)}
                  disabled={field.disabled || loading}
                  name={field.name.toString()}
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
                  disabled={field.disabled || loading}
                />
              ) : field.type === 'switch' ? (
                <Switch
                  checked={formField.value}
                  onCheckedChange={formField.onChange}
                  disabled={field.disabled || loading}
                />
              ) : field.type === 'date' ? (
                <Input
                  {...formField}
                  type="date"
                  disabled={field.disabled || loading}
                  value={formField.value ? new Date(formField.value).toISOString().split('T')[0] : ''}
                />
              ) : null}
            </FormControl>
            {field.description && <FormDescription>{field.description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4 mb-6`}>
          {fields.map((field) => renderField(field, form))}
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export interface FormDialogProps<T extends FieldValues> extends FormConfig<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function FormDialog<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  ...formProps
}: FormDialogProps<T>) {
  const handleCancel = () => {
    onOpenChange(false);
    if (formProps.onCancel) {
      formProps.onCancel();
    }
  };

  const handleSubmit: SubmitHandler<T> = (data) => {
    formProps.onSubmit(data);
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <GenericForm
          {...formProps}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          className="mt-4"
        />
      </DialogContent>
    </Dialog>
  );
}

export function useFormDialog<T extends FieldValues>(
  defaultValues: DefaultValues<T>,
  onSubmit: SubmitHandler<T>
) {
  const [open, setOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<DefaultValues<T>>(defaultValues);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit: SubmitHandler<T> = async (data) => {
    setLoading(true);
    setError(undefined);

    try {
      await onSubmit(data);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (values?: DefaultValues<T>) => {
    setInitialValues(values || defaultValues);
    setError(undefined);
    setOpen(true);
  };

  return {
    open,
    setOpen,
    initialValues,
    error,
    loading,
    openDialog,
    handleSubmit
  };
}
