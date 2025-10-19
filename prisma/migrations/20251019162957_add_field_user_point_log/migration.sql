/*
  Warnings:

  - You are about to drop the column `isIncreaseCoin` on the `ChangePointUserLog` table. All the data in the column will be lost.
  - You are about to drop the column `isIncreaseHeart` on the `ChangePointUserLog` table. All the data in the column will be lost.
  - You are about to drop the column `isIncreasePoint` on the `ChangePointUserLog` table. All the data in the column will be lost.
  - Added the required column `snapshotCoin` to the `ChangePointUserLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snapshotHeart` to the `ChangePointUserLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snapshotPoint` to the `ChangePointUserLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChangePointUserLog" DROP COLUMN "isIncreaseCoin",
DROP COLUMN "isIncreaseHeart",
DROP COLUMN "isIncreasePoint",
ADD COLUMN     "snapshotCoin" INTEGER NOT NULL,
ADD COLUMN     "snapshotHeart" INTEGER NOT NULL,
ADD COLUMN     "snapshotPoint" INTEGER NOT NULL;
