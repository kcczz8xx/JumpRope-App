/*
  Warnings:

  - Changed the type of `courseType` on the `school_courses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `courseType` on the `school_quotation_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "school_courses" DROP COLUMN "courseType",
ADD COLUMN     "courseType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "school_quotation_items" DROP COLUMN "courseType",
ADD COLUMN     "courseType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "CourseType";

-- CreateIndex
CREATE INDEX "school_courses_courseType_idx" ON "school_courses"("courseType");
