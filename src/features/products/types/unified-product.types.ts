// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { z } from 'zod';
import { Supplier } from '@/features/suppliers/types';

/**
 * Product Type Enums
 */
export enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
  SINGLE = 'single'
}

/**
 * Product Status Enums
 */
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  PENDING = 'pending',
  PRIVATE = 'private',
  PUBLISH = 'publish'
}

/**
 * Stock Status Enums
 */
export enum StockStatus {
  IN_STOCK = 'instock',
  OUT_OF_STOCK = 'outofstock',
  ON_BACKORDER = 'onbackorder'
}

/**
 * Catalog Visibility Enums
 */
export enum CatalogVisibility {
  VISIBLE = 'visible',
  CATALOG = 'catalog',
  SEARCH = 'search',
  HIDDEN = 'hidden'
}

/**
 * Tax Status Enums
 */
export enum TaxStatus {
  TAXABLE = 'taxable',
  SHIPPING = 'shipping',
  NONE = 'none'
}

/**
 * Backorder Enums
 */
export enum BackorderStatus {
  NO = 'no',
  NOTIFY = 'notify',
  YES = 'yes'
}

/**
 * Base Product Interface
 * Contains the core properties that all product types share
 */
export const BaseProductSchema = z.object({
  // Basic Information
  id: z.string().optional(),
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  
  // Categorization
  category: z.string(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  
  // Status and Type
  productType: z.nativeEnum(ProductType),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  
  // Timestamps
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
  updatedBy: z.string().optional()
});

/**
 * Product Pricing Schema
 * Contains all pricing-related properties
 */
export const ProductPricingSchema = z.object({
  costPrice: z.number().min(0, 'Cost price cannot be negative').optional(),
  retailPrice: z.number().positive('Price must be greater than 0'),
  salePrice: z.number().min(0, 'Sale price cannot be negative').optional(),
  regularPrice: z.number().min(0).optional(),
  purchasePrice: z.number().min(0).optional(),
  taxStatus: z.nativeEnum(TaxStatus).optional(),
  taxClass: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  onSale: z.boolean().optional(),
  saleStartDate: z.string().or(z.date()).optional(),
  saleEndDate: z.string().or(z.date()).optional(),
});

/**
 * Product Metadata Schema
 * Contains additional metadata for products
 */
export const ProductMetadataSchema = z.object({
  featured: z.boolean().optional(),
  catalogVisibility: z.nativeEnum(CatalogVisibility).optional(),
  weight: z.number().min(0).optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
    unit: z.enum(['cm', 'in'])
  }).optional(),
  shippingClass: z.string().optional(),
  reviewsAllowed: z.boolean().optional(),
  averageRating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  virtual: z.boolean().optional(),
  downloadable: z.boolean().optional(),
  downloadLimit: z.number().min(-1).optional(),
  downloadExpiry: z.number().min(-1).optional(),
  externalUrl: z.string().url().optional(),
  buttonText: z.string().optional(),
  menuOrder: z.number().int().optional(),
});

/**
 * Product Category Schema
 */
export const ProductCategorySchema = z.enum([
  'breakfast',
  'lunch',
  'dinner',
  'soup',
  'desserts',
  'side_dish',
  'appetizer',
  'beverages'
]);

/**
 * Product Size Options Schema
 */
export const ProductSizeOptionsSchema = z.array(z.enum(['Small', 'Medium', 'Large']));

/**
 * Product Size Prices Schema
 */
export const ProductSizePricesSchema = z.record(z.enum(['Small', 'Medium', 'Large']), z.number().min(0));

/**
 * Product Ice Level Options Schema
 */
export const ProductIceLevelOptionsSchema = z.array(z.enum(['No Ice', 'Less Ice', 'Normal Ice', 'Extra Ice']));

/**
 * Product Dimensions Schema
 */
export const ProductDimensionsSchema = z.object({
  length: z.number().min(0),
  width: z.number().min(0),
  height: z.number().min(0),
  unit: z.enum(['cm', 'in'])
});

/**
 * Product Location Schema
 */
export const ProductLocationSchema = z.object({
  locationId: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  stock: z.number().min(0),
  minStock: z.number().min(0),
  maxStock: z.number().min(0),
  enabled: z.boolean().default(true)
});

/**
 * Product Attribute Schema
 */
export const ProductAttributeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Attribute name is required'),
  values: z.array(z.string()).min(1, 'At least one attribute value is required'),
  displayOrder: z.number().int().optional(),
  isVisibleOnProductPage: z.boolean().default(true),
  isUsedForVariations: z.boolean().default(true)
});

/**
 * Product Variant Option Schema
 */
export const ProductVariantOptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Option name is required'),
  values: z.array(z.string()).min(1, 'At least one option value is required')
});

/**
 * Product Variation Schema
 */
export const ProductVariationSchema = z.object({
  id: z.string().optional(),
  attributes: z.record(z.string(), z.string()),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  retailPrice: z.number().min(0),
  salePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  image: z.string().optional(),
  inStock: z.boolean().optional()
});

/**
 * Product Variant Schema
 */
