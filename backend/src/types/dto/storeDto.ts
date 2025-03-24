import { Store, StoreType } from '@prisma/client';

/**
 * Data Transfer Object for Store entity
 */
export interface StoreDto {
  id: string;
  name: string;
  type: StoreType;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  isActive: boolean;
  productCount: number;
  orderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data Transfer Object for a paginated list of stores
 */
export interface StoreListDto {
  stores: StoreDto[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Data Transfer Object for product inventory in a store
 */
export interface StoreInventoryDto {
  storeId: string;
  storeName: string;
  products: {
    productId: string;
    productName: string;
    sku: string;
    stock: number;
    minStock: number;
    maxStock: number;
  }[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Transform a Store entity to a StoreDto
 */
export function transformStoreToDto(
  store: Store & {
    _count?: {
      productLocations: number;
      orders: number;
    };
  }
): StoreDto {
  return {
    id: store.id,
    name: store.name,
    type: store.type,
    address: store.address,
    city: store.city,
    state: store.state,
    zipCode: store.zipCode,
    phone: store.phone,
    isActive: store.isActive,
    productCount: store._count?.productLocations || 0,
    orderCount: store._count?.orders || 0,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  };
}

/**
 * Transform a paginated list of stores to a StoreListDto
 */
export function transformToStoreListDto(data: {
  stores: (Store & {
    _count?: {
      productLocations: number;
      orders: number;
    };
  })[];
  total: number;
  page: number;
  limit: number;
}): StoreListDto {
  return {
    stores: data.stores.map(transformStoreToDto),
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
} 