/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotencyKey` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "idempotencyKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Message_idempotencyKey_key" ON "Message"("idempotencyKey");
