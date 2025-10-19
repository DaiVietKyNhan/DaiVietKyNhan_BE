-- AlterTable
ALTER TABLE "ChangePointUserLog" ADD COLUMN     "newCoin" INTEGER,
ADD COLUMN     "newHeart" INTEGER,
ALTER COLUMN "newPoint" DROP NOT NULL;
