/**
 * Relations Module Index
 * 
 * This file exports all the components, hooks, and utilities from the relations module
 */

// Export entity relations
import { 
  EntityType, 
  RelationshipType,
  entityRelationships,
  getEntityRelationships,
  getDirectRelationships,
  areEntitiesDirectlyRelated,
  getRelatedEntities
} from './entity-relations';

export { 
  EntityType, 
  RelationshipType,
  entityRelationships,
  getEntityRelationships,
  getDirectRelationships,
  areEntitiesDirectlyRelated,
  getRelatedEntities
};

// Export hooks
import { useEntityRelations } from './hooks/useEntityRelations';
export { useEntityRelations };

// Export default object with all components
export default {
  types: {
    EntityType,
    RelationshipType,
  },
  relationships: entityRelationships,
  utils: {
    getEntityRelationships,
    getDirectRelationships,
    areEntitiesDirectlyRelated,
    getRelatedEntities,
  },
  hooks: {
    useEntityRelations,
  },
};
