/*
  Warnings:

  - You are about to drop the column `zipCode` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Supplier` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Store" DROP COLUMN "zipCode",
ADD COLUMN     "postalCode" TEXT;

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "zipCode",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "taxId" TEXT;
