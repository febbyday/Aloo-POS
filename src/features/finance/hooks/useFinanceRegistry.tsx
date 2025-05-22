import { useEffect, useState } from 'react';
import {
  contextRegistry,
  ContextType,
  useContextRegistry,
  ContextTypeMap
} from '../context/ContextRegistry';
import { toast } from '@/lib/toast';

/**
 * Custom hook for accessing finance contexts through the registry
 *
 * This hook provides a type-safe way to access any finance context
 * through the context registry, without the need for nested providers
 * or direct imports of context hooks.
 *
 * Benefits:
 * - Makes context dependencies explicit
 * - Simplifies testing by making dependencies injectable
 * - Provides error handling for missing contexts
 * - Allows for accessing contexts that might not be in the direct parent hierarchy
 *
 * @example
 * // Access revenue context
 * const revenueContext = useFinanceRegistry(ContextType.Revenue);
 *
 * // Get total revenue
 * const { totalRevenue } = revenueContext;
 */
export function useFinanceRegistry<T extends ContextType>(contextType: T): ContextTypeMap[T] {
  const registry = useContextRegistry();
  const [context, setContext] = useState<ContextTypeMap[T] | undefined>(
    registry.get(contextType)
  );

  useEffect(() => {
    // Check if the context is available in the registry
    if (!registry.has(contextType)) {
      // Log error and show toast in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`Context of type ${contextType} not found in registry.`);

        toast({
          title: 'Context Error',
          description: `Required context ${contextType} is not available. Check provider configuration.`,
          variant: 'destructive',
        });
      }
    } else {
      // Update context from registry
      setContext(registry.get(contextType));
    }
  }, [contextType, registry]);

  // Throw error if context is not available
  if (!context) {
    throw new Error(`Context of type ${contextType} not found in registry.`);
  }

  return context;
}

/**
 * Specialized hooks for specific contexts
 *
 * These hooks provide a more direct way to access specific contexts
 * through the registry without needing to specify the context type.
 */

export function useFinanceFromRegistry() {
  return useFinanceRegistry(ContextType.Finance);
}

export function useTaxFromRegistry() {
  return useFinanceRegistry(ContextType.Tax);
}

export function useRevenueFromRegistry() {
  return useFinanceRegistry(ContextType.Revenue);
}

export function useExpenseFromRegistry() {
  return useFinanceRegistry(ContextType.Expense);
}