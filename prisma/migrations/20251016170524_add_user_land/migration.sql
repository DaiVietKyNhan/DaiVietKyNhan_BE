-- CreateEnum
CREATE TYPE "UserLandStatus" AS ENUM ('UNLOCKED', 'LOCKED', 'PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "KyNhan" ADD COLUMN     "userLandId" INTEGER;

-- CreateTable
CREATE TABLE "UserLand" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "landId" INTEGER NOT NULL,
    "status" "UserLandStatus" NOT NULL DEFAULT 'LOCKED',
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLand_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KyNhan" ADD CONSTRAINT "KyNhan_userLandId_fkey" FOREIGN KEY ("userLandId") REFERENCES "UserLand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLand" ADD CONSTRAINT "UserLand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserLand" ADD CONSTRAINT "UserLand_landId_fkey" FOREIGN KEY ("landId") REFERENCES "Land"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserLand" ADD CONSTRAINT "UserLand_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserLand" ADD CONSTRAINT "UserLand_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserLand" ADD CONSTRAINT "UserLand_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
