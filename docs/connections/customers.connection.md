# Module Connection Guide - Customers

## Pre-Connection Analysis
- [ ] Verify module exists in both frontend (`src/features/customers`) and backend (`backend/src/customers`)
- [ ] Check module dependencies in `docs/feature-module-boundaries.md`
- [ ] Review module-specific settings in `components.json`
- [ ] Verify API endpoints in `src/lib/api/config.ts`

## Relationship Analysis
1. Check Direct Dependencies:
   - [ ] List all modules that depend on Customers
     * Sales (transactions)
     * Repairs (service history)
     * Marketing (campaigns)
     * Loyalty (points/rewards)
   - [ ] List all modules that Customers depends on
     * Products (purchase history)
     * Shops (preferred location)
     * Staff (assigned representatives)
   - [ ] Verify circular dependency absence
   - [ ] Document required foreign keys

2. Check Event Dependencies:
   - [ ] List events published by Customers
     * CustomerCreated
     * CustomerUpdated
     * CustomerMerged
     * LoyaltyEarned
     * PreferencesChanged
   - [ ] List events consumed by Customers
     * SaleCompleted
     * RepairFinished
     * LoyaltyRedeemed
     * MarketingEngagement
   - [ ] Document event payload structures

3. Check Shared Resources:
   - [ ] List shared types and interfaces
     * Customer
     * CustomerContact
     * LoyaltyStatus
     * PurchaseHistory
     * CustomerPreferences
   - [ ] List shared components
   - [ ] Document shared state requirements

## Step-by-Step Connection Process

### 1. Database Layer
- [ ] Review Prisma schema for Customer relationships
- [ ] Add necessary fields:
  ```prisma
  model Customer {
    id            String    @id @default(cuid())
    code          String    @unique
    firstName     String
    lastName      String
    email         String?   @unique
    phone         String?
    address       Json?
    loyaltyPoints Int       @default(0)
    tier          String    @default("STANDARD")
    preferredShop String?
    status        String    @default("ACTIVE")
    sales         Sale[]
    repairs       Repair[]
    // other fields
  }

  model CustomerPreference {
    id           String    @id @default(cuid())
    customerId   String
    category     String
    preferences  Json
    lastUpdated  DateTime
    // other fields
  }

  model CustomerNote {
    id           String    @id @default(cuid())
    customerId   String
    note         String
    createdBy    String
    createdAt    DateTime  @default(now())
    // other fields
  }
  ```
- [ ] Run migration: `npx prisma migrate dev --name add_customer_models`
- [ ] Generate Prisma client
- [ ] Verify foreign key constraints
- [ ] Add indexes for frequently queried fields

### 2. Backend Setup
- [ ] Create DTO types in `backend/src/types/dto/customers.dto.ts`
- [ ] Implement repository in `backend/src/repositories/customers.repository.ts`
- [ ] Create service layer in `backend/src/services/customers.service.ts`
- [ ] Set up controllers in `backend/src/controllers/customers.controller.ts`
- [ ] Configure routes in `backend/src/routes/customers.routes.ts`
- [ ] Add customer-specific endpoints:
  - Profile management
  - Purchase history
  - Loyalty tracking
  - Preference management
  - Note management

### 3. Frontend Integration
- [ ] Update API client configuration in `src/lib/api/config.ts`
- [ ] Create/update service in `src/features/customers/services/customer.service.ts`
- [ ] Implement customer management components:
  - Customer profile form
  - Purchase history view
  - Loyalty dashboard
  - Preference editor
  - Notes interface
- [ ] Set up state management store
- [ ] Implement data transformers for API responses
- [ ] Add loading states and error handling
- [ ] Update form validation schemas

### 4. Settings & Configuration
- [ ] Add customer settings to global config
- [ ] Configure loyalty tiers
- [ ] Set up preference categories
- [ ] Configure notification rules
- [ ] Set up permission requirements
- [ ] Add feature flags if needed
- [ ] Configure module-specific environment variables

### 5. Cross-Module Integration
- [ ] Review dependent modules in `docs/feature-module-boundaries.md`
- [ ] Set up event listeners/emitters
- [ ] Configure shared state management
- [ ] Implement cross-module validators
- [ ] Set up relationship hooks
- [ ] Configure loyalty point synchronization

### 6. Testing & Validation
- [ ] Add API endpoint tests
- [ ] Create integration tests
- [ ] Test customer management features:
  - Profile CRUD
  - Purchase tracking
  - Loyalty calculations
  - Preference management
  - Notes system
- [ ] Verify error handling
- [ ] Test data transformations
- [ ] Validate settings across environments

### 7. Documentation
- [ ] Update API documentation
- [ ] Document module relationships
- [ ] Add usage examples
- [ ] Update changelog
- [ ] Document configuration options
- [ ] Document customer management procedures

## Validation Checklist
- [ ] All CRUD operations working
- [ ] Purchase history tracking functioning
- [ ] Loyalty system working
- [ ] Preferences management operational
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
