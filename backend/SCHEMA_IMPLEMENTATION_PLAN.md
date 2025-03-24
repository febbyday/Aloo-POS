# POS System Schema Implementation Plan

This document outlines the step-by-step plan for implementing the database schema for our POS system. We'll focus on the essential modules required to make products and orders function properly.

## Phase 1: Core Schema Implementation

### Step 1: Update Product & Category Models

```prisma
model Product {
  id              String           @id @default(cuid())
  name            String
  description     String?
  shortDescription String?
  sku             String           @unique
  barcode         String?          @unique
  retailPrice     Decimal          @db.Decimal(10, 2)
  costPrice       Decimal?         @db.Decimal(10, 2)
  salePrice       Decimal?         @db.Decimal(10, 2)
  status          ProductStatus    @default(ACTIVE)
  productType     String           @default("simple")
  brand           String?
  stock           Int              @default(0)
  reorderPoint    Int?             @default(10)
  
  // Relationships
  categoryId      String?
  category        Category?        @relation(fields: [categoryId], references: [id])
  supplierId      String?
  supplier        Supplier?        @relation(fields: [supplierId], references: [id])
  
  // Collections
  locations       ProductLocation[]
  orderItems      OrderItem[]
  
  // Timestamps
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}

model Category {
  id            String      @id @default(cuid())
  name          String      @unique
  description   String?
  parentId      String?
  parent        Category?   @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children      Category[]  @relation("CategoryHierarchy")
  products      Product[]
  isActive      Boolean     @default(true)
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  DRAFT
}
```

### Step 2: Implement Store & Location Models

```prisma
model Store {
  id           String            @id @default(cuid())
  name         String
  type         StoreType         @default(RETAIL)
  address      String?
  city         String?
  state        String?
  zipCode      String?
  phone        String?
  isActive     Boolean           @default(true)
  
  // Collections
  productLocations ProductLocation[]
  orders           Order[]
  
  // Timestamps
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model ProductLocation {
  id          String   @id @default(cuid())
  stock       Int      @default(0)
  minStock    Int      @default(0)
  maxStock    Int      @default(100)
  
  // Relationships
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Unique constraint to prevent duplicates
  @@unique([productId, storeId])
}

enum StoreType {
  RETAIL
  WAREHOUSE
  MARKET
  ONLINE
}
```

### Step 3: Implement Supplier Model

```prisma
model Supplier {
  id              String    @id @default(cuid())
  name            String
  contactPerson   String?
  email           String?
  phone           String?
  address         String?
  city            String?
  state           String?
  zipCode         String?
  isActive        Boolean   @default(true)
  products        Product[]
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### Step 4: Implement Order & Sales Models

```prisma
model Order {
  id             String       @id @default(cuid())
  orderNumber    String       @unique
  status         OrderStatus  @default(PENDING)
  total          Decimal      @db.Decimal(10, 2)
  subtotal       Decimal      @db.Decimal(10, 2)
  tax            Decimal      @db.Decimal(10, 2) @default(0)
  discount       Decimal      @db.Decimal(10, 2) @default(0)
  notes          String?
  paymentMethod  String?
  paymentStatus  PaymentStatus @default(PENDING)
  
  // Relationships
  storeId        String?
  store          Store?       @relation(fields: [storeId], references: [id])
  
  // Collections
  items          OrderItem[]
  
  // Timestamps
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model OrderItem {
  id             String     @id @default(cuid())
  quantity       Int
  price          Decimal    @db.Decimal(10, 2)
  discount       Decimal    @db.Decimal(10, 2) @default(0)
  tax            Decimal    @db.Decimal(10, 2) @default(0)
  
  // Relationships
  orderId        String
  order          Order      @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId      String
  product        Product    @relation(fields: [productId], references: [id])
  
  // Timestamps
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
}

enum OrderStatus {
  PENDING
  PROCESSING
  COMPLETED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PARTIAL
  PAID
  REFUNDED
  FAILED
}
```

## Phase 2: Implementation & Migration Steps

### Step 1: Apply Schema Updates

1. Update the `schema.prisma` file with the models above
2. Run the migration:

```bash
npx prisma migrate dev --name core_models
```

### Step 2: Update Repository & Service Layer

1. Create repository files for each model:
   - `backend/src/repositories/productRepository.ts`
   - `backend/src/repositories/categoryRepository.ts`
   - `backend/src/repositories/storeRepository.ts`
   - `backend/src/repositories/supplierRepository.ts`
   - `backend/src/repositories/orderRepository.ts`

2. Create service files for business logic:
   - `backend/src/services/productService.ts`
   - `backend/src/services/categoryService.ts`
   - `backend/src/services/storeService.ts`
   - `backend/src/services/supplierService.ts`
   - `backend/src/services/orderService.ts`

### Step 3: Create API Routes

1. Create controller files:
   - `backend/src/controllers/productController.ts`
   - `backend/src/controllers/categoryController.ts`
   - `backend/src/controllers/storeController.ts`
   - `backend/src/controllers/supplierController.ts`
   - `backend/src/controllers/orderController.ts`

2. Define routes in `index.ts`:
```typescript
// Import routes
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import storeRoutes from './routes/storeRoutes';
import supplierRoutes from './routes/supplierRoutes';
import orderRoutes from './routes/orderRoutes';

// Use routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
```

## Phase 3: Data Transformation Layer

Create type definitions and transformers to bridge the gap between Prisma models and frontend expectations:

1. Create DTOs (Data Transfer Objects) in:
   - `backend/src/types/dto/productDto.ts`
   - `backend/src/types/dto/categoryDto.ts`
   - `backend/src/types/dto/storeDto.ts`
   - `backend/src/types/dto/supplierDto.ts`
   - `backend/src/types/dto/orderDto.ts`

2. Create transformation functions in:
   - `backend/src/utils/transformers.ts`

## Implementation Priority Order

1. **Categories** - Simple model, foundation for products
2. **Suppliers** - Required for product relationships
3. **Stores/Locations** - Required for inventory management
4. **Products** - Core entity with relationships to all others
5. **Orders & OrderItems** - Depends on products and stores

## Testing Plan

1. Create seed data for development:
   - `backend/prisma/seed.ts`

2. Test each endpoint with Postman/Insomnia:
   - CRUD operations for each entity
   - Relationship queries
   - Filters and pagination

## Frontend Integration Notes

1. Update API service files in the frontend to match new endpoints
2. Ensure data transformations handle the new schema structure
3. Update form validation schemas to match backend expectations

## Next Phase Considerations

Once the core functionality is working, consider implementing:

1. Product variants
2. Price history tracking
3. Stock transfer functionality
4. Customer models for order relationships
5. Tax categories and rate configuration

This phased approach ensures we can quickly get the basic product and order functionality working while laying the groundwork for more advanced features in the future. 