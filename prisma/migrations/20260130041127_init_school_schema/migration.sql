-- CreateEnum
CREATE TYPE "PartnershipStatus" AS ENUM ('INQUIRY', 'QUOTATION_SENT', 'NEGOTIATING', 'CONFIRMED', 'ACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'REVISED');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('REGULAR_CLASS', 'INTENSIVE', 'TRIAL_CLASS', 'HOLIDAY_CAMP', 'COMPETITION_PREP', 'AFTER_SCHOOL', 'INTEREST_CLASS');

-- CreateEnum
CREATE TYPE "ChargingModel" AS ENUM ('STUDENT_PER_LESSON', 'TUTOR_PER_LESSON', 'STUDENT_HOURLY', 'TUTOR_HOURLY', 'STUDENT_FULL_COURSE', 'TEAM_ACTIVITY');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('REGULAR', 'MAKEUP', 'EXTRA_PRACTICE');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PENDING_SEND', 'SENT', 'OVERDUE', 'PAID', 'CANCELLED', 'VOID');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHEQUE', 'BANK_TRANSFER', 'FPS', 'PAYME', 'ALIPAY_HK', 'WECHAT_PAY_HK', 'CREDIT_CARD', 'AUTOPAY', 'OTHER');

-- CreateEnum
CREATE TYPE "TutorRole" AS ENUM ('HEAD_COACH', 'ASSISTANT_COACH', 'TEACHING_ASSISTANT', 'SUBSTITUTE', 'STAFF', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'ABSENT', 'LATE', 'EARLY_LEAVE');

-- CreateEnum
CREATE TYPE "SalaryCalculationMode" AS ENUM ('PER_LESSON', 'HOURLY', 'MONTHLY_FIXED');

-- CreateEnum
CREATE TYPE "CourseTerm" AS ENUM ('FULL_YEAR', 'FIRST_TERM', 'SECOND_TERM', 'SUMMER');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TUTOR', 'ADMIN', 'STAFF');

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "schoolNameEn" TEXT,
    "schoolCode" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "website" TEXT,
    "partnershipStatus" "PartnershipStatus" NOT NULL DEFAULT 'INQUIRY',
    "partnershipStartDate" TIMESTAMP(3),
    "partnershipEndDate" TIMESTAMP(3),
    "partnershipStartYear" TEXT,
    "partnershipEndYear" TEXT,
    "confirmationChannel" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_contacts" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "salutation" TEXT,
    "nameChinese" TEXT NOT NULL,
    "nameEnglish" TEXT,
    "position" TEXT,
    "department" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "school_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_quotations" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "inquiryDate" TIMESTAMP(3),
    "desiredStartDate" TIMESTAMP(3),
    "estimatedStudentCount" INTEGER,
    "desiredSchedule" TEXT,
    "inquiryRemarks" TEXT,
    "quotationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "totalAmount" DECIMAL(10,2),
    "sentDate" TIMESTAMP(3),
    "sentBy" TEXT,
    "respondedDate" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "school_quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_quotation_items" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "courseType" "CourseType" NOT NULL,
    "description" TEXT,
    "chargingModel" "ChargingModel" NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "lessonsPerWeek" INTEGER,
    "durationMinutes" INTEGER,
    "estimatedStudents" INTEGER,
    "requiredTutors" INTEGER,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_courses" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "courseCode" TEXT,
    "courseType" "CourseType" NOT NULL,
    "courseTerm" "CourseTerm" NOT NULL DEFAULT 'FULL_YEAR',
    "academicYear" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "requiredTutors" INTEGER NOT NULL DEFAULT 1,
    "maxStudents" INTEGER,
    "chargingModel" "ChargingModel" NOT NULL,
    "studentPerLessonFee" DECIMAL(10,2),
    "studentHourlyFee" DECIMAL(10,2),
    "studentFullCourseFee" DECIMAL(10,2),
    "teamActivityFee" DECIMAL(10,2),
    "tutorPerLessonFee" DECIMAL(10,2),
    "tutorHourlyFee" DECIMAL(10,2),
    "paymentMode" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "school_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_lessons" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "lessonType" "LessonType" NOT NULL DEFAULT 'REGULAR',
    "lessonTerm" "CourseTerm",
    "studentCount" INTEGER,
    "lessonStatus" "LessonStatus" NOT NULL DEFAULT 'SCHEDULED',
    "feeMode" TEXT,
    "feePerMode" DECIMAL(10,2),
    "feeLesson" DECIMAL(10,2),
    "invoiceStatus" TEXT DEFAULT 'NOT_INVOICED',
    "invoiceId" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "school_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_invoices" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceToken" TEXT,
    "invoiceType" TEXT,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "dueDate" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "invoiceProgress" TEXT,
    "invoiceAmount" DECIMAL(10,2) NOT NULL,
    "sentDate" TIMESTAMP(3),
    "salutation" TEXT,
    "recipientNameChinese" TEXT,
    "recipientNameEnglish" TEXT,
    "contactPosition" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "schoolPhone" TEXT,
    "schoolFax" TEXT,
    "mailingAddress" TEXT,
    "courseItems" JSONB,
    "onsiteServiceItems" JSONB,
    "equipmentSalesItems" JSONB,
    "otherServiceItems" JSONB,
    "invoiceRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "school_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_invoice_courses" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_invoice_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_receipts" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "paymentNumber" TEXT,
    "receiptProgress" TEXT,
    "paymentConfirmedDate" TIMESTAMP(3),
    "actualReceivedAmount" DECIMAL(10,2),
    "paymentMethod" "PaymentMethod",
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentTransactionNumber" TEXT,
    "receiptRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "school_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_tutor_lessons" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "tutorRole" "TutorRole" NOT NULL DEFAULT 'HEAD_COACH',
    "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notificationStatus" TEXT,
    "checkInImage" TEXT,
    "geoLocation" TEXT,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "workingMinutes" INTEGER,
    "salaryCalculationMode" "SalaryCalculationMode",
    "baseLessonSalary" DECIMAL(10,2),
    "salaryDetails" JSONB,
    "totalSalary" DECIMAL(10,2),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "lessonDate" TIMESTAMP(3),
    "startTime" TEXT,
    "endTime" TEXT,
    "lessonLocation" TEXT,
    "lessonPlanId" TEXT,
    "attendanceRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "school_tutor_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "nameChinese" TEXT,
    "nameEnglish" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "certifications" JSONB,
    "specialties" TEXT[],
    "defaultSalaryMode" "SalaryCalculationMode" NOT NULL DEFAULT 'PER_LESSON',
    "defaultPerLessonFee" DECIMAL(10,2),
    "defaultHourlyRate" DECIMAL(10,2),
    "monthlyFixedSalary" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tutor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_schoolCode_key" ON "schools"("schoolCode");

