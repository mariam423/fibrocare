-- CHECK constraints for data integrity.
-- Existing rows already conform to these sets (verified via code analysis),
-- so the constraints are added without NOT VALID to get immediate enforcement.

-- User.role — stored values: free_user, pro_user, doctor (guest is computed only)
ALTER TABLE "User"
  ADD CONSTRAINT "user_role_check" CHECK ("role" IN ('free_user', 'pro_user', 'doctor'));

-- User.signupRole — PATIENT or DOCTOR
ALTER TABLE "User"
  ADD CONSTRAINT "user_signup_role_check" CHECK ("signupRole" IN ('PATIENT', 'DOCTOR'));

-- DoctorPost.verifiedStatus
ALTER TABLE "DoctorPost"
  ADD CONSTRAINT "doctorpost_verified_status_check" CHECK ("verifiedStatus" IN ('pending', 'verified', 'rejected'));

-- DoctorPost.source
ALTER TABLE "DoctorPost"
  ADD CONSTRAINT "doctorpost_source_check" CHECK ("source" IN ('ai', 'manual'));

-- DoctorPost.language
ALTER TABLE "DoctorPost"
  ADD CONSTRAINT "doctorpost_language_check" CHECK ("language" IN ('en', 'ar'));

-- ArticleReaction.kind
ALTER TABLE "ArticleReaction"
  ADD CONSTRAINT "articlereaction_kind_check" CHECK ("kind" IN ('like', 'helpful'));

-- Consultation.status
ALTER TABLE "Consultation"
  ADD CONSTRAINT "consultation_status_check" CHECK ("status" IN ('open', 'closed'));

-- Subscription.status
ALTER TABLE "Subscription"
  ADD CONSTRAINT "subscription_status_check" CHECK ("status" IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete'));

-- Subscription.plan
ALTER TABLE "Subscription"
  ADD CONSTRAINT "subscription_plan_check" CHECK ("plan" IN ('free', 'pro'));

-- Subscription.provider
ALTER TABLE "Subscription"
  ADD CONSTRAINT "subscription_provider_check" CHECK ("provider" IN ('stripe', 'lemon-squeezy', 'local'));

-- PainLog.painLevel — 0 to 10 scale
ALTER TABLE "PainLog"
  ADD CONSTRAINT "painlog_pain_level_check" CHECK ("painLevel" >= 0 AND "painLevel" <= 10);
