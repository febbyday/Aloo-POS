/*
  Warnings:

  - You are about to drop the column `minimumPoints` on the `loyalty_tiers` table. All the data in the column will be lost.
  - The `benefits` column on the `loyalty_tiers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "loyalty_tiers_name_key";

-- AlterTable
ALTER TABLE "_CustomerToCustomerGroup" ADD CONSTRAINT "_CustomerToCustomerGroup_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CustomerToCustomerGroup_AB_unique";

-- AlterTable
ALTER TABLE "loyalty_tiers" DROP COLUMN "minimumPoints",
ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "minimumSpend" DECIMAL(10,2) NOT NULL DEFAULT 0,
DROP COLUMN "benefits",
ADD COLUMN     "benefits" TEXT[];

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
    "pointsAwarded" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_settings" (
    "id" TEXT NOT NULL,
    "pointsPerDollar" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "pointValueInCents" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "minimumRedemption" INTEGER NOT NULL DEFAULT 100,
    "expiryPeriodInDays" INTEGER NOT NULL DEFAULT 365,
    "enableBirthdayBonus" BOOLEAN NOT NULL DEFAULT true,
    "birthdayBonusPoints" INTEGER NOT NULL DEFAULT 50,
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
