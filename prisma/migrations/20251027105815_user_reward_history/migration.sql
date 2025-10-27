-- CreateTable
CREATE TABLE "UserRewardHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rewardId" INTEGER NOT NULL,
    "status" "UserRewardStatus" NOT NULL,
    "exchangedAt" TIMESTAMP(3),
    "code" VARCHAR(100),
    "valuePaid" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRewardHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRewardHistory_userId_idx" ON "UserRewardHistory"("userId");

-- CreateIndex
CREATE INDEX "UserRewardHistory_rewardId_idx" ON "UserRewardHistory"("rewardId");

-- CreateIndex
CREATE INDEX "UserRewardHistory_status_idx" ON "UserRewardHistory"("status");

-- CreateIndex
CREATE INDEX "UserRewardHistory_createdAt_idx" ON "UserRewardHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "UserRewardHistory" ADD CONSTRAINT "UserRewardHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserRewardHistory" ADD CONSTRAINT "UserRewardHistory_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserRewardHistory" ADD CONSTRAINT "UserRewardHistory_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserRewardHistory" ADD CONSTRAINT "UserRewardHistory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserRewardHistory" ADD CONSTRAINT "UserRewardHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
