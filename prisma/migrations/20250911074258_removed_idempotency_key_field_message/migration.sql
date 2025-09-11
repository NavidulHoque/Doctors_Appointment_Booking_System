/*
  Warnings:

  - You are about to drop the column `idempotencyKey` on the `Message` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Message_idempotencyKey_key";

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "idempotencyKey";
