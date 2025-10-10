/*
  Warnings:

  - A unique constraint covering the columns `[systemConfigType]` on the table `SystemConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SystemConfigType" AS ENUM ('OPEN_DATE', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "SystemConfig" ADD COLUMN     "systemConfigType" "SystemConfigType" NOT NULL DEFAULT 'OPEN_DATE';

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_systemConfigType_key" ON "SystemConfig"("systemConfigType");
