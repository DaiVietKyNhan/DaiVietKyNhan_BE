/*
  Warnings:

  - A unique constraint covering the columns `[landId]` on the table `LandBarge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LandBarge_landId_key" ON "LandBarge"("landId");
