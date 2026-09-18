-- Additive, idempotent migration (prisma-pg tree) for the 15-point
-- hormonal / cycle tracking suite:
--
--   * MenstrualLog — per-day granular entry linked to a MenstrualCycle,
--     covering flow intensity, fibro-somatic symptoms, GI/inflammation,
--     ovulation signatures, mood, energy, libido, and sensory overload.
--   * Caregiver/partner secure sync fields on User
--     (caregiverShareEnabled + signed token for read-only flare view).

-- CreateEnum
CREATE TYPE "FlowIntensity" AS ENUM ('SPOTTING', 'LIGHT', 'MEDIUM', 'HEAVY');

-- CreateEnum
CREATE TYPE "CervicalMucus" AS ENUM ('DRY', 'STICKY', 'CREAMY', 'WATERY', 'EGG_WHITE');

-- CreateEnum
CREATE TYPE "OpkResult" AS ENUM ('NEGATIVE', 'POSITIVE', 'NOT_USED');

-- CreateEnum
CREATE TYPE "SensorySensitivity" AS ENUM ('NONE', 'MILD', 'MODERATE', 'SEVERE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "caregiverShareEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "caregiverShareToken" TEXT;

-- CreateTable
CREATE TABLE "MenstrualLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flowIntensity" "FlowIntensity",
    "hasClots" BOOLEAN NOT NULL DEFAULT false,
    "flowColor" TEXT,
    "crampsSeverity" INTEGER NOT NULL DEFAULT 0,
    "headacheSeverity" INTEGER NOT NULL DEFAULT 0,
    "breastTenderness" INTEGER NOT NULL DEFAULT 0,
    "bloatingSeverity" INTEGER NOT NULL DEFAULT 0,
    "giDiarrhea" BOOLEAN NOT NULL DEFAULT false,
    "giConstipation" BOOLEAN NOT NULL DEFAULT false,
    "hormonalAcne" BOOLEAN NOT NULL DEFAULT false,
    "cervicalMucus" "CervicalMucus",
    "opkResult" "OpkResult",
    "tearfulness" INTEGER NOT NULL DEFAULT 0,
    "anxietyLevel" INTEGER NOT NULL DEFAULT 0,
    "moodVolatility" INTEGER NOT NULL DEFAULT 0,
    "energyLevel" INTEGER NOT NULL DEFAULT 5,
    "libidoLevel" INTEGER NOT NULL DEFAULT 5,
    "lightSensitivity" "SensorySensitivity" NOT NULL DEFAULT 'NONE',
    "soundSensitivity" "SensorySensitivity" NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenstrualLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenstrualLog_userId_logDate_idx" ON "MenstrualLog"("userId", "logDate");

-- CreateIndex
CREATE INDEX "MenstrualLog_cycleId_idx" ON "MenstrualLog"("cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "MenstrualLog_userId_cycleId_logDate_key" ON "MenstrualLog"("userId", "cycleId", "logDate");

-- CreateIndex
CREATE UNIQUE INDEX "User_caregiverShareToken_key" ON "User"("caregiverShareToken");

-- AddForeignKey
ALTER TABLE "MenstrualLog" ADD CONSTRAINT "MenstrualLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenstrualLog" ADD CONSTRAINT "MenstrualLog_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "MenstrualCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;