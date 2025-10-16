/*
  Warnings:

  - Added the required column `questionId` to the `UserTestQuestionHome` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserTestQuestionHome" ADD COLUMN     "questionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "GodProfile" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "textEmotion" VARCHAR NOT NULL,
    "requirePoint" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "imgUrl" VARCHAR(1000),
    "text_color" VARCHAR(50),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GodProfile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserTestQuestionHome" ADD CONSTRAINT "UserTestQuestionHome_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TestQuestionHome"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GodProfile" ADD CONSTRAINT "GodProfile_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GodProfile" ADD CONSTRAINT "GodProfile_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GodProfile" ADD CONSTRAINT "GodProfile_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
