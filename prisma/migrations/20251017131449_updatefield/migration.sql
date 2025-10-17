-- DropForeignKey
ALTER TABLE "KyNhanSummary" DROP CONSTRAINT "KyNhanSummary_questionId_fkey";

-- AddForeignKey
ALTER TABLE "KyNhanSummary" ADD CONSTRAINT "KyNhanSummary_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
