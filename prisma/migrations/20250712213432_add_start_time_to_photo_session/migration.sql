-- AlterTable
ALTER TABLE "PhotoSession" ADD COLUMN     "endTime" BIGINT,
ALTER COLUMN "startTime" DROP NOT NULL;
