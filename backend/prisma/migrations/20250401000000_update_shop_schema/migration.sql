-- Update ShopStatus enum
ALTER TYPE "ShopStatus" ADD VALUE 'CLOSED';
ALTER TYPE "ShopStatus" ADD VALUE 'PENDING';

-- Create ShopType enum
CREATE TYPE "ShopType" AS ENUM ('RETAIL', 'WAREHOUSE', 'OUTLET');

-- Alter Shop table
ALTER TABLE "Shop" 
  ADD COLUMN "type" "ShopType" NOT NULL DEFAULT 'RETAIL',
  ADD COLUMN "location" TEXT,
  ADD COLUMN "manager" TEXT,
  ADD COLUMN "openingHours" TEXT,
  ADD COLUMN "lastSync" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing shops to use location from address
UPDATE "Shop" SET "location" = "address" WHERE "location" IS NULL;

-- Make location NOT NULL after populating it
ALTER TABLE "Shop" ALTER COLUMN "location" SET NOT NULL;

-- Alter StaffAssignment table
ALTER TABLE "StaffAssignment" 
  ADD COLUMN "role" TEXT,
  ADD COLUMN "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "schedule" JSONB;
