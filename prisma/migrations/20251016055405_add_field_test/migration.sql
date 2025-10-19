-- CreateEnum
CREATE TYPE "TestQuestionHomeTraitType" AS ENUM ('CHOLERIC', 'SANGUINE', 'MELANCHOLIC', 'PHLEGMATIC');

-- AlterTable
ALTER TABLE "TestQuestionHome" ADD COLUMN     "testType" "TestQuestionHomeTraitType";
