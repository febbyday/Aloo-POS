/**
 * Component System
 * 
 * This module exports the component system utilities and components
 * organized by atomic design principles.
 */

// Export component creator utility
export {
  createComponent,
  createComponentDocs,
  type CreateComponentOptions,
  type DocumentedComponent
} from './createComponent';

// Export atoms (will be populated as components are created)
export * from './atoms';

// Export molecules (will be populated as components are created)
export * from './molecules';

// Export organisms (will be populated as components are created)
export * from './organisms';

// Export templates (will be populated as components are created)
export * from './templates';

// Export pages (will be populated as components are created)
export * from './pages'; 