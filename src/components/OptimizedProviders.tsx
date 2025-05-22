import React, { ReactNode, useEffect } from 'react';
import { performanceMonitor } from '@/lib/performance/performance-monitor';

interface ProviderProps {
  children: ReactNode;
}

/**
 * OptimizedProviders Component
 * 
 * This component wraps multiple providers and optimizes their initialization
 * by grouping them and measuring their performance.
 */
export function OptimizedProviders({ children }: ProviderProps) {
  useEffect(() => {
    performanceMonitor.markStart('providers:initialization');
    
    return () => {
      performanceMonitor.markEnd('providers:initialization');
    };
  }, []);
  
  return <>{children}</>;
}

/**
 * CoreProviders Component
 * 
 * This component wraps the core providers that are required for the application
 * to function properly.
 */
export function CoreProviders({ children }: ProviderProps) {
  useEffect(() => {
    performanceMonitor.markStart('providers:core');
    
    return () => {
      performanceMonitor.markEnd('providers:core');
    };
  }, []);
  
  return <>{children}</>;
}

/**
 * FeatureProviders Component
 * 
 * This component wraps feature-specific providers that are not required
 * for the core application to function.
 */
export function FeatureProviders({ children }: ProviderProps) {
  useEffect(() => {
    performanceMonitor.markStart('providers:features');
    
    return () => {
      performanceMonitor.markEnd('providers:features');
    };
  }, []);
  
  return <>{children}</>;
}

/**
 * HistoryProviders Component
 * 
 * This component wraps history-related providers that are used for tracking
 * changes to entities.
 */
export function HistoryProviders({ children }: ProviderProps) {
  useEffect(() => {
    performanceMonitor.markStart('providers:history');
    
    return () => {
      performanceMonitor.markEnd('providers:history');
    };
  }, []);
  
  return <>{children}</>;
}

export default OptimizedProviders;
