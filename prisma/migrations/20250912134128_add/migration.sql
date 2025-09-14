-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('LAWYER', 'STAFF', 'CLIENT');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'CLIENT';
