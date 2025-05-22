/**
 * Service Integrator
 * 
 * This module provides integration between different services in the POS system,
 * ensuring that changes in one service are properly propagated to related services.
 */

import { eventBus, POS_EVENTS } from '../events/event-bus';
import productService from '../../features/products/services/factory-product-service';
import customersService from '../../features/customers/services/factory-customers-service';
import suppliersService from '../../features/suppliers/services/factory-suppliers-service';
import ordersService from '../../features/orders/services/factory-orders-service';
import { EntityType, getRelatedEntities } from '../relations/entity-relations';

class ServiceIntegrator {
  private initialized = false;
  
  /**
   * Initialize the service integrator by setting up event listeners
   */
  public initialize(): void {
    if (this.initialized) {
      return;
    }
    
    this.setupProductIntegrations();
    this.setupCustomerIntegrations();
    this.setupOrderIntegrations();
    this.setupSupplierIntegrations();
    
    this.initialized = true;
    console.log('Service integrator initialized');
  }
  
  /**
   * Set up integrations for product-related events
   */
  private setupProductIntegrations(): void {
    // When a product's inventory changes, check if it's low and emit an event if needed
    eventBus.subscribe(POS_EVENTS.PRODUCT_INVENTORY_CHANGED, async (data: { productId: string, newQuantity: number }) => {
      const { productId, newQuantity } = data;
      const product = (await productService.getById(productId)).data;
      
      if (!product) return;
      
      if (newQuantity <= product.lowStockThreshold && newQuantity > 0) {
        eventBus.emit(POS_EVENTS.INVENTORY_LOW, {
          productId,
          productName: product.name,
          currentQuantity: newQuantity,
          threshold: product.lowStockThreshold
        });
      } else if (newQuantity <= 0) {
        eventBus.emit(POS_EVENTS.INVENTORY_OUT_OF_STOCK, {
          productId,
          productName: product.name
        });
      }
    });
    
    // When a product is deleted, check for related entities that might be affected
    eventBus.subscribe(POS_EVENTS.PRODUCT_DELETED, async (productId: string) => {
      const relatedEntities = getRelatedEntities(EntityType.PRODUCT);
      
      // Log which entities might be affected by this deletion
      console.log(`Product ${productId} deleted. Related entities that might be affected:`, relatedEntities);
    });
  }
  
  /**
   * Set up integrations for customer-related events
   */
  private setupCustomerIntegrations(): void {
    // When a customer's loyalty points change, check if they qualify for a new membership level
    eventBus.subscribe(POS_EVENTS.CUSTOMER_LOYALTY_CHANGED, async (data: { customerId: string, newPoints: number }) => {
      const { customerId, newPoints } = data;
      const customer = (await customersService.getById(customerId)).data;
      
      if (!customer) return;
      
      // Check if the customer's membership level should change based on points
      let newMembershipLevel = customer.membershipLevel;
      
      if (newPoints >= 1000) {
        newMembershipLevel = 'platinum';
      } else if (newPoints >= 500) {
        newMembershipLevel = 'gold';
      } else if (newPoints >= 200) {
        newMembershipLevel = 'silver';
      } else {
        newMembershipLevel = 'bronze';
      }
      
      // Update membership level if it changed
      if (newMembershipLevel !== customer.membershipLevel) {
        await customersService.update(customerId, { membershipLevel: newMembershipLevel });
        
        eventBus.emit(POS_EVENTS.CUSTOMER_UPDATED, {
          customerId,
          changes: {
            membershipLevel: {
              from: customer.membershipLevel,
              to: newMembershipLevel
            }
          }
        });
      }
    });
  }
  
  /**
   * Set up integrations for order-related events
   */
  private setupOrderIntegrations(): void {
    // When an order is created, update product inventory
    eventBus.subscribe(POS_EVENTS.ORDER_CREATED, async (orderId: string) => {
      const order = (await ordersService.getById(orderId)).data;
      
      if (!order) return;
      
      // Update inventory for each product in the order
      for (const item of order.items) {
        await productService.updateInventory(
          item.productId, 
          item.quantity, 
          false // Decrement inventory
        );
        
        // Emit event for inventory change
        eventBus.emit(POS_EVENTS.PRODUCT_INVENTORY_CHANGED, {
          productId: item.productId,
          newQuantity: (await productService.getById(item.productId)).data?.inventory || 0
        });
      }
      
      // Update customer loyalty points if applicable
      if (order.customerId) {
        const pointsToAdd = Math.floor(order.total / 10); // Example: 1 point for every $10 spent
        
        if (pointsToAdd > 0) {
          await customersService.updateLoyaltyPoints(order.customerId, pointsToAdd, true);
          
          const customer = (await customersService.getById(order.customerId)).data;
          
          if (customer) {
            eventBus.emit(POS_EVENTS.CUSTOMER_LOYALTY_CHANGED, {
              customerId: order.customerId,
              newPoints: customer.loyaltyPoints
            });
          }
        }
      }
    });
    
    // When an order status changes to cancelled, restore inventory
    eventBus.subscribe(POS_EVENTS.ORDER_STATUS_CHANGED, async (data: { orderId: string, newStatus: string, oldStatus: string }) => {
      const { orderId, newStatus, oldStatus } = data;
      
      if (newStatus === 'cancelled') {
        const order = (await ordersService.getById(orderId)).data;
        
        if (!order) return;
        
        // Restore inventory for each product in the order
        for (const item of order.items) {
          await productService.updateInventory(
            item.productId, 
            item.quantity, 
            true // Increment inventory
          );
          
          // Emit event for inventory change
          eventBus.emit(POS_EVENTS.PRODUCT_INVENTORY_CHANGED, {
            productId: item.productId,
            newQuantity: (await productService.getById(item.productId)).data?.inventory || 0
          });
        }
        
        // Deduct customer loyalty points if applicable
        if (order.customerId) {
          const pointsToDeduct = Math.floor(order.total / 10); // Example: 1 point for every $10 spent
          
          if (pointsToDeduct > 0) {
            await customersService.updateLoyaltyPoints(order.customerId, pointsToDeduct, false);
            
            const customer = (await customersService.getById(order.customerId)).data;
            
            if (customer) {
              eventBus.emit(POS_EVENTS.CUSTOMER_LOYALTY_CHANGED, {
                customerId: order.customerId,
                newPoints: customer.loyaltyPoints
              });
            }
          }
        }
      }
    });
  }
  
  /**
   * Set up integrations for supplier-related events
   */
  private setupSupplierIntegrations(): void {
    // When a supplier's rating changes, update related products' supplier info
    eventBus.subscribe(POS_EVENTS.SUPPLIER_RATING_CHANGED, async (data: { supplierId: string, newRating: number }) => {
      const { supplierId, newRating } = data;
      
      // This is a placeholder for potential integrations with products
      // In a real system, you might want to update product supplier information
      console.log(`Supplier ${supplierId} rating changed to ${newRating}`);
    });
  }
}

// Create and export singleton instance
export const serviceIntegrator = new ServiceIntegrator();

export default serviceIntegrator;
