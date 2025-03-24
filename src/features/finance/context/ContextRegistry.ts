/**
 * Context Registry
 * 
 * This class implements a registry pattern for React contexts, allowing
 * contexts to register and retrieve other contexts without creating
 * tight coupling through nesting.
 */

import { useContext, createContext } from 'react';
import { FinanceContextType } from './FinanceContext';
import { TaxContextType } from './TaxContext';
import { RevenueContextType } from './RevenueContext';
import { ExpenseContextType } from './ExpenseContext';

// Define available context types
export enum ContextType {
  Finance = 'finance',
  Tax = 'tax',
  Revenue = 'revenue',
  Expense = 'expense',
}

// Map context types to their corresponding TypeScript interfaces
export interface ContextTypeMap {
  [ContextType.Finance]: FinanceContextType;
  [ContextType.Tax]: TaxContextType;
  [ContextType.Revenue]: RevenueContextType;
  [ContextType.Expense]: ExpenseContextType;
}

// Interface for context registry items
export interface RegistryItem<T extends keyof ContextTypeMap = keyof ContextTypeMap> {
  type: T;
  context: ContextTypeMap[T];
}

/**
 * Context Registry class
 * Provides a centralized registry for context instances
 */
class ContextRegistry {
  private registry = new Map<ContextType, unknown>();
  private static instance: ContextRegistry;

  private constructor() {
    // Private constructor for singleton pattern
    if (process.env.NODE_ENV === 'development') {
      console.log('ContextRegistry initialized');
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ContextRegistry {
    if (!ContextRegistry.instance) {
      ContextRegistry.instance = new ContextRegistry();
    }
    return ContextRegistry.instance;
  }

  /**
   * Register a context with the registry
   * @param type The type of context
   * @param context The context instance
   */
  public register<T extends ContextType>(type: T, context: ContextTypeMap[T]): void {
    this.registry.set(type, context);
    if (process.env.NODE_ENV === 'development') {
      console.log(`Context registered: ${type}`);
    }
  }

  /**
   * Get a context from the registry
   * @param type The type of context to retrieve
   * @returns The context instance or undefined if not registered
   */
  public get<T extends ContextType>(type: T): ContextTypeMap[T] | undefined {
    return this.registry.get(type) as ContextTypeMap[T] | undefined;
  }

  /**
   * Check if a context is registered
   * @param type The type of context to check
   * @returns True if the context is registered
   */
  public has(type: ContextType): boolean {
    return this.registry.has(type);
  }

  /**
   * Deregister a context
   * @param type The type of context to deregister
   */
  public deregister(type: ContextType): void {
    this.registry.delete(type);
    if (process.env.NODE_ENV === 'development') {
      console.log(`Context deregistered: ${type}`);
    }
  }

  /**
   * Get all registered contexts
   * @returns Array of registry items
   */
  public getAll(): RegistryItem[] {
    const items: RegistryItem[] = [];
    this.registry.forEach((context, type) => {
      items.push({ 
        type: type as keyof ContextTypeMap, 
        context: context as ContextTypeMap[keyof ContextTypeMap] 
      });
    });
    return items;
  }
}

// Export singleton instance
export const contextRegistry = ContextRegistry.getInstance();

// Create a React context for the registry itself
const RegistryContext = createContext<ContextRegistry>(contextRegistry);

// Export a hook to use the registry
export const useContextRegistry = () => {
  return useContext(RegistryContext);
};

export default contextRegistry; 