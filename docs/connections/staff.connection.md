# Module Connection Guide - Staff

## Pre-Connection Analysis
- [ ] Verify module exists in both frontend (`src/features/staff`) and backend (`backend/src/staff`)
- [ ] Check module dependencies in `docs/feature-module-boundaries.md`
- [ ] Review module-specific settings in `components.json`
- [ ] Verify API endpoints in `src/lib/api/config.ts`

## Relationship Analysis
1. Check Direct Dependencies:
   - [ ] List all modules that depend on Staff
     * Sales (cashier identification)
     * Shops (staff assignment)
     * Reports (performance tracking)
     * Settings (permissions)
   - [ ] List all modules that Staff depends on
     * Roles (permissions)
     * Shops (workplace)
     * Auth (authentication)
   - [ ] Verify circular dependency absence
   - [ ] Document required foreign keys

2. Check Event Dependencies:
   - [ ] List events published by Staff
     * StaffCreated
     * StaffUpdated
     * RoleAssigned
     * ShiftStarted
     * ShiftEnded
   - [ ] List events consumed by Staff
     * ShopAssigned
     * PermissionChanged
     * ScheduleUpdated
   - [ ] Document event payload structures

## Step-by-Step Connection Process

### 1. Database Layer
- [ ] Review Prisma schema for Staff relationships
- [ ] Add necessary fields:
  ```prisma
  model Staff {
    id              String    @id @default(cuid())
    code            String    @unique
    firstName       String
    lastName        String
    email           String    @unique
    phone           String?
    roleId          String
    status          String    @default("ACTIVE")
    assignments     StaffAssignment[]
    shifts          Shift[]
    createdAt       DateTime  @default(now())
    updatedAt       DateTime  @updatedAt
  }

  model Shift {
    id              String    @id @default(cuid())
    staffId         String
    shopId          String
    startTime       DateTime
    endTime         DateTime?
    status          String
    // other fields
  }
