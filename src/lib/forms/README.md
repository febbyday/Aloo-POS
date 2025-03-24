# Form System

The Form System provides a comprehensive solution for building type-safe, accessible forms in the POS application. It combines the power of React Hook Form for performance and Zod for validation, while providing a consistent API for all form components.

## Core Features

- **Type Safety**: Full TypeScript support with automatic type inference
- **Schema Validation**: Built-in Zod schema validators with custom error messages
- **Accessibility**: ARIA attributes and keyboard navigation support
- **Performance**: Efficient re-rendering with React Hook Form
- **Consistency**: Uniform API for all form components
- **Error Handling**: Built-in error and success message management
- **Integration**: Seamless integration with Shadcn UI components

## Core Components

### `useZodForm`

A custom hook that integrates React Hook Form with Zod validation:

```tsx
import { useZodForm, SchemaCreators, createFormSchema } from '@/lib/forms';

// Define your schema
const userSchema = createFormSchema({
  name: SchemaCreators.string({ required: true, min: 2 }),
  email: SchemaCreators.string({ required: true, email: true }),
  age: SchemaCreators.number({ min: 18 })
});

// Type is automatically inferred from schema
type UserFormValues = z.infer<typeof userSchema>;

// Use the hook
const form = useZodForm({
  schema: userSchema,
  defaultValues: {
    name: '',
    email: '',
    age: null
  }
});
```

### `FormProvider`

A wrapper component that provides form context and handles form submission:

```tsx
import { FormProvider } from '@/lib/forms';

const handleSubmit = async (data: UserFormValues) => {
  try {
    await saveUser(data);
    form.setSuccessMessage('User created successfully');
  } catch (error) {
    form.setFormError('Failed to create user');
  }
};

return (
  <FormProvider 
    form={form} 
    onSubmit={handleSubmit}
    className="space-y-4"
  >
    {/* Form fields */}
    <button type="submit">Submit</button>
  </FormProvider>
);
```

### `createFormField`

A utility function for creating form field components:

```tsx
import { createFormField } from '@/lib/forms';
import { Input } from '@/components/ui/input';

const TextField = createFormField({
  component: ({ label, value, onChange, onBlur, error, hasError, id, ...props }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <Input
        id={id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={hasError ? 'border-destructive' : ''}
        {...props}
      />
      {hasError && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
});

// Usage
<TextField name="name" label="Full Name" required />
```

### `SchemaCreators` and `createFormSchema`

Utilities for creating Zod validation schemas:

```tsx
import { SchemaCreators, createFormSchema } from '@/lib/forms';

const productSchema = createFormSchema({
  name: SchemaCreators.string({ 
    required: true, 
    min: 3,
    errorMessages: {
      required: 'Product name is required',
      min: 'Name must be at least 3 characters'
    }
  }),
  price: SchemaCreators.number({ 
    required: true, 
    min: 0.01
  }),
  category: SchemaCreators.enum(
    ['electronics', 'clothing', 'food'] as const,
    { required: true }
  ),
  tags: SchemaCreators.array(
    z.string(),
    { min: 1 }
  )
});
```

## Complete Example

Here's a complete example of a form using all the components:

```tsx
import {
  useZodForm,
  FormProvider,
  createFormSchema,
  SchemaCreators,
  createFormField,
  z
} from '@/lib/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

// Create form field components
const TextField = createFormField({
  component: ({ label, value, onChange, onBlur, error, hasError, id, ...props }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <Input
        id={id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={hasError ? 'border-destructive' : ''}
        {...props}
      />
      {hasError && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
});

const SwitchField = createFormField({
  component: ({ label, value, onChange, id, ...props }) => (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <Switch
        id={id}
        checked={value || false}
        onCheckedChange={onChange}
        {...props}
      />
    </div>
  ),
  defaultValueFn: (value) => Boolean(value)
});

// Define form schema
const userSchema = createFormSchema({
  name: SchemaCreators.string({ required: true, min: 2 }),
  email: SchemaCreators.string({ required: true, email: true }),
  isActive: SchemaCreators.boolean()
});

type UserFormValues = z.infer<typeof userSchema>;

// Form component
function UserForm() {
  const form = useZodForm({
    schema: userSchema,
    defaultValues: {
      name: '',
      email: '',
      isActive: true
    },
    mode: 'onBlur'
  });

  const handleSubmit = async (data: UserFormValues) => {
    try {
      // Submit form data to API
      await saveUser(data);
      form.setSuccessMessage('User created successfully');
    } catch (error) {
      form.setFormError('Failed to create user');
    }
  };

  return (
    <FormProvider form={form} onSubmit={handleSubmit} className="space-y-4">
      <TextField name="name" label="Full Name" required />
      <TextField name="email" label="Email Address" required />
      <SwitchField name="isActive" label="Active User" />
      
      <Button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Saving...' : 'Save User'}
      </Button>
    </FormProvider>
  );
}
```

## Best Practices

1. **Schema Definition**: Define your schema separately from your component for better code organization.

2. **Field Reuse**: Create reusable field components with `createFormField` for consistency.

3. **Error Handling**: Use the built-in error handling and display mechanisms.

4. **Validation Modes**: Set the appropriate validation mode for your form (e.g., `onBlur`, `onChange`, `onSubmit`).

5. **TypeScript Integration**: Leverage type inference with `z.infer<typeof schema>` for type safety.

6. **Default Values**: Always provide default values matching your schema structure.

7. **Async Validation**: Implement async validation using the controller's rules or zod's refinements.

8. **Accessibility**: Ensure proper labeling and error association for all form fields.

## Advanced Usage

### Conditional Fields

You can implement conditional form fields by watching other fields:

```tsx
const form = useZodForm({ schema });
const hasShippingAddress = form.watch('hasShippingAddress');

return (
  <FormProvider form={form} onSubmit={handleSubmit}>
    <SwitchField name="hasShippingAddress" label="Different shipping address?" />
    
    {hasShippingAddress && (
      <>
        <TextField name="shippingAddress.street" label="Street" required />
        <TextField name="shippingAddress.city" label="City" required />
      </>
    )}
  </FormProvider>
);
```

### Custom Validation Messages

You can customize validation messages in the schema:

```tsx
const schema = createFormSchema({
  password: SchemaCreators.string({
    required: true,
    min: 8,
    errorMessages: {
      required: 'Password is required',
      min: 'Password must be at least 8 characters'
    }
  })
});
```

### Field Arrays

You can work with arrays of fields:

```tsx
const schema = createFormSchema({
  items: SchemaCreators.array(
    z.object({
      name: z.string().min(1),
      quantity: z.number().min(1)
    })
  )
});

function ItemsForm() {
  const form = useZodForm({ schema });
  const { fields, append, remove } = form.useFieldArray({ name: 'items' });
  
  return (
    <FormProvider form={form}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <TextField name={`items.${index}.name`} label="Item Name" />
          <NumberField name={`items.${index}.quantity`} label="Quantity" />
          <Button onClick={() => remove(index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={() => append({ name: '', quantity: 1 })}>Add Item</Button>
    </FormProvider>
  );
}
``` 