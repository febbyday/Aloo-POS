# Form System Examples

This directory contains examples of how to use the form system in the POS application.

## Product Form Example

The `ProductForm.tsx` file demonstrates how to create a form with the following features:

1. **Schema-based Validation**: Using Zod schemas to define form fields and validation rules
2. **Type Safety**: Leveraging TypeScript for full type safety with form values
3. **Field Components**: Using the form field creator to wrap UI components with form functionality
4. **Form Context**: Using the form provider to manage form state and submission

## Key Features Demonstrated

### 1. Schema Definition

```typescript
const productFormSchema = createFormSchema({
  name: SchemaCreators.string({ 
    required: true, 
    min: 3, 
    max: 100 
  }),
  price: SchemaCreators.price({ 
    required: true, 
    min: 0.01 
  }),
  // Other fields...
});

// Define the form value type
type ProductFormValues = z.infer<typeof productFormSchema>;
```

### 2. Field Component Creation

```typescript
const FormTextField = createFormField({
  component: TextField
});

const FormNumberField = createFormField({
  component: NumberField,
  defaultValueFn: (value) => (value === null || value === undefined) ? '' : value,
  transformValueFn: (value) => (value === '') ? null : value
});
```

### 3. Form Hook Usage

```typescript
const form = useZodForm({
  schema: productFormSchema,
  defaultValues: initialValues,
  mode: 'onBlur'
});
```

### 4. Form Provider

```typescript
<FormProvider
  form={form}
  isEditMode={isEditMode}
  onSubmit={handleSubmit}
  onCancel={onCancel}
>
  {/* Form fields */}
</FormProvider>
```

## Best Practices

1. **Schema Reuse**: Define schemas in a separate file when they're used in multiple places
2. **Field Component Composition**: Create reusable field components with the form field creator
3. **Form Submission Logic**: Keep form submission logic separate from UI components
4. **Validation Rules**: Use the schema creators for consistent validation rules
5. **Error Handling**: Provide clear error messages for validation failures

## Using the Form System

To create a new form:

1. Define your schema using `createFormSchema` and `SchemaCreators`
2. Create your field components using `createFormField`
3. Create your form component with `useZodForm` and `FormProvider`
4. Render your form with the field components

## Advanced Features

The form system supports several advanced features:

1. **Multi-step Forms**: Use the form context to manage multi-step form state
2. **Conditional Fields**: Use the form state to conditionally render fields
3. **Dynamic Field Arrays**: Use React Hook Form's array fields support
4. **Form Transformations**: Transform values during submission or initialization
5. **Form Reset**: Reset the form to initial values or clear all fields

See the form utilities in `src/lib/forms` for more details on available options and features. 