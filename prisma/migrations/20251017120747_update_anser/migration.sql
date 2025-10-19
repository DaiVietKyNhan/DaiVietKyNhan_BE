/*
  Warnings:

  - You are about to drop the `ValidTextInputAnswer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ValidTextInputAnswer" DROP CONSTRAINT "ValidTextInputAnswer_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ValidTextInputAnswer" DROP CONSTRAINT "ValidTextInputAnswer_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "ValidTextInputAnswer" DROP CONSTRAINT "ValidTextInputAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "ValidTextInputAnswer" DROP CONSTRAINT "ValidTextInputAnswer_updatedById_fkey";

-- DropTable
DROP TABLE "ValidTextInputAnswer";

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "text" VARCHAR NOT NULL,
    "questionId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
