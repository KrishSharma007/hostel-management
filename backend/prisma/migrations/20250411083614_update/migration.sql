/*
  Warnings:

  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dutyType` to the `AttendantDuty` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendantDutyType" AS ENUM ('CLEANING', 'ROOM_MANAGEMENT', 'BASIC_ASSISTANCE', 'SECURITY');

-- DropForeignKey
ALTER TABLE "Attendant" DROP CONSTRAINT "Attendant_PersonID_fkey";

-- DropForeignKey
ALTER TABLE "AttendantDuty" DROP CONSTRAINT "AttendantDuty_AttendantID_fkey";

-- DropForeignKey
ALTER TABLE "AttendantDuty" DROP CONSTRAINT "AttendantDuty_HostelID_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_HostelID_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_PersonID_fkey";

-- DropForeignKey
ALTER TABLE "HostelAddress" DROP CONSTRAINT "HostelAddress_hostelId_fkey";

-- DropForeignKey
ALTER TABLE "HostelWardenAssignment" DROP CONSTRAINT "HostelWardenAssignment_HostelID_fkey";

-- DropForeignKey
ALTER TABLE "HostelWardenAssignment" DROP CONSTRAINT "HostelWardenAssignment_WardenID_fkey";

-- DropForeignKey
ALTER TABLE "MessBill" DROP CONSTRAINT "MessBill_StudentID_fkey";

-- DropForeignKey
ALTER TABLE "PersonalAddress" DROP CONSTRAINT "PersonalAddress_personId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_hostelId_fkey";

-- DropForeignKey
ALTER TABLE "RoomAllocation" DROP CONSTRAINT "RoomAllocation_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomAllocation" DROP CONSTRAINT "RoomAllocation_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_PersonID_fkey";

-- DropForeignKey
ALTER TABLE "Warden" DROP CONSTRAINT "Warden_PersonID_fkey";

-- AlterTable
ALTER TABLE "AttendantDuty" ADD COLUMN     "dutyType" "AttendantDutyType" NOT NULL;

-- AlterTable
ALTER TABLE "Hostel" ADD COLUMN     "Contact_no" TEXT;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "Contact_no" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "Emergency_contact" TEXT,
ADD COLUMN     "Father_contact" TEXT,
ADD COLUMN     "Mother_contact" TEXT;

-- DropTable
DROP TABLE "Contact";

-- CreateIndex
CREATE INDEX "AttendantDuty_dutyType_idx" ON "AttendantDuty"("dutyType");

-- AddForeignKey
ALTER TABLE "PersonalAddress" ADD CONSTRAINT "PersonalAddress_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelAddress" ADD CONSTRAINT "HostelAddress_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("HostelID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_PersonID_fkey" FOREIGN KEY ("PersonID") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warden" ADD CONSTRAINT "Warden_PersonID_fkey" FOREIGN KEY ("PersonID") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendant" ADD CONSTRAINT "Attendant_PersonID_fkey" FOREIGN KEY ("PersonID") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("HostelID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomAllocation" ADD CONSTRAINT "RoomAllocation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("StudentID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomAllocation" ADD CONSTRAINT "RoomAllocation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendantDuty" ADD CONSTRAINT "AttendantDuty_AttendantID_fkey" FOREIGN KEY ("AttendantID") REFERENCES "Attendant"("AttendantID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendantDuty" ADD CONSTRAINT "AttendantDuty_HostelID_fkey" FOREIGN KEY ("HostelID") REFERENCES "Hostel"("HostelID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelWardenAssignment" ADD CONSTRAINT "HostelWardenAssignment_HostelID_fkey" FOREIGN KEY ("HostelID") REFERENCES "Hostel"("HostelID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelWardenAssignment" ADD CONSTRAINT "HostelWardenAssignment_WardenID_fkey" FOREIGN KEY ("WardenID") REFERENCES "Warden"("WardenID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessBill" ADD CONSTRAINT "MessBill_StudentID_fkey" FOREIGN KEY ("StudentID") REFERENCES "Student"("StudentID") ON DELETE CASCADE ON UPDATE CASCADE;
