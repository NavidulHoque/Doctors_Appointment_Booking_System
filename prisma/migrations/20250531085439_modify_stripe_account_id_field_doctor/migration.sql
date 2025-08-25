/*
  Warnings:

  - A unique constraint covering the columns `[stripeAccountId]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Doctor_stripeAccountId_key" ON "Doctor"("stripeAccountId");
