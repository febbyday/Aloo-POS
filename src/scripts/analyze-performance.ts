/**
 * Performance Analysis Script
 * 
 * This script analyzes the performance of the application and provides
 * recommendations for improvement.
 */

import { performanceMonitor } from '../lib/performance/performance-monitor';

/**
 * Analyze performance measurements and provide recommendations
 */
export function analyzePerformance() {
  // Get all measurements
  const measurements = performanceMonitor.getAllMeasurements();
  
  // Define thresholds for different metrics
  const thresholds = {
    initialization: 1000, // 1 second
    providers: 500, // 500 ms
    rendering: 500, // 500 ms
    apiRequest: 300, // 300 ms
  };
  
  // Initialize recommendations array
  const recommendations: string[] = [];
  
  // Check initialization time
  if (measurements['app:initialization']?.duration > thresholds.initialization) {
    recommendations.push(
      'Application initialization is slow. Consider lazy loading more components and reducing the number of providers.'
    );
  }
  
  // Check providers initialization time
  if (measurements['providers:initialization']?.duration > thresholds.providers) {
    recommendations.push(
      'Provider initialization is slow. Consider combining related providers or lazy loading non-critical providers.'
    );
  }
  
  // Check core providers initialization time
  if (measurements['providers:core']?.duration > thresholds.providers / 2) {
    recommendations.push(
      'Core providers initialization is slow. Review the initialization logic of AuthProvider, NotificationProvider, StoreProvider, and CompanyProvider.'
    );
  }
  
  // Check feature providers initialization time
  if (measurements['providers:features']?.duration > thresholds.providers / 2) {
    recommendations.push(
      'Feature providers initialization is slow. Consider lazy loading these providers or optimizing their initialization logic.'
    );
  }
  
  // Check history providers initialization time
  if (measurements['providers:history']?.duration > thresholds.providers / 2) {
    recommendations.push(
      'History providers initialization is slow. These providers might be making unnecessary API calls during initialization.'
    );
  }
  
  // Check rendering time
  if (measurements['app:rendering']?.duration > thresholds.rendering) {
    recommendations.push(
      'Initial rendering is slow. Consider using React.memo for complex components and reducing the number of components rendered on initial load.'
    );
  }
  
  // Check settings preload time
  if (measurements['settings:preload']?.duration > thresholds.apiRequest) {
    recommendations.push(
      'Settings preloading is slow. Consider optimizing the settings service or loading settings on demand.'
    );
  }
  
  // Log recommendations
  if (recommendations.length > 0) {
    console.group('🔍 Performance Recommendations');
    recommendations.forEach((recommendation, index) => {
      console.log(`${index + 1}. ${recommendation}`);
    });
    console.groupEnd();
  } else {
    console.log('✅ No performance issues detected.');
  }
  
  return recommendations;
}

// Export the analyze function
export default analyzePerformance;
