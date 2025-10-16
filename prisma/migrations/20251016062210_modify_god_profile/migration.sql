/*
  Warnings:

  - You are about to drop the column `requirePoint` on the `GodProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GodProfile" DROP COLUMN "requirePoint",
ADD COLUMN     "traitType" "TestQuestionHomeTraitType";
