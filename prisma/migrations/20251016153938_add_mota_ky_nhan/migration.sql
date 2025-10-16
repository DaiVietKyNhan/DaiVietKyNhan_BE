/*
  Warnings:

  - Added the required column `ten` to the `ChiTietKyNhan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChiTietKyNhan" ADD COLUMN     "ten" VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE "KyNhan" ADD COLUMN     "landId" INTEGER;

-- CreateTable
CREATE TABLE "MotaKyNhan" (
    "id" SERIAL NOT NULL,
    "ten" VARCHAR(500) NOT NULL,
    "danhHieu" VARCHAR(500),
    "namSinhNamMat" VARCHAR(100),
    "queQuan" VARCHAR(500),
    "xuatThan" VARCHAR(500),
    "khoiNghia" VARCHAR(500),
    "nguoiDongHanh" VARCHAR(500),
    "phuQuan" VARCHAR(500),
    "chienCong" VARCHAR(500),
    "dinhCao" VARCHAR(500),
    "ketCuc" VARCHAR(500),
    "imgUrl" VARCHAR(1000),
    "kyNhanId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MotaKyNhan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Land" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" VARCHAR,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Land_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MotaKyNhan_kyNhanId_key" ON "MotaKyNhan"("kyNhanId");

-- CreateIndex
CREATE INDEX "MotaKyNhan_deletedAt_idx" ON "MotaKyNhan"("deletedAt");

-- AddForeignKey
ALTER TABLE "KyNhan" ADD CONSTRAINT "KyNhan_landId_fkey" FOREIGN KEY ("landId") REFERENCES "Land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MotaKyNhan" ADD CONSTRAINT "MotaKyNhan_kyNhanId_fkey" FOREIGN KEY ("kyNhanId") REFERENCES "KyNhan"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MotaKyNhan" ADD CONSTRAINT "MotaKyNhan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MotaKyNhan" ADD CONSTRAINT "MotaKyNhan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MotaKyNhan" ADD CONSTRAINT "MotaKyNhan_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Land" ADD CONSTRAINT "Land_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Land" ADD CONSTRAINT "Land_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Land" ADD CONSTRAINT "Land_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
