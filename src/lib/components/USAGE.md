# Component System Usage Guide

This guide explains how to use the component system to create, document, and use components in the POS application.

## Creating a New Component

### 1. Determine the Component Level

First, determine which level your component belongs to:

- **Atoms**: Basic building blocks (buttons, inputs, labels)
- **Molecules**: Simple component compositions (form fields, search bars)
- **Organisms**: Complex UI sections (forms, tables, dashboards)
- **Templates**: Page layouts without specific data
- **Pages**: Complete pages with data integration

### 2. Create the Component File

Create a new file in the appropriate directory:

```tsx
// src/lib/components/atoms/MyComponent.tsx
import React from 'react';
import { createComponent } from '../createComponent';

export interface MyComponentProps {
  // Define your props here
  label: string;
  onClick?: () => void;
  className?: string;
}

const MyComponent = createComponent<MyComponentProps>(
  {
    displayName: 'MyComponent',
    description: 'A description of what this component does.',
    defaultProps: {
      // Default props here
    },
  },
  (props) => {
    const { label, onClick, className } = props;
    
    return (
      <div className={className} onClick={onClick}>
        {label}
      </div>
    );
  }
);

export default MyComponent;
```

### 3. Export the Component

Add the component to the appropriate index file:

```tsx
// src/lib/components/atoms/index.ts
export { default as MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

### 4. Create an Example

Create an example to demonstrate how to use the component:

```tsx
// src/lib/components/examples/MyComponentExample.tsx
import React from 'react';
import { MyComponent } from '../atoms';

export function MyComponentExample() {
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold">Basic Usage</h2>
      <MyComponent label="Click me" onClick={() => alert('Clicked!')} />
      
      {/* Add more examples here */}
    </div>
  );
}

export default MyComponentExample;
```

### 5. Add the Example to the Index

```tsx
// src/lib/components/examples/index.ts
export { default as MyComponentExample } from './MyComponentExample';
```

## Using the Component Creator

The `createComponent` utility provides a consistent way to create components:

```tsx
const MyComponent = createComponent<MyComponentProps>(
  {
    // Component options
    displayName: 'MyComponent',
    description: 'Component description for documentation.',
    defaultClassName: 'default-class-names',
    forwardRef: false, // Set to true if you need to forward refs
    defaultProps: {
      // Default props
    },
  },
  (props, ref) => {
    // Component implementation
    return (
      <div>
        {/* Component JSX */}
      </div>
    );
  }
);
```

## Component Documentation

Components created with `createComponent` automatically include documentation:

```tsx
// Access component documentation
console.log(MyComponent.docs.description);
console.log(MyComponent.docs.props);
```

You can also create comprehensive documentation with examples:

```tsx
import { createComponentDocs } from '../createComponent';
import MyComponent from './MyComponent';

const docs = createComponentDocs(MyComponent, [
  <MyComponent label="Example 1" />,
  <MyComponent label="Example 2" variant="primary" />,
]);
```

## Best Practices

1. **Keep components focused**: Each component should have a single responsibility.
2. **Document thoroughly**: Use JSDoc comments to document props and behavior.
3. **Use TypeScript**: Define prop interfaces for type safety.
4. **Follow naming conventions**: Use PascalCase for components, camelCase for props.
5. **Create examples**: Demonstrate different use cases in example components.
6. **Reuse existing components**: Compose from atoms to create more complex components.
7. **Consider accessibility**: Ensure components are accessible with proper ARIA attributes.

## Examples

Check the `examples` directory for sample implementations:

- `BadgeExample`: Demonstrates the Badge component with various variants and sizes.
- `SearchInputExample`: Shows how to use the SearchInput component with different configurations.

## Extending Shadcn UI Components

When extending Shadcn UI components:

1. Import the base component from `@/components/ui`
2. Add your custom functionality
3. Use the `createComponent` utility to maintain consistency
4. Document the additional props and behavior

Example:

```tsx
import { Button } from '@/components/ui/button';
import { createComponent } from '../createComponent';

export interface CustomButtonProps {
  label: string;
  icon?: React.ReactNode;
  // ... other props
}

const CustomButton = createComponent<CustomButtonProps>(
  {
    displayName: 'CustomButton',
    description: 'A custom button with an icon.',
    defaultProps: {
      // Default props
    },
  },
  (props) => {
    const { label, icon, ...rest } = props;
    
    return (
      <Button {...rest}>
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </Button>
    );
  }
);

export default CustomButton;
``` 