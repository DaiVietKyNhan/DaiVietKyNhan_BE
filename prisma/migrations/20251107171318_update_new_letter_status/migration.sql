/*
  Warnings:

  - You are about to drop the column `isRead` on the `letters` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LetterStatus" AS ENUM ('PENDING', 'REMOVE', 'PUBLIC');

-- AlterTable
ALTER TABLE "letters" DROP COLUMN "isRead",
ADD COLUMN     "status" "LetterStatus" NOT NULL DEFAULT 'PENDING';
