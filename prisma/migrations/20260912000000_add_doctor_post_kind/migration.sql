-- Add `kind` column to DoctorPost to support the Direct Doctor Publishing
-- Hub: verified doctors can publish three content kinds —
--
--   "article"  — structured patient-education articles (the previous
--                behavior; every pre-migration row is an article)
--   "research" — research summaries / paper digests with citations
--   "status"   — short clinical status updates / personal posts
--
-- Manual + AI-generated rows alike default to "article" so existing
-- feeds, the AI library split, and dedupe logic are untouched.

-- AlterTable
ALTER TABLE "DoctorPost" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'article';

-- CreateIndex (feed filtering by kind: /pro/doctor kind tabs)
CREATE INDEX "DoctorPost_kind_idx" ON "DoctorPost"("kind");
