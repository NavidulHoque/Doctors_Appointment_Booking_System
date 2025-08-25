/*
  Warnings:

  - You are about to drop the column `endTime` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "availableTimes" TEXT[],
ADD COLUMN     "revenue" INTEGER NOT NULL DEFAULT 0;
