/*
  Warnings:

  - You are about to drop the column `toUserId` on the `letters` table. All the data in the column will be lost.
  - Added the required column `kyNhanId` to the `letters` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "letters" DROP CONSTRAINT "letters_toUserId_fkey";

-- AlterTable
ALTER TABLE "letters" DROP COLUMN "toUserId",
ADD COLUMN     "kyNhanId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_kyNhanId_fkey" FOREIGN KEY ("kyNhanId") REFERENCES "KyNhan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
