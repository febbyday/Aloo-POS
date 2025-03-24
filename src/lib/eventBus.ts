/**
 * Event Bus Re-export
 * 
 * This file re-exports the eventBus from the events module for backward compatibility
 * and to maintain a simpler import path for components that use the event bus.
 */

import { eventBus, POS_EVENTS } from './events/event-bus';

export { eventBus, POS_EVENTS };
export default eventBus; 