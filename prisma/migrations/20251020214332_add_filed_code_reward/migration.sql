/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "code" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "Reward_code_key" ON "Reward"("code");