export const ProductVariantSchema = z.object({
  id: z.string(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  style: z.string().optional(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  compareAtPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  retailPrice: z.number().min(0).optional(),
  quantity: z.number().int().min(0, 'Quantity must be greater than or equal to 0'),
  stock: z.number().min(0).optional(),
  lowStockAlert: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  optionValues: z.array(z.string()),
  isActive: z.boolean().default(true),
  images: z.array(z.string()).optional(),
  locations: z.array(ProductLocationSchema).optional(),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional()
});

/**
 * Stock Management Schema
 */
export const StockManagementSchema = z.object({
  stock: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  locations: z.array(ProductLocationSchema).optional(),
  manageStock: z.boolean().default(true),
  stockStatus: z.nativeEnum(StockStatus).optional(),
  backorders: z.nativeEnum(BackorderStatus).optional(),
  backordersAllowed: z.boolean().optional(),
  soldIndividually: z.boolean().optional(),
  reorderPoint: z.number().min(0).optional(),
  reorderQuantity: z.number().min(0).optional(),
});

/**
 * Supplier Information Schema
 */
export const SupplierInfoSchema = z.object({
  supplier: z.union([
    z.object({
      id: z.string(),
      name: z.string(),
      contact: z.string().optional(),
      leadTime: z.string().optional(),
      lastOrder: z.string().optional()
    }),
    z.custom<Supplier>()
  ]).optional(),
  supplierSku: z.string().optional(),
  supplierPrice: z.number().min(0).optional(),
  supplierNotes: z.string().optional(),
  minimumOrderQuantity: z.number().min(0).optional(),
  leadTime: z.number().min(0).optional(),
});

/**
 * Media Schema
 */
export const MediaSchema = z.object({
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  gallery: z.array(z.string()).optional(),
  thumbnailUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  documentUrls: z.array(z.string()).optional(),
});

/**
 * Unified Product Schema
 * Combines all the schemas to create a comprehensive product schema
 */
export const UnifiedProductSchema = z.object({
  ...BaseProductSchema.shape,
  ...ProductPricingSchema.shape,
  ...ProductMetadataSchema.shape,
  ...StockManagementSchema.shape,
  ...SupplierInfoSchema.shape,
  ...MediaSchema.shape,
  
  // Variants and Attributes
  attributes: z.array(ProductAttributeSchema).optional(),
  variations: z.array(ProductVariationSchema).optional(),
  variants: z.array(ProductVariantSchema).optional(),
  
  // Related products
  relatedProducts: z.array(z.string()).optional(),
  crossSellProducts: z.array(z.string()).optional(),
  upSellProducts: z.array(z.string()).optional(),
  
  // Custom fields
  customFields: z.record(z.string(), z.any()).optional(),
});

/**
 * Product History Action Type
 */
export type ProductHistoryAction = {
  type: 'update' | 'create' | 'delete' | 'stock_change' | 'price_change';
  id: string;
  field?: keyof UnifiedProduct;
  before?: Partial<UnifiedProduct>;
  after?: Partial<UnifiedProduct>;
  timestamp: string | Date;
  user?: string;
  notes?: string;
};

/**
 * Export Types
 */
export type UnifiedProduct = z.infer<typeof UnifiedProductSchema>;
export type BaseProduct = z.infer<typeof BaseProductSchema>;
export type ProductPricing = z.infer<typeof ProductPricingSchema>;
export type ProductMetadata = z.infer<typeof ProductMetadataSchema>;
export type StockManagement = z.infer<typeof StockManagementSchema>;
export type SupplierInfo = z.infer<typeof SupplierInfoSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type ProductAttribute = z.infer<typeof ProductAttributeSchema>;
export type ProductVariation = z.infer<typeof ProductVariationSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductLocation = z.infer<typeof ProductLocationSchema>;
export type ProductDimensions = z.infer<typeof ProductDimensionsSchema>;
export type ProductSizeOption = z.infer<typeof ProductSizeOptionsSchema>[number];
export type ProductIceLevelOption = z.infer<typeof ProductIceLevelOptionsSchema>[number];
export type ProductVariantOption = z.infer<typeof ProductVariantOptionSchema>;

/**
 * Form Data Types
 */
export type ProductFormData = Omit<
  UnifiedProduct, 
  'id' | 'sku' | 'barcode' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'locations'
>;

/**
 * Variant Types
 */
export type VariantOptionCombination = Record<string, string>;

export type VariantMatrix = {
  combinations: VariantOptionCombination[];
  variants: ProductVariant[];
};

export type VariantGenerationConfig = {
  baseProduct: Partial<UnifiedProduct>;
  attributes: ProductAttribute[];
  pricingStrategy: 'fixed' | 'increment' | 'percentage';
  pricingValue: number;
  generateSKUs: boolean;
  generateBarcodes: boolean;
  stockStrategy: 'distribute' | 'duplicate' | 'zero';
};

export type BulkVariantUpdate = {
  variantIds: string[];
  updateType: 'price' | 'stock' | 'status';
  value: any;
  reason?: string;
};

/**
 * Inventory Filter Type
 */
export type InventoryFilter = {
  search?: string;
  categoryId?: string | null;
  categories?: string[];
  locations?: string[];
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'all';
  priceRange?: {
    min?: number;
    max?: number;
  };
  brand?: string;
  supplier?: string;
  featured?: boolean;
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

/**
 * API Request/Response Types
 */
export type ProductListResponse = {
  products: UnifiedProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Export Column Type
 */
export type ExportColumn = {
  id: keyof UnifiedProduct;
  label: string;
};

/**
 * Export Options Type
 */
export type ExportOptions = {
  format: 'csv' | 'excel' | 'pdf';
  columns: ExportColumn[];
  filename: string;
};
