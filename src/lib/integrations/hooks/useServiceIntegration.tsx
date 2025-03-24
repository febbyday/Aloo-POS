import { useEffect, useState } from 'react';
import { serviceIntegrator } from '../service-integrator';
import { eventBus, POS_EVENTS } from '../../events/event-bus';
import { useEventSubscription } from '../../events/hooks/useEventBus';

/**
 * React hook for initializing and working with the service integrator
 * 
 * @returns Object with integration status and utility functions
 */
export function useServiceIntegration() {
  const [initialized, setInitialized] = useState(false);
  const [systemEvents, setSystemEvents] = useState<Array<{ type: string; message: string; timestamp: Date }>>([]);
  
  // Initialize the service integrator when the component mounts
  useEffect(() => {
    if (!initialized) {
      serviceIntegrator.initialize();
      setInitialized(true);
    }
  }, [initialized]);
  
  // Subscribe to system events
  useEventSubscription(POS_EVENTS.SYSTEM_ERROR, (error: any) => {
    setSystemEvents(prev => [
      ...prev,
      { type: 'error', message: error.message || String(error), timestamp: new Date() }
    ]);
  });
  
  useEventSubscription(POS_EVENTS.SYSTEM_WARNING, (warning: any) => {
    setSystemEvents(prev => [
      ...prev,
      { type: 'warning', message: warning.message || String(warning), timestamp: new Date() }
    ]);
  });
  
  useEventSubscription(POS_EVENTS.SYSTEM_INFO, (info: any) => {
    setSystemEvents(prev => [
      ...prev,
      { type: 'info', message: info.message || String(info), timestamp: new Date() }
    ]);
  });
  
  return {
    initialized,
    systemEvents,
    clearSystemEvents: () => setSystemEvents([]),
    emitSystemEvent: (type: 'error' | 'warning' | 'info', message: string) => {
      const eventType = 
        type === 'error' ? POS_EVENTS.SYSTEM_ERROR :
        type === 'warning' ? POS_EVENTS.SYSTEM_WARNING :
        POS_EVENTS.SYSTEM_INFO;
      
      eventBus.emit(eventType, { message });
    }
  };
}

export default useServiceIntegration;
