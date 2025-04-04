/*
  Warnings:

  - You are about to drop the column `storeId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `ProductLocation` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the column `openingHours` on the `Shop` table. All the data in the column will be lost.
  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[productId,shopId]` on the table `ProductLocation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Shop` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopId` to the `ProductLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ShopType" ADD VALUE 'MARKET';
ALTER TYPE "ShopType" ADD VALUE 'ONLINE';

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_storeId_fkey";

-- DropForeignKey
ALTER TABLE "ProductLocation" DROP CONSTRAINT "ProductLocation_storeId_fkey";

-- DropIndex
DROP INDEX "ProductLocation_productId_storeId_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "storeId",
ADD COLUMN     "shopId" TEXT;

-- AlterTable
ALTER TABLE "ProductLocation" DROP COLUMN "storeId",
ADD COLUMN     "shopId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "location",
DROP COLUMN "openingHours",
ADD COLUMN     "averageOrderValue" DECIMAL(10,2),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "inventoryCount" INTEGER DEFAULT 0,
ADD COLUMN     "operatingHours" JSONB,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "salesLastMonth" DECIMAL(10,2),
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "staffCount" INTEGER DEFAULT 0,
ADD COLUMN     "state" TEXT;

-- DropTable
DROP TABLE "Store";

-- DropEnum
DROP TYPE "StoreType";

-- CreateIndex
CREATE UNIQUE INDEX "ProductLocation_productId_shopId_key" ON "ProductLocation"("productId", "shopId");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_code_key" ON "Shop"("code");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductLocation" ADD CONSTRAINT "ProductLocation_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
