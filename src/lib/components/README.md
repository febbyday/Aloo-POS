# Component System

This directory contains a comprehensive component system for the POS application, based on atomic design principles and Shadcn UI components.

## Structure

The component system is organized using atomic design principles:

- **Atoms**: Basic building blocks (buttons, inputs, labels)
- **Molecules**: Simple component compositions (form fields, search bars)
- **Organisms**: Complex UI sections (forms, tables, dashboards)
- **Templates**: Page layouts without specific data
- **Pages**: Complete pages with data integration

## Component Guidelines

When creating or modifying components, follow these guidelines:

### 1. Naming Conventions

- Use PascalCase for component names (`SearchInput.tsx`, `ProductCard.tsx`)
- Use kebab-case for style files (`search-input.module.css`)
- Use camelCase for utility functions and hooks (`useComponentState.tsx`)

### 2. Component Structure

Each component should:

- Have a single responsibility
- Be fully typed with TypeScript
- Include comprehensive JSDoc comments
- Export a named interface for its props
- Be properly exported from index files

### 3. Styling Approach

- Use TailwindCSS for styling
- For complex components, use CSS modules if necessary
- Follow the project's design tokens for colors, spacing, etc.

### 4. Accessibility

- Include proper ARIA attributes
- Ensure keyboard navigation works
- Maintain proper focus management
- Support screen readers with appropriate labels

### 5. Documentation

- Include usage examples in comments
- Document all props with JSDoc
- Explain any non-obvious behaviors
- Reference related components when applicable

### 6. Testing

- Include unit tests for component logic
- Include snapshot tests for UI stability
- Test accessibility with automated tools
- Test edge cases and error states

## Component Creation Workflow

1. Identify the need for a new component
2. Determine its atomic level (atom, molecule, etc.)
3. Create the component file with proper typing
4. Implement the component with TailwindCSS
5. Add tests and documentation
6. Export from the appropriate index file
7. Create usage examples

## Using Shadcn UI Components

This component system is built on top of Shadcn UI components. When using Shadcn UI:

1. Import base components from `@/components/ui`
2. Extend and compose them as needed
3. Maintain consistent styling and behavior
4. Avoid direct modification of Shadcn UI source code

## Examples

Check the `examples` directory for sample implementations of components at each atomic level. 