/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `KyNhan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "godProfileId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "KyNhan_name_key" ON "KyNhan"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_godProfileId_fkey" FOREIGN KEY ("godProfileId") REFERENCES "GodProfile"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
