/**
 * Store Module
 * 
 * Exports all store-related functionality including factory functions,
 * utility hooks, and persistence helpers.
 */

// Export main store creation utilities
export {
  createStore,
  createSimpleStore,
  createPersistentStore,
  createSelectors,
  shallow
} from './createStore';

// Export store types
export type {
  StoreApi,
  UseBoundStore,
  StateCreator,
  CreateStoreOptions
} from './createStore';

// Export persistence utilities
export {
  createJSONStorage,
  persist
} from 'zustand/middleware';

// Export dev tools
export {
  devtools
} from 'zustand/middleware';

// Export our custom immer middleware
export {
  immer
} from './immerMiddleware'; 