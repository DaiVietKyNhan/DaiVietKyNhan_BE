/*
  Warnings:

  - You are about to drop the column `kynhanSummaryId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `inputTextAnswerId` on the `UserAnswerLog` table. All the data in the column will be lost.
  - Added the required column `userId` to the `UserAnswerLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TestQuestionHomeType" AS ENUM ('NORMAL', 'CONVERT');

-- CreateEnum
CREATE TYPE "AnswerScale" AS ENUM ('STRONGLY_DISAGREE', 'DISAGREE', 'NEUTRAL', 'AGREE', 'STRONGLY_AGREE');

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_kynhanSummaryId_fkey";

-- DropForeignKey
ALTER TABLE "UserAnswerLog" DROP CONSTRAINT "UserAnswerLog_inputTextAnswerId_fkey";

-- AlterTable
ALTER TABLE "KyNhanSummary" ADD COLUMN     "questionId" INTEGER;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "kynhanSummaryId",
ALTER COLUMN "questionType" SET DEFAULT 'TEXT_INPUT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pointTestHome" INTEGER;

-- AlterTable
ALTER TABLE "UserAnswerLog" DROP COLUMN "inputTextAnswerId",
ADD COLUMN     "inputTextAnswer" TEXT,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "TestQuestionHome" (
    "id" SERIAL NOT NULL,
    "text" VARCHAR NOT NULL,
    "testQuestionHomeType" "TestQuestionHomeType" NOT NULL DEFAULT 'NORMAL',
    "answer" "AnswerScale" NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestQuestionHome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTestQuestionHome" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "answer" "AnswerScale" NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTestQuestionHome_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KyNhanSummary" ADD CONSTRAINT "KyNhanSummary_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestQuestionHome" ADD CONSTRAINT "TestQuestionHome_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TestQuestionHome" ADD CONSTRAINT "TestQuestionHome_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TestQuestionHome" ADD CONSTRAINT "TestQuestionHome_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTestQuestionHome" ADD CONSTRAINT "UserTestQuestionHome_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTestQuestionHome" ADD CONSTRAINT "UserTestQuestionHome_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTestQuestionHome" ADD CONSTRAINT "UserTestQuestionHome_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserTestQuestionHome" ADD CONSTRAINT "UserTestQuestionHome_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserAnswerLog" ADD CONSTRAINT "UserAnswerLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
