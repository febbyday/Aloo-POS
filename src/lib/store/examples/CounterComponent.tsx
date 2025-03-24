/**
 * CounterComponent Example
 * 
 * This component demonstrates how to use the useCounter hook in a React component.
 * It provides a simple UI for interacting with the counter state.
 */

import React from 'react';
import useCounter from './useCounter';

interface CounterComponentProps {
  /**
   * Label to display next to the counter
   */
  label?: string;
  
  /**
   * Initial counter value (only used on first render)
   */
  initialValue?: number;
  
  /**
   * Callback when counter value changes
   */
  onChange?: (newValue: number) => void;
}

/**
 * A simple counter component that demonstrates using the counter store
 */
export function CounterComponent({
  label = 'Counter',
  initialValue,
  onChange
}: CounterComponentProps) {
  // Use the counter hook to get state and actions
  const {
    count,
    increment,
    decrement,
    reset,
    setCount,
    incrementByTwo,
    decrementByTwo,
    isZero
  } = useCounter();
  
  // Set the initial value on first render
  React.useEffect(() => {
    if (initialValue !== undefined) {
      setCount(initialValue);
    }
  }, [initialValue, setCount]);
  
  // Call onChange when count changes
  React.useEffect(() => {
    onChange?.(count);
  }, [count, onChange]);
  
  // Handle custom increment amount
  const [customAmount, setCustomAmount] = React.useState<number>(5);
  const handleCustomIncrement = () => {
    increment(customAmount);
  };
  
  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h2 className="text-lg font-semibold mb-2">{label}</h2>
      
      <div className="flex items-center mb-4">
        <span className="text-2xl font-bold mr-4">{count}</span>
        
        <div className="space-x-2">
          <button 
            onClick={() => decrement()}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            -1
          </button>
          
          <button 
            onClick={() => increment()}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            +1
          </button>
          
          <button 
            onClick={reset}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={isZero}
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex space-x-2">
          <button 
            onClick={decrementByTwo}
            className="px-3 py-1 bg-red-400 text-white rounded hover:bg-red-500"
          >
            -2
          </button>
          
          <button 
            onClick={incrementByTwo}
            className="px-3 py-1 bg-green-400 text-white rounded hover:bg-green-500"
          >
            +2
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(Number(e.target.value))}
            className="w-16 px-2 py-1 border rounded"
          />
          
          <button 
            onClick={handleCustomIncrement}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Amount
          </button>
        </div>
      </div>
    </div>
  );
}

export default CounterComponent; 