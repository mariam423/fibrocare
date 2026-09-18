-- Fibro-Dietary & Personal Flare Trigger Tracker — additive schema.
--
-- Adds three tables:
--   MealLog    — one eating occasion (date bucket, meal type, eaten time,
--                pre-meal energy, notes, trigger-warning snapshot)
--   MealItem   — foods/ingredients inside a MealLog (plain text for the
--                warning + next-day correlation engines)
--   TriggerFood — the patient's personal flare-trigger list
--
-- The migration is idempotent (CREATE TABLE/index IF NOT EXISTS + guarded
-- foreign keys) so a partially-applied run never blocks redeploy.

-- CreateTable
CREATE TABLE IF NOT EXISTS "MealLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "eatenAt" TIMESTAMP(3) NOT NULL,
    "energyBefore" INTEGER NOT NULL DEFAULT 2,
    "warningsJson" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MealItem" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" TEXT,

    CONSTRAINT "MealItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TriggerFood" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 3,
    "reactionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TriggerFood_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (day-bucket reads: today's / date-scoped meals)
CREATE INDEX IF NOT EXISTS "MealLog_userId_date_idx" ON "MealLog"("userId", "date");

-- CreateIndex (calendar / timeline reads ordered by eaten time)
CREATE INDEX IF NOT EXISTS "MealLog_userId_eatenAt_idx" ON "MealLog"("userId", "eatenAt");

-- CreateIndex (meal detail rows)
CREATE INDEX IF NOT EXISTS "MealItem_mealId_idx" ON "MealItem"("mealId");

-- CreateIndex (next-day correlation scans by food name)
CREATE INDEX IF NOT EXISTS "MealItem_name_idx" ON "MealItem"("name");

-- CreateIndex (per-user unique food name → personal trigger list)
CREATE UNIQUE INDEX IF NOT EXISTS "TriggerFood_userId_name_key" ON "TriggerFood"("userId", "name");

-- CreateIndex (ordered severity reviews)
CREATE INDEX IF NOT EXISTS "TriggerFood_userId_severity_idx" ON "TriggerFood"("userId", "severity");

-- AddForeignKey (each guarded so reruns never collide)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'MealLog_userId_fkey'
  ) THEN
    ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'MealItem_mealId_fkey'
  ) THEN
    ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_mealId_fkey"
      FOREIGN KEY ("mealId") REFERENCES "MealLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TriggerFood_userId_fkey'
  ) THEN
    ALTER TABLE "TriggerFood" ADD CONSTRAINT "TriggerFood_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;