-- CreateEnum
CREATE TYPE "CyclePhase" AS ENUM ('MENSTRUAL', 'FOLLICULAR', 'OVULATORY', 'LUTEAL');

-- CreateEnum
CREATE TYPE "SymptomCategory" AS ENUM ('PHYSICAL', 'COGNITIVE', 'MOOD');

-- CreateEnum
CREATE TYPE "PainArea" AS ENUM ('PELVIC', 'LOWER_BACK', 'WIDESPREAD', 'JOINTS', 'OTHER');

-- AlterTable
ALTER TABLE "SymptomLog" ADD COLUMN     "area" "PainArea",
ADD COLUMN     "category" "SymptomCategory" NOT NULL DEFAULT 'PHYSICAL',
ADD COLUMN     "severity" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "MenstrualCycle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "phase" "CyclePhase" NOT NULL,
    "overallSeverity" INTEGER NOT NULL DEFAULT 5,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenstrualCycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenstrualCycle_userId_startDate_idx" ON "MenstrualCycle"("userId", "startDate");

-- AddForeignKey
ALTER TABLE "MenstrualCycle" ADD CONSTRAINT "MenstrualCycle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
