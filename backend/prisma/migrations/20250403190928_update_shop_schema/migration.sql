/*
  Warnings:

  - You are about to drop the column `address` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Shop` table. All the data in the column will be lost.
  - Added the required column `addressCity` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressCountry` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressPostalCode` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressState` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressStreet` to the `Shop` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `Shop` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "postalCode",
DROP COLUMN "state",
ADD COLUMN     "addressCity" TEXT NOT NULL,
ADD COLUMN     "addressCountry" TEXT NOT NULL,
ADD COLUMN     "addressLatitude" DOUBLE PRECISION,
ADD COLUMN     "addressLongitude" DOUBLE PRECISION,
ADD COLUMN     "addressPostalCode" TEXT NOT NULL,
ADD COLUMN     "addressState" TEXT NOT NULL,
ADD COLUMN     "addressStreet" TEXT NOT NULL,
ADD COLUMN     "addressStreet2" TEXT,
ADD COLUMN     "recentActivity" JSONB,
ADD COLUMN     "topSellingCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "phone" SET NOT NULL;
