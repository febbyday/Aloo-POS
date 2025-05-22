/**
 * Utility functions for async and event safety
 */

/**
 * Creates an AbortController and returns utilities for managing it
 */
export function createAbortController() {
  const controller = new AbortController();
  
  return {
    signal: controller.signal,
    abort: () => controller.abort(),
    isAborted: () => controller.signal.aborted
  };
}

/**
 * Safe async operation handler that prevents state updates after unmounting
 */
export function createSafeAsyncHandler() {
  let isActive = true;
  
  return {
    /**
     * Execute an async function safely, ensuring no state updates after unmount
     */
    execute: async <T>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
      if (!isActive) return undefined;
      
      try {
        const result = await asyncFn();
        return isActive ? result : undefined;
      } catch (error) {
        // Only log error if the component is still mounted
        if (isActive) {
          console.error("Error in safe async operation:", error);
        }
        return undefined;
      }
    },
    
    /**
     * Call on component unmount to prevent further operations
     */
    cleanup: () => {
      isActive = false;
    }
  };
}

/**
 * Manages event listeners with auto-cleanup
 */
export function createEventManager() {
  const listeners: Array<{
    element: EventTarget;
    event: string;
    callback: EventListenerOrEventListenerObject;
    options?: AddEventListenerOptions | boolean | undefined;
  }> = [];
  
  return {
    /**
     * Add event listener with automatic tracking for cleanup
     */
    addEventListener: (
      element: EventTarget,
      event: string,
      callback: EventListenerOrEventListenerObject,
      options?: AddEventListenerOptions | boolean
    ) => {
      element.addEventListener(event, callback, options);
      listeners.push({ element, event, callback, options });
    },
    
    /**
     * Remove all registered event listeners
     */
    removeAllListeners: () => {
      listeners.forEach(({ element, event, callback, options }) => {
        element.removeEventListener(event, callback, options);
      });
      listeners.length = 0;
    }
  };
}
