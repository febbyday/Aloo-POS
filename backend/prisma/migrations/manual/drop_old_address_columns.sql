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
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressStreet2') THEN
        ALTER TABLE "Shop" DROP COLUMN "addressStreet2";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressCity') THEN
        ALTER TABLE "Shop" DROP COLUMN "addressCity";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressState') THEN
        ALTER TABLE "Shop" DROP COLUMN "addressState";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressPostalCode') THEN
        ALTER TABLE "Shop" DROP COLUMN "addressPostalCode";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressCountry') THEN
        ALTER TABLE "Shop" DROP COLUMN "addressCountry";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressLatitude') THEN
        ALTER TABLE "Shop" DROP COLUMN "addressLatitude";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Shop' AND column_name = 'addressLongitude') THEN
        ALTER TABLE "Shop" DROP COLUMN "addressLongitude";
    END IF;
END
$$;
