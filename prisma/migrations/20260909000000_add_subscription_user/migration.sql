-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");