-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "isHeadOffice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC',
ADD COLUMN     "website" TEXT;
