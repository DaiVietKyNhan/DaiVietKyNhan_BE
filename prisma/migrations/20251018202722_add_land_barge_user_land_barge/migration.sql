-- CreateTable
CREATE TABLE "LandBarge" (
    "id" SERIAL NOT NULL,
    "landId" INTEGER NOT NULL,
    "imgUrl" VARCHAR(1000) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandBarge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLandBarge" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "landBargeId" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLandBarge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LandBarge" ADD CONSTRAINT "LandBarge_landId_fkey" FOREIGN KEY ("landId") REFERENCES "Land"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LandBarge" ADD CONSTRAINT "LandBarge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LandBarge" ADD CONSTRAINT "LandBarge_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LandBarge" ADD CONSTRAINT "LandBarge_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserLandBarge" ADD CONSTRAINT "UserLandBarge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserLandBarge" ADD CONSTRAINT "UserLandBarge_landBargeId_fkey" FOREIGN KEY ("landBargeId") REFERENCES "LandBarge"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserLandBarge" ADD CONSTRAINT "UserLandBarge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserLandBarge" ADD CONSTRAINT "UserLandBarge_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UserLandBarge" ADD CONSTRAINT "UserLandBarge_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
