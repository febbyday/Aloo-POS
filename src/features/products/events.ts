/**
 * Products Module Events
 * 
 * This file defines all events that the Products module publishes.
 * These events can be subscribed to by other modules using the event bus.
 */

import { Product, ProductCategory, ProductVariant } from './types/product.types';

/**
 * Event names for the Products module
 */
export enum ProductEventTypes {
  // Product lifecycle events
  PRODUCT_CREATED = 'products/product-created',
  PRODUCT_UPDATED = 'products/product-updated',
  PRODUCT_DELETED = 'products/product-deleted',
  
  // Product state events
  PRODUCT_ACTIVATED = 'products/product-activated',
  PRODUCT_DEACTIVATED = 'products/product-deactivated',
  
  // Category events
  CATEGORY_CREATED = 'products/category-created',
  CATEGORY_UPDATED = 'products/category-updated',
  CATEGORY_DELETED = 'products/category-deleted',
  
  // Variant events
  VARIANT_CREATED = 'products/variant-created',
  VARIANT_UPDATED = 'products/variant-updated',
  VARIANT_DELETED = 'products/variant-deleted',
  
  // Pricing events
  PRICE_UPDATED = 'products/price-updated',
  SALE_PRICE_ADDED = 'products/sale-price-added',
  SALE_PRICE_REMOVED = 'products/sale-price-removed',
}

/**
 * Base interface for all product events
 */
interface ProductEvent {
  type: ProductEventTypes;
  timestamp: number;
}

/**
 * Product created event
 */
export interface ProductCreatedEvent extends ProductEvent {
  type: ProductEventTypes.PRODUCT_CREATED;
  product: Product;
}

/**
 * Product updated event
 */
export interface ProductUpdatedEvent extends ProductEvent {
  type: ProductEventTypes.PRODUCT_UPDATED;
  productId: string;
  changes: Partial<Product>;
  previousValues: Partial<Product>;
}

/**
 * Product deleted event
 */
export interface ProductDeletedEvent extends ProductEvent {
  type: ProductEventTypes.PRODUCT_DELETED;
  productId: string;
}

/**
 * Product activated event
 */
export interface ProductActivatedEvent extends ProductEvent {
  type: ProductEventTypes.PRODUCT_ACTIVATED;
  productId: string;
}

/**
 * Product deactivated event
 */
export interface ProductDeactivatedEvent extends ProductEvent {
  type: ProductEventTypes.PRODUCT_DEACTIVATED;
  productId: string;
}

/**
 * Category created event
 */
export interface CategoryCreatedEvent extends ProductEvent {
  type: ProductEventTypes.CATEGORY_CREATED;
  category: ProductCategory;
}

/**
 * Category updated event
 */
export interface CategoryUpdatedEvent extends ProductEvent {
  type: ProductEventTypes.CATEGORY_UPDATED;
  categoryId: string;
  changes: Partial<ProductCategory>;
}

/**
 * Category deleted event
 */
export interface CategoryDeletedEvent extends ProductEvent {
  type: ProductEventTypes.CATEGORY_DELETED;
  categoryId: string;
}

/**
 * Variant created event
 */
export interface VariantCreatedEvent extends ProductEvent {
  type: ProductEventTypes.VARIANT_CREATED;
  productId: string;
  variant: ProductVariant;
}

/**
 * Variant updated event
 */
export interface VariantUpdatedEvent extends ProductEvent {
  type: ProductEventTypes.VARIANT_UPDATED;
  productId: string;
  variantId: string;
  changes: Partial<ProductVariant>;
}

/**
 * Variant deleted event
 */
export interface VariantDeletedEvent extends ProductEvent {
  type: ProductEventTypes.VARIANT_DELETED;
  productId: string;
  variantId: string;
}

/**
 * Price updated event
 */
export interface PriceUpdatedEvent extends ProductEvent {
  type: ProductEventTypes.PRICE_UPDATED;
  productId: string;
  variantId?: string;
  oldPrice: number;
  newPrice: number;
}

/**
 * Sale price added event
 */
export interface SalePriceAddedEvent extends ProductEvent {
  type: ProductEventTypes.SALE_PRICE_ADDED;
  productId: string;
  variantId?: string;
  regularPrice: number;
  salePrice: number;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Sale price removed event
 */
export interface SalePriceRemovedEvent extends ProductEvent {
  type: ProductEventTypes.SALE_PRICE_REMOVED;
  productId: string;
  variantId?: string;
}

/**
 * Union type of all product events
 */
export type ProductEvents =
  | ProductCreatedEvent
  | ProductUpdatedEvent
  | ProductDeletedEvent
  | ProductActivatedEvent
  | ProductDeactivatedEvent
  | CategoryCreatedEvent
  | CategoryUpdatedEvent
  | CategoryDeletedEvent
  | VariantCreatedEvent
  | VariantUpdatedEvent
  | VariantDeletedEvent
  | PriceUpdatedEvent
  | SalePriceAddedEvent
  | SalePriceRemovedEvent;

/**
 * Object containing all event types for the Products module
 * This is exported for use by other modules that need to subscribe to these events
 */
export const PRODUCT_EVENTS = ProductEventTypes; 