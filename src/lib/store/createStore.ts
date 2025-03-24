/**
 * Store Factory
 * 
 * Provides factory functions to create standardized Zustand stores with
 * common patterns and middleware configurations.
 */

import { create, StateCreator, StoreApi, UseBoundStore } from 'zustand';
import { persist, createJSONStorage, PersistOptions, StateStorage } from 'zustand/middleware';
import { immer } from './immerMiddleware';
import { devtools, DevtoolsOptions } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

/**
 * Log middleware that logs store updates
 */
const log = <T extends object>(
  config: StateCreator<T>
): StateCreator<T> => (set, get, api) => 
  config(
    (args) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Updating state:', args);
      }
      return set(args);
    },
    get,
    api
  );

/**
 * Default storage configuration
 */
const defaultStorage = typeof window !== 'undefined' 
  ? createJSONStorage(() => localStorage)
  : undefined;

/**
 * Options for creating a store
 */
export interface CreateStoreOptions<T extends object> {
  /**
   * Name of the store for devtools and persistence
   */
  name: string;
  
  /**
   * Store description 
   */
  description?: string;
  
  /**
   * Initial state
   */
  initialState: Partial<T>;
  
  /**
   * Whether to enable persistence
   */
  persist?: boolean;
  
  /**
   * Custom storage for persistence
   */
  storage?: StateStorage;
  
  /**
   * Persist options
   */
  persistOptions?: Omit<PersistOptions<T>, 'name' | 'storage'>;
  
  /**
   * Whether to use Immer middleware
   */
  immer?: boolean;
  
  /**
   * Whether to use devtools middleware
   */
  devtools?: boolean;
  
  /**
   * Devtools options
   */
  devtoolsOptions?: Omit<DevtoolsOptions, 'name'>;
  
  /**
   * Whether to enable logging middleware
   */
  logging?: boolean;
  
  /**
   * Version of the store for migrations
   */
  version?: number;
  
  /**
   * Migration function for persisted data
   */
  migrate?: (persistedState: unknown, version: number) => T;
}

/**
 * Default options for stores
 */
const defaultOptions: Partial<CreateStoreOptions<any>> = {
  persist: false,
  immer: true,
  devtools: true,
  logging: process.env.NODE_ENV === 'development',
  version: 1,
};

/**
 * Create a new store with middleware
 */
export function createStore<T extends object, A = T>(
  stateCreator: (set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>) => A,
  options: CreateStoreOptions<T>
): UseBoundStore<StoreApi<T & A>> {
  const {
    name,
    description,
    initialState,
    persist: shouldPersist,
    storage,
    persistOptions,
    immer: useImmer,
    devtools: useDevtools,
    devtoolsOptions,
    logging: useLogging,
    version,
    migrate,
  } = { ...defaultOptions, ...options };
  
  // Create store creator with middleware
  let storeCreator: StateCreator<T & A, any, any, any> = (set, get, api) => {
    // Combine initial state with state from creator function
    const state = { ...(initialState as object) } as T;
    const actions = stateCreator(set, get, api) as A;
    return { ...state, ...actions };
  };
  
  // Apply middleware in the correct order
  if (useImmer) {
    storeCreator = immer(storeCreator);
  }
  
  if (useLogging) {
    storeCreator = log(storeCreator);
  }
  
  if (useDevtools) {
    storeCreator = devtools(storeCreator, { 
      name, 
      ...(description ? { trace: true, traceLimit: 25 } : {}),
      ...devtoolsOptions 
    });
  }
  
  if (shouldPersist) {
    storeCreator = persist(storeCreator, { 
      name, 
      storage: storage || defaultStorage,
      version,
      migrate,
      ...persistOptions,
    });
  }
  
  // Create and return the store
  return create<T & A>()(storeCreator);
}

/**
 * Create a simple non-persistent store
 */
export function createSimpleStore<T extends object, A = T>(
  stateCreator: (set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>) => A,
  initialState: Partial<T>,
  name: string,
  useDevtools = true
): UseBoundStore<StoreApi<T & A>> {
  return createStore(stateCreator, {
    name,
    initialState,
    persist: false,
    devtools: useDevtools,
    immer: true,
  });
}

/**
 * Create a persistent store
 */
export function createPersistentStore<T extends object, A = T>(
  stateCreator: (set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>) => A,
  initialState: Partial<T>,
  name: string,
  storage?: StateStorage,
  persistOptions?: Omit<PersistOptions<T>, 'name' | 'storage'>
): UseBoundStore<StoreApi<T & A>> {
  return createStore(stateCreator, {
    name,
    initialState,
    persist: true,
    storage,
    persistOptions,
    devtools: true,
    immer: true,
  });
}

/**
 * A helper for type-safe store selectors
 */
export function createSelectors<T extends object, A = T>(store: UseBoundStore<StoreApi<T & A>>) {
  type StateKeys = keyof (T & A);
  
  const useSelector = <K extends StateKeys | StateKeys[], R = K extends StateKeys[] 
    ? Pick<T & A, K[number]> 
    : K extends StateKeys 
    ? (T & A)[K] 
    : never>(
    selector: K | ((state: T & A) => R),
    equalityFn?: (a: R, b: R) => boolean
  ): R => {
    if (typeof selector === 'function') {
      return store(selector as (state: T & A) => R, equalityFn);
    }
    
    if (Array.isArray(selector)) {
      return store(
        (state) => {
          const result = {} as Pick<T & A, K[number]>;
          selector.forEach((key) => {
            (result as any)[key] = state[key];
          });
          return result;
        },
        equalityFn || shallow
      ) as R;
    }
    
    return store((state) => state[selector as StateKeys], equalityFn) as R;
  };
  
  return { useSelector, useStore: store };
}

export { shallow };

// Export types
export type { StoreApi, UseBoundStore, StateCreator }; 