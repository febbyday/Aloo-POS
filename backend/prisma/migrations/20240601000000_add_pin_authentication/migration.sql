-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pinHash" TEXT,
                  ADD COLUMN IF NOT EXISTS "isPinEnabled" BOOLEAN NOT NULL DEFAULT false,
                  ADD COLUMN IF NOT EXISTS "lastPinChange" TIMESTAMP(3),
                  ADD COLUMN IF NOT EXISTS "failedPinAttempts" INTEGER NOT NULL DEFAULT 0,
                  ADD COLUMN IF NOT EXISTS "pinLockedUntil" TIMESTAMP(3);
