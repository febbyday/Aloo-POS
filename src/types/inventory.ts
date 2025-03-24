import { SupplierReference } from '@/features/suppliers/types'

export interface Product {
  id: string
  name: string
  category: string
  description?: string
  shortDescription?: string
  sku: string
  barcode?: string
  costPrice: number
  retailPrice: number
  salePrice?: number
  imageUrl?: string
  images?: string[]
  supplier: SupplierReference
  minStock: number
  maxStock: number
  locations: ProductLocation[]
  variants: ProductVariant[]
  createdAt: string
  updatedAt: string
  // WooCommerce specific fields
  productType: 'simple' | 'variable'
  status: 'draft' | 'pending' | 'private' | 'publish'
  featured: boolean
  catalogVisibility: 'visible' | 'catalog' | 'search' | 'hidden'
  taxStatus: 'taxable' | 'shipping' | 'none'
  taxClass: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'in'
  }
  shippingClass?: string
  downloadable: boolean
  virtual: boolean
  purchaseNote?: string
  externalUrl?: string
  buttonText?: string
  manageStock: boolean
  stockStatus: 'instock' | 'outofstock' | 'onbackorder'
  backorders: 'no' | 'notify' | 'yes'
  backordersAllowed: boolean
  soldIndividually: boolean
  attributes?: ProductAttribute[]
  variations?: ProductVariation[]
  reviewsAllowed: boolean
  averageRating: number
  ratingCount: number
  relatedIds: string[]
  upsellIds: string[]
  crossSellIds: string[]
  parentId: string
  purchasePrice: number
  regularPrice: number
  categories: Array<{
    id: string
    name: string
    slug: string
    parent?: string
  }>
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
  wcId?: number // WooCommerce product ID
  wcStatus: 'synced' | 'pending' | 'error'
  wcLastSync?: string
  featuredImage?: string
  gallery?: string[]
}

export interface ProductVariant {
  id: string
  sku: string
  barcode?: string
  size?: string
  color?: string
  style?: string
  costPrice?: number
  retailPrice?: number
  locations: ProductLocation[]
  stock: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductLocation {
  locationId: string
  stock: number
  minStock?: number
  maxStock?: number
}

export interface StockTransfer {
  id: string
  sourceLocationId: string
  destinationLocationId: string
  products: StockTransferItem[]
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface StockTransferItem {
  productId: string
  quantity: number
  product: Product
}

export interface Location {
  id: string
  name: string
  type: 'shop' | 'market' | 'warehouse'
  address?: string
}

export interface StockAlert {
  id: string
  productId: string
  threshold: number
  status: 'active' | 'resolved'
  createdAt: Date
}

export type StockLevel = 'low' | 'medium' | 'high' | 'out_of_stock'

export interface InventoryFilter {
  search?: string
  locations?: string[]
  stockLevels?: StockLevel[]
  categories?: string[]
  priceRange?: {
    min?: number
    max?: number
  }
}

export interface ProductAttribute {
  id: string
  name: string
  options: string[]
  isVisibleOnProductPage: boolean
  isUsedForVariations: boolean
}

export interface ProductVariation {
  id: string
  attributes: { [key: string]: string }
  retailPrice: number
  salePrice?: number
  stock: number
  sku?: string
  image?: string
}
