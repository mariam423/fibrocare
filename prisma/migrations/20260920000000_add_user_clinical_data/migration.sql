-- FibroCare Clinical Centre — additive schema.
--
-- Adds ONE nullable column on User holding the latest ACR 2010/2016
-- self-assessment snapshot (JSON, see `acrProfileSnapshot` in
-- src/lib/clinical/acr.ts) so a patient can share their criteria
-- evaluation with a clinician. Purely additive: existing rows get NULL,
-- and every other feature is untouched.
--
-- The migration is idempotent (guarded ALTER TABLE) so a partially
-- applied run never blocks redeploy.

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clinicalDataJson" TEXT;