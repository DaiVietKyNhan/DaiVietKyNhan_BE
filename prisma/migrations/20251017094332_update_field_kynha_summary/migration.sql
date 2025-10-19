/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `KyNhanSummary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "KyNhanSummary" DROP COLUMN "imageUrl",
ADD COLUMN     "imgUrl" VARCHAR(1000);
