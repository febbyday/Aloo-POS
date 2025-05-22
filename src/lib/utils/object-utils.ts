/**
 * Deep clone an object
 * 
 * @param obj - The object to clone
 * @returns A deep copy of the object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  return Object.keys(obj).reduce((result, key) => {
    return {
      ...result,
      [key]: deepClone((obj as Record<string, any>)[key])
    };
  }, {}) as T;
}

/**
 * Check if an object is empty
 * 
 * @param obj - The object to check
 * @returns True if the object is empty, false otherwise
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Pick specific keys from an object
 * 
 * @param obj - The source object
 * @param keys - The keys to pick
 * @returns A new object with only the specified keys
 */
export function pick<T extends object, K extends keyof T>(
  obj: T, 
  keys: K[]
): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * Omit specific keys from an object
 * 
 * @param obj - The source object
 * @param keys - The keys to omit
 * @returns A new object without the specified keys
 */
export function omit<T extends object, K extends keyof T>(
  obj: T, 
  keys: K[]
): Omit<T, K> {
  return Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key as any)) {
      result[key as string] = obj[key as keyof T];
    }
    return result;
  }, {} as any);
}
