/*
  Warnings:

  - You are about to drop the column `userLandId` on the `KyNhan` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "KyNhan" DROP CONSTRAINT "KyNhan_userLandId_fkey";

-- AlterTable
ALTER TABLE "KyNhan" DROP COLUMN "userLandId";
