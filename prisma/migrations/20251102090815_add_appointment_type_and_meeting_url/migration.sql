-- CreateEnum
CREATE TYPE "public"."AppointmentType" AS ENUM ('ONLINE', 'FACE_TO_FACE');

-- AlterTable
ALTER TABLE "public"."appointments" ADD COLUMN     "meetingUrl" TEXT,
ADD COLUMN     "type" "public"."AppointmentType" NOT NULL DEFAULT 'FACE_TO_FACE';
