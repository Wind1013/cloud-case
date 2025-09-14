-- CreateEnum
CREATE TYPE "public"."CaseStatus" AS ENUM ('ACTIVE', 'CLOSED', 'PENDING', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."cases" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."CaseStatus" NOT NULL DEFAULT 'PENDING',
    "lawyerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cases" ADD CONSTRAINT "cases_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
