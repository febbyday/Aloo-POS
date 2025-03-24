import { Product, ProductStatus } from '@prisma/client';

// Types for frontend/API responses
export interface ProductLocationDto {
  id: string;
  stock: number;
  minStock: number;
  maxStock: number;
  storeId: string;
  storeName?: string;
  storeType?: string;
}

/**
 * Data Transfer Object for Product entity
 */
export interface ProductDto {
  id: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  sku: string;
  barcode: string | null;
  retailPrice: number;
  costPrice: number | null;
  salePrice: number | null;
  status: ProductStatus;
  productType: string;
  brand: string | null;
  stock: number;
  reorderPoint: number | null;
  categoryId: string | null;
  categoryName: string | null;
  supplierId: string | null;
  supplierName: string | null;
  locations: {
    storeId: string;
    storeName: string;
    stock: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data Transfer Object for a paginated list of products
 */
export interface ProductListDto {
  products: ProductDto[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Data Transfer Object for basic product information (for lists)
 */
export interface ProductSummaryDto {
  id: string;
  name: string;
  sku: string;
  retailPrice: number;
  status: ProductStatus;
  stock: number;
  categoryName: string | null;
  supplierName: string | null;
}

// Transform functions
export function transformProductToDto(
  product: Product & {
    category?: { name: string } | null;
    supplier?: { name: string } | null;
    locations?: {
      store: { id: string; name: string };
      stock: number;
    }[];
  }
): ProductDto {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    sku: product.sku,
    barcode: product.barcode,
    retailPrice: Number(product.retailPrice),
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    status: product.status,
    productType: product.productType,
    brand: product.brand,
    stock: product.stock,
    reorderPoint: product.reorderPoint,
    categoryId: product.categoryId,
    categoryName: product.category?.name || null,
    supplierId: product.supplierId,
    supplierName: product.supplier?.name || null,
    locations: product.locations 
      ? product.locations.map(location => ({
          storeId: location.store.id,
          storeName: location.store.name,
          stock: location.stock,
        }))
      : [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Transform a Product entity to a ProductSummaryDto
 */
export function transformToProductSummary(
  product: Product & {
    category?: { name: string } | null;
    supplier?: { name: string } | null;
  }
): ProductSummaryDto {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    retailPrice: Number(product.retailPrice),
    status: product.status,
    stock: product.stock,
    categoryName: product.category?.name || null,
    supplierName: product.supplier?.name || null,
  };
}

/**
 * Transform a paginated list of products to a ProductListDto
 */
export function transformToProductListDto(
  data: {
    products: (Product & {
      category?: { name: string } | null;
      supplier?: { name: string } | null;
    })[];
    total: number;
    page: number;
    limit: number;
  },
  useSummary: boolean = true
): ProductListDto {
  return {
    products: data.products.map(product => 
      useSummary 
        ? transformToProductSummary(product) as unknown as ProductDto
        : transformProductToDto(product)
    ),
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
} 