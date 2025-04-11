-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('Student', 'Warden', 'Attendant');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('GENERATED', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('MORNING', 'EVENING', 'NIGHT');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY');

-- CreateTable
CREATE TABLE "PersonalAddress" (
    "id" SERIAL NOT NULL,
    "hNo" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "personId" INTEGER,

    CONSTRAINT "PersonalAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelAddress" (
    "id" SERIAL NOT NULL,
    "building" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "landmark" TEXT,
    "hostelId" INTEGER,

    CONSTRAINT "HostelAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "personType" "PersonType" NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "ContactID" SERIAL NOT NULL,
    "PersonID" INTEGER,
    "HostelID" INTEGER,
    "Contact_no" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("ContactID")
);

-- CreateTable
CREATE TABLE "Hostel" (
    "HostelID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Hostel_pkey" PRIMARY KEY ("HostelID")
);

-- CreateTable
CREATE TABLE "Student" (
    "StudentID" SERIAL NOT NULL,
    "PersonID" INTEGER NOT NULL,
    "Remark" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("StudentID")
);

-- CreateTable
CREATE TABLE "Warden" (
    "WardenID" SERIAL NOT NULL,
    "PersonID" INTEGER NOT NULL,

    CONSTRAINT "Warden_pkey" PRIMARY KEY ("WardenID")
);

-- CreateTable
CREATE TABLE "Attendant" (
    "AttendantID" SERIAL NOT NULL,
    "PersonID" INTEGER NOT NULL,

    CONSTRAINT "Attendant_pkey" PRIMARY KEY ("AttendantID")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "hostelId" INTEGER NOT NULL,
    "roomType" "RoomType" NOT NULL,
    "furnitureDetails" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomAllocation" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "academicYear" VARCHAR(9) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "RoomAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendantDuty" (
    "DutyID" SERIAL NOT NULL,
    "AttendantID" INTEGER NOT NULL,
    "HostelID" INTEGER NOT NULL,
    "Duty_date" TIMESTAMP(3) NOT NULL,
    "shiftType" "ShiftType" NOT NULL,

    CONSTRAINT "AttendantDuty_pkey" PRIMARY KEY ("DutyID")
);

-- CreateTable
CREATE TABLE "HostelWardenAssignment" (
    "AssignmentID" SERIAL NOT NULL,
    "HostelID" INTEGER NOT NULL,
    "WardenID" INTEGER NOT NULL,
    "Assignment_date" TIMESTAMP(3) NOT NULL,
    "End_date" TIMESTAMP(3),

    CONSTRAINT "HostelWardenAssignment_pkey" PRIMARY KEY ("AssignmentID")
);

-- CreateTable
CREATE TABLE "MessBill" (
    "BillID" SERIAL NOT NULL,
    "StudentID" INTEGER NOT NULL,
    "Bill_amount" DECIMAL(65,30) NOT NULL,
    "Bill_generation_date" TIMESTAMP(3) NOT NULL,
    "Due_date" TIMESTAMP(3) NOT NULL,
    "Bill_deposit_date" TIMESTAMP(3),
    "fine" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "status" "BillStatus" NOT NULL DEFAULT 'GENERATED',

    CONSTRAINT "MessBill_pkey" PRIMARY KEY ("BillID")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalAddress_personId_key" ON "PersonalAddress"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "HostelAddress_hostelId_key" ON "HostelAddress"("hostelId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_PersonID_HostelID_Contact_no_key" ON "Contact"("PersonID", "HostelID", "Contact_no");

-- CreateIndex
CREATE UNIQUE INDEX "Student_PersonID_key" ON "Student"("PersonID");

-- CreateIndex
CREATE UNIQUE INDEX "Warden_PersonID_key" ON "Warden"("PersonID");

-- CreateIndex
CREATE UNIQUE INDEX "Attendant_PersonID_key" ON "Attendant"("PersonID");

-- CreateIndex
CREATE INDEX "AttendantDuty_Duty_date_idx" ON "AttendantDuty"("Duty_date");

-- CreateIndex
CREATE INDEX "AttendantDuty_shiftType_idx" ON "AttendantDuty"("shiftType");

-- CreateIndex
CREATE UNIQUE INDEX "HostelWardenAssignment_HostelID_WardenID_Assignment_date_key" ON "HostelWardenAssignment"("HostelID", "WardenID", "Assignment_date");

-- AddForeignKey
ALTER TABLE "PersonalAddress" ADD CONSTRAINT "PersonalAddress_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelAddress" ADD CONSTRAINT "HostelAddress_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("HostelID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_PersonID_fkey" FOREIGN KEY ("PersonID") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_HostelID_fkey" FOREIGN KEY ("HostelID") REFERENCES "Hostel"("HostelID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_PersonID_fkey" FOREIGN KEY ("PersonID") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warden" ADD CONSTRAINT "Warden_PersonID_fkey" FOREIGN KEY ("PersonID") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendant" ADD CONSTRAINT "Attendant_PersonID_fkey" FOREIGN KEY ("PersonID") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("HostelID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomAllocation" ADD CONSTRAINT "RoomAllocation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("StudentID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomAllocation" ADD CONSTRAINT "RoomAllocation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendantDuty" ADD CONSTRAINT "AttendantDuty_AttendantID_fkey" FOREIGN KEY ("AttendantID") REFERENCES "Attendant"("AttendantID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendantDuty" ADD CONSTRAINT "AttendantDuty_HostelID_fkey" FOREIGN KEY ("HostelID") REFERENCES "Hostel"("HostelID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelWardenAssignment" ADD CONSTRAINT "HostelWardenAssignment_HostelID_fkey" FOREIGN KEY ("HostelID") REFERENCES "Hostel"("HostelID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelWardenAssignment" ADD CONSTRAINT "HostelWardenAssignment_WardenID_fkey" FOREIGN KEY ("WardenID") REFERENCES "Warden"("WardenID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessBill" ADD CONSTRAINT "MessBill_StudentID_fkey" FOREIGN KEY ("StudentID") REFERENCES "Student"("StudentID") ON DELETE RESTRICT ON UPDATE CASCADE;
