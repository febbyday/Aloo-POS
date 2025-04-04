# Module Connection Guide - Shops

## Pre-Connection Analysis
- [ ] Verify module exists in both frontend (`src/features/shops`) and backend (`backend/src/shops`)
- [ ] Check module dependencies in `docs/feature-module-boundaries.md`
- [ ] Review module-specific settings in `components.json`
- [ ] Verify API endpoints in `src/lib/api/config.ts`

## Relationship Analysis
1. Check Direct Dependencies:
   - [ ] List all modules that depend on Shops
     * Sales (point of sale)
     * Inventory (stock locations)
     * Staff (assignments)
     * Reports (location-based)
   - [ ] List all modules that Shops depends on
     * Products (catalog)
     * Staff (management)
     * Settings (configuration)
   - [ ] Verify circular dependency absence
   - [ ] Document required foreign keys

2. Check Event Dependencies:
   - [ ] List events published by Shops
     * ShopCreated
     * ShopUpdated
     * ShopStatusChanged
     * InventoryTransferred
     * StaffAssigned
   - [ ] List events consumed by Shops
     * SaleCompleted
     * InventoryUpdated
     * StaffScheduled
     * SettingsChanged
   - [ ] Document event payload structures

3. Check Shared Resources:
   - [ ] List shared types and interfaces
     * Shop
     * ShopSettings
     * InventoryLocation
     * StaffAssignment
     * OperatingHours
   - [ ] List shared components
   - [ ] Document shared state requirements

## Step-by-Step Connection Process

### 1. Database Layer
- [ ] Review Prisma schema for Shop relationships
- [ ] Add necessary fields:
  ```prisma
  model Shop {
    id              String    @id @default(cuid())
    code            String    @unique
    name            String
    address         Json
    phone           String
    email           String?
    status          String    @default("ACTIVE")
    operatingHours  Json
    settings        Json
    inventory       Inventory[]
    staff           StaffAssignment[]
    sales           Sale[]
    // other fields
  }

  model StaffAssignment {
    id              String    @id @default(cuid())
    shopId          String
    staffId         String
    role            String
    startDate       DateTime
    endDate         DateTime?
    // other fields
  }

  model ShopInventory {
    id              String    @id @default(cuid())
    shopId          String
    productId       String
    quantity        Int
    minLevel        Int
    maxLevel        Int
    // other fields
  }
  ```
- [ ] Run migration: `npx prisma migrate dev --name add_shop_models`
- [ ] Generate Prisma client
- [ ] Verify foreign key constraints
- [ ] Add indexes for frequently queried fields

### 2. Backend Setup
- [ ] Create DTO types in `backend/src/types/dto/shops.dto.ts`
- [ ] Implement repository in `backend/src/repositories/shops.repository.ts`
- [ ] Create service layer in `backend/src/services/shops.service.ts`
- [ ] Set up controllers in `backend/src/controllers/shops.controller.ts`
- [ ] Configure routes in `backend/src/routes/shops.routes.ts`
- [ ] Add shop-specific endpoints:
  - Shop management
  - Inventory tracking
  - Staff assignment
  - Settings configuration
  - Operating hours

### 3. Frontend Integration
- [ ] Update API client configuration in `src/lib/api/config.ts`
- [ ] Create/update service in `src/features/shops/services/shop.service.ts`
- [ ] Implement shop management components:
  - Shop details form
  - Inventory dashboard
  - Staff roster
  - Settings panel
  - Operating hours editor
- [ ] Set up state management store
- [ ] Implement data transformers for API responses
- [ ] Add loading states and error handling
- [ ] Update form validation schemas

### 4. Settings & Configuration
- [ ] Add shop settings to global config
- [ ] Configure inventory thresholds
- [ ] Set up staff roles
- [ ] Configure operating hours templates
- [ ] Set up permission requirements
- [ ] Add feature flags if needed
- [ ] Configure module-specific environment variables

### 5. Cross-Module Integration
- [ ] Review dependent modules in `docs/feature-module-boundaries.md`
- [ ] Set up event listeners/emitters
- [ ] Configure shared state management
- [ ] Implement cross-module validators
- [ ] Set up relationship hooks
- [ ] Configure inventory synchronization

### 6. Testing & Validation
- [ ] Add API endpoint tests
- [ ] Create integration tests
- [ ] Test shop management features:
  - Shop CRUD
  - Inventory management
  - Staff assignments
  - Settings configuration
  - Operating hours
- [ ] Verify error handling
- [ ] Test data transformations
- [ ] Validate settings across environments

### 7. Documentation
- [ ] Update API documentation
- [ ] Document module relationships
- [ ] Add usage examples
- [ ] Update changelog
- [ ] Document configuration options
- [ ] Document shop management procedures

## Validation Checklist
- [ ] All CRUD operations working
- [ ] Inventory tracking functioning
- [ ] Staff assignment working
- [ ] Settings management operational
- [ ] Real-time updates functioning
- [ ] Error handling tested
- [ ] Performance metrics acceptable
- [ ] Security measures in place
- [ ] Cross-module relationships verified
- [ ] Settings properly propagated

## Deployment Considerations
1. Database migration order
2. API version compatibility
3. Frontend/Backend deployment synchronization
4. Environment variable updates
5. Cache clearing requirements
6. Data migration strategy
7. Backup procedures
8. Performance monitoring setup
9. Alert system configuration
10. Scaling considerations
