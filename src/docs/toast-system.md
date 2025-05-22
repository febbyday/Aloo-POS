# Toast Notification System

This document describes the standardized toast notification system for the POS application.

## Overview

The toast system provides a consistent way to display notifications to users across the application. It includes:

- A toast service with methods for different types of notifications
- A context provider for easy access throughout the application
- An enhanced toaster component with improved styling and icon support

## Usage

### Basic Usage

```tsx
import { toast } from '@/lib/toast';

// Simple toast
toast('Message sent successfully');

// With title and description
toast({
  title: 'Message Sent',
  description: 'Your message has been sent successfully'
});
```

### Toast Types

```tsx
import { useToast } from '@/lib/toast';

function MyComponent() {
  const toast = useToast();

  const showToasts = () => {
    // Success toast
    toast.success('Operation completed successfully');

    // Error toast
    toast.error('An error occurred');

    // Warning toast
    toast.warning('Please check your input');

    // Info toast
    toast.info('New updates available');

    // Loading toast
    toast.loading('Processing your request...');

    // Confirmation toast with action buttons
    toast.confirmation(
      'Delete Item?',
      'Are you sure you want to delete this item?',
      () => console.log('Confirmed'),
      () => console.log('Cancelled'),
      'Yes',
      'No'
    );

    // Progress toast with progress indicator
    const { id } = toast.progress('Uploading File', 0, 'Starting upload...');
    // Update progress later with:
    // toast.updateProgress(id, 50, { description: 'Uploading file... 50%' });

    // Custom toast with custom styling
    toast.custom({
      title: 'Custom Toast',
      description: 'This is a fully customized toast notification',
      className: 'bg-gradient-to-r from-indigo-500 to-purple-500 border-none text-white'
    });
  };

  return (
    <button onClick={showToasts}>Show Toasts</button>
  );
}
```

### With Actions

```tsx
import { useToast } from '@/lib/toast';

function MyComponent() {
  const toast = useToast();

  const handleUndo = () => {
    // Undo logic here
    console.log('Undo action');
  };

  const showActionToast = () => {
    toast.action(
      'Item Deleted',
      'The item has been removed from your cart',
      handleUndo,
      'Undo'
    );
  };

  return (
    <button onClick={showActionToast}>Delete Item</button>
  );
}
```

### Promise Toast

```tsx
import { useToast } from '@/lib/toast';

function MyComponent() {
  const toast = useToast();

  const fetchData = async () => {
    try {
      await toast.promise(
        fetch('/api/data'),
        {
          loading: 'Fetching data...',
          success: 'Data loaded successfully',
          error: 'Failed to load data'
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={fetchData}>Fetch Data</button>
  );
}
```

### Custom Content

```tsx
import { useToast } from '@/lib/toast';

function MyComponent() {
  const toast = useToast();

  const showCustomToast = () => {
    toast.info({
      title: 'New Product Added',
      description: (
        <div className="space-y-1">
          <p><strong>Coffee Mug</strong> - $12.99</p>
          <p className="text-xs text-muted-foreground">Added to inventory</p>
        </div>
      )
    });
  };

  return (
    <button onClick={showCustomToast}>Add Product</button>
  );
}
```

### Customization Options

```tsx
import { useToast } from '@/lib/toast';

function MyComponent() {
  const toast = useToast();

  // Toast with custom position
  toast.info({
    title: 'Top Center',
    description: 'This toast appears in the top center',
    position: 'top-center'
  });

  // Toast with custom animation
  toast.info({
    title: 'Fade Animation',
    description: 'This toast uses fade animation',
    animation: 'fade'
  });

  // Toast with custom duration
  toast.info({
    title: 'Long Duration',
    description: 'This toast stays visible for 10 seconds',
    duration: 10000
  });

  // Toast with custom theme
  toast.info({
    title: 'Custom Theme',
    description: 'This toast uses a custom theme',
    theme: 'colored'
  });
}
```

## Implementation Details

The toast system is built on top of the Shadcn UI toast component, with enhancements for:

- Consistent styling across different toast types
- Icon support for different toast types
- Support for actions and custom content
- Promise-based toasts for async operations
- Context provider for easy access throughout the application

## Best Practices

1. **Use the appropriate toast type** for the message you're displaying:
   - `success` for successful operations
   - `error` for errors and failures
   - `warning` for warnings and cautions
   - `info` for informational messages
   - `loading` for operations in progress
   - `confirmation` for confirmation dialogs with action buttons
   - `progress` for operations with progress indicators
   - `custom` for fully customized toast notifications

2. **Keep messages concise** - Toast notifications should be brief and to the point.

3. **Use titles and descriptions** for more complex messages:
   - Title: A short summary of the message
   - Description: Additional details or context

4. **Set appropriate durations** based on the importance of the message:
   - Success messages: 4 seconds
   - Error messages: 8 seconds
   - Warning messages: 6 seconds
   - Info messages: 5 seconds
   - Loading messages: Until completed
   - Confirmation messages: 10 seconds
   - Progress messages: Until completed
   - Custom messages: 5 seconds (default)

5. **Use actions sparingly** - Only include action buttons when they provide clear value to the user.

6. **Avoid displaying objects directly** - Always convert objects to strings or use specific properties.

7. **Use appropriate positions** - Choose toast positions based on the context:
   - Bottom positions are generally less intrusive
   - Top positions are more noticeable and urgent
   - Center positions draw the most attention

8. **Choose animations wisely** - Different animations convey different levels of urgency:
   - Slide animations are subtle and professional
   - Fade animations are gentle and unobtrusive
   - Zoom animations draw more attention
   - Bounce animations are playful but can be distracting

9. **Use progress indicators** for long-running operations to keep users informed.

## Troubleshooting

### Common Issues

1. **Objects in toast descriptions**

   Problem: Passing objects directly to toast descriptions can cause rendering errors.

   Solution: The toast system will automatically stringify objects, but it's better to extract specific properties:

   ```tsx
   // Instead of this:
   toast.info({ description: product });

   // Do this:
   toast.info(`Added ${product.name} ($${product.price.toFixed(2)}) to cart`);
   ```

2. **Toast not appearing**

   Problem: Toast notifications not showing up.

   Solution: Make sure the `EnhancedToaster` component is included in your application layout.

3. **Inconsistent styling**

   Problem: Toast notifications have inconsistent styling.

   Solution: Always use the toast system methods (`toast.success`, `toast.error`, etc.) rather than directly using the Shadcn UI toast.
