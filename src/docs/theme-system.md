# Theme System Documentation

This document provides information about the theme system in the application, including how to use it and best practices.

## Overview

The application supports three theme modes:
- **Light Mode**: A light color scheme
- **Dark Mode**: A dark color scheme
- **System Mode**: Automatically follows the user's system preference

## Usage

### Using the Theme Provider

The `ThemeProvider` is the core component of the theme system. It should wrap your application or the part of your application that needs theme support.

```tsx
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="pos-theme">
      <YourApp />
    </ThemeProvider>
  );
}
```

#### Props

- `defaultTheme`: The default theme to use if no theme is stored in localStorage. Options are "light", "dark", or "system". Default is "system".
- `storageKey`: The key to use for storing the theme preference in localStorage. Default is "pos-theme".
- `children`: The content to render within the provider.

### Using the Theme Hook

The `useTheme` hook provides access to the current theme and functions to change it.

```tsx
import { useTheme } from '@/components/theme-provider';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

#### Return Values

- `theme`: The current theme setting ("light", "dark", or "system").
- `setTheme`: A function to change the theme.
- `resolvedTheme`: The actual theme being applied ("light" or "dark"), which is useful when theme is set to "system".

### Using the Theme Toggle Component

The `ThemeToggle` component provides a pre-built UI for changing the theme.

```tsx
import { ThemeToggle } from '@/components/theme-toggle';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  );
}
```

#### Props

- `variant`: The button variant to use. Default is "ghost".
- `size`: The button size to use. Default is "icon".
- `showTooltip`: Whether to show a tooltip when hovering over the button. Default is true.

## CSS Variables

The theme system uses CSS variables defined in `src/index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... other variables ... */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... other variables ... */
}
```

### Using Theme Variables in Components

When creating components, use the CSS variables to ensure they work correctly in both light and dark modes:

```tsx
// Good - Uses theme variables
<div className="bg-background text-foreground">
  Themed content
</div>

// Bad - Uses hardcoded colors
<div className="bg-white text-black">
  Non-themed content
</div>
```

## Best Practices

1. **Always Use the ThemeToggle Component**
   - Use the standard `ThemeToggle` component instead of creating custom implementations
   - This ensures consistent behavior and appearance

2. **Use Theme-Aware Colors**
   - Use the theme CSS variables via Tailwind classes (e.g., `bg-background`, `text-foreground`)
   - Avoid hardcoded colors that don't change with the theme

3. **Test Both Themes**
   - Always test your components in both light and dark modes
   - Ensure proper contrast and readability in both themes

4. **Respect User Preferences**
   - Default to "system" theme to respect user preferences
   - Persist user theme choices using the built-in localStorage mechanism

5. **Handle Images and Media**
   - For images that need different versions in light/dark mode, use CSS to swap them:
   ```css
   .dark .light-image { display: none; }
   .dark .dark-image { display: block; }
   .light-image { display: block; }
   .dark-image { display: none; }
   ```

## Troubleshooting

### Theme Not Applying Correctly

1. Ensure the component is wrapped in a `ThemeProvider`
2. Check that you're using theme CSS variables, not hardcoded colors
3. Verify that the `dark` class is being applied to the HTML element

### Theme Toggle Not Working

1. Ensure you're using the `useTheme` hook from the correct import
2. Verify that the `ThemeProvider` is properly set up
3. Check browser localStorage for the theme preference key

## Migration from Old Theme System

If you're migrating from an older theme implementation:

1. Replace any custom theme context with the standard `ThemeProvider`
2. Replace direct theme toggles with the `ThemeToggle` component
3. Update any hardcoded colors to use theme CSS variables
4. Ensure the default theme is set to "system"
