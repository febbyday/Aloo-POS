# Store Examples

This directory contains examples of how to use the store factory for state management in the POS system.

## Counter Store Example

The counter store is a simple example that demonstrates the basic features of the store factory:

1. **Store Creation** (`counterStore.ts`): Shows how to define a store with state and actions
2. **Custom Hook** (`useCounter.tsx`): Shows how to create a hook that consumes the store
3. **UI Component** (`CounterComponent.tsx`): Shows how to use the hook in a React component

## Key Features Demonstrated

### 1. State Management

```typescript
// Create the store using the factory
const counterStore = createStore<CounterState, CounterActions>(
  (set, get) => ({
    // Actions implementation...
  }),
  {
    name: 'counter-store',
    description: 'A simple counter store example',
    initialState,
    persist: true,
    logging: true
  }
);
```

### 2. Selector Creation

```typescript
// Create selectors for the store
export const { useSelector, useStore } = createSelectors(counterStore);

// Export individual selectors for common use cases
export const useCount = () => useSelector((state) => state.count);
export const useLastUpdated = () => useSelector((state) => state.lastUpdated);
```

### 3. Composition in Hooks

```typescript
export function useCounter(options: UseCounterOptions = {}) {
  // Get state and actions from the store
  const count = useCount();
  const { increment, decrement, reset, setCount } = useCounterActions();
  
  // Create enhanced actions
  const incrementByTwo = useCallback(() => {
    increment(2);
  }, [increment]);
  
  // Return a composed API
  return {
    count,
    increment,
    incrementByTwo,
    // ...other properties
  };
}
```

## Best Practices

1. **Normalized State**: Keep state normalized when dealing with collections (see product store for a more complex example)
2. **Atomized Selectors**: Create fine-grained selectors to minimize re-renders
3. **Derived State in Hooks**: Calculate derived state in hooks, not in the store
4. **Persistence Configuration**: Use the `persist` option for state that should persist across sessions
5. **Dev Tools Integration**: Use the `logging` option during development for better debugging

## Using the Store Factory

To create a new store:

1. Define your state interface
2. Define your actions interface
3. Create the store using the factory
4. Create selectors for the store
5. Create hooks to consume the store
6. Use the hooks in your components

## Advanced Features

The store factory supports several advanced features:

1. **Persistence**: Automatically persist state to localStorage
2. **Immer Integration**: Use Immer for immutable updates with mutable syntax
3. **Middleware Support**: Add custom middleware for advanced use cases
4. **TypeScript Integration**: Full type safety for state and actions
5. **Dev Tools**: Integration with Redux DevTools during development

See `createStore.ts` for more details on available options and features. 