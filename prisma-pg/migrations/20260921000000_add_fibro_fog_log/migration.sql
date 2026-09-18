-- FibroCare Fog Shield — additive schema.
--
-- Adds a single table, FibroFogLog, for logging fibro-fog / cognitive
-- fatigue episodes in real-life daily scenarios (not just studying):
-- self-reported intensity (1–10), situational triggers (TEXT[]), an
-- optional brain-dump note (encrypted at rest by the app layer before
-- it ever reaches this column), the coping tool used, and the timestamp.
--
-- The table mirrors the canonical Postgres schema. It is purely additive:
-- existing rows and every other feature are untouched.
--
-- The migration is idempotent (guarded CREATE/INDEX/constraint) so a
-- partially-applied run never blocks redeploy.

-- CreateTable
CREATE TABLE IF NOT EXISTS "FibroFogLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL DEFAULT 5,
    "triggers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "brainDumpText" TEXT,
    "copingToolUsed" TEXT NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FibroFogLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (history reads: "what did my fog look like this week?")
CREATE INDEX IF NOT EXISTS "FibroFogLog_userId_createdAt_idx" ON "FibroFogLog"("userId", "createdAt");

-- AddForeignKey (guarded so reruns never collide)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FibroFogLog_userId_fkey'
  ) THEN
    ALTER TABLE "FibroFogLog" ADD CONSTRAINT "FibroFogLog_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;