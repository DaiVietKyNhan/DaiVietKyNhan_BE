/*
  Warnings:

  - Made the column `newPoint` on table `ChangePointUserLog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `newCoin` on table `ChangePointUserLog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `newHeart` on table `ChangePointUserLog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChangePointUserLog" ALTER COLUMN "newPoint" SET NOT NULL,
ALTER COLUMN "newCoin" SET NOT NULL,
ALTER COLUMN "newHeart" SET NOT NULL;
