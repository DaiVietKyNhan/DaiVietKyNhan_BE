-- AlterTable
ALTER TABLE "ChangePointUserLog" ADD COLUMN     "isIncreaseCoin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isIncreaseHeart" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isIncreasePoint" BOOLEAN NOT NULL DEFAULT false;
