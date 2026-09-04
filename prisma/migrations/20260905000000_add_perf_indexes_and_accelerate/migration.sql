-- Performance indexes for the multi-region / multi-tenant upgrade.
-- All statements are additive; none drop data. Idempotent guards
-- (DROP IF EXISTS) are not portable to SQLite, so re-running the
-- migration will fail; that is the standard Prisma contract.

-- ConsultationMessage: drop the single-column `consultationId` index
-- in favor of a composite that supports the same lookup AND the
-- `ORDER BY createdAt` pagination path with a single B-tree seek.
DROP INDEX "ConsultationMessage_consultationId_idx";
CREATE INDEX "ConsultationMessage_consultationId_createdAt_idx" ON "ConsultationMessage"("consultationId" ASC, "createdAt" ASC);

-- ArticleReaction: per-user reaction history view.
CREATE INDEX "ArticleReaction_userId_idx" ON "ArticleReaction"("userId" ASC);

-- User: cohort / admin queries.
CREATE INDEX "User_role_idx" ON "User"("role" ASC);
CREATE INDEX "User_signupRole_idx" ON "User"("signupRole" ASC);
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt" ASC);
