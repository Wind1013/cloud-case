-- CreateEnum
CREATE TYPE "public"."TemplateState" AS ENUM ('ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "public"."templates" ADD COLUMN     "status" "public"."TemplateState" NOT NULL DEFAULT 'ACTIVE';
