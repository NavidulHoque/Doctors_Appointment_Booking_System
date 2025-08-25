/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "isCompleted",
ADD COLUMN     "cancellationReason" TEXT NOT NULL DEFAULT '';
