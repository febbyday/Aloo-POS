import { Supplier } from '@prisma/client';

/**
 * Data Transfer Object for Supplier entity
 */
export interface SupplierDto {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  taxId: string | null;
  notes: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data Transfer Object for a paginated list of suppliers
 */
export interface SupplierListDto {
  suppliers: SupplierDto[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Transform a Supplier entity to a SupplierDto
 */
export function transformSupplierToDto(
  supplier: Supplier & {
    _count?: {
      products: number;
    };
  }
): SupplierDto {
  return {
    id: supplier.id,
    name: supplier.name,
    contactPerson: supplier.contactPerson,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    city: supplier.city,
    state: supplier.state,
    postalCode: supplier.postalCode,
    country: supplier.country,
    taxId: supplier.taxId,
    notes: supplier.notes,
    isActive: supplier.isActive,
    productCount: supplier._count?.products || 0,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  };
}

/**
 * Transform a paginated list of suppliers to a SupplierListDto
 */
export function transformToSupplierListDto(data: {
  suppliers: (Supplier & {
    _count?: {
      products: number;
    };
  })[];
  total: number;
  page: number;
  limit: number;
}): SupplierListDto {
  return {
    suppliers: data.suppliers.map(transformSupplierToDto),
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
} 