import React, { useEffect } from 'react';
import { performanceMonitor } from './performance-monitor';

interface PerformanceWrapperProps {
  name: string;
  children: React.ReactNode;
  logImmediately?: boolean;
}

/**
 * A component wrapper that measures the rendering time of its children
 * 
 * @param name Name of the performance measurement
 * @param children React children to render
 * @param logImmediately Whether to log the measurement immediately
 */
export function PerformanceWrapper({ 
  name, 
  children, 
  logImmediately = false 
}: PerformanceWrapperProps) {
  useEffect(() => {
    performanceMonitor.markStart(name);
    
    return () => {
      performanceMonitor.markEnd(name, logImmediately);
    };
  }, [name, logImmediately]);
  
  return <>{children}</>;
}

export default PerformanceWrapper;
