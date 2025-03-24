/**
 * useCounter Hook
 * 
 * This example hook demonstrates how to use the counter store in a React component.
 * It provides a simple interface for interacting with the counter state.
 */

import { useCallback } from 'react';
import { useCount, useCounterActions } from './counterStore';

interface UseCounterOptions {
  /**
   * Whether to include the last updated timestamp in the return value
   */
  withTimestamp?: boolean;
}

/**
 * Hook to interact with the counter store
 * @param options Configuration options
 * @returns The counter state and methods to interact with it
 */
export function useCounter(options: UseCounterOptions = {}) {
  // Get state and actions from the store
  const count = useCount();
  const { increment, decrement, reset, setCount } = useCounterActions();
  
  // Create a double increment function
  const incrementByTwo = useCallback(() => {
    increment(2);
  }, [increment]);
  
  // Create a double decrement function
  const decrementByTwo = useCallback(() => {
    decrement(2);
  }, [decrement]);
  
  // Create a function to increment by a specific amount
  const incrementBy = useCallback((amount: number) => {
    increment(amount);
  }, [increment]);
  
  return {
    // State
    count,
    
    // Basic actions
    increment,
    decrement,
    reset,
    setCount,
    
    // Enhanced actions
    incrementByTwo,
    decrementByTwo,
    incrementBy,
    
    // Helper methods
    isPositive: count > 0,
    isNegative: count < 0,
    isZero: count === 0,
  };
}

export default useCounter; 