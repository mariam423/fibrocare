-- Add `language` column to DoctorPost to support bilingual AI articles.
--
-- The AI generator now writes two rows per curated topic: one in
-- `"en"` and one in `"ar"`. The library dedupes by `(slug, language)`
-- so the two rows coexist on the same topic page; a user switching
-- from the EN locale to the AR locale sees the same topic rendered
-- in their language instead of an empty feed.
--
-- Pre-migration rows default to `"en"` because every AI article
-- written before this migration was English-only. Manual posts
-- (those with `source = "manual"`) keep `"en"` until the doctor
-- edits them; the manual composer is out of scope for this change.

-- AlterTable
ALTER TABLE "DoctorPost" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en';

-- CreateIndex
CREATE INDEX "DoctorPost_language_idx" ON "DoctorPost"("language");
