/**
 * Counter Store Example
 * 
 * This is a simple example demonstrating how to use the store factory.
 * It creates a counter store with increment, decrement, and reset actions.
 */

import { createStore, createSelectors } from '../createStore';

// Define the store state
interface CounterState {
  count: number;
  lastUpdated: Date | null;
}

// Initial state
const initialState: CounterState = {
  count: 0,
  lastUpdated: null
};

// Define the store actions
interface CounterActions {
  increment: (amount?: number) => void;
  decrement: (amount?: number) => void;
  reset: () => void;
  setCount: (count: number) => void;
}

// Create the store using the factory
const counterStore = createStore<CounterState, CounterActions>(
  (set, get) => ({
    // Define actions
    increment: (amount = 1) => {
      set((state) => {
        state.count += amount;
        state.lastUpdated = new Date();
      });
    },
    
    decrement: (amount = 1) => {
      set((state) => {
        state.count -= amount;
        state.lastUpdated = new Date();
      });
    },
    
    reset: () => {
      set((state) => {
        state.count = 0;
        state.lastUpdated = new Date();
      });
    },
    
    setCount: (count) => {
      set((state) => {
        state.count = count;
        state.lastUpdated = new Date();
      });
    }
  }),
  {
    name: 'counter-store',
    description: 'A simple counter store example',
    initialState,
    persist: true,
    logging: true
  }
);

// Create selectors for the store
export const { useSelector, useStore } = createSelectors(counterStore);

// Export individual selectors for common use cases
export const useCount = () => useSelector((state) => state.count);
export const useLastUpdated = () => useSelector((state) => state.lastUpdated);
export const useCounterActions = () => useSelector((state) => ({
  increment: state.increment,
  decrement: state.decrement,
  reset: state.reset,
  setCount: state.setCount
}));

// Export the raw store for advanced use cases
export default counterStore; 