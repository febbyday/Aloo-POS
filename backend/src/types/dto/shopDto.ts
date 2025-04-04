import { Shop, ShopStatus, ShopType } from '@prisma/client';
const { Address } = require('../../../shared/schemas/shopSchema.cjs');

/**
 * Shop DTO interface
 * Represents the data transfer object for a shop
 */
export interface ShopDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  address: Address;
  phone?: string | null;
  email?: string | null;
  status: ShopStatus;
  type: ShopType;
  manager?: string | null;
  operatingHours?: any;
  lastSync: Date;
  isHeadOffice: boolean;
  licenseNumber?: string | null;
  logoUrl?: string | null;
  taxId?: string | null;
  timezone: string;
  website?: string | null;
  settings?: any;
  salesLastMonth?: number | null;
  inventoryCount?: number | null;
  averageOrderValue?: number | null;
  staffCount?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transform a Shop entity to a ShopDto
 * @param shop The Shop entity to transform
 * @returns The transformed ShopDto
 */
export function transformShopToDto(shop: Shop): ShopDto {
  // Parse the address from JSON
  const address = typeof shop.address === 'object'
    ? shop.address as Address
    : JSON.parse(String(shop.address)) as Address;

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
    staffCount: shop.staffCount,
    createdAt: shop.createdAt,
    updatedAt: shop.updatedAt
  };
}
