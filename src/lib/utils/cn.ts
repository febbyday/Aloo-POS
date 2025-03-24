/**
 * Class Name Utility
 * 
 * A utility for conditionally joining class names together.
 * Uses the clsx and tailwind-merge libraries for optimal class merging.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges multiple class names together and resolves Tailwind CSS conflicts
 * 
 * @param inputs - Class names or conditional class objects to merge
 * @returns Merged class string with resolved Tailwind conflicts
 * 
 * @example
 * // Basic usage
 * cn('text-red-500', 'bg-blue-500')
 * // => 'text-red-500 bg-blue-500'
 * 
 * @example
 * // With conditionals
 * cn('text-base', { 'text-red-500': isError, 'text-green-500': isSuccess })
 * // => 'text-base text-red-500' if isError is true
 * // => 'text-base text-green-500' if isSuccess is true
 * 
 * @example
 * // Resolving conflicts
 * cn('text-red-500', 'text-blue-500')
 * // => 'text-blue-500' (the latter class wins)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export default cn; 