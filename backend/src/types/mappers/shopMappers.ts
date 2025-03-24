// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Store, StoreType } from '@prisma/client';
import { StoreDto } from '../dto/storeDto';
import { Shop } from '../schemas/shopSchema';

/**
 * Maps a Store database entity to a StoreDto object
 * This handles the database-to-API transformation
 */
export function mapStoreToDto(store: Store & { 
  _count?: { productLocations: number; orders: number } 
}): StoreDto {
  return {
    id: store.id,
    name: store.name,
    type: store.type,
    address: store.address,
    city: store.city,
    state: store.state,
    zipCode: store.postalCode, // Map from postalCode to zipCode for consistency
    phone: store.phone,
    isActive: store.isActive,
    productCount: store._count?.productLocations ?? 0,
    orderCount: store._count?.orders ?? 0,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt
  };
}

/**
 * Maps between backend StoreDto and frontend Shop structure
 * This aligns the backend data structure with the frontend expectations
 */
export function mapStoreDtoToShop(storeDto: StoreDto): Shop {
  // Map store type to shop type expected by frontend
  const mapStoreType = (type: StoreType): 'retail' | 'warehouse' | 'outlet' => {
    switch (type) {
      case 'RETAIL': return 'retail';
      case 'WAREHOUSE': return 'warehouse';
      case 'OUTLET': return 'outlet';
      default: return 'retail'; // Default fallback
    }
  };
  
  return {
    id: storeDto.id,
    name: storeDto.name,
    location: [storeDto.address, storeDto.city, storeDto.state, storeDto.zipCode]
      .filter(Boolean)
      .join(', '),
    type: mapStoreType(storeDto.type),
    status: storeDto.isActive ? 'active' : 'inactive',
    staffCount: 0, // This would need to be populated from staff count query
    lastSync: storeDto.updatedAt,
    createdAt: storeDto.createdAt,
    phone: storeDto.phone || '',
    salesLastMonth: 0, // This would need to be populated with real data
    inventoryCount: storeDto.productCount,
    // Additional fields would be populated with real data in a production environment
    email: '',
    manager: '',
    openingHours: '',
    averageOrderValue: 0,
    topSellingCategories: []
  };
}

/**
 * Maps a frontend Shop object to a format ready for database persistence
 * This is used when creating or updating a shop/store
 */
export function mapShopToStoreInput(shop: Partial<Shop>): {
  name: string; 
  type: StoreType; 
  isActive: boolean;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null; // Update property name to postalCode for consistency
  phone: string | null;
} {
  // Map frontend shop type to backend store type
  const mapShopType = (type?: 'retail' | 'warehouse' | 'outlet'): StoreType => {
    switch (type) {
      case 'retail': return 'RETAIL';
      case 'warehouse': return 'WAREHOUSE';
      case 'outlet': return 'OUTLET';
      default: return 'RETAIL'; // Default fallback
    }
  };
  
  // Parse location if it exists
  let address = null;
  let city = null;
  let state = null;
  let postalCode = null;
  
  if (shop.location) {
    const locationParts = shop.location.split(',').map(part => part.trim());
    if (locationParts.length >= 1) address = locationParts[0];
    if (locationParts.length >= 2) city = locationParts[1];
    if (locationParts.length >= 3) state = locationParts[2];
    if (locationParts.length >= 4) postalCode = locationParts[3];
  }
  
  return {
    name: shop.name || '',  // Ensure name is never undefined
    type: mapShopType(shop.type),
    isActive: shop.status === 'active',
    address,
    city,
    state,
    postalCode,
    phone: shop.phone || null
  };
}
