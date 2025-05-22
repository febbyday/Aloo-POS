/**
 * Utility functions to handle async operations safely
 * and prevent "message channel closed" errors
 */

/**
 * Creates an AbortController with automatic cleanup on unmount
 * Use this in React components with useEffect for cancellable async operations
 * 
 * @example
 * const { signal, abort } = useAbortController();
 * 
 * useEffect(() => {
 *   fetchData({ signal });
 *   return abort; // Cleanup on unmount
 * }, []);
 */
export function useAbortController() {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    abort: () => controller.abort()
  };
}

/**
 * Wraps an async function to make it safe when components unmount
 * Returns a version of the function that won't cause errors if it resolves after unmount
 * 
 * @example
 * const safeAsync = createSafeAsync();
 * 
 * useEffect(() => {
 *   // This won't cause errors if the component unmounts before it completes
 *   safeAsync(async () => {
 *     const data = await fetchSomething();
 *     setState(data); // Safe: won't be called if unmounted
 *   });
 * }, []);
 */
export function createSafeAsync() {
  let mounted = true;
  
  // Function to safely execute async operations
  const safeAsync = <T>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
    return new Promise((resolve) => {
      if (!mounted) {
        resolve(undefined);
        return;
      }
      
      asyncFn()
        .then((result) => {
          if (mounted) {
            resolve(result);
          } else {
            resolve(undefined);
          }
        })
        .catch((error) => {
          console.error('Async operation failed:', error);
          resolve(undefined);
        });
    });
  };
  
  // Cleanup function to call on unmount
  safeAsync.cleanup = () => {
    mounted = false;
  };
  
  return safeAsync;
}

/**
 * Makes event listeners safe by ensuring they're properly removed on cleanup
 * 
 * @example
 * useEffect(() => {
 *   const { addEventListener, removeAllListeners } = createSafeEventListeners();
 *   
 *   addEventListener(window, 'resize', handleResize);
 *   addEventListener(document, 'keydown', handleKeyDown);
 *   
 *   return removeAllListeners; // Automatically removes all listeners on unmount
 * }, []);
 */
export function createSafeEventListeners() {
  const listeners: Array<{
    target: EventTarget;
    type: string;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
  }> = [];
  
  const addEventListener = (
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => {
    target.addEventListener(type, listener, options);
    listeners.push({ target, type, listener, options });
  };
  
  const removeAllListeners = () => {
    listeners.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    listeners.length = 0;
  };
  
  return {
    addEventListener,
    removeAllListeners
  };
}
