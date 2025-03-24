/**
 * Entity Relations Manager
 * 
 * This module defines and manages relationships between different entities in the POS system.
 * It provides a centralized way to understand how entities are connected and how changes
 * in one entity might affect others.
 */

// Define relationship types
export enum RelationshipType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_MANY = 'MANY_TO_MANY',
}

// Define entity types
export enum EntityType {
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  CUSTOMER = 'CUSTOMER',
  ORDER = 'ORDER',
  ORDER_ITEM = 'ORDER_ITEM',
  SUPPLIER = 'SUPPLIER',
  INVENTORY = 'INVENTORY',
  EMPLOYEE = 'EMPLOYEE',
  PAYMENT = 'PAYMENT',
  TAX = 'TAX',
  DISCOUNT = 'DISCOUNT',
}

// Define relationship interface
export interface Relationship {
  sourceEntity: EntityType;
  targetEntity: EntityType;
  type: RelationshipType;
  sourceField: string;
  targetField: string;
  description: string;
  cascadeOperations?: {
    onDelete?: boolean;
    onUpdate?: boolean;
  };
}

// Define the relationships between entities
export const entityRelationships: Relationship[] = [
  // Product relationships
  {
    sourceEntity: EntityType.PRODUCT,
    targetEntity: EntityType.CATEGORY,
    type: RelationshipType.MANY_TO_MANY,
    sourceField: 'categoryIds',
    targetField: 'id',
    description: 'Products belong to multiple categories',
  },
  {
    sourceEntity: EntityType.PRODUCT,
    targetEntity: EntityType.SUPPLIER,
    type: RelationshipType.MANY_TO_MANY,
    sourceField: 'supplierIds',
    targetField: 'id',
    description: 'Products are supplied by multiple suppliers',
  },
  {
    sourceEntity: EntityType.PRODUCT,
    targetEntity: EntityType.INVENTORY,
    type: RelationshipType.ONE_TO_ONE,
    sourceField: 'id',
    targetField: 'productId',
    description: 'Products have inventory information',
    cascadeOperations: {
      onDelete: true,
      onUpdate: true,
    },
  },
  
  // Order relationships
  {
    sourceEntity: EntityType.ORDER,
    targetEntity: EntityType.CUSTOMER,
    type: RelationshipType.MANY_TO_ONE,
    sourceField: 'customerId',
    targetField: 'id',
    description: 'Orders belong to a customer',
  },
  {
    sourceEntity: EntityType.ORDER,
    targetEntity: EntityType.ORDER_ITEM,
    type: RelationshipType.ONE_TO_MANY,
    sourceField: 'id',
    targetField: 'orderId',
    description: 'Orders contain multiple order items',
    cascadeOperations: {
      onDelete: true,
      onUpdate: true,
    },
  },
  {
    sourceEntity: EntityType.ORDER,
    targetEntity: EntityType.PAYMENT,
    type: RelationshipType.ONE_TO_MANY,
    sourceField: 'id',
    targetField: 'orderId',
    description: 'Orders can have multiple payments',
    cascadeOperations: {
      onDelete: true,
      onUpdate: true,
    },
  },
  {
    sourceEntity: EntityType.ORDER,
    targetEntity: EntityType.EMPLOYEE,
    type: RelationshipType.MANY_TO_ONE,
    sourceField: 'employeeId',
    targetField: 'id',
    description: 'Orders are processed by an employee',
  },
  
  // Order item relationships
  {
    sourceEntity: EntityType.ORDER_ITEM,
    targetEntity: EntityType.PRODUCT,
    type: RelationshipType.MANY_TO_ONE,
    sourceField: 'productId',
    targetField: 'id',
    description: 'Order items reference a product',
  },
  {
    sourceEntity: EntityType.ORDER_ITEM,
    targetEntity: EntityType.TAX,
    type: RelationshipType.MANY_TO_MANY,
    sourceField: 'taxIds',
    targetField: 'id',
    description: 'Order items can have multiple taxes applied',
  },
  {
    sourceEntity: EntityType.ORDER_ITEM,
    targetEntity: EntityType.DISCOUNT,
    type: RelationshipType.MANY_TO_MANY,
    sourceField: 'discountIds',
    targetField: 'id',
    description: 'Order items can have multiple discounts applied',
  },
  
  // Customer relationships
  {
    sourceEntity: EntityType.CUSTOMER,
    targetEntity: EntityType.ORDER,
    type: RelationshipType.ONE_TO_MANY,
    sourceField: 'id',
    targetField: 'customerId',
    description: 'Customers can have multiple orders',
  },
  
  // Supplier relationships
  {
    sourceEntity: EntityType.SUPPLIER,
    targetEntity: EntityType.PRODUCT,
    type: RelationshipType.ONE_TO_MANY,
    sourceField: 'id',
    targetField: 'supplierIds',
    description: 'Suppliers provide multiple products',
  },
  {
    sourceEntity: EntityType.SUPPLIER,
    targetEntity: EntityType.CATEGORY,
    type: RelationshipType.MANY_TO_MANY,
    sourceField: 'categories',
    targetField: 'id',
    description: 'Suppliers are associated with multiple categories',
  },
  
  // Category relationships
  {
    sourceEntity: EntityType.CATEGORY,
    targetEntity: EntityType.PRODUCT,
    type: RelationshipType.ONE_TO_MANY,
    sourceField: 'id',
    targetField: 'categoryIds',
    description: 'Categories contain multiple products',
  },
  {
    sourceEntity: EntityType.CATEGORY,
    targetEntity: EntityType.CATEGORY,
    type: RelationshipType.ONE_TO_MANY,
    sourceField: 'id',
    targetField: 'parentId',
    description: 'Categories can have subcategories',
  },
];

