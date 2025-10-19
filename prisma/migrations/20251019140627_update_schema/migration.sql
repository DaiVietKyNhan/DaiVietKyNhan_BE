/*
  Warnings:

  - You are about to drop the column `quanHe` on the `ChiTietKyNhan` table. All the data in the column will be lost.
  - You are about to drop the column `ten` on the `ChiTietKyNhan` table. All the data in the column will be lost.
  - You are about to drop the column `tinhCach` on the `ChiTietKyNhan` table. All the data in the column will be lost.
  - You are about to drop the column `trichDoan` on the `ChiTietKyNhan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChiTietKyNhan" DROP COLUMN "quanHe",
DROP COLUMN "ten",
DROP COLUMN "tinhCach",
DROP COLUMN "trichDoan",
ADD COLUMN     "thamKhao" TEXT;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" INTEGER,
ADD COLUMN     "fileName" VARCHAR(500),
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" VARCHAR(100),
ADD COLUMN     "thuTu" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedById" INTEGER;

-- CreateTable
CREATE TABLE "ChiTietKyNhanBoiCanhLichSuVaSuuThan" (
    "id" SERIAL NOT NULL,
    "chiTietKyNhanId" INTEGER NOT NULL,
    "tieuDe" VARCHAR(500) NOT NULL,
    "noiDung" TEXT NOT NULL,
    "nguon" TEXT,
    "thuTu" INTEGER NOT NULL DEFAULT 0,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChiTietKyNhanBoiCanhLichSuVaSuuThan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiTietKyNhanSuSachVietGi" (
    "id" SERIAL NOT NULL,
    "chiTietKyNhanId" INTEGER NOT NULL,
    "tieuDe" VARCHAR(500) NOT NULL,
    "doanVan" TEXT NOT NULL,
    "tacGia" VARCHAR(500),
    "nguonSach" TEXT,
    "thuTu" INTEGER NOT NULL DEFAULT 0,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChiTietKyNhanSuSachVietGi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiTietKyNhanGiaiThoaiDanGian" (
    "id" SERIAL NOT NULL,
    "chiTietKyNhanId" INTEGER NOT NULL,
    "tieuDe" VARCHAR(500) NOT NULL,
    "noiDung" TEXT NOT NULL,
    "nguon" TEXT,
    "thuTu" INTEGER NOT NULL DEFAULT 0,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChiTietKyNhanGiaiThoaiDanGian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChiTietKyNhanBoiCanhLichSuVaSuuThan_deletedAt_idx" ON "ChiTietKyNhanBoiCanhLichSuVaSuuThan"("deletedAt");

-- CreateIndex
CREATE INDEX "ChiTietKyNhanBoiCanhLichSuVaSuuThan_chiTietKyNhanId_idx" ON "ChiTietKyNhanBoiCanhLichSuVaSuuThan"("chiTietKyNhanId");

-- CreateIndex
CREATE INDEX "ChiTietKyNhanSuSachVietGi_deletedAt_idx" ON "ChiTietKyNhanSuSachVietGi"("deletedAt");

-- CreateIndex
CREATE INDEX "ChiTietKyNhanSuSachVietGi_chiTietKyNhanId_idx" ON "ChiTietKyNhanSuSachVietGi"("chiTietKyNhanId");

-- CreateIndex
CREATE INDEX "ChiTietKyNhanGiaiThoaiDanGian_deletedAt_idx" ON "ChiTietKyNhanGiaiThoaiDanGian"("deletedAt");

-- CreateIndex
CREATE INDEX "ChiTietKyNhanGiaiThoaiDanGian_chiTietKyNhanId_idx" ON "ChiTietKyNhanGiaiThoaiDanGian"("chiTietKyNhanId");

-- CreateIndex
CREATE INDEX "Media_deletedAt_idx" ON "Media"("deletedAt");

-- CreateIndex
CREATE INDEX "Media_chiTietId_idx" ON "Media"("chiTietId");

-- AddForeignKey
ALTER TABLE "ChiTietKyNhanBoiCanhLichSuVaSuuThan" ADD CONSTRAINT "ChiTietKyNhanBoiCanhLichSuVaSuuThan_chiTietKyNhanId_fkey" FOREIGN KEY ("chiTietKyNhanId") REFERENCES "ChiTietKyNhan"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChiTietKyNhanBoiCanhLichSuVaSuuThan" ADD CONSTRAINT "ChiTietKyNhanBoiCanhLichSuVaSuuThan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChiTietKyNhanBoiCanhLichSuVaSuuThan" ADD CONSTRAINT "ChiTietKyNhanBoiCanhLichSuVaSuuThan_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChiTietKyNhanBoiCanhLichSuVaSuuThan" ADD CONSTRAINT "ChiTietKyNhanBoiCanhLichSuVaSuuThan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChiTietKyNhanSuSachVietGi" ADD CONSTRAINT "ChiTietKyNhanSuSachVietGi_chiTietKyNhanId_fkey" FOREIGN KEY ("chiTietKyNhanId") REFERENCES "ChiTietKyNhan"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChiTietKyNhanSuSachVietGi" ADD CONSTRAINT "ChiTietKyNhanSuSachVietGi_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChiTietKyNhanSuSachVietGi" ADD CONSTRAINT "ChiTietKyNhanSuSachVietGi_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChiTietKyNhanSuSachVietGi" ADD CONSTRAINT "ChiTietKyNhanSuSachVietGi_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChiTietKyNhanGiaiThoaiDanGian" ADD CONSTRAINT "ChiTietKyNhanGiaiThoaiDanGian_chiTietKyNhanId_fkey" FOREIGN KEY ("chiTietKyNhanId") REFERENCES "ChiTietKyNhan"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChiTietKyNhanGiaiThoaiDanGian" ADD CONSTRAINT "ChiTietKyNhanGiaiThoaiDanGian_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChiTietKyNhanGiaiThoaiDanGian" ADD CONSTRAINT "ChiTietKyNhanGiaiThoaiDanGian_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ChiTietKyNhanGiaiThoaiDanGian" ADD CONSTRAINT "ChiTietKyNhanGiaiThoaiDanGian_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
