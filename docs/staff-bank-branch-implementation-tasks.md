# 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

# Staff Module Enhancement: Bank Branch Location Implementation

## Overview
This document outlines the tasks required to enhance the staff module by adding branch location to the banking details. The implementation will follow the established frontend development standards and cover both frontend and backend components.

## Analysis of Current Implementation

### Current State
- Basic staff module implemented with TypeScript and React
- Banking details schema exists but missing branch location field
- Mock data is being used with some banking fields not fully implemented in the schema
- Validation is implemented using Zod schemas

### Missing Features
- Branch location in banking details
- Consistent implementation of banking details across all components
- Backend API endpoints for staff with complete banking information
- Data migration for existing staff records

## Implementation Tasks

### 1. Backend Tasks

#### Database Schema Updates
- [ ] Update staff database schema to include branch location in banking details
- [ ] Create migration script for existing staff records
- [ ] Update database validation rules

#### API Endpoints
- [ ] Create/update staff API endpoints:
  - [ ] GET /api/staff - with complete banking details including branch location
  - [ ] GET /api/staff/:id - with complete banking details 
  - [ ] POST /api/staff - with branch location validation
  - [ ] PUT /api/staff/:id - with branch location update support
  - [ ] DELETE /api/staff/:id

#### Controllers and Services
- [ ] Update StaffController to handle branch location in requests/responses
- [ ] Update staff service layer to process branch location
- [ ] Implement validation for branch location field

#### Middleware
- [ ] Update request validation middleware for staff endpoints
- [ ] Add branch location to allowed fields in sanitization middleware

### 2. Frontend Tasks

#### Type Definitions
- [ ] Update staff types in `src/features/staff/types/staff.ts`:
  - [ ] Add branchLocation to banking details object
  - [ ] Update Zod schema validation for branchLocation
  - [ ] Add validation messages for branchLocation

#### API Service Updates
- [ ] Update staffService in `src/features/staff/services/staffService.ts`:
  - [ ] Update create method to include branch location
  - [ ] Update update method to handle branch location changes
  - [ ] Ensure proper typing throughout service layer

#### Form Components
- [ ] Update StaffForm/StaffModal component:
  - [ ] Add branch location field in banking details section
  - [ ] Add proper validation rules for branch location
  - [ ] Ensure form submits branch location correctly

#### UI Components
- [ ] Update StaffDetailsPage to display branch location
- [ ] Update staff table to include branch location in expanded view
- [ ] Create or update banking details component to prominently show branch location

#### Context and State Management
- [ ] Update staff context to handle branch location in state
- [ ] Update staff reducer actions for branch location updates
- [ ] Ensure branch location is preserved during state transitions

### 3. Testing

#### Backend Tests
- [ ] Unit tests for branch location validation
- [ ] API endpoint tests for branch location CRUD operations
- [ ] Integration tests for complete banking details flow

#### Frontend Tests
- [ ] Component tests for branch location field display and interactions
- [ ] Form validation tests for branch location
- [ ] Integration tests for creating/updating staff with branch location

### 4. Documentation

- [ ] Update API documentation to include branch location field
- [ ] Update TypeScript interface documentation
- [ ] Add examples of branch location usage in code comments
- [ ] Update user documentation for staff management

## Implementation Details

### Branch Location Schema Updates
```typescript
// Update staffSchema in staff.ts
bankingDetails: z.object({
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountType: z.string().min(1, "Account type is required"),
  branchLocation: z.string().min(1, "Branch location is required"),
  branchCode: z.string().optional(),
  swiftCode: z.string().optional(),
  iban: z.string().optional(),
  bankAddress: z.string().optional(),
}).optional(),
```

### Form Field Example
```tsx
<FormField
  control={form.control}
  name="bankingDetails.branchLocation"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Branch Location</FormLabel>
      <FormControl>
        <Input placeholder="Enter bank branch location" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### API Request/Response Example
```typescript
// Request body example
{
  "firstName": "John",
  "lastName": "Doe",
  // Other staff fields...
  "bankingDetails": {
    "accountName": "John Doe",
    "accountNumber": "1234567890",
    "bankName": "Example Bank",
    "accountType": "Savings",
    "branchLocation": "Downtown Branch",
    "branchCode": "001",
    // Other banking fields...
  }
}
```

## Timeline
- Database and backend updates: 2 days
- Frontend type and service updates: 1 day
- UI component updates: 2 days
- Testing and documentation: 1 day
- Total estimated time: 6 days
