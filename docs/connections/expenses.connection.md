# Module Connection Guide - Expenses

## Pre-Connection Analysis
- [ ] Verify module exists in both frontend (`src/features/expenses`) and backend (`backend/src/expenses`)
- [ ] Check module dependencies in `docs/feature-module-boundaries.md`
- [ ] Review module-specific settings in `components.json`
- [ ] Verify API endpoints in `src/lib/api/config.ts`

## Relationship Analysis
1. Check Direct Dependencies:
   - [ ] List all modules that depend on Expenses
     * Finance (accounting)
     * Reports (financial analysis)
     * Staff (reimbursements)
   - [ ] List all modules that Expenses depends on
     * Suppliers (payments)
     * Shops (location-based expenses)
     * Staff (expense approvals)
   - [ ] Verify circular dependency absence
   - [ ] Document required foreign keys

2. Check Event Dependencies:
   - [ ] List events published by Expenses
     * ExpenseCreated
     * ExpenseApproved
     * ExpensePaid
     * ExpenseRejected
     * BudgetUpdated
   - [ ] List events consumed by Expenses
     * PaymentProcessed
     * BudgetAllocated
     * ApprovalGranted
   - [ ] Document event payload structures

3. Check Shared Resources:
   - [ ] List shared types and interfaces
     * Expense
     * ExpenseCategory
     * Budget
     * ApprovalWorkflow
     * PaymentStatus
   - [ ] List shared components
   - [ ] Document shared state requirements

## Step-by-Step Connection Process

### 1. Database Layer
- [ ] Review Prisma schema for Expense relationships
- [ ] Add necessary fields:
  ```prisma
  model Expense {
    id            String    @id @default(cuid())
    amount        Decimal
    description   String
    category      String
    date          DateTime
    shopId        String?
    staffId       String?
    status        String
    approvedBy    String?
    receipts      Receipt[]
    // other fields
  }

  model ExpenseCategory {
    id            String    @id @default(cuid())
    name          String
    budget        Decimal
    expenses      Expense[]
    // other fields
  }

  model Receipt {
    id            String    @id @default(cuid())
    expenseId     String
    fileUrl       String
    uploadedAt    DateTime
    // other fields
  }
  ```
- [ ] Run migration: `npx prisma migrate dev --name add_expense_models`
- [ ] Generate Prisma client
- [ ] Verify foreign key constraints
- [ ] Add indexes for frequently queried fields

### 2. Backend Setup
- [ ] Create DTO types in `backend/src/types/dto/expenses.dto.ts`
- [ ] Implement repository in `backend/src/repositories/expenses.repository.ts`
- [ ] Create service layer in `backend/src/services/expenses.service.ts`
- [ ] Set up controllers in `backend/src/controllers/expenses.controller.ts`
- [ ] Configure routes in `backend/src/routes/expenses.routes.ts`
- [ ] Add expense-specific endpoints:
  - Expense submission
  - Approval workflow
  - Receipt management
  - Budget tracking
  - Category management

### 3. Frontend Integration
- [ ] Update API client configuration in `src/lib/api/config.ts`
- [ ] Create/update service in `src/features/expenses/services/expense.service.ts`
- [ ] Implement expense management components:
  - Expense form
  - Receipt upload
  - Approval interface
  - Budget dashboard
  - Category management
- [ ] Set up state management store
- [ ] Implement data transformers for API responses
- [ ] Add loading states and error handling
- [ ] Update form validation schemas

### 4. Settings & Configuration
- [ ] Add expense settings to global config
- [ ] Configure expense categories
- [ ] Set up approval workflows
- [ ] Configure budget alerts
- [ ] Set up permission requirements
- [ ] Add feature flags if needed
- [ ] Configure module-specific environment variables

### 5. Cross-Module Integration
- [ ] Review dependent modules in `docs/feature-module-boundaries.md`
- [ ] Set up event listeners/emitters
- [ ] Configure shared state management
- [ ] Implement cross-module validators
- [ ] Set up relationship hooks
- [ ] Configure budget synchronization

### 6. Testing & Validation
- [ ] Add API endpoint tests
- [ ] Create integration tests
- [ ] Test expense management features:
  - Expense submission
  - Receipt handling
  - Approval workflow
  - Budget tracking
  - Category management
- [ ] Verify error handling
- [ ] Test data transformations
- [ ] Validate settings across environments

### 7. Documentation
- [ ] Update API documentation
- [ ] Document module relationships
- [ ] Add usage examples
- [ ] Update changelog
- [ ] Document configuration options
- [ ] Document expense management procedures

## Validation Checklist
- [ ] All CRUD operations working
- [ ] Receipt system functioning
- [ ] Approval workflow working
- [ ] Budget tracking operational
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
