import { useEffect, useRef } from 'react';
import { eventBus, EventSubscription } from '../event-bus';

/**
 * React hook for subscribing to events from the event bus
 * 
 * @param eventName Name of the event to subscribe to
 * @param callback Function to call when the event is emitted
 * @param deps Dependencies array for the effect (similar to useEffect)
 */
export function useEventSubscription<T = any>(
  eventName: string,
  callback: (data: T) => void,
  deps: React.DependencyList = []
): void {
  // Use ref to maintain the same callback reference across renders
  const callbackRef = useRef(callback);
  
  // Update the callback ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Subscribe to the event when the component mounts
  useEffect(() => {
    const subscription = eventBus.subscribe<T>(eventName, (data) => {
      callbackRef.current(data);
    });
    
    // Unsubscribe when the component unmounts or dependencies change
    return () => {
      subscription.unsubscribe();
    };
  }, [eventName, ...deps]);
}

/**
 * React hook for emitting events to the event bus
 * 
 * @returns Function to emit events
 */
export function useEventEmitter() {
  return {
    emit: <T = any>(eventName: string, data: T) => {
      eventBus.emit(eventName, data);
    }
  };
}

export default { useEventSubscription, useEventEmitter };
