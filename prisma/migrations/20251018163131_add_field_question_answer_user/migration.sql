/*
  Warnings:

  - The `text` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `text` column on the `UserAnswerLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "QuestionOptionType" AS ENUM ('ONE', 'TWO');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "questionOptionType" "QuestionOptionType" NOT NULL DEFAULT 'ONE',
DROP COLUMN "text",
ADD COLUMN     "text" TEXT[];

-- AlterTable
ALTER TABLE "UserAnswerLog" DROP COLUMN "text",
ADD COLUMN     "text" TEXT[];
