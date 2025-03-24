export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  shortDescription?: string;
  sku: string;
  barcode: string;
  costPrice: number;
  retailPrice: number;
  salePrice?: number;
  stock?: number;
  /**
   * Type of product: 'single' for standard products with no variations
   * or 'variable' for products with multiple variants like size, color, etc.
   */
  productType: 'single' | 'variable';
  supplier: {
    id: string;
    name: string;
    contact?: string;
    leadTime?: string;
    lastOrder?: string;
  };
  brand?: string;
  minStock: number;
  maxStock: number;
  locations: {
    id: string;
    locationId?: string;
    name?: string;
    type?: string;
    stock: number;
    minStock: number;
    maxStock: number;
  }[];
  status?: 'active' | 'inactive' | 'draft';
  images?: string[];
  imageUrl?: string;
  gallery?: string[];
  tags?: string[];
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
  variants: ProductVariant[];
  isTemporary?: boolean;
  lastRestock?: string;
  nextRestock?: string;
  reorderPoint?: number;
  reorderQuantity?: number;
  lastCounted?: string;
  lastReceived?: string;
  lastSold?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a product variant with specific attributes like size, color, etc.
 */
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode: string;
  size?: string;
  color?: string;
  style?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  costPrice: number;
  retailPrice: number;
  stock: number;
  minStock?: number;
  maxStock?: number;
  images?: string[];
  isActive: boolean;
}

/**
 * Defines the attributes that can vary between product variants
 */
export interface ProductAttribute {
  id?: string;
  name: string;
  values: string[];
  displayOrder?: number;
  isVisibleOnProductPage?: boolean;
}

/**
 * Represents a specific product variation with its attributes
 */
export interface ProductVariation {
  id?: string;
  attributes: Record<string, string>;
  price?: number;
  salePrice?: number;
  stock?: number;
  inStock?: boolean;
}

/**
 * Configuration for generating variants from attribute combinations
 */
export interface VariantGenerationConfig {
  baseProduct: Partial<Product>;
  attributes: VariantAttribute[];
  pricingStrategy: 'fixed' | 'increment' | 'percentage';
  pricingValue: number;
  generateSKUs: boolean;
  generateBarcodes: boolean;
  stockStrategy: 'distribute' | 'duplicate' | 'zero';
}

/**
 * Interface for bulk variant operations
 */
export interface BulkVariantUpdate {
  variantIds: string[];
  updateType: 'price' | 'stock' | 'status';
  value: any;
  reason?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ExportColumn {
  id: keyof Product;
  label: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  columns: ExportColumn[];
  filename: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  date: string;
  reason?: string;
  userId: string;
}

export interface SpecialPrice {
  id: string;
  productId: string;
  price: number;
  startDate: string;
  endDate: string;
  customerGroupId?: string;
  description?: string;
  status: 'active' | 'scheduled' | 'expired';
}

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export interface ProductPrice {
  id: string;
  productId: string;
  customerGroupId?: string;
  basePrice: number;
  specialPrice?: number;
  specialPriceStartDate?: string;
  specialPriceEndDate?: string;
}

export interface BulkPriceUpdate {
  productIds: string[];
  updateType: 'fixed' | 'percentage' | 'increase' | 'decrease';
  value: number;
  customerGroupId?: string;
  reason?: string;
}

/**
 * Interface for inventory filtering options
 */
export interface InventoryFilter {
  /** Search term for filtering products */
  search?: string;
  
  /** Category ID for filtering products */
  categoryId?: string | null;
  
  /** Categories for filtering products */
  categories?: string[];
  
  /** Locations for filtering products */
  locations?: string[];
  
  /** Stock status for filtering products */
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'all';
  
  /** Price range for filtering products */
  priceRange?: {
    min?: number;
    max?: number;
  };
  
  /** Minimum price for filtering products */
  min?: number;
  
  /** Maximum price for filtering products */
  max?: number;
  
  /** Whether to show only featured products */
  featured?: boolean;
  
  /** Product sort order */
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt';
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}
