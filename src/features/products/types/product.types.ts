import { z } from 'zod';

// Product size options schema
export const ProductSizeOptionsSchema = z.array(z.enum(['Small', 'Medium', 'Large']));

// Product size prices schema
export const ProductSizePricesSchema = z.record(z.enum(['Small', 'Medium', 'Large']), z.number().min(0));

// Product ice level options schema
export const ProductIceLevelOptionsSchema = z.array(z.enum(['No Ice', 'Less Ice', 'Normal Ice', 'Extra Ice']));

// Product category schema
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

// Product variant option schema
export const ProductVariantOptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Option name is required'),
  values: z.array(z.string()).min(1, 'At least one option value is required')
});

// Product variant schema
export const ProductVariantSchema = z.object({
  id: z.string(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  compareAtPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  quantity: z.number().int().min(0, 'Quantity must be greater than or equal to 0'),
  lowStockAlert: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  optionValues: z.array(z.string()),
  isActive: z.boolean().default(true),
  images: z.array(z.string()).optional()
});

// Product schema with variants
export const ProductWithVariantsSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: ProductCategorySchema,
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  variantOptions: z.array(ProductVariantOptionSchema),
  variants: z.array(ProductVariantSchema),
  isActive: z.boolean().default(true),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  
  // Customization options
  sizeOptions: ProductSizeOptionsSchema.optional(),
  sizePrices: ProductSizePricesSchema.optional(),
  iceOptions: ProductIceLevelOptionsSchema.optional(),
  minQuantity: z.number().int().min(1).default(1),
  maxQuantity: z.number().int().min(1).default(99)
});

// Product History Action Types
export type ProductHistoryAction = {
  type: 'update';
  id: string;
  field: keyof Product;
  before: Partial<Product>;
  after: Partial<Product>;
};

// Product Schema
export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  brand: z.string().optional(),
  category: z.string(),
  retailPrice: z.number().positive('Price must be greater than 0'),
  costPrice: z.number().min(0, 'Cost price cannot be negative').optional(),
  salePrice: z.number().min(0, 'Sale price cannot be negative').optional(),
  supplier: z.object({
    id: z.string(),
    name: z.string()
  }).optional(),
  locations: z.array(z.object({
    locationId: z.string(),
    stock: z.number().min(0),
    minStock: z.number().min(0),
    maxStock: z.number().min(0),
    enabled: z.boolean()
  })).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  updatedBy: z.string().optional()
});

// Product Type
export type Product = z.infer<typeof ProductSchema>;

// Form Data Type
export type ProductFormData = Omit<Product, 'id' | 'sku' | 'barcode' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'locations'>;

// Export types
export type ProductVariantOption = z.infer<typeof ProductVariantOptionSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductWithVariants = z.infer<typeof ProductWithVariantsSchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type ProductSizeOption = z.infer<typeof ProductSizeOptionsSchema>[number];
export type ProductIceLevelOption = z.infer<typeof ProductIceLevelOptionsSchema>[number];

// Helper type for variant option combinations
export type VariantOptionCombination = {
  [key: string]: string;
};

// Helper type for variant matrix
export interface VariantMatrix {
  combinations: VariantOptionCombination[];
  variants: ProductVariant[];
}

/**
 * Product filtering, sorting, and pagination options
 */
export interface ProductFilter {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  searchTerm?: string;
  isActive?: boolean;
  tags?: string[];
}