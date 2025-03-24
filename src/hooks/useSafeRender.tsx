// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { safeStringify } from '@/utils/errorHandling';

/**
 * Custom hook for safely rendering potentially problematic values in React
 * Prevents the "Objects are not valid as a React child" error
 */
export const useSafeRender = () => {
  /**
   * Safely renders any value as a string
   * Prevents React errors when trying to render objects directly
   */
  const renderSafely = useCallback((value: unknown): string => {
    return safeStringify(value);
  }, []);

  /**
   * Safely renders an object's property
   * Returns the property value as a string if it exists, or a fallback value
   */
  const renderObjectProperty = useCallback(
    <T extends Record<string, any>>(
      obj: T | null | undefined,
      property: keyof T,
      fallback: string = ''
    ): string => {
      if (!obj) return fallback;
      
      try {
        const value = obj[property];
        return value !== undefined && value !== null 
          ? typeof value === 'object' 
            ? safeStringify(value) 
            : String(value)
          : fallback;
      } catch (error) {
        console.error(`Error rendering property ${String(property)}:`, error);
        return fallback;
      }
    },
    []
  );

  /**
   * Shows a toast notification for the "Objects are not valid as a React child" error
   */
  const showObjectRenderingErrorToast = useCallback(() => {
    toast({
      variant: "destructive",
      title: "Something went wrong",
      description: "Objects are not valid as a React child. If you meant to render a collection of children, use an array instead.",
    });
  }, []);

  return {
    renderSafely,
    renderObjectProperty,
    showObjectRenderingErrorToast
  };
};
