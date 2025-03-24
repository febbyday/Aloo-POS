/*
  Warnings:

  - The values [BAG,WALLET,BELT,JACKET] on the enum `LeatherProductType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `tier` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `brand` on the `Repair` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedCompletionDate` on the `Repair` table. All the data in the column will be lost.
  - Added the required column `dueDate` to the `Repair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productBrand` to the `Repair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productModel` to the `Repair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `Repair` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LeatherProductType_new" AS ENUM ('SHOES', 'BOOTS', 'BAGS', 'WALLETS', 'BELTS', 'JACKETS', 'OTHER');
ALTER TABLE "Repair" ALTER COLUMN "productType" TYPE "LeatherProductType_new" USING ("productType"::text::"LeatherProductType_new");
ALTER TYPE "LeatherProductType" RENAME TO "LeatherProductType_old";
ALTER TYPE "LeatherProductType_new" RENAME TO "LeatherProductType";
DROP TYPE "LeatherProductType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "tier",
ADD COLUMN     "membershipLevel" TEXT NOT NULL DEFAULT 'bronze',
ADD COLUMN     "tierId" TEXT;

-- AlterTable
ALTER TABLE "Repair" DROP COLUMN "brand",
DROP COLUMN "estimatedCompletionDate",
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "productBrand" TEXT NOT NULL,
ADD COLUMN     "productModel" TEXT NOT NULL,
ADD COLUMN     "productName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "loyalty_tiers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minimumSpend" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "benefits" TEXT[],
    "color" TEXT NOT NULL DEFAULT '#000000',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_rewards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousTierId" TEXT,
    "newTierId" TEXT,
    "spendAmount" DECIMAL(10,2),

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "pointsPerDollar" INTEGER NOT NULL DEFAULT 10,
    "pointValueInCents" INTEGER NOT NULL DEFAULT 1,
    "minimumRedemption" INTEGER NOT NULL DEFAULT 500,
    "expiryPeriodInDays" INTEGER NOT NULL DEFAULT 365,
    "enableBirthdayBonus" BOOLEAN NOT NULL DEFAULT true,
    "birthdayBonusPoints" INTEGER NOT NULL DEFAULT 250,
    "enableReferralBonus" BOOLEAN NOT NULL DEFAULT true,
    "referralBonusPoints" INTEGER NOT NULL DEFAULT 100,
    "autoTierUpgrade" BOOLEAN NOT NULL DEFAULT true,
    "tierDowngradeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "tierDowngradePeriodDays" INTEGER NOT NULL DEFAULT 365,
    "spendingCalculationPeriod" TEXT NOT NULL DEFAULT 'LIFETIME',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_tiers_name_key" ON "loyalty_tiers"("name");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "loyalty_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