/**
 * Get all relationships for a specific entity
 * @param entityType The type of entity to get relationships for
 * @returns Array of relationships where the entity is either the source or target
 */
export function getEntityRelationships(entityType: EntityType): Relationship[] {
  return entityRelationships.filter(
    rel => rel.sourceEntity === entityType || rel.targetEntity === entityType
  );
}

/**
 * Get direct relationships between two entities
 * @param sourceEntityType The source entity type
 * @param targetEntityType The target entity type
 * @returns Array of relationships between the two entities
 */
export function getDirectRelationships(
  sourceEntityType: EntityType,
  targetEntityType: EntityType
): Relationship[] {
  return entityRelationships.filter(
    rel => 
      (rel.sourceEntity === sourceEntityType && rel.targetEntity === targetEntityType) ||
      (rel.sourceEntity === targetEntityType && rel.targetEntity === sourceEntityType)
  );
}

/**
 * Check if two entities are directly related
 * @param sourceEntityType The source entity type
 * @param targetEntityType The target entity type
 * @returns True if the entities are directly related
 */
export function areEntitiesDirectlyRelated(
  sourceEntityType: EntityType,
  targetEntityType: EntityType
): boolean {
  return getDirectRelationships(sourceEntityType, targetEntityType).length > 0;
}

/**
 * Get all entities that are directly related to the given entity
 * @param entityType The entity type to get related entities for
 * @returns Array of entity types that are directly related
 */
export function getRelatedEntities(entityType: EntityType): EntityType[] {
  const relationships = getEntityRelationships(entityType);
  const relatedEntities = new Set<EntityType>();
  
  relationships.forEach(rel => {
    if (rel.sourceEntity === entityType) {
      relatedEntities.add(rel.targetEntity);
    } else {
      relatedEntities.add(rel.sourceEntity);
    }
  });
  
  return Array.from(relatedEntities);
}

export default {
  RelationshipType,
  EntityType,
  entityRelationships,
  getEntityRelationships,
  getDirectRelationships,
  areEntitiesDirectlyRelated,
  getRelatedEntities,
};
