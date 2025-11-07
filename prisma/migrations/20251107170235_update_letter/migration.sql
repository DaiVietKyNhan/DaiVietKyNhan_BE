/*
  Warnings:

  - You are about to drop the column `kyNhanId` on the `letters` table. All the data in the column will be lost.
  - Added the required column `from` to the `letters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `letters` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "letters" DROP CONSTRAINT "letters_kyNhanId_fkey";

-- AlterTable
ALTER TABLE "letters" DROP COLUMN "kyNhanId",
ADD COLUMN     "from" VARCHAR(500) NOT NULL,
ADD COLUMN     "to" VARCHAR(500) NOT NULL;
