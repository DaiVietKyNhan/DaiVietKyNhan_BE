/*
  Warnings:

  - The `text` column on the `UserAnswerLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "answerOptionType" AS ENUM ('ONE', 'TWO');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "answerOptionType" "answerOptionType" NOT NULL DEFAULT 'ONE';

-- AlterTable
ALTER TABLE "UserAnswerLog" ADD COLUMN     "amountAttempt" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "text",
ADD COLUMN     "text" TEXT[];
