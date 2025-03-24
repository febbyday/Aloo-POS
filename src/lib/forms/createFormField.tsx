/**
 * Form Field Creator
 * 
 * Utility for creating type-safe form field components that integrate with react-hook-form.
 * This provides consistent interface and behavior for all form fields.
 * 
 * @module forms/createFormField
 */

import React from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";

/**
 * Base properties for all form field components
 */
export interface FormFieldBaseProps {
  /**
   * Field label
   */
  label?: string;

  /**
   * Help text or description
   */
  description?: string;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Whether the field is disabled
   */
  disabled?: boolean;

  /**
   * CSS class for the field
   */
  className?: string;

  /**
   * Whether the field is read-only
   */
  readOnly?: boolean;

  /**
   * Field placeholder
   */
  placeholder?: string;

  /**
   * Data attributes
   */
  [key: `data-${string}`]: string | undefined;
}

/**
 * Base component props received from Controller
 */
export interface FormFieldComponentBaseProps<T = any> {
  /**
   * Field value
   */
  value: T;

  /**
   * Change handler
   */
  onChange: (value: T) => void;

  /**
   * Blur handler
   */
  onBlur: () => void;

  /**
   * Field name
   */
  name: string;

  /**
   * Field ID
   */
  id: string;

  /**
   * Whether the field has an error
   */
  hasError: boolean;

  /**
   * Error message
   */
  error?: string;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
}

/**
 * Configuration for creating a form field component
 */
export interface CreateFormFieldConfig<
  TFieldValue = any,
  TComponentProps extends Record<string, any> = {}
> {
  /**
   * The field component that handles rendering
   */
  component: React.ComponentType<
    FormFieldComponentBaseProps<TFieldValue> & TComponentProps
  >;

  /**
   * Function to transform the value before passing to the field
   */
  transformValue?: (value: any) => TFieldValue;

  /**
   * Function to transform the value after change
   */
  transformOnChange?: (value: TFieldValue) => any;

  /**
   * Function to provide a default value if undefined
   */
  defaultValueFn?: (value: any) => TFieldValue;
}

/**
 * Properties for the created form field component
 */
export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TComponentProps extends Record<string, any> = {}
> = Omit<ControllerProps<TFieldValues, TFieldName>, "render"> &
  FormFieldBaseProps &
  TComponentProps;

/**
 * Creates a type-safe form field component
 * 
 * @example
 * const TextField = createFormField({
 *   component: ({ label, value, onChange, onBlur, error, hasError, ...props }) => (
 *     <div>
 *       {label && <label>{label}</label>}
 *       <input
 *         value={value}
 *         onChange={(e) => onChange(e.target.value)}
 *         onBlur={onBlur}
 *         className={hasError ? "error" : ""}
 *         {...props}
 *       />
 *       {hasError && <p className="error">{error}</p>}
 *     </div>
 *   )
 * });
 * 
 * // Usage
 * <TextField name="firstName" label="First Name" required />
 */
export function createFormField<
  TFieldValue = any,
  TComponentProps extends Record<string, any> = {}
>({
  component: Component,
  transformValue,
  transformOnChange,
  defaultValueFn,
}: CreateFormFieldConfig<TFieldValue, TComponentProps>) {
  // Return a function component that accepts field props
  function FormField<
    TFieldValues extends FieldValues = FieldValues,
    TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  >({
    name,
    control,
    label,
    description,
    rules,
    shouldUnregister,
    defaultValue,
    disabled,
    required,
    ...rest
  }: FormFieldProps<TFieldValues, TFieldName, TComponentProps>) {
    // Access the form context to get the control if not provided
    const formContext = useFormContext<TFieldValues>();
    
    if (!control && !formContext) {
      throw new Error(
        "FormField must be used within a FormProvider or be provided a control prop"
      );
    }
    
    // Use either the provided control or the one from context
    const controlToUse = control || formContext.control;
    
    // Generate a stable ID for the field
    const id = `field-${name}`;
    
    return (
      <Controller
        name={name}
        control={controlToUse}
        rules={{ required: required ? "This field is required" : false, ...rules }}
        shouldUnregister={shouldUnregister}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => {
          // Handle value transformations
          let value = field.value;
          
          // Apply default value function if value is undefined
          if ((value === undefined || value === null) && defaultValueFn) {
            value = defaultValueFn(value);
          }
          
          // Apply value transformation if provided
          if (transformValue) {
            value = transformValue(value);
          }
          
          // Create change handler with optional transformation
          const handleChange = (newValue: TFieldValue) => {
            const transformedValue = transformOnChange
              ? transformOnChange(newValue)
              : newValue;
            field.onChange(transformedValue);
          };
          
          return (
            <Component
              {...(rest as TComponentProps)}
              id={id}
              name={field.name}
              value={value}
              onChange={handleChange}
              onBlur={field.onBlur}
              ref={field.ref}
              disabled={disabled}
              required={required}
              hasError={!!fieldState.error}
              error={fieldState.error?.message}
              label={label}
              description={description}
            />
          );
        }}
      />
    );
  }
  
  // Add display name for better debugging
  FormField.displayName = "FormField";
  
  return FormField;
}

export default createFormField; 