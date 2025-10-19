/*
  Warnings:

  - The values [UNLOCKED] on the enum `UserLandStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserLandStatus_new" AS ENUM ('LOCKED_FORCED', 'LOCKED', 'PENDING', 'COMPLETED');
ALTER TABLE "UserLand" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "UserLand" ALTER COLUMN "status" TYPE "UserLandStatus_new" USING ("status"::text::"UserLandStatus_new");
ALTER TYPE "UserLandStatus" RENAME TO "UserLandStatus_old";
ALTER TYPE "UserLandStatus_new" RENAME TO "UserLandStatus";
DROP TYPE "UserLandStatus_old";
ALTER TABLE "UserLand" ALTER COLUMN "status" SET DEFAULT 'LOCKED';
COMMIT;
