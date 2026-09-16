-- AlterTable: server-side privacy PIN hash. Nullable — a user without a
-- PIN configured keeps a NULL here, exactly like passwordHash.
ALTER TABLE "User" ADD COLUMN "pinHash" TEXT;

-- AlterTable: failure-only lockout for the PIN. Only WRONG attempts count,
-- so legitimate re-locks (new tab, tab switch) never trip the limit.
ALTER TABLE "User" ADD COLUMN "pinFailedAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "pinLockedUntil" TIMESTAMP(3);