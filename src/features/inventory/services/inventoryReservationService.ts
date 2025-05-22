/**
 * Inventory Reservation Service
 * 
 * This service handles real-time inventory reservation during checkout to prevent overselling.
 * It includes mechanisms for holding inventory, releasing holds on abandoned carts,
 * and resolving conflicts for concurrent transactions.
 */

import { v4 as uuidv4 } from 'uuid';

// Types for the reservation system
export interface InventoryReservation {
  id: string;
  productId: string;
  variantId?: string;
  locationId: string;
  quantity: number;
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
}

export interface ReservationRequest {
  productId: string;
  variantId?: string;
  locationId: string;
  quantity: number;
  sessionId: string;
  durationMinutes?: number; // How long to hold the reservation
}

export interface ReservationResponse {
  success: boolean;
  reservation?: InventoryReservation;
  error?: string;
  availableQuantity?: number;
}

// Default reservation timeout in minutes
const DEFAULT_RESERVATION_TIMEOUT = 15;

// In-memory store for reservations (would be replaced with database in production)
let reservations: InventoryReservation[] = [];

// Cleanup interval for expired reservations (in milliseconds)
const CLEANUP_INTERVAL = 60000; // 1 minute

/**
 * Start the cleanup interval to automatically release expired reservations
 */
const startCleanupInterval = () => {
  setInterval(() => {
    const now = new Date();
    const expiredReservations = reservations.filter(
      (r) => r.status === 'active' && r.expiresAt < now
    );
    
    if (expiredReservations.length > 0) {
      console.log(`Releasing ${expiredReservations.length} expired reservations`);
      
      expiredReservations.forEach((reservation) => {
        reservation.status = 'expired';
      });
      
      // In a real implementation, we would persist these changes to a database
    }
  }, CLEANUP_INTERVAL);
};

// Start the cleanup interval when the service is initialized
startCleanupInterval();

export const inventoryReservationService = {
  /**
   * Reserve inventory for a product during checkout
   */
  reserveInventory: async (request: ReservationRequest): Promise<ReservationResponse> => {
    try {
      // In a real implementation, we would check the actual inventory in the database
      // For now, we'll simulate this check
      const availableQuantity = await simulateInventoryCheck(
        request.productId,
        request.variantId,
        request.locationId
      );
      
      // Get active reservations for this product/variant/location
      const activeReservations = reservations.filter(
        (r) => 
          r.productId === request.productId && 
          r.variantId === request.variantId &&
          r.locationId === request.locationId &&
          r.status === 'active'
      );
      
      // Calculate total reserved quantity
      const reservedQuantity = activeReservations.reduce(
        (total, reservation) => total + reservation.quantity, 
        0
      );
      
      // Check if there's enough available inventory
      const actuallyAvailable = availableQuantity - reservedQuantity;
      
      if (actuallyAvailable < request.quantity) {
        return {
          success: false,
          error: 'Insufficient inventory',
          availableQuantity: actuallyAvailable
        };
      }
      
      // Create a new reservation
      const durationMinutes = request.durationMinutes || DEFAULT_RESERVATION_TIMEOUT;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + durationMinutes * 60000);
      
      const reservation: InventoryReservation = {
        id: uuidv4(),
        productId: request.productId,
        variantId: request.variantId,
        locationId: request.locationId,
        quantity: request.quantity,
        sessionId: request.sessionId,
        createdAt: now,
        expiresAt: expiresAt,
        status: 'active'
      };
      
      // Add to reservations (in a real implementation, save to database)
      reservations.push(reservation);
      
      return {
        success: true,
        reservation
      };
    } catch (error) {
      console.error('Error reserving inventory:', error);
      return {
        success: false,
        error: 'Failed to reserve inventory'
      };
    }
  },
  
  /**
   * Complete a reservation after successful checkout
   */
  completeReservation: async (reservationId: string): Promise<boolean> => {
    const reservation = reservations.find(r => r.id === reservationId);
    
    if (!reservation) {
      return false;
    }
    
    if (reservation.status !== 'active') {
      return false;
    }
    
    // Mark as completed
    reservation.status = 'completed';
    
    // In a real implementation, we would:
    // 1. Update the reservation status in the database
    // 2. Update the actual inventory levels
    
    return true;
  },
  
  /**
   * Cancel a reservation and release the held inventory
   */
  cancelReservation: async (reservationId: string): Promise<boolean> => {
    const reservation = reservations.find(r => r.id === reservationId);
    
    if (!reservation) {
      return false;
    }
    
    if (reservation.status !== 'active') {
      return false;
    }
    
    // Mark as cancelled
    reservation.status = 'cancelled';
    
    return true;
  },
  
  /**
   * Get all active reservations for a session
   */
  getSessionReservations: async (sessionId: string): Promise<InventoryReservation[]> => {
    return reservations.filter(
      r => r.sessionId === sessionId && r.status === 'active'
    );
  },
  
  /**
   * Extend the expiration time of a reservation
   */
  extendReservation: async (reservationId: string, additionalMinutes: number): Promise<boolean> => {
    const reservation = reservations.find(r => r.id === reservationId);
    
    if (!reservation || reservation.status !== 'active') {
      return false;
    }
    
    // Extend the expiration time
    reservation.expiresAt = new Date(
      reservation.expiresAt.getTime() + additionalMinutes * 60000
    );
    
    return true;
  },
  
  /**
   * Check if a product has sufficient available inventory (accounting for active reservations)
   */
  checkAvailability: async (
    productId: string, 
    variantId: string | undefined, 
    locationId: string, 
    quantity: number
  ): Promise<boolean> => {
    // Get the current inventory level (in a real implementation, from database)
    const availableQuantity = await simulateInventoryCheck(
      productId,
      variantId,
      locationId
    );
    
    // Get active reservations
    const activeReservations = reservations.filter(
      (r) => 
        r.productId === productId && 
        r.variantId === variantId &&
        r.locationId === locationId &&
        r.status === 'active'
    );
    
    // Calculate total reserved quantity
    const reservedQuantity = activeReservations.reduce(
      (total, reservation) => total + reservation.quantity, 
      0
    );
    
    // Check if there's enough available inventory
    return (availableQuantity - reservedQuantity) >= quantity;
  },
  
  /**
   * Release all expired reservations
   */
  releaseExpiredReservations: async (): Promise<number> => {
    const now = new Date();
    const expiredReservations = reservations.filter(
      (r) => r.status === 'active' && r.expiresAt < now
    );
    
    expiredReservations.forEach((reservation) => {
      reservation.status = 'expired';
    });
    
    return expiredReservations.length;
  }
};

/**
 * Simulate checking inventory levels (would be replaced with actual database query)
 */
async function simulateInventoryCheck(
  productId: string,
  variantId: string | undefined,
  locationId: string
): Promise<number> {
  // In a real implementation, this would query the database
  // For now, return a random number between 5 and 100
  return Math.floor(Math.random() * 95) + 5;
}

export default inventoryReservationService;
