# Module Connection Guide - Markets

## Pre-Connection Analysis
- [ ] Verify module exists in both frontend (`src/features/markets`) and backend (`backend/src/markets`)
- [ ] Check module dependencies in `docs/feature-module-boundaries.md`
- [ ] Review module-specific settings in `components.json`
- [ ] Verify API endpoints in `src/lib/api/config.ts`

## Relationship Analysis
1. Check Direct Dependencies:
   - [ ] List all modules that depend on Markets
     * Products (stock allocation)
     * Staff (assignments)
     * Reports (market performance)
     * Settings (market configuration)
   - [ ] List all modules that Markets depends on
     * Products (inventory)
     * Staff (resource planning)
     * Locations (venue management)
     * Analytics (performance tracking)
   - [ ] Verify circular dependency absence
   - [ ] Document required foreign keys

2. Check Event Dependencies:
   - [ ] List events published by Markets
     * MarketCreated
     * MarketUpdated
     * MarketStatusChanged
     * StockAllocated
     * StaffAssigned
   - [ ] List events consumed by Markets
     * ProductStockUpdated
     * StaffAvailabilityChanged
     * WeatherAlert
     * AnalyticsUpdated
   - [ ] Document event payload structures

3. Check Shared Resources:
   - [ ] List shared types and interfaces
     * Market
     * MarketFilter
     * StockAllocation
     * StaffAssignment
     * MarketSettings
   - [ ] List shared components
     * MarketWizard
     * MarketsTable
     * MarketDetailsDialog
   - [ ] Document shared state requirements

## Step-by-Step Connection Process

### 1. Database Layer
- [ ] Review Prisma schema for Market relationships
- [ ] Add necessary fields:
  ```prisma
  model Market {
    id              String    @id @default(cuid())
    name            String
    location        String
    startDate       DateTime
    endDate         DateTime
    status          String    @default("planning")
    progress        Int       @default(0)
    stockAllocation Json
    staffAssigned   Json
    settings        Json?
    createdAt       DateTime  @default(now())
    updatedAt       DateTime  @updatedAt
    // other fields
  }

  model MarketStock {
    id              String    @id @default(cuid())
    marketId        String
    productId       String
    allocated       Int
    total           Int
    // other fields
  }

  model MarketStaff {
    id              String    @id @default(cuid())
    marketId        String
    staffId         String
    role            String
    assignedAt      DateTime
    // other fields
  }
  ```
- [ ] Run migration: `npx prisma migrate dev --name add_market_models`
- [ ] Generate Prisma client
- [ ] Verify foreign key constraints
- [ ] Add indexes for frequently queried fields

### 2. Backend Setup
- [ ] Create DTO types in `backend/src/types/dto/markets.dto.ts`
- [ ] Implement repository in `backend/src/repositories/markets.repository.ts`
- [ ] Create service layer in `backend/src/services/markets.service.ts`
- [ ] Set up controllers in `backend/src/controllers/markets.controller.ts`
- [ ] Configure routes in `backend/src/routes/markets.routes.ts`
- [ ] Add market-specific endpoints:
  - Market CRUD operations
  - Stock allocation
  - Staff assignment
  - Performance tracking
  - Analytics integration

### 3. Frontend Integration
- [ ] Update API client configuration in `src/lib/api/config.ts`
- [ ] Implement/update service in `src/features/markets/services/marketsService.ts`:
  - fetchAll
  - fetchById
  - create
  - update
  - delete
- [ ] Implement market management components:
  - MarketWizard
  - MarketsTable
  - MarketDetailsDialog
  - StockAllocationPanel
  - StaffAssignmentPanel
- [ ] Set up MarketsContext for state management
- [ ] Implement useMarkets hook with pagination and filtering
- [ ] Add loading states and error handling
- [ ] Update form validation schemas

### 4. Settings & Configuration
- [ ] Add market settings to global config
- [ ] Configure market analysis settings:
  - enableMarketAnalysis
  - marketCodePrefix
  - defaultCurrency
  - enableLocationTracking
  - analysisFrequency
  - demographicTracking
  - performanceMetrics
- [ ] Set up permission requirements
- [ ] Add feature flags if needed
- [ ] Configure module-specific environment variables

### 5. Cross-Module Integration
- [ ] Review dependent modules in `docs/feature-module-boundaries.md`
- [ ] Set up event listeners/emitters
- [ ] Configure shared state management
- [ ] Implement cross-module validators
- [ ] Set up relationship hooks
- [ ] Configure stock allocation system

### 6. Testing & Validation
- [ ] Add API endpoint tests
- [ ] Create integration tests
- [ ] Test market features:
  - Market creation/editing
  - Stock allocation
  - Staff assignment
  - Performance tracking
  - Analytics integration
- [ ] Verify error handling
- [ ] Test data transformations
- [ ] Validate settings across environments

### 7. Documentation
- [ ] Update API documentation
- [ ] Document module relationships
- [ ] Add usage examples
- [ ] Update changelog
- [ ] Document configuration options
- [ ] Document market management procedures

## Validation Checklist
- [ ] All CRUD operations working
- [ ] Stock allocation functioning
- [ ] Staff assignment working
- [ ] Performance tracking operational
- [ ] Analytics integration functioning
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

