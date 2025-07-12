/*
  Warnings:

  - Added the required column `startTime` to the `PhotoSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PhotoSession" ADD COLUMN     "startTime" BIGINT NOT NULL;
