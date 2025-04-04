# Module Connection Guide - Repairs

## Pre-Connection Analysis
- [ ] Verify module exists in both frontend (`src/features/repairs`) and backend (`backend/src/repairs`)
- [ ] Check module dependencies in `docs/feature-module-boundaries.md`
- [ ] Review module-specific settings in `components.json`
- [ ] Verify API endpoints in `src/lib/api/config.ts`

## Relationship Analysis
1. Check Direct Dependencies:
   - [ ] List all modules that depend on Repairs
     * Sales (service charges)
     * Customers (repair history)
     * Finance (repair payments)
   - [ ] List all modules that Repairs depends on
     * Products (parts inventory)
     * Customers (device ownership)
     * Staff (technicians)
   - [ ] Verify circular dependency absence
   - [ ] Document required foreign keys

2. Check Event Dependencies:
   - [ ] List events published by Repairs
     * RepairCreated
     * RepairStatusUpdated
     * RepairCompleted
     * PartsUsed
     * DiagnosisAdded
   - [ ] List events consumed by Repairs
     * CustomerUpdated
     * ProductStockChanged
     * PaymentReceived
   - [ ] Document event payload structures

3. Check Shared Resources:
   - [ ] List shared types and interfaces
     * RepairTicket
     * RepairStatus
     * DiagnosisReport
     * RepairParts
     * ServiceCharge
   - [ ] List shared components
   - [ ] Document shared state requirements

## Step-by-Step Connection Process

### 1. Database Layer
- [ ] Review Prisma schema for Repair relationships
- [ ] Add necessary fields:
  ```prisma
  model RepairTicket {
    id            String    @id @default(cuid())
    customerId    String
    deviceType    String
    serialNumber  String?
    description   String
    status        String
    priority      String
    assignedTo    String?
    diagnosis     DiagnosisReport[]
    parts         RepairParts[]
    charges       ServiceCharge[]
    // other fields
  }

  model DiagnosisReport {
    id            String    @id @default(cuid())
    repairId      String
    findings      String
    recommendation String
    technician    String
    // other fields
  }

  model RepairParts {
    id            String    @id @default(cuid())
    repairId      String
    productId     String
    quantity      Int
    cost          Decimal
    // other fields
  }
  ```
- [ ] Run migration: `npx prisma migrate dev --name add_repair_models`
- [ ] Generate Prisma client
- [ ] Verify foreign key constraints
- [ ] Add indexes for frequently queried fields

### 2. Backend Setup
- [ ] Create DTO types in `backend/src/types/dto/repairs.dto.ts`
- [ ] Implement repository in `backend/src/repositories/repairs.repository.ts`
- [ ] Create service layer in `backend/src/services/repairs.service.ts`
- [ ] Set up controllers in `backend/src/controllers/repairs.controller.ts`
- [ ] Configure routes in `backend/src/routes/repairs.routes.ts`
- [ ] Add repair-specific endpoints:
  - Ticket management
  - Diagnosis reports
  - Parts tracking
  - Service charges
  - Status updates

### 3. Frontend Integration
- [ ] Update API client configuration in `src/lib/api/config.ts`
- [ ] Create/update service in `src/features/repairs/services/repair.service.ts`
- [ ] Implement repair management components:
  - Repair ticket form
  - Diagnosis entry
  - Parts selection
  - Status tracking
  - Service charge calculator
- [ ] Set up state management store
- [ ] Implement data transformers for API responses
- [ ] Add loading states and error handling
- [ ] Update form validation schemas

### 4. Settings & Configuration
- [ ] Add repair settings to global config
- [ ] Configure repair status options
- [ ] Set up priority levels
- [ ] Configure notification settings
- [ ] Set up permission requirements
- [ ] Add feature flags if needed
- [ ] Configure module-specific environment variables

### 5. Cross-Module Integration
- [ ] Review dependent modules in `docs/feature-module-boundaries.md`
- [ ] Set up event listeners/emitters
- [ ] Configure shared state management
- [ ] Implement cross-module validators
- [ ] Set up relationship hooks
- [ ] Configure parts inventory synchronization

### 6. Testing & Validation
- [ ] Add API endpoint tests
- [ ] Create integration tests
- [ ] Test repair management features:
  - Ticket creation
  - Diagnosis entry
  - Parts tracking
  - Status updates
  - Service charges
- [ ] Verify error handling
- [ ] Test data transformations
- [ ] Validate settings across environments

### 7. Documentation
- [ ] Update API documentation
- [ ] Document module relationships
- [ ] Add usage examples
- [ ] Update changelog
- [ ] Document configuration options
- [ ] Document repair management procedures

## Validation Checklist
- [ ] All CRUD operations working
- [ ] Diagnosis system functioning
- [ ] Parts tracking working
- [ ] Status updates operational
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
