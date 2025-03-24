# Integration Guide: Phase 2 Features

This guide explains how to integrate the new systems developed in Phase 2 (State Management, Form System, and Component System) into the existing codebase.

## Table of Contents

1. [State Management Integration](#state-management-integration)
2. [Form System Integration](#form-system-integration)
3. [Component System Integration](#component-system-integration)
4. [Migration Strategies](#migration-strategies)
5. [Testing & Verification](#testing--verification)

## State Management Integration

The new state management system uses Zustand with standardized patterns, middleware, and utilities for better maintainability and performance.

### Converting an Existing Context to Zustand

**Before (Context API):**

```tsx
// UserContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface UserContextType extends UserState {
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<UserState>({
    user: null,
    isLoading: false,
    error: null
  });

  const login = async (credentials: Credentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.login(credentials);
      setState(prev => ({ ...prev, user, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        isLoading: false 
      }));
    }
  };

  const logout = async () => {
    // Logout logic
  };

  return (
    <UserContext.Provider value={{ ...state, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
```

**After (Zustand Store):**

```tsx
// userStore.ts
import { create } from '@/lib/store';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState & UserActions>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.login(credentials);
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  logout: async () => {
    // Logout logic
    set({ user: null });
  },

  clearError: () => set({ error: null })
}));

// For type-safe selectors
export const userSelectors = {
  user: (state: UserState & UserActions) => state.user,
  isAuthenticated: (state: UserState & UserActions) => !!state.user,
  isLoading: (state: UserState & UserActions) => state.isLoading,
  error: (state: UserState & UserActions) => state.error
};
```

### Using Persistent Storage

For data that needs to persist across sessions:

```tsx
import { create, createJSONStorage, persist } from '@/lib/store';

export const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'light',
      currency: 'USD',
      setTheme: (theme: string) => set({ theme }),
      setCurrency: (currency: string) => set({ currency }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Creating a New Store

For new features, use the store factory:

```tsx
import { createStore } from '@/lib/store';

// Define your state and actions
interface CartState {
  items: CartItem[];
  total: number;
}

interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

// Create the store
export const useCartStore = createStore<CartState & CartActions>((set, get) => ({
  items: [],
  total: 0,
  
  addItem: (item) => {
    const { items } = get();
    const existingItem = items.find(i => i.id === item.id);
    
    if (existingItem) {
      const updatedItems = items.map(i => 
        i.id === item.id 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
      );
      set({ 
        items: updatedItems,
        total: calculateTotal(updatedItems)
      });
    } else {
      const updatedItems = [...items, { ...item, quantity: 1 }];
      set({ 
        items: updatedItems,
        total: calculateTotal(updatedItems)
      });
    }
  },
  
  removeItem: (id) => {
    const { items } = get();
    const updatedItems = items.filter(i => i.id !== id);
    set({ 
      items: updatedItems,
      total: calculateTotal(updatedItems)
    });
  },
  
  clearCart: () => set({ items: [], total: 0 })
}));

// Helper for calculating total
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};
```

## Form System Integration

The new form system provides a comprehensive solution for building type-safe forms with Zod validation and React Hook Form.

### Converting an Existing Form

**Before (Basic Form):**

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ProductForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Name is required';
    if (!price) newErrors.price = 'Price is required';
    else if (isNaN(parseFloat(price))) newErrors.price = 'Price must be a number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Submit the form
      console.log({ name, price: parseFloat(price), description });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Name</label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="text-red-500">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="price">Price</label>
        <Input
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        {errors.price && <p className="text-red-500">{errors.price}</p>}
      </div>
      
      <div>
        <label htmlFor="description">Description</label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <Button type="submit">Save Product</Button>
    </form>
  );
}
```

**After (Form System):**

```tsx
import {
  useZodForm,
  FormProvider,
  createFormSchema,
  SchemaCreators,
  createFormField,
} from '@/lib/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Create reusable form fields
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

const TextareaField = createFormField({
  component: ({ label, value, onChange, onBlur, error, hasError, id, ...props }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <Textarea
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

// Define schema
const productSchema = createFormSchema({
  name: SchemaCreators.string({ required: true }),
  price: SchemaCreators.number({ required: true, min: 0.01 }),
  description: SchemaCreators.string(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Form component
export function ProductForm() {
  const form = useZodForm({
    schema: productSchema,
    defaultValues: {
      name: '',
      price: null,
      description: '',
    },
    mode: 'onBlur',
  });

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      // Submit the form
      console.log(data);
      form.setSuccessMessage('Product saved successfully');
    } catch (error) {
      form.setFormError('Failed to save product');
    }
  };

  return (
    <FormProvider form={form} onSubmit={handleSubmit} className="space-y-4">
      <TextField name="name" label="Name" required />
      <TextField name="price" label="Price" type="number" step="0.01" required />
      <TextareaField name="description" label="Description" rows={3} />
      
      <Button type="submit" disabled={form.isSubmitting}>
        Save Product
      </Button>
    </FormProvider>
  );
}
```

### Working with Existing Forms

For complex forms where full migration isn't immediately feasible, use a hybrid approach:

```tsx
// Wrap existing form elements with createFormField
const ExistingSelectField = createFormField({
  component: ({ label, value, onChange, onBlur, error, hasError, id, ...props }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={hasError ? 'error-class' : ''}
        {...props}
      >
        {props.options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && <span className="error">{error}</span>}
    </div>
  )
});
```

## Component System Integration

The new component system provides a consistent way to create and document UI components.

### Converting a Basic Component

**Before:**

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
};

export function Badge({ 
  variant = 'default', 
  size = 'md', 
  children, 
  className 
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        {
          'bg-primary text-primary-foreground': variant === 'default',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
          'bg-destructive text-destructive-foreground': variant === 'destructive',
          'border border-input bg-background': variant === 'outline',
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-0.5 text-sm': size === 'md',
          'px-3 py-1 text-base': size === 'lg',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
```

**After:**

```tsx
import { createComponent } from '@/lib/components';
import { cn } from '@/lib/utils';

/**
 * Badge component for displaying short status information
 */
const Badge = createComponent({
  name: 'Badge',
  description: 'A badge component for displaying status or labels',
  props: {
    /**
     * The visual style of the badge
     * @default "default"
     */
    variant: {
      type: ['default', 'secondary', 'destructive', 'outline'] as const,
      defaultValue: 'default',
    },
    /**
     * The size of the badge
     * @default "md"
     */
    size: {
      type: ['sm', 'md', 'lg'] as const,
      defaultValue: 'md',
    },
    /**
     * The content of the badge
     */
    children: {
      type: 'React.ReactNode',
      isRequired: true,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: 'string',
    },
  },
  component: ({ 
    variant = 'default', 
    size = 'md', 
    children, 
    className,
    ...props
  }) => {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          {
            'bg-primary text-primary-foreground': variant === 'default',
            'bg-secondary text-secondary-foreground': variant === 'secondary',
            'bg-destructive text-destructive-foreground': variant === 'destructive',
            'border border-input bg-background': variant === 'outline',
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-0.5 text-sm': size === 'md',
            'px-3 py-1 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
  examples: [
    {
      name: 'Default',
      props: { children: 'Badge' }
    },
    {
      name: 'Secondary',
      props: { variant: 'secondary', children: 'Secondary' }
    },
    {
      name: 'Destructive',
      props: { variant: 'destructive', children: 'Destructive' }
    },
    {
      name: 'Outline',
      props: { variant: 'outline', children: 'Outline' }
    },
    {
      name: 'Small Size',
      props: { size: 'sm', children: 'Small' }
    },
    {
      name: 'Large Size',
      props: { size: 'lg', children: 'Large' }
    },
  ]
});

export { Badge };
```

### Creating New Speciality Components

For domain-specific components, use the Component System:

```tsx
import { createComponent } from '@/lib/components';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store/userStore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

/**
 * User profile card component
 */
const UserProfileCard = createComponent({
  name: 'UserProfileCard',
  description: 'Displays user profile information in a card format',
  props: {
    /**
     * Whether to show full user details or just basic info
     * @default false
     */
    expandedView: {
      type: 'boolean',
      defaultValue: false,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: 'string',
    },
  },
  component: ({ expandedView = false, className }) => {
    const user = useUserStore(state => state.user);
    
    if (!user) {
      return null;
    }
    
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar 
              src={user.avatarUrl} 
              fallback={user.name.charAt(0)} 
              alt={user.name}
            />
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          {expandedView && (
            <div className="mt-4 border-t pt-4">
              <p>Role: {user.role}</p>
              <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
              <p>Last active: {new Date(user.lastActive).toLocaleDateString()}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
  examples: [
    {
      name: 'Basic View',
      props: {}
    },
    {
      name: 'Expanded View',
      props: { expandedView: true }
    }
  ]
});

export { UserProfileCard };
```

## Migration Strategies

### Gradual Migration

For large existing features, use a gradual migration approach:

1. **Identify components to migrate**: Start with standalone components or small features
2. **Create parallel implementations**: Keep the old implementation alongside the new one
3. **Switch one component at a time**: Update references to use the new implementation
4. **Verify each change**: Test thoroughly before moving to the next component
5. **Clean up**: Remove the old implementation once the migration is complete

### New Feature Implementation

For new features, use the new systems from the start:

1. **Create a Zustand store** for feature state management
2. **Use the form system** for any forms
3. **Build UI components** with the component system
4. **Document thoroughly** for team knowledge sharing

## Testing & Verification

### Store Testing

```tsx
// userStore.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useUserStore } from './userStore';

describe('userStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useUserStore.setState({ user: null, isLoading: false, error: null });
    });
  });

  test('should set loading state during login', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserStore());
    
    act(() => {
      // Mock the login function
      result.current.login({ email: 'test@example.com', password: 'password' });
    });
    
    expect(result.current.isLoading).toBe(true);
  });
});
```

### Form Testing

```tsx
// productForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductForm } from './ProductForm';

describe('ProductForm', () => {
  test('displays validation errors', async () => {
    render(<ProductForm />);
    
    // Submit the form without filling out required fields
    fireEvent.click(screen.getByText('Save Product'));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });
});
```

### Component Testing

```tsx
// Badge.test.tsx
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  test('renders with default props', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  test('applies variant classes', () => {
    const { container } = render(<Badge variant="destructive">Warning</Badge>);
    expect(container.firstChild).toHaveClass('bg-destructive');
  });
});
```

## Conclusion

By following these integration guidelines, you can gradually migrate the existing codebase to use the new systems developed in Phase 2. This approach ensures minimal disruption while improving maintainability, scalability, and developer experience in the POS application. 