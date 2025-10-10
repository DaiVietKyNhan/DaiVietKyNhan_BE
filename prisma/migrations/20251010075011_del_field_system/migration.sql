/*
  Warnings:

  - You are about to drop the column `systemConfigType` on the `SystemConfig` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "SystemConfig_systemConfigType_key";

-- AlterTable
ALTER TABLE "SystemConfig" DROP COLUMN "systemConfigType";

-- DropEnum
DROP TYPE "SystemConfigType";
