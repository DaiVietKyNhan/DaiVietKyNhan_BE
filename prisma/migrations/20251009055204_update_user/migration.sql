/*
  Warnings:

  - You are about to drop the `VerificationCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender";

-- DropTable
DROP TABLE "VerificationCode";

-- CreateTable
CREATE TABLE "KyNhan" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "thoiKy" VARCHAR(500) NOT NULL,
    "chienCong" TEXT NOT NULL,
    "imgUrl" VARCHAR(1000),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KyNhan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiTietKyNhan" (
    "id" SERIAL NOT NULL,
    "kyNhanId" INTEGER NOT NULL,
    "tinhCach" TEXT NOT NULL,
    "quanHe" TEXT,
    "trichDoan" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChiTietKyNhan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" SERIAL NOT NULL,
    "launchDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "chiTietId" INTEGER NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KyNhan_deletedAt_idx" ON "KyNhan"("deletedAt");

-- CreateIndex
CREATE INDEX "ChiTietKyNhan_deletedAt_idx" ON "ChiTietKyNhan"("deletedAt");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ChiTietKyNhan" ADD CONSTRAINT "ChiTietKyNhan_kyNhanId_fkey" FOREIGN KEY ("kyNhanId") REFERENCES "KyNhan"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_chiTietId_fkey" FOREIGN KEY ("chiTietId") REFERENCES "ChiTietKyNhan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
