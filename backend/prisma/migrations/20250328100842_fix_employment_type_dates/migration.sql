/*
  Warnings:

  - You are about to drop the column `isActive` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `isSystemRole` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `permissions` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `staffCount` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `bankingDetails` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `hireDate` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Staff` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Staff` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Made the column `roleId` on table `Staff` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_roleId_fkey";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "isActive",
DROP COLUMN "isSystemRole",
DROP COLUMN "permissions",
DROP COLUMN "staffCount",
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "bankingDetails",
DROP COLUMN "department",
DROP COLUMN "emergencyContact",
DROP COLUMN "hireDate",
DROP COLUMN "position",
DROP COLUMN "updatedBy",
ADD COLUMN     "code" TEXT NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "roleId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" "ShopStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "status" "ShiftStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAssignment" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StaffToShop" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StaffToShop_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StaffToShop_B_index" ON "_StaffToShop"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_code_key" ON "Staff"("code");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StaffToShop" ADD CONSTRAINT "_StaffToShop_A_fkey" FOREIGN KEY ("A") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StaffToShop" ADD CONSTRAINT "_StaffToShop_B_fkey" FOREIGN KEY ("B") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
