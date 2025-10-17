/*
  Warnings:

  - The values [MULTIPLE_CHOICE] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('TEXT_INPUT');
ALTER TABLE "Question" ALTER COLUMN "questionType" DROP DEFAULT;
ALTER TABLE "Question" ALTER COLUMN "questionType" TYPE "QuestionType_new" USING ("questionType"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";
ALTER TABLE "Question" ALTER COLUMN "questionType" SET DEFAULT 'TEXT_INPUT';
COMMIT;