-- CreateIndex
CREATE INDEX "schools_partnershipStatus_idx" ON "schools"("partnershipStatus");

-- CreateIndex
CREATE INDEX "schools_schoolName_idx" ON "schools"("schoolName");

-- CreateIndex
CREATE INDEX "school_contacts_schoolId_idx" ON "school_contacts"("schoolId");

-- CreateIndex
CREATE INDEX "school_contacts_isPrimary_idx" ON "school_contacts"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "school_contacts_schoolId_email_key" ON "school_contacts"("schoolId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "school_quotations_quotationNumber_key" ON "school_quotations"("quotationNumber");

-- CreateIndex
CREATE INDEX "school_quotations_schoolId_idx" ON "school_quotations"("schoolId");

-- CreateIndex
CREATE INDEX "school_quotations_status_idx" ON "school_quotations"("status");

-- CreateIndex
CREATE INDEX "school_quotations_quotationNumber_idx" ON "school_quotations"("quotationNumber");

-- CreateIndex
CREATE INDEX "school_quotation_items_quotationId_idx" ON "school_quotation_items"("quotationId");

-- CreateIndex
CREATE INDEX "school_courses_schoolId_idx" ON "school_courses"("schoolId");

-- CreateIndex
CREATE INDEX "school_courses_academicYear_idx" ON "school_courses"("academicYear");

-- CreateIndex
CREATE INDEX "school_courses_courseType_idx" ON "school_courses"("courseType");

-- CreateIndex
CREATE INDEX "school_courses_status_idx" ON "school_courses"("status");

-- CreateIndex
CREATE INDEX "school_lessons_courseId_idx" ON "school_lessons"("courseId");

-- CreateIndex
CREATE INDEX "school_lessons_lessonDate_idx" ON "school_lessons"("lessonDate");

-- CreateIndex
CREATE INDEX "school_lessons_lessonStatus_idx" ON "school_lessons"("lessonStatus");

-- CreateIndex
CREATE INDEX "school_lessons_invoiceStatus_idx" ON "school_lessons"("invoiceStatus");

-- CreateIndex
CREATE INDEX "school_lessons_invoiceId_idx" ON "school_lessons"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "school_invoices_invoiceNumber_key" ON "school_invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "school_invoices_invoiceToken_key" ON "school_invoices"("invoiceToken");

-- CreateIndex
CREATE INDEX "school_invoices_schoolId_idx" ON "school_invoices"("schoolId");

-- CreateIndex
CREATE INDEX "school_invoices_status_idx" ON "school_invoices"("status");

-- CreateIndex
CREATE INDEX "school_invoices_invoiceNumber_idx" ON "school_invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "school_invoices_invoiceDate_idx" ON "school_invoices"("invoiceDate");

-- CreateIndex
CREATE INDEX "school_invoice_courses_invoiceId_idx" ON "school_invoice_courses"("invoiceId");

-- CreateIndex
CREATE INDEX "school_invoice_courses_courseId_idx" ON "school_invoice_courses"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "school_invoice_courses_invoiceId_courseId_key" ON "school_invoice_courses"("invoiceId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "school_receipts_invoiceId_key" ON "school_receipts"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "school_receipts_receiptNumber_key" ON "school_receipts"("receiptNumber");

-- CreateIndex
CREATE INDEX "school_receipts_schoolId_idx" ON "school_receipts"("schoolId");

-- CreateIndex
CREATE INDEX "school_receipts_invoiceId_idx" ON "school_receipts"("invoiceId");

-- CreateIndex
CREATE INDEX "school_receipts_paymentStatus_idx" ON "school_receipts"("paymentStatus");

-- CreateIndex
CREATE INDEX "school_receipts_receiptNumber_idx" ON "school_receipts"("receiptNumber");

-- CreateIndex
CREATE INDEX "school_tutor_lessons_lessonId_idx" ON "school_tutor_lessons"("lessonId");

-- CreateIndex
CREATE INDEX "school_tutor_lessons_userId_idx" ON "school_tutor_lessons"("userId");

-- CreateIndex
CREATE INDEX "school_tutor_lessons_courseId_idx" ON "school_tutor_lessons"("courseId");

-- CreateIndex
CREATE INDEX "school_tutor_lessons_attendanceStatus_idx" ON "school_tutor_lessons"("attendanceStatus");

-- CreateIndex
CREATE INDEX "school_tutor_lessons_paymentStatus_idx" ON "school_tutor_lessons"("paymentStatus");

-- CreateIndex
CREATE INDEX "school_tutor_lessons_lessonDate_idx" ON "school_tutor_lessons"("lessonDate");

-- CreateIndex
CREATE UNIQUE INDEX "school_tutor_lessons_lessonId_userId_key" ON "school_tutor_lessons"("lessonId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_profiles_userId_key" ON "tutor_profiles"("userId");

-- CreateIndex
CREATE INDEX "tutor_profiles_userId_idx" ON "tutor_profiles"("userId");

-- CreateIndex
CREATE INDEX "tutor_profiles_isActive_idx" ON "tutor_profiles"("isActive");

-- AddForeignKey
ALTER TABLE "school_contacts" ADD CONSTRAINT "school_contacts_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_quotations" ADD CONSTRAINT "school_quotations_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_quotations" ADD CONSTRAINT "school_quotations_sentBy_fkey" FOREIGN KEY ("sentBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_quotation_items" ADD CONSTRAINT "school_quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "school_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_courses" ADD CONSTRAINT "school_courses_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_lessons" ADD CONSTRAINT "school_lessons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "school_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_lessons" ADD CONSTRAINT "school_lessons_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "school_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_invoices" ADD CONSTRAINT "school_invoices_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_invoice_courses" ADD CONSTRAINT "school_invoice_courses_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "school_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_invoice_courses" ADD CONSTRAINT "school_invoice_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "school_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_receipts" ADD CONSTRAINT "school_receipts_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_receipts" ADD CONSTRAINT "school_receipts_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "school_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_tutor_lessons" ADD CONSTRAINT "school_tutor_lessons_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "school_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_tutor_lessons" ADD CONSTRAINT "school_tutor_lessons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_profiles" ADD CONSTRAINT "tutor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
