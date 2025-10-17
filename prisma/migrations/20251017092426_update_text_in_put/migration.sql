/*
  Warnings:

  - You are about to drop the column `questionDifficulty` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `selectedAnswerId` on the `UserAnswerLog` table. All the data in the column will be lost.
  - You are about to drop the `Answer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `landId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "UserAnswerLog" DROP CONSTRAINT "UserAnswerLog_selectedAnswerId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "questionDifficulty",
DROP COLUMN "status",
ADD COLUMN     "landId" INTEGER NOT NULL,
ADD COLUMN     "point" INTEGER NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "UserAnswerLog" DROP COLUMN "selectedAnswerId";

-- DropTable
DROP TABLE "Answer";

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_landId_fkey" FOREIGN KEY ("landId") REFERENCES "Land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
