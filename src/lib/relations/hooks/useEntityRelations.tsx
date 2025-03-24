import { useMemo } from 'react';
import { 
  EntityType, 
  RelationshipType,
  getEntityRelationships,
  getDirectRelationships,
  areEntitiesDirectlyRelated,
  getRelatedEntities
} from '../entity-relations';

/**
 * React hook for working with entity relationships
 * 
 * @param entityType The type of entity to get relationships for
 * @returns Object with relationship utility functions
 */
export function useEntityRelations(entityType: EntityType) {
  const relationships = useMemo(() => getEntityRelationships(entityType), [entityType]);
  const relatedEntities = useMemo(() => getRelatedEntities(entityType), [entityType]);
  
  return {
    // All relationships for this entity
    relationships,
    
    // All entities directly related to this entity
    relatedEntities,
    
    // Check if this entity is directly related to another entity
    isRelatedTo: (otherEntityType: EntityType) => 
      areEntitiesDirectlyRelated(entityType, otherEntityType),
    
    // Get direct relationships between this entity and another entity
    getRelationshipsWith: (otherEntityType: EntityType) => 
      getDirectRelationships(entityType, otherEntityType),
    
    // Get all relationships of a specific type
    getRelationshipsByType: (type: RelationshipType) => 
      relationships.filter(rel => rel.type === type),
    
    // Get all one-to-one relationships
    oneToOneRelationships: relationships.filter(rel => rel.type === RelationshipType.ONE_TO_ONE),
    
    // Get all one-to-many relationships
    oneToManyRelationships: relationships.filter(rel => rel.type === RelationshipType.ONE_TO_MANY),
    
    // Get all many-to-many relationships
    manyToManyRelationships: relationships.filter(rel => rel.type === RelationshipType.MANY_TO_MANY),
    
    // Get all relationships where this entity is the source
    sourceRelationships: relationships.filter(rel => rel.sourceEntity === entityType),
    
    // Get all relationships where this entity is the target
    targetRelationships: relationships.filter(rel => rel.targetEntity === entityType),
  };
}

export default useEntityRelations;
