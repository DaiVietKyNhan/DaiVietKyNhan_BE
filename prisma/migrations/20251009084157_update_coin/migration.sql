/*
  Warnings:

  - You are about to drop the column `points` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `basePoints` on the `AttendanceConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "points",
ADD COLUMN     "bonusCoin" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "AttendanceConfig" DROP COLUMN "basePoints",
ADD COLUMN     "baseCoin" INTEGER NOT NULL DEFAULT 0;
