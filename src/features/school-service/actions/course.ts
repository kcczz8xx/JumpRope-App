"use server";

/**
 * School Service Actions - 課程管理
 *
 * 使用 createAction wrapper 自動處理：
 * - Schema 驗證
 * - 認證檢查
 * - 審計日誌
 * - 錯誤處理
 */

import { prisma } from "@/lib/db";
import type { CourseTerm, ChargingModel, SchoolCourse, School } from "@prisma/client";
import { createAction, success } from "@/lib/patterns";
import { failureFromCode } from "@/features/_core/error-codes";
import { createCourseSchema, type CreateCourseInput } from "../schemas/course";
import { z } from "zod";

const deleteCourseSchema = z.object({
  id: z.string().min(1, "缺少課程 ID"),
});
type DeleteCourseInput = z.infer<typeof deleteCourseSchema>;

type CourseWithSchool = SchoolCourse & {
  school: Pick<School, "id" | "schoolName">;
};

/**
 * 建立課程
 */
export const createCourseAction = createAction<
  CreateCourseInput,
  { message: string; course: CourseWithSchool }
>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

    const {
      schoolId,
      courseName,
      courseType,
      courseTerm,
      academicYear,
      startDate,
      endDate,
      requiredTutors,
      maxStudents,
      courseDescription,
      chargingModel,
      studentPerLessonFee,
      totalCourseFee,
      tutorPerLessonFee,
    } = input;

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school || school.deletedAt) {
      return failureFromCode("RESOURCE", "NOT_FOUND");
    }

    const course = await prisma.schoolCourse.create({
      data: {
        schoolId,
        courseName: courseName.trim(),
        courseType: courseType || "REGULAR",
        courseTerm: courseTerm as CourseTerm | undefined,
        academicYear: academicYear || new Date().getFullYear().toString(),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        requiredTutors: requiredTutors || 1,
        maxStudents: maxStudents || undefined,
        chargingModels: chargingModel ? [chargingModel as ChargingModel] : [],
        studentPerLessonFee: studentPerLessonFee ?? null,
        studentFullCourseFee: totalCourseFee ?? null,
        tutorPerLessonFee: tutorPerLessonFee ?? null,
        description: courseDescription || null,
        status: "ACTIVE",
      },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
          },
        },
      },
    });

    return success({ message: "課程建立成功", course });
  },
  {
    schema: createCourseSchema,
    requireAuth: true,
    audit: true,
    auditAction: "COURSE_CREATE",
    auditResource: "course",
    auditResourceId: () => undefined,
  }
);

/**
 * 刪除課程（軟刪除）
 */
export const deleteCourseAction = createAction<
  DeleteCourseInput,
  { message: string }
>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

    const { id } = input;

    const existingCourse = await prisma.schoolCourse.findUnique({
      where: { id },
    });

    if (!existingCourse || existingCourse.deletedAt) {
      return failureFromCode("RESOURCE", "NOT_FOUND");
    }

    await prisma.schoolCourse.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return success({ message: "課程已刪除" });
  },
  {
    schema: deleteCourseSchema,
    requireAuth: true,
    audit: true,
    auditAction: "COURSE_DELETE",
    auditResource: "course",
    auditResourceId: (input) => input.id,
  }
);
