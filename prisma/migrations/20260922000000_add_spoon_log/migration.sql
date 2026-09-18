-- FibroCare Spoon Theory — additive schema.
--
-- One table, SpoonLog: a daily energy check-in (1–10 subjective morning
-- capacity) with a live balance that drifts as the day is spent/rested.
-- One row per user per calendar day; the morning check-in upserts.
-- Purely additive and idempotent (guarded CREATE/INDEX/constraint) so a
-- partially-applied run never blocks redeploy.

-- CreateTable
CREATE TABLE IF NOT EXISTS "SpoonLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logDate" TEXT NOT NULL,
    "startSpoons" INTEGER NOT NULL,
    "currentSpoons" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpoonLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (today's check-in lookups + history reads)
CREATE INDEX IF NOT EXISTS "SpoonLog_userId_logDate_idx" ON "SpoonLog"("userId", "logDate");

-- AddForeignKey (guarded so reruns never collide)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SpoonLog_userId_fkey'
  ) THEN
    ALTER TABLE "SpoonLog" ADD CONSTRAINT "SpoonLog_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
