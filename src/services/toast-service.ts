/**
 * Toast Notification Service
 * 
 * This service provides a unified way to display toast notifications in the app.
 * It uses the toast library to display notification messages.
 */

import { toast, ToastOptions } from 'react-hot-toast';

/**
 * Toast type definition
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

/**
 * Toast service options
 */
export interface ToastServiceOptions extends Omit<ToastOptions, 'icon'> {
  /**
   * Toast title
   */
  title?: string;
  
  /**
   * Toast description/message
   */
  description?: string;
  
  /**
   * Custom icon to display
   */
  icon?: React.ReactNode;
  
  /**
   * Duration in milliseconds
   */
  duration?: number;
  
  /**
   * Actions to display in the toast
   */
  actions?: React.ReactNode;
}

/**
 * Default options for different toast types
 */
const defaultOptions: Record<ToastType, Partial<ToastOptions>> = {
  success: { duration: 4000 },
  error: { duration: 8000 },
  info: { duration: 5000 },
  warning: { duration: 6000 },
  loading: { duration: Infinity }
};

/**
 * Show a toast notification
 */
function show(
  type: ToastType,
  message: string,
  options: ToastServiceOptions = {}
): string {
  const { title, description, duration, ...restOptions } = options;
  
  // Merge options with defaults based on type
  const mergedOptions: ToastOptions = {
    ...defaultOptions[type],
    ...restOptions,
    duration: duration || defaultOptions[type].duration
  };
  
  // Build the message - use description if provided, otherwise use message
  const displayMessage = description || message;
  
  // Handle different toast types
  switch (type) {
    case 'success':
      return toast.success(displayMessage, mergedOptions);
    case 'error':
      return toast.error(displayMessage, mergedOptions);
    case 'loading':
      return toast.loading(displayMessage, mergedOptions);
    case 'info':
    case 'warning':
    default:
      return toast(displayMessage, mergedOptions);
  }
}

/**
 * Show a success toast
 */
function success(message: string, options: ToastServiceOptions = {}): string {
  return show('success', message, options);
}

/**
 * Show an error toast
 */
function error(message: string, options: ToastServiceOptions = {}): string {
  return show('error', message, options);
}

/**
 * Show an info toast
 */
function info(message: string, options: ToastServiceOptions = {}): string {
  return show('info', message, options);
}

/**
 * Show a warning toast
 */
function warning(message: string, options: ToastServiceOptions = {}): string {
  return show('warning', message, options);
}

/**
 * Show a loading toast
 */
function loading(message: string, options: ToastServiceOptions = {}): string {
  return show('loading', message, options);
}

/**
 * Update an existing toast
 */
function update(
  id: string,
  message: string,
  options: ToastServiceOptions & { type?: ToastType } = {}
): void {
  const { type, ...restOptions } = options;
  
  if (type) {
    switch (type) {
      case 'success':
        toast.success(message, { id, ...restOptions });
        break;
      case 'error':
        toast.error(message, { id, ...restOptions });
        break;
      default:
        toast(message, { id, ...restOptions });
    }
  } else {
    toast(message, { id, ...restOptions });
  }
}

/**
 * Dismiss a toast by ID
 */
function dismiss(id?: string): void {
  toast.dismiss(id);
}

/**
 * Dismiss all toasts
 */
function dismissAll(): void {
  toast.dismiss();
}

/**
 * Promise toast - shows loading and then success/error based on promise result
 */
function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  },
  options: ToastServiceOptions = {}
): Promise<T> {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    options
  );
}

/**
 * Custom toast with component
 */
function custom(content: React.ReactNode, options: ToastOptions = {}): string {
  return toast.custom(content, options);
}

// Export toast service
export const ToastService = {
  show,
  success,
  error,
  info,
  warning,
  loading,
  update,
  dismiss,
  dismissAll,
  promise,
  custom
}; 