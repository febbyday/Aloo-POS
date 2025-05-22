/**
 * Performance Monitoring Utility
 * 
 * This utility provides functions to measure and log performance metrics
 * for different parts of the application.
 */

// Store performance marks and measures
const performanceMarks: Record<string, number> = {};
const performanceMeasures: Record<string, { duration: number, timestamp: number }> = {};

// Enable detailed logging in development mode
const enableDetailedLogging = import.meta.env.MODE === 'development';

/**
 * Mark the start of a performance measurement
 * 
 * @param name Name of the performance mark
 */
export function markStart(name: string): void {
  performanceMarks[name] = performance.now();
  
  if (enableDetailedLogging) {
    console.log(`⏱️ [Performance] Started: ${name}`);
  }
}

/**
 * Mark the end of a performance measurement and calculate duration
 * 
 * @param name Name of the performance mark
 * @param logImmediately Whether to log the measurement immediately
 * @returns Duration in milliseconds
 */
export function markEnd(name: string, logImmediately = true): number {
  const endTime = performance.now();
  const startTime = performanceMarks[name];
  
  if (startTime === undefined) {
    console.warn(`⚠️ [Performance] No start mark found for: ${name}`);
    return 0;
  }
  
  const duration = endTime - startTime;
  
  // Store the measurement
  performanceMeasures[name] = {
    duration,
    timestamp: endTime
  };
  
  // Log the measurement if requested
  if (logImmediately && enableDetailedLogging) {
    console.log(`⏱️ [Performance] ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return duration;
}

/**
 * Measure the execution time of a function
 * 
 * @param name Name of the measurement
 * @param fn Function to measure
 * @returns Result of the function
 */
export async function measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
  markStart(name);
  try {
    return await fn();
  } finally {
    markEnd(name);
  }
}

/**
 * Measure the execution time of a synchronous function
 * 
 * @param name Name of the measurement
 * @param fn Function to measure
 * @returns Result of the function
 */
export function measureSync<T>(name: string, fn: () => T): T {
  markStart(name);
  try {
    return fn();
  } finally {
    markEnd(name);
  }
}

/**
 * Get all performance measurements
 * 
 * @returns Object containing all measurements
 */
export function getAllMeasurements(): Record<string, { duration: number, timestamp: number }> {
  return { ...performanceMeasures };
}

/**
 * Log all performance measurements
 */
export function logAllMeasurements(): void {
  console.group('📊 Performance Measurements');
  
  // Sort measurements by duration (descending)
  const sortedMeasurements = Object.entries(performanceMeasures)
    .sort(([, a], [, b]) => b.duration - a.duration);
  
  // Log each measurement
  sortedMeasurements.forEach(([name, { duration }]) => {
    console.log(`${name}: ${duration.toFixed(2)}ms`);
  });
  
  console.groupEnd();
}

/**
 * Clear all performance measurements
 */
export function clearMeasurements(): void {
  Object.keys(performanceMarks).forEach(key => {
    delete performanceMarks[key];
  });
  
  Object.keys(performanceMeasures).forEach(key => {
    delete performanceMeasures[key];
  });
}

// Export the performance monitoring API
export const performanceMonitor = {
  markStart,
  markEnd,
  measure,
  measureSync,
  getAllMeasurements,
  logAllMeasurements,
  clearMeasurements
};

export default performanceMonitor;
