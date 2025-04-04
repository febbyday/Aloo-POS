# Shop Address Structure Deployment Guide

This guide outlines the process for deploying the shop address structure changes to production. The changes involve migrating from individual address fields (addressStreet, addressCity, etc.) to a structured JSON object (address).

## Overview of Changes

1. **Database Schema**: Updated the Prisma schema to use a JSON field for address instead of individual fields
2. **Backend Code**: Updated services, controllers, and mappers to handle the new address structure
3. **Frontend Components**: Updated components to display and edit the structured address object

## Deployment Checklist

### Pre-Deployment

- [ ] Run all tests to ensure they pass
- [ ] Verify that the migration script works correctly in the staging environment
- [ ] Backup the production database

### Deployment Steps

1. **Deploy Backend Changes**
   - [ ] Deploy the updated Prisma schema
   - [ ] Deploy the updated backend code (services, controllers, mappers)
   - [ ] Run the migration script to convert existing data

2. **Deploy Frontend Changes**
   - [ ] Deploy the updated frontend components
   - [ ] Deploy the updated types and schemas

3. **Verification**
   - [ ] Run the verification script to ensure all shops have valid address structures
   - [ ] Manually test the shop creation and editing functionality
   - [ ] Verify that shop addresses are displayed correctly in all relevant components

## Migration Script

The migration script performs the following steps:

1. Adds a new `address` JSON column to the `Shop` table
2. Populates the new column with data from the existing address fields
3. Makes the new column NOT NULL
4. Drops the old address columns

```sql
-- Check if address column exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'address') THEN
        ALTER TABLE "Shop" ADD COLUMN "address" JSONB;
        
        -- Populate the new address column with data from the existing address fields
        UPDATE "Shop"
        SET "address" = jsonb_build_object(
          'street', "addressStreet",
          'street2', "addressStreet2",
          'city', "addressCity",
          'state', "addressState",
          'postalCode', "addressPostalCode",
          'country', "addressCountry",
          'latitude', "addressLatitude",
          'longitude', "addressLongitude"
        );
        
        -- Make the address column NOT NULL after populating it
        ALTER TABLE "Shop" ALTER COLUMN "address" SET NOT NULL;
    END IF;
END
$$;

-- Drop the old address columns if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressStreet') THEN
        ALTER TABLE "Shop" DROP COLUMN "addressStreet";
    END IF;
    
    -- ... (similar for other address columns)
END
$$;
```

## Verification Script

The verification script checks that:

1. The old address columns have been removed
2. All shops have valid address structures
3. The address data has been correctly migrated

To run the verification script:

```bash
node scripts/verify-shop-address-structure.js [environment]
```

Where `environment` is one of: local, dev, staging, production (default: staging)

## Rollback Plan

In case of issues, a rollback script is provided to revert the changes:

```bash
node scripts/rollback-shop-address-migration.js [environment] [--remove-json-field]
```

The rollback script:

1. Adds back the individual address columns
2. Populates them with data from the JSON address field
3. Optionally removes the JSON address field

**IMPORTANT**: The rollback script should only be run in case of emergency!

## Post-Deployment

After successful deployment:

1. Monitor the application for any issues related to shop addresses
2. Update documentation to reflect the new address structure
3. Remove any temporary migration scripts or files

## Contact

For questions or issues related to this deployment, contact:

- **Technical Lead**: [Name] ([email])
- **Database Administrator**: [Name] ([email])
- **Frontend Developer**: [Name] ([email])
