/**
 * Events Module Index
 * 
 * This file exports all the components, hooks, and utilities from the events module
 */

// Export event bus
import { eventBus, POS_EVENTS } from './event-bus';
export { eventBus, POS_EVENTS };

// Export hooks
import { useEventSubscription, useEventEmitter } from './hooks/useEventBus';
export { useEventSubscription, useEventEmitter };

// Export components
import { EventLogger } from './components/EventLogger';
export { EventLogger };

// Export default object with all components
export default {
  bus: eventBus,
  events: POS_EVENTS,
  hooks: {
    useEventSubscription,
    useEventEmitter,
  },
  components: {
    EventLogger,
  },
};
