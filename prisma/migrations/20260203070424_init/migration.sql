/*
  Warnings:

  - You are about to drop the column `chargingModels` on the `school_courses` table. All the data in the column will be lost.
  - You are about to drop the column `studentFullCourseFee` on the `school_courses` table. All the data in the column will be lost.
  - You are about to drop the column `studentHourlyFee` on the `school_courses` table. All the data in the column will be lost.
  - You are about to drop the column `studentPerLessonFee` on the `school_courses` table. All the data in the column will be lost.
  - You are about to drop the column `teamActivityFee` on the `school_courses` table. All the data in the column will be lost.
  - You are about to drop the column `tutorHourlyFee` on the `school_courses` table. All the data in the column will be lost.
  - You are about to drop the column `tutorPerLessonFee` on the `school_courses` table. All the data in the column will be lost.
  - You are about to drop the column `courseItems` on the `school_invoices` table. All the data in the column will be lost.
  - You are about to drop the column `equipmentSalesItems` on the `school_invoices` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceProgress` on the `school_invoices` table. All the data in the column will be lost.
  - You are about to drop the column `onsiteServiceItems` on the `school_invoices` table. All the data in the column will be lost.
  - You are about to drop the column `otherServiceItems` on the `school_invoices` table. All the data in the column will be lost.
  - You are about to drop the column `feeLesson` on the `school_lessons` table. All the data in the column will be lost.
  - You are about to drop the column `feeMode` on the `school_lessons` table. All the data in the column will be lost.
  - You are about to drop the column `feePerMode` on the `school_lessons` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceId` on the `school_lessons` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `school_lessons` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `school_tutor_lessons` table. All the data in the column will be lost.
  - You are about to drop the column `lessonDate` on the `school_tutor_lessons` table. All the data in the column will be lost.
  - You are about to drop the column `lessonLocation` on the `school_tutor_lessons` table. All the data in the column will be lost.
  - You are about to drop the column `lessonPlanId` on the `school_tutor_lessons` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `school_tutor_lessons` table. All the data in the column will be lost.
  - You are about to drop the `school_invoice_courses` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[postponedLessonId]` on the table `school_lessons` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "InvoicingPeriodStatus" AS ENUM ('OPEN', 'CLOSED', 'INVOICED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FeeItemDirection" AS ENUM ('REVENUE', 'EXPENSE');

-- DropForeignKey
ALTER TABLE "school_invoice_courses" DROP CONSTRAINT "school_invoice_courses_courseId_fkey";

-- DropForeignKey
ALTER TABLE "school_invoice_courses" DROP CONSTRAINT "school_invoice_courses_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "school_lessons" DROP CONSTRAINT "school_lessons_invoiceId_fkey";

-- DropIndex
DROP INDEX "school_lessons_invoiceId_idx";

-- DropIndex
DROP INDEX "school_tutor_lessons_lessonDate_idx";

-- AlterTable
ALTER TABLE "school_courses" DROP COLUMN "chargingModels",
DROP COLUMN "studentFullCourseFee",
DROP COLUMN "studentHourlyFee",
DROP COLUMN "studentPerLessonFee",
DROP COLUMN "teamActivityFee",
DROP COLUMN "tutorHourlyFee",
DROP COLUMN "tutorPerLessonFee",
ADD COLUMN     "dataCompleteness" JSONB,
ADD COLUMN     "dataCompletionDeadline" TIMESTAMP(3),
ADD COLUMN     "pendingDataFields" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "school_invoices" DROP COLUMN "courseItems",
DROP COLUMN "equipmentSalesItems",
DROP COLUMN "invoiceProgress",
DROP COLUMN "onsiteServiceItems",
DROP COLUMN "otherServiceItems",
ADD COLUMN     "periodId" TEXT;

-- AlterTable
ALTER TABLE "school_lessons" DROP COLUMN "feeLesson",
DROP COLUMN "feeMode",
DROP COLUMN "feePerMode",
DROP COLUMN "invoiceId",
DROP COLUMN "paymentStatus",
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" TEXT,
ADD COLUMN     "postponedLessonId" TEXT,
ADD COLUMN     "postponedToDate" TIMESTAMP(3),
ADD COLUMN     "totalExpense" DECIMAL(10,2),
ADD COLUMN     "totalRevenue" DECIMAL(10,2),
ADD COLUMN     "tutorCount" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "school_quotations" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "school_tutor_lessons" DROP COLUMN "endTime",
DROP COLUMN "lessonDate",
DROP COLUMN "lessonLocation",
DROP COLUMN "lessonPlanId",
DROP COLUMN "startTime";

-- DropTable
DROP TABLE "school_invoice_courses";

-- CreateTable
CREATE TABLE "school_course_fee_structures" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "feeType" TEXT NOT NULL,
    "direction" "FeeItemDirection" NOT NULL,
    "calculationMode" "ChargingModel" NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "unitType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_course_fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_course_schedules" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "courseTerm" "CourseTerm",
    "autoGenerateLessons" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_course_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "lessonId" TEXT,
    "courseId" TEXT,
    "description" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoicing_periods" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "periodName" TEXT NOT NULL,
    "academicYear" TEXT,
    "periodType" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "InvoicingPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "totalLessons" INTEGER,
    "totalRevenue" DECIMAL(10,2),
    "totalExpense" DECIMAL(10,2),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "invoicing_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_lesson_fee_items" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "feeStructureId" TEXT,
    "feeType" TEXT NOT NULL,
    "direction" "FeeItemDirection" NOT NULL,
    "calculationMode" "ChargingModel" NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "calculationFormula" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_lesson_fee_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "school_course_fee_structures_courseId_idx" ON "school_course_fee_structures"("courseId");

-- CreateIndex
CREATE INDEX "school_course_fee_structures_feeType_idx" ON "school_course_fee_structures"("feeType");

-- CreateIndex
CREATE INDEX "school_course_fee_structures_isActive_idx" ON "school_course_fee_structures"("isActive");

-- CreateIndex
CREATE INDEX "school_course_schedules_courseId_idx" ON "school_course_schedules"("courseId");

-- CreateIndex
CREATE INDEX "school_course_schedules_effectiveFrom_effectiveTo_idx" ON "school_course_schedules"("effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "school_invoice_items_invoiceId_idx" ON "school_invoice_items"("invoiceId");

-- CreateIndex
CREATE INDEX "school_invoice_items_lessonId_idx" ON "school_invoice_items"("lessonId");

-- CreateIndex
CREATE INDEX "school_invoice_items_courseId_idx" ON "school_invoice_items"("courseId");

-- CreateIndex
CREATE INDEX "school_invoice_items_itemType_idx" ON "school_invoice_items"("itemType");

-- CreateIndex
CREATE INDEX "invoicing_periods_schoolId_idx" ON "invoicing_periods"("schoolId");

-- CreateIndex
CREATE INDEX "invoicing_periods_status_idx" ON "invoicing_periods"("status");

-- CreateIndex
CREATE INDEX "invoicing_periods_periodStart_periodEnd_idx" ON "invoicing_periods"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "invoicing_periods_schoolId_periodName_key" ON "invoicing_periods"("schoolId", "periodName");

-- CreateIndex
CREATE INDEX "school_lesson_fee_items_lessonId_idx" ON "school_lesson_fee_items"("lessonId");

-- CreateIndex
CREATE INDEX "school_lesson_fee_items_feeType_idx" ON "school_lesson_fee_items"("feeType");

-- CreateIndex
CREATE INDEX "school_lesson_fee_items_direction_idx" ON "school_lesson_fee_items"("direction");

-- CreateIndex
CREATE INDEX "school_invoices_periodId_idx" ON "school_invoices"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "school_lessons_postponedLessonId_key" ON "school_lessons"("postponedLessonId");

-- CreateIndex
CREATE INDEX "school_quotations_parentId_idx" ON "school_quotations"("parentId");

-- AddForeignKey
ALTER TABLE "school_course_fee_structures" ADD CONSTRAINT "school_course_fee_structures_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "school_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_course_schedules" ADD CONSTRAINT "school_course_schedules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "school_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_invoice_items" ADD CONSTRAINT "school_invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "school_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_invoice_items" ADD CONSTRAINT "school_invoice_items_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "school_lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_invoice_items" ADD CONSTRAINT "school_invoice_items_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "school_courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_invoices" ADD CONSTRAINT "school_invoices_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "invoicing_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoicing_periods" ADD CONSTRAINT "invoicing_periods_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_lesson_fee_items" ADD CONSTRAINT "school_lesson_fee_items_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "school_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_lessons" ADD CONSTRAINT "school_lessons_postponedLessonId_fkey" FOREIGN KEY ("postponedLessonId") REFERENCES "school_lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_quotations" ADD CONSTRAINT "school_quotations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "school_quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
