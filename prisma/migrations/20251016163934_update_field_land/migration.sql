/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Land` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Land" DROP COLUMN "imageUrl",
ADD COLUMN     "imgUrl" VARCHAR;
