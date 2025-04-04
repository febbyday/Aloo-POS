-- Update Shop table to use JSON for address
-- First, create a new column for the JSON address
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

-- Drop the old address columns
ALTER TABLE "Shop" 
  DROP COLUMN "addressStreet",
  DROP COLUMN "addressStreet2",
  DROP COLUMN "addressCity",
  DROP COLUMN "addressState",
  DROP COLUMN "addressPostalCode",
  DROP COLUMN "addressCountry",
  DROP COLUMN "addressLatitude",
  DROP COLUMN "addressLongitude";
