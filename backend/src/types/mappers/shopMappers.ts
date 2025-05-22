import { Shop, ShopStatus, ShopType, Prisma } from '@prisma/client';
import { ShopDto } from '../dto/shopDto';
import { FrontendShop } from '../schemas/shopSchema';
const { Address, addressSchema } = require('../../../shared/schemas/shopSchema.cjs');

/**
 * Maps a Shop database entity to a ShopDto object
 * This handles the database-to-API transformation
 */
export function mapShopToDto(shop: Shop & {
  _count?: { productLocations: number; orders: number; staff: number; assignments: number }
}): ShopDto {
  // Parse the address from JSON
  let address: Address;
  try {
    address = typeof shop.address === 'object'
      ? shop.address as Address
      : JSON.parse(String(shop.address)) as Address;
  } catch (error) {
    console.error('Error parsing shop address:', error);
    // Fallback to a basic valid address
    address = {
      street: 'Unknown',
      city: 'Unknown',
      state: 'Unknown',
      postalCode: 'Unknown',
      country: 'Unknown'
    };
  }

  return {
    id: shop.id,
    code: shop.code,
    name: shop.name,
    description: shop.description,
    address,
    phone: shop.phone,
    email: shop.email,
    status: shop.status,
    type: shop.type,
    manager: shop.manager,
    operatingHours: shop.operatingHours,
    lastSync: shop.lastSync,
    isHeadOffice: shop.isHeadOffice,
    licenseNumber: shop.licenseNumber,
    logoUrl: shop.logoUrl,
    taxId: shop.taxId,
    timezone: shop.timezone,
    website: shop.website,
    settings: shop.settings,
    salesLastMonth: shop.salesLastMonth ? Number(shop.salesLastMonth) : null,
    inventoryCount: shop.inventoryCount,
    averageOrderValue: shop.averageOrderValue ? Number(shop.averageOrderValue) : null,
    staffCount: shop._count?.staff ?? shop.staffCount ?? 0,
    createdAt: shop.createdAt,
    updatedAt: shop.updatedAt
  };
}

/**
 * Maps between backend ShopDto and frontend Shop structure
 * This aligns the backend data structure with the frontend expectations
 */
export function mapShopDtoToShop(shopDto: ShopDto): FrontendShop {
  return {
    id: shopDto.id,
    code: shopDto.code,
    name: shopDto.name,
    description: shopDto.description || undefined,
    address: shopDto.address,
    phone: shopDto.phone || undefined,
    email: shopDto.email || undefined,
    status: shopDto.status,
    type: shopDto.type,
    manager: shopDto.manager || undefined,
    operatingHours: shopDto.operatingHours,
    lastSync: shopDto.lastSync.toISOString(),
    isHeadOffice: shopDto.isHeadOffice,
    licenseNumber: shopDto.licenseNumber || undefined,
    logoUrl: shopDto.logoUrl || undefined,
    taxId: shopDto.taxId || undefined,
    timezone: shopDto.timezone,
    website: shopDto.website || undefined,
    settings: shopDto.settings,
    salesLastMonth: shopDto.salesLastMonth || undefined,
    inventoryCount: shopDto.inventoryCount || undefined,
    averageOrderValue: shopDto.averageOrderValue || undefined,
    staffCount: shopDto.staffCount || undefined,
    createdAt: shopDto.createdAt.toISOString(),
    updatedAt: shopDto.updatedAt.toISOString()
  };
}

/**
 * Map a frontend Shop object to a Prisma Shop input
 * @param shop The frontend Shop object to map
 * @returns The mapped Prisma.ShopCreateInput or Prisma.ShopUpdateInput
 */
export function mapShopToShopInput(shop: any): Prisma.ShopCreateInput | Prisma.ShopUpdateInput {
  // Map status string to ShopStatus enum
  const mapStatus = (status: string): ShopStatus => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return ShopStatus.ACTIVE;
      case 'INACTIVE': return ShopStatus.INACTIVE;
      case 'MAINTENANCE': return ShopStatus.MAINTENANCE;
      case 'CLOSED': return ShopStatus.CLOSED;
      case 'PENDING': return ShopStatus.PENDING;
      default: return ShopStatus.ACTIVE;
    }
  };

  // Map type string to ShopType enum
  const mapType = (type: string): ShopType => {
    switch (type.toUpperCase()) {
      case 'RETAIL': return ShopType.RETAIL;
      case 'WAREHOUSE': return ShopType.WAREHOUSE;
      case 'OUTLET': return ShopType.OUTLET;
      case 'MARKET': return ShopType.MARKET;
      case 'ONLINE': return ShopType.ONLINE;
      default: return ShopType.RETAIL;
    }
  };

  // Handle address properly
  let address: Address;
  try {
    // If address is already an object, use it
    if (typeof shop.address === 'object' && shop.address !== null) {
      address = shop.address;
    }
    // If we have individual address fields, construct an address object
    else if (shop.street || shop.city || shop.state || shop.postalCode || shop.country) {
      address = {
        street: shop.street || '',
        street2: shop.street2 || undefined,
        city: shop.city || '',
        state: shop.state || '',
        postalCode: shop.postalCode || '',
        country: shop.country || 'Unknown',
        latitude: shop.latitude || undefined,
        longitude: shop.longitude || undefined
      };
    }
    // Default empty address
    else {
      address = {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Unknown'
      };
    }

    // Validate the address with Zod schema
    addressSchema.parse(address);
  } catch (error) {
    console.error('Invalid address format:', error);
    // Fallback to a basic valid address
    address = {
      street: 'Unknown',
      city: 'Unknown',
      state: 'Unknown',
      postalCode: 'Unknown',
      country: 'Unknown'
    };
  }

  return {
    code: shop.code,
    name: shop.name,
    description: shop.description || null,
    address,
    phone: shop.phone || null,
    email: shop.email || null,
    status: shop.status ? mapStatus(shop.status) : ShopStatus.ACTIVE,
    type: shop.type ? mapType(shop.type) : ShopType.RETAIL,
    manager: shop.manager || null,
    operatingHours: shop.operatingHours || null,
    isHeadOffice: shop.isHeadOffice || false,
    licenseNumber: shop.licenseNumber || null,
    logoUrl: shop.logoUrl || null,
    taxId: shop.taxId || null,
    timezone: shop.timezone || 'UTC',
    website: shop.website || null,
    settings: shop.settings || null
  };
}
