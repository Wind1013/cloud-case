/*
  Warnings:

  - You are about to drop the column `lawyerId` on the `cases` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."cases" DROP CONSTRAINT "cases_lawyerId_fkey";

-- AlterTable
ALTER TABLE "public"."cases" DROP COLUMN "lawyerId";
