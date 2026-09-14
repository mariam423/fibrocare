-- Bring the Postgres chain up to parity with prisma/schema.prisma:
--
-- 1. `Comment` table — the comments feature on verified Doctor Hub
--    articles (src/app/api/pro/posts/[id]/comments). Missed when the
--    feature landed because only prisma/migrations/ was updated, and
--    that tree has since drifted out of replayable shape; this pg tree
--    is the one production applies (db-migrate-pg.mjs via npm run build).
-- 2. `DoctorPost.kind` — article | research | status content kinds for
--    the publishing hub (mirrors 20260912000000_add_doctor_post_kind).
-- 3. `DoctorPost.mediaUrls` — String[] default {} on DoctorPost.
--
-- Every pre-migration row keeps its defaults: existing posts are
-- articles, no comments exist yet on fresh deploys of this chain.

-- AlterTable
ALTER TABLE "DoctorPost" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'article';

-- AlterTable
ALTER TABLE "DoctorPost" ADD COLUMN "mediaUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (feed filtering by kind: /pro/doctor kind tabs)
CREATE INDEX "DoctorPost_kind_idx" ON "DoctorPost"("kind");

-- CreateIndex (comments are listed per post, oldest first)
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");

-- CreateIndex (per-user comment history lookup)
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "DoctorPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
