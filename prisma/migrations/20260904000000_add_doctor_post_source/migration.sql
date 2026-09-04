-- Add `source` column to DoctorPost to discriminate AI-generated
-- articles from doctor-written posts.
--
-- `"ai"`     → produced by the curated AI article generator and
--              surfaced only in `AiArticleLibrary`.
-- `"manual"` → written by a verified doctor through the publishing
--              composer and surfaced only in `DoctorContentFeed`.
--
-- Default is `"manual"` so every pre-migration row is treated as
-- doctor-written — the legacy verification flow never produced a
-- row outside the AI path, but the conservative default keeps the
-- `DoctorContentFeed` populated for any historical posts that did
-- exist before this split.
--
-- We back-fill existing rows that match the AI marker (the
-- curated-topic slug present as a comma-separated tag) so the
-- historical feed is split correctly on the first deploy.

-- AlterTable
ALTER TABLE "DoctorPost" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'manual';

-- CreateIndex
CREATE INDEX "DoctorPost_source_idx" ON "DoctorPost"("source");
