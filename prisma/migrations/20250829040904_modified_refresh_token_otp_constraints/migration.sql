/*
  Warnings:

  - The `refreshToken` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "public"."User_otp_key";

-- DropIndex
DROP INDEX "public"."User_refreshToken_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "refreshToken",
ADD COLUMN     "refreshToken" TEXT[];
