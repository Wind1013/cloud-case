/*
  Warnings:

  - The values [ACTIVE,CLOSED,PENDING,ARCHIVED] on the enum `CaseStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."CaseType" AS ENUM ('ADMINISTRATIVE', 'CIVIL', 'CRIMINAL');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."CaseStatus_new" AS ENUM ('ARRAIGNMENT', 'PRETRIAL', 'TRIAL', 'PROMULGATION', 'REMEDIES', 'PRELIMINARY_CONFERENCE', 'DECISION');
ALTER TABLE "public"."cases" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."cases" ALTER COLUMN "status" TYPE "public"."CaseStatus_new" USING ("status"::text::"public"."CaseStatus_new");
ALTER TYPE "public"."CaseStatus" RENAME TO "CaseStatus_old";
ALTER TYPE "public"."CaseStatus_new" RENAME TO "CaseStatus";
DROP TYPE "public"."CaseStatus_old";
ALTER TABLE "public"."cases" ALTER COLUMN "status" SET DEFAULT 'PRELIMINARY_CONFERENCE';
COMMIT;

-- AlterTable
ALTER TABLE "public"."cases" ADD COLUMN     "type" "public"."CaseType" NOT NULL DEFAULT 'CIVIL',
ALTER COLUMN "status" SET DEFAULT 'PRELIMINARY_CONFERENCE';
