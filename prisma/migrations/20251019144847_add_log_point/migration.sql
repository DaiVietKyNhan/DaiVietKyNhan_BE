-- CreateTable
CREATE TABLE "ChangePointUserLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" VARCHAR NOT NULL,
    "newPoint" INTEGER NOT NULL,
    "createdById" INTEGER,
    "deletedById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "ChangePointUserLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChangePointUserLog" ADD CONSTRAINT "ChangePointUserLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChangePointUserLog" ADD CONSTRAINT "ChangePointUserLog_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChangePointUserLog" ADD CONSTRAINT "ChangePointUserLog_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChangePointUserLog" ADD CONSTRAINT "ChangePointUserLog_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
